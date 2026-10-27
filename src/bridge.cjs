'use strict';

const http = require('node:http');
const path = require('node:path');
const fs = require('node:fs/promises');
const express = require('express');
const { WebSocketServer } = require('ws');
const { app } = require('electron');
const { roInitialize } = require('@microsoft/dynwinrt');
const {
  GlobalSystemMediaTransportControlsSessionManager,
  GlobalSystemMediaTransportControlsSessionPlaybackStatus,
  DataReader,
  IRandomAccessStream,
  createProjectedLifetimeScope,

} = require('./winrt-generated');

const HTTP_HOST = '127.0.0.1';
const HTTP_PORT = 12345;
const WS_HOST = '127.0.0.1';
const WS_PORT = 12346;
const POLL_INTERVAL_MS = 800;
const MAX_THUMBNAIL_BYTES = 4 * 1024 * 1024;
const stateFile = path.join(
  process.env.LOCALAPPDATA || app.getPath('userData'),
  'BeamNG', 'BeamNG.drive', 'current', 'media_state.json'
);

const emptyState = () => ({
  track: 'Ожидание плеера', artist: '', album: '', is_playing: false,
  thumbnail: null, artworkStatus: 'Обложка пока не проверена', session: false, error: null, position: 0, duration: 0,
});

let state = emptyState();
let manager = null;
let managerScope = null;
let httpServer = null;
let wsServer = null;
let pollTimer = null;
let onState = () => {};
let lastWsThumbnail;
let cachedArtworkKey = null;
let cachedThumbnail = null;
let cachedArtworkStatus = 'Обложка пока не проверена';
let lastArtworkAttemptAt = 0;
let pollStopped = false;
let nativeQueue = Promise.resolve();

function emit() {
  const data = JSON.stringify(state);
  let wsState = state;
  if (state.thumbnail === lastWsThumbnail) {
    wsState = { ...state };
    delete wsState.thumbnail;
  } else {
    lastWsThumbnail = state.thumbnail;
  }
  const wsData = JSON.stringify(wsState);
  for (const client of wsServer?.clients || []) {
    if (client.readyState === 1) client.send(wsData);
  }
  onState(state);
  fs.mkdir(path.dirname(stateFile), { recursive: true })
    .then(() => fs.writeFile(stateFile, data, 'utf8'))
    .catch(() => {});
}

function enqueueNative(operation) {
  const result = nativeQueue.then(operation, operation);
  nativeQueue = result.catch(() => {});
  return result;
}

async function withProjectionScope(operation) {
  const scope = createProjectedLifetimeScope();
  try {
    return await operation();
  } finally {
    scope.dispose();
  }
}

function chooseSession() {
  const view = manager.getSessions();
  const sessions = [];
  for (let index = 0; index < view.size; index += 1) sessions.push(view.getAt(index));
  if (sessions.length === 0) return null;

  const playing = sessions.find((session) =>
    session.getPlaybackInfo()?.playbackStatus === GlobalSystemMediaTransportControlsSessionPlaybackStatus.Playing
  );
  return playing || manager.getCurrentSession() || sessions[0];
}

function detectMime(bytes) {
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (bytes.length >= 6 && bytes.toString('ascii', 0, 3) === 'GIF') return 'image/gif';
  if (bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  if (bytes.length >= 2 && bytes[0] === 0x42 && bytes[1] === 0x4d) return 'image/bmp';
  return 'image/jpeg';
}

async function readThumbnail(reference) {
  if (!reference) return { thumbnail: null, status: 'Плеер не передал обложку (thumbnail отсутствует).' };
  let reader;
  try {
    const contentStream = await reference.openReadAsync();
    if (!contentStream) return { thumbnail: null, status: 'Windows вернула пустой поток обложки.' };
    const stream = IRandomAccessStream.from(contentStream._obj);
    const size = Number(stream.size);
    if (!Number.isSafeInteger(size) || size <= 0) {
      return { thumbnail: null, status: 'Поток обложки пустой или имеет неверный размер (' + size + ').' };
    }
    if (size > MAX_THUMBNAIL_BYTES) {
      return { thumbnail: null, status: 'Обложка слишком большая: ' + Math.round(size / 1024) + ' КБ.' };
    }
    reader = new DataReader(stream.getInputStreamAt(0n));
    const loaded = await reader.loadAsync(size);
    if (!loaded) return { thumbnail: null, status: 'Windows не загрузила байты обложки.' };
    const bytes = reader.readBytes(new Uint8Array(loaded));
    if (!bytes.length) return { thumbnail: null, status: 'Поток прочитан, но не содержит данных.' };
    const mime = detectMime(bytes);
    return {
      thumbnail: 'data:' + mime + ';base64,' + bytes.toString('base64'),
      status: 'Обложка получена (' + Math.round(bytes.length / 1024) + ' КБ, ' + mime + ').',
    };
  } catch (error) {
    return { thumbnail: null, status: 'Ошибка чтения обложки: ' + (error.message || error) };
  } finally {
    try { reader?.close(); } catch {}
  }
}
function ticksToMs(timeSpan) {
  const ticks = BigInt(timeSpan?.duration ?? 0);
  return Number(ticks / 10000n);
}

async function refreshMediaState() {
  if (!manager) return;
  return enqueueNative(() => withProjectionScope(async () => {
    const session = chooseSession();
    if (!session) {
      cachedArtworkKey = null;
      cachedThumbnail = null;
      cachedArtworkStatus = 'Ожидание активного плеера.';
      lastArtworkAttemptAt = 0;
      state = { ...emptyState(), track: 'Нет активного плеера' };
      emit();
      return;
    }

    const props = await session.tryGetMediaPropertiesAsync();
    if (!props) {
      state = { ...emptyState(), track: 'Не удалось прочитать данные трека', session: true };
      emit();
      return;
    }
    const timeline = session.getTimelineProperties();
    const start = ticksToMs(timeline?.startTime);
    const end = ticksToMs(timeline?.endTime);
    const position = Math.max(0, ticksToMs(timeline?.position) - start);
    const duration = Math.max(0, end - start);
    const artworkKey = [session.sourceAppUserModelId, props.title, props.artist, props.albumTitle].join('|');
    if (artworkKey !== cachedArtworkKey) {
      cachedArtworkKey = artworkKey;
      cachedThumbnail = null;
      cachedArtworkStatus = 'Проверяю обложку…';
      lastArtworkAttemptAt = 0;
    }
    // Some players publish track metadata before the thumbnail is ready.
    // Retry while this track has no artwork instead of caching the initial miss forever.
    if (!cachedThumbnail && Date.now() - lastArtworkAttemptAt >= 2000) {
      lastArtworkAttemptAt = Date.now();
      const result = await readThumbnail(props.thumbnail);
      cachedThumbnail = result.thumbnail;
      cachedArtworkStatus = result.status;
    }
    const thumbnail = cachedThumbnail;

    state = {
      track: props.title || '',
      artist: props.artist || '',
      album: props.albumTitle || '',
      is_playing: session.getPlaybackInfo()?.playbackStatus === GlobalSystemMediaTransportControlsSessionPlaybackStatus.Playing,
      thumbnail,
      artworkStatus: cachedArtworkStatus,
      session: true,
      error: null,
      position: duration > 0 ? Math.min(position, duration) : position,
      duration,
    };
    emit();
  }));
}

async function command(action) {
  const supported = ['pause', 'play', 'toggle', 'next', 'prev'];
  if (!supported.includes(action)) return { ok: false, error: 'Неизвестная команда.' };
  if (!manager) return { ok: false, error: state.error || 'Windows Media недоступен.' };

  try {
    const ok = await enqueueNative(() => withProjectionScope(async () => {
      const session = chooseSession();
      if (!session) return false;
      switch (action) {
        case 'pause': return session.tryPauseAsync();
        case 'play': return session.tryPlayAsync();
        case 'next': return session.trySkipNextAsync();
        case 'prev': return session.trySkipPreviousAsync();
        default: return session.tryTogglePlayPauseAsync();
      }
    }));
    return { ok: !!ok, error: ok ? null : 'Нет активного плеера или плеер не поддержал команду.' };
  } catch (error) {
    return { ok: false, error: error.message || 'Команда не выполнена.' };
  }
}

function sendJson(response, result) {
  response.status(result.ok ? 200 : 400)
    .set('Access-Control-Allow-Origin', '*')
    .json(result);
}

function schedulePoll() {
  if (pollStopped) return;
  pollTimer = setTimeout(async () => {
    try {
      await refreshMediaState();
    } catch (error) {
      state = { ...state, error: error.message || 'Не удалось обновить состояние медиа.' };
      emit();
    } finally {
      schedulePoll();
    }
  }, POLL_INTERVAL_MS);
}
async function startBridge(callback) {
  onState = callback;
  try {
    roInitialize(1);
    managerScope = createProjectedLifetimeScope();
    manager = await GlobalSystemMediaTransportControlsSessionManager.requestAsync();
    if (!manager) throw new Error('Windows не вернула менеджер медиа-сессий.');
    await refreshMediaState();
    pollStopped = false;
    schedulePoll();
  } catch (error) {
    try { managerScope?.dispose(); } catch {}
    managerScope = null;
    manager = null;
    state = { ...emptyState(), error: `Не удалось получить доступ к Windows Media: ${error.message || error}` };
    emit();
  }

  const api = express();
  api.disable('x-powered-by');
  api.use((request, response, next) => {
    response.set('Access-Control-Allow-Origin', '*');
    response.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    response.set('Access-Control-Allow-Headers', 'Content-Type');
    if (request.method === 'OPTIONS') return response.sendStatus(204);
    next();
  });
  api.get('/status', (_request, response) => response.json(state));
  api.get('/api/:action', async (request, response) => {
    if (!['pause', 'play', 'toggle', 'next', 'prev'].includes(request.params.action)) {
      return sendJson(response, { ok: false, error: 'Неизвестная команда.' });
    }
    return sendJson(response, await command(request.params.action));
  });
  api.post('/api/:action', async (request, response) => {
    if (!['pause', 'play', 'toggle', 'next', 'prev'].includes(request.params.action)) {
      return sendJson(response, { ok: false, error: 'Неизвестная команда.' });
    }
    return sendJson(response, await command(request.params.action));
  });
  api.get('/', (_request, response) => response.sendFile(path.join(__dirname, '..', 'renderer', 'widget.html')));

  httpServer = http.createServer(api);
  await new Promise((resolve, reject) => {
    httpServer.once('error', reject);
    httpServer.listen(HTTP_PORT, HTTP_HOST, resolve);
  });
  wsServer = new WebSocketServer({ host: WS_HOST, port: WS_PORT });
  wsServer.on('connection', (socket) => {
    socket.send(JSON.stringify(state));
    socket.on('message', async (raw) => {
      try {
        const message = JSON.parse(raw.toString());
        if (['pause', 'play', 'toggle', 'next', 'prev'].includes(message.action)) {
          const result = await command(message.action);
          if (!result.ok) {
            state = { ...state, error: result.error || 'Команда не выполнена.' };
            emit();
          }
        }
      } catch {}
    });
  });

  return { ok: true, http: `http://${HTTP_HOST}:${HTTP_PORT}`, websocket: `ws://${WS_HOST}:${WS_PORT}` };
}

async function stopBridge() {
  pollStopped = true;
  if (pollTimer) clearTimeout(pollTimer);
  pollTimer = null;
  try { await nativeQueue; } catch {}
  manager = null;
  try { managerScope?.dispose(); } catch {}
  managerScope = null;
  for (const server of [wsServer, httpServer]) {
    if (server) server.close();
  }
  wsServer = null;
  httpServer = null;
}

function getState() {
  return state;
}

module.exports = { startBridge, stopBridge, getState, command };





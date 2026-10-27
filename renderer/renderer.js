const $ = id => document.getElementById(id);
let current = {}, pending = false, noticeMessage = '';
let language = localStorage.getItem('beamng-media-bridge-language') === 'en' ? 'en' : 'ru';

const strings = {
  ru: {
    launchGame: 'Запустить игру',
    steamOnly: 'Только Steam-версия',
    launch: 'Запустить',
    mods: 'Моды для BeamNG.drive',
    modsInfo: 'Новые релизы, обновления и исходники — в Telegram-канале.',
    openChannel: 'Открыть @mods_base',
    currentTrack: 'Текущий трек',
    waitingPlayer: 'Ожидание плеера',
    startMusic: 'Запустите музыку в Windows',
    playPause: 'Пауза или продолжение',
    howToConnect: 'Как подключить',
    stepOne: 'Добавьте MediaWidget.zip в папку модов BeamNG.drive.',
    stepTwo: 'Добавьте виджет через меню Apps внутри игры.',
    stepThree: 'Оставьте это приложение запущенным во время игры.',
    openDataFolder: 'Открыть папку данных BeamNG',
    privacyTitle: 'Обложка и медиаинформация',
    privacyText: 'Приложение читает название трека, исполнителя, альбом, состояние и обложку текущего медиа-сеанса Windows. Данные передаются локальному виджету в BeamNG. Файл состояния: %LOCALAPPDATA%\\BeamNG\\BeamNG.drive\\current\\media_state.json. Подключение доступно только на этом компьютере.',
    connecting: 'Подключение…',
    playing: 'Играет',
    paused: 'Пауза',
    noPlayer: 'Нет активного плеера',
    waiting: 'Ожидание',
    statusError: 'Ошибка',
    artistUnknown: 'Исполнитель не указан',
    mediaStart: 'Запустите музыку в Windows',
    trackReadError: 'Не удалось прочитать данные трека',
    commandFailed: 'Команда не выполнена.',
    coverNotChecked: 'Обложка пока не проверена',
    coverWaiting: 'Ожидание активного плеера.',
    coverChecking: 'Проверяю обложку…',
    coverMissing: 'Плеер не передал обложку (thumbnail отсутствует).',
    coverEmpty: 'Windows вернула пустой поток обложки.',
    coverLoadFailed: 'Windows не загрузила байты обложки.',
    coverNoData: 'Поток прочитан, но не содержит данных.',
    languageLabel: 'EN',
    languageAria: 'Switch to English',
    genericMediaError: 'Не удалось получить данные Windows Media.',
    genericCoverError: 'Ошибка чтения обложки.'
  },
  en: {
    launchGame: 'Launch the game',
    steamOnly: 'Steam version only',
    launch: 'Launch',
    mods: 'BeamNG.drive mods',
    modsInfo: 'New releases, updates, and source code are posted on our Telegram channel.',
    openChannel: 'Open @mods_base',
    currentTrack: 'Current track',
    waitingPlayer: 'Waiting for a player',
    startMusic: 'Start playing music in Windows',
    playPause: 'Pause or resume',
    howToConnect: 'How to connect',
    stepOne: 'Add MediaWidget.zip to your BeamNG.drive mods folder.',
    stepTwo: 'Add the widget from the Apps menu in the game.',
    stepThree: 'Keep this app running while you play.',
    openDataFolder: 'Open BeamNG data folder',
    privacyTitle: 'Artwork and media information',
    privacyText: 'The app reads the current Windows media session title, artist, album, playback state, and artwork. Data is sent locally to the BeamNG widget. State file: %LOCALAPPDATA%\\BeamNG\\BeamNG.drive\\current\\media_state.json. The connection is available only on this computer.',
    connecting: 'Connecting…',
    playing: 'Playing',
    paused: 'Paused',
    noPlayer: 'No active player',
    waiting: 'Waiting',
    statusError: 'Error',
    artistUnknown: 'Unknown artist',
    mediaStart: 'Start playing music in Windows',
    trackReadError: 'Could not read track information',
    commandFailed: 'The command failed.',
    coverNotChecked: 'Artwork has not been checked yet',
    coverWaiting: 'Waiting for an active player.',
    coverChecking: 'Checking for artwork…',
    coverMissing: 'The player did not provide artwork.',
    coverEmpty: 'Windows returned an empty artwork stream.',
    coverLoadFailed: 'Windows could not load the artwork data.',
    coverNoData: 'The artwork stream was read but contains no data.',
    languageLabel: 'RU',
    languageAria: 'Переключить на русский',
    genericMediaError: 'Could not read Windows media information.',
    genericCoverError: 'Could not read artwork.'
  }
};

function t(key) {
  return strings[language][key] || strings.ru[key] || key;
}

function localizeArtworkStatus(value) {
  if (!value) return '';
  const exact = {
    'Обложка пока не проверена': 'coverNotChecked',
    'Ожидание активного плеера.': 'coverWaiting',
    'Проверяю обложку…': 'coverChecking',
    'Плеер не передал обложку (thumbnail отсутствует).': 'coverMissing',
    'Windows вернула пустой поток обложки.': 'coverEmpty',
    'Windows не загрузила байты обложки.': 'coverLoadFailed',
    'Поток прочитан, но не содержит данных.': 'coverNoData'
  };
  if (exact[value]) return t(exact[value]);
  if (value.startsWith('Обложка получена (')) return value.replace('Обложка получена', language === 'en' ? 'Artwork received' : 'Обложка получена');
  if (value.startsWith('Обложка слишком большая:')) return value.replace('Обложка слишком большая:', language === 'en' ? 'Artwork is too large:' : 'Обложка слишком большая:');
  if (value.startsWith('Поток обложки пустой или имеет неверный размер')) return value.replace('Поток обложки пустой или имеет неверный размер', language === 'en' ? 'Artwork stream is empty or has an invalid size' : 'Поток обложки пустой или имеет неверный размер');
  if (value.startsWith('Ошибка чтения обложки:')) return language === 'en' ? t('genericCoverError') + ' ' + value.slice('Ошибка чтения обложки:'.length).trim() : value;
  return value;
}

function localizeError(value) {
  if (!value) return '';
  if (value === 'Не удалось прочитать данные трека') return t('trackReadError');
  if (value === 'Команда не выполнена.') return t('commandFailed');
  if (value.startsWith('Не удалось получить доступ к Windows Media:')) {
    const detail = value.slice('Не удалось получить доступ к Windows Media:'.length).trim();
    return language === 'en' ? t('genericMediaError') + ' ' + detail : value;
  }
  return value;
}

function localizeTrack(value) {
  if (!value) return t('noPlayer');
  if (value === 'Ожидание плеера') return t('waitingPlayer');
  if (value === 'Нет активного плеера') return t('noPlayer');
  if (value === 'Не удалось прочитать данные трека') return t('trackReadError');
  return value;
}

function applyLanguage() {
  document.documentElement.lang = language;
  document.querySelectorAll('[data-i18n]').forEach(element => {
    element.textContent = t(element.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-aria]').forEach(element => {
    element.setAttribute('aria-label', t(element.dataset.i18nAria));
  });
  $('lang-toggle').textContent = t('languageLabel');
  $('lang-toggle').setAttribute('aria-label', t('languageAria'));
  document.title = 'BeamNG Media Bridge';
}

function render(state = {}) {
  current = state;
  $('track').textContent = localizeTrack(state.track);
  $('artist').textContent = [state.artist, state.album].filter(Boolean).join(' · ') ||
    (state.session ? t('artistUnknown') : t('mediaStart'));
  $('status').textContent = state.session
    ? (state.is_playing ? t('playing') : t('paused'))
    : (state.error ? t('statusError') : t('waiting'));
  $('status').classList.toggle('online', !!state.session);
  $('error').textContent = localizeError(state.error);
  $('artwork-status').textContent = localizeArtworkStatus(state.artworkStatus);
  $('notice').textContent = localizeError(noticeMessage);
  $('toggle').textContent = state.is_playing ? 'Ⅱ' : '▶';
  $('toggle').setAttribute('aria-label', state.is_playing
    ? (language === 'en' ? 'Pause' : 'Пауза')
    : (language === 'en' ? 'Resume' : 'Продолжить'));
  const cover = $('cover');
  if (state.thumbnail) {
    cover.style.backgroundImage = 'url("' + state.thumbnail + '")';
    cover.textContent = '';
  } else {
    cover.style.backgroundImage = '';
    cover.textContent = '♪';
  }
}

async function toggle() {
  if (pending) return;
  pending = true;
  noticeMessage = '';
  try {
    const result = await window.bridge.command(current.is_playing ? 'pause' : 'play');
    if (!result?.ok) noticeMessage = result?.error || t('commandFailed');
  } catch (error) {
    noticeMessage = error.message;
  } finally {
    pending = false;
    render(current);
  }
}

$('lang-toggle').addEventListener('click', () => {
  language = language === 'ru' ? 'en' : 'ru';
  localStorage.setItem('beamng-media-bridge-language', language);
  applyLanguage();
  render(current);
});

applyLanguage();
window.bridge.getState().then(render);
window.bridge.onState(render);
$('toggle').addEventListener('click', toggle);
$('folder').addEventListener('click', () => window.bridge.openBeamngFolder());
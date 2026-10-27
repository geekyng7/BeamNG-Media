const $ = id => document.getElementById(id);
function setOptionalText(id, value) { const element = $(id); if (element) element.textContent = value; }
let current = {}, pending = false, noticeMessage = '', releaseUrl = '';
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
    trackIsPlaying: 'Трек играет',
    startMusic: 'Запустите музыку в Windows',
    playPause: 'Пауза или продолжение',
    howToConnect: 'Как подключить',
    stepOne: 'Добавьте MediaWidget.zip в папку модов BeamNG.drive.',
    stepTwo: 'Добавьте виджет через меню Apps внутри игры.',
    stepThree: 'Оставьте это приложение запущенным во время игры.',
    openDataFolder: 'Открыть папку данных BeamNG',
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
    languageLabel: 'EN',
    languageAria: 'Switch to English',
    genericMediaError: 'Не удалось получить данные Windows Media.',
    checkUpdates: 'Проверить обновления', openRelease: 'Открыть страницу релиза', checkingUpdates: 'Проверяю обновления…', updateAvailable: 'Доступна версия {version}.', upToDate: 'У вас последняя версия ({version}).', noRelease: 'Публичный релиз пока не найден.', updateFailed: 'Не удалось проверить обновления.', invalidReleaseTag: 'Тег релиза должен иметь вид v1.2.3.'
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
    trackIsPlaying: 'Track is playing',
    startMusic: 'Start playing music in Windows',
    playPause: 'Pause or resume',
    howToConnect: 'How to connect',
    stepOne: 'Add MediaWidget.zip to your BeamNG.drive mods folder.',
    stepTwo: 'Add the widget from the Apps menu in the game.',
    stepThree: 'Keep this app running while you play.',
    openDataFolder: 'Open BeamNG data folder',
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
    languageLabel: 'RU',
    languageAria: 'Переключить на русский',
    genericMediaError: 'Could not read Windows media information.',
    checkUpdates: 'Check for updates', openRelease: 'Open release page', checkingUpdates: 'Checking for updates…', updateAvailable: 'Version {version} is available.', upToDate: 'You have the latest version ({version}).', noRelease: 'No public release was found.', updateFailed: 'Could not check for updates.', invalidReleaseTag: 'Release tag must look like v1.2.3.'
  }
};

function t(key) {
  return strings[language][key] || strings.ru[key] || key;
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
  $('track').textContent = state.session && state.is_playing
    ? t('trackIsPlaying')
    : localizeTrack(state.track);
  $('artist').textContent = [state.artist, state.album].filter(Boolean).join(' · ') ||
    (state.session ? t('artistUnknown') : t('mediaStart'));
  $('status').textContent = state.session
    ? (state.is_playing ? t('playing') : t('paused'))
    : (state.error ? t('statusError') : t('waiting'));
  $('status').classList.toggle('online', !!state.session);
  setOptionalText('error', localizeError(state.error));
  setOptionalText('notice', localizeError(noticeMessage));
  $('toggle').textContent = state.is_playing ? 'Ⅱ' : '▶';
  $('toggle').setAttribute('aria-label', state.is_playing
    ? (language === 'en' ? 'Pause' : 'Пауза')
    : (language === 'en' ? 'Resume' : 'Продолжить'));
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
$('folder')?.addEventListener('click', () => window.bridge.openBeamngFolder());
const updateButton = $('check-updates');
if (updateButton) updateButton.addEventListener('click', async () => {
  const button=$('check-updates'), link=$('release-link');
  button.disabled=true; setOptionalText('update-status', t('checkingUpdates')); releaseUrl=''; if(link) link.hidden=true;
  try {
    const result=await window.bridge.checkForUpdates();
    if(result.noRelease) setOptionalText('update-status', t('noRelease'));
    else if(!result.ok) setOptionalText('update-status', result.error==='Release tag must match v1.2.3'?t('invalidReleaseTag'):t('updateFailed')+' '+result.error);
    else if(result.updateAvailable){setOptionalText('update-status', t('updateAvailable').replace('{version}',result.latestVersion));releaseUrl=result.releaseUrl;if(link) link.hidden=false;}
    else setOptionalText('update-status', t('upToDate').replace('{version}',result.currentVersion));
  } catch(error){setOptionalText('update-status', t('updateFailed')+' '+error.message);}
  finally{button.disabled=false;}
});
$('release-link')?.addEventListener('click',async event=>{event.preventDefault();if(releaseUrl)await window.bridge.openRelease(releaseUrl);});
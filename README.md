### Автор(Author)
https://t.me/mods_base # Лучшие моды (Mods for BeamNG.drive)

# BeamNG Media Bridge

Local Windows media-session bridge for a BeamNG.drive UI widget.

## Русский

BeamNG Media Bridge передаёт данные активного медиа-сеанса Windows в виджет BeamNG.drive.

Возможности:

- название трека, исполнитель, альбом и обложка;
- состояние воспроизведения и команды паузы, продолжения, следующего и предыдущего трека;
- позиция и длительность трека передаются в игру для отображения движущегося таймлайна;
- интерфейс приложения переключается между русским и английским языками; выбор сохраняется;
- локальный обмен данными через 127.0.0.1 — приложение не отправляет медиаинформацию в интернет.

### Требования

- Windows 10 версии 1809 или новее, либо Windows 11, x64;
- Node.js 22.12 или новее и npm — для запуска из исходников и сборки;
- Windows SDK нужен только для повторной генерации WinRT-привязок. Сгенерированные файлы уже находятся в src/winrt-generated.

### Запуск и сборка

В папке проекта выполните:

    npm install
    npm start

Создать Windows-установщик NSIS:

    npm run dist

Результат сборки появится в папке release. Для обычной сборки .NET SDK не требуется.

### Подключение виджета

1. Установите BeamNG Media Bridge и оставьте приложение запущенным.
2. Добавьте beamng-widget.js в пользовательский UI-мод BeamNG.drive.
3. В игре добавьте виджет через меню Apps.
4. Убедитесь, что музыка воспроизводится в приложении, которое публикует медиа-сеанс Windows.

Приложение записывает состояние в:

    %LOCALAPPDATA%\BeamNG\BeamNG.drive\current\media_state.json

Локальные интерфейсы моста:

- HTTP: http://127.0.0.1:12345
- WebSocket: ws://127.0.0.1:12346
- Статус: GET /status
- Команды: /api/play, /api/pause, /api/next, /api/prev

В WebSocket можно отправлять JSON-команды, например:

    {"action":"next"}

Состояние включает track, artist, album, is_playing, thumbnail, position и duration. Обложка передаётся как data URL. Поддержка метаданных, обложек и команд зависит от того, что конкретный проигрыватель сообщает Windows.

## English

BeamNG Media Bridge forwards the active Windows media session to a BeamNG.drive widget.

Features:

- track title, artist, album, and artwork;
- playback state and pause, resume, next-track, and previous-track commands;
- track position and duration are sent to the game so the widget can display a moving timeline;
- the desktop app can switch between Russian and English, and remembers the selection;
- local communication uses 127.0.0.1; media information is not sent to the internet.

### Requirements

- Windows 10 version 1809 or later, or Windows 11, x64;
- Node.js 22.12 or later and npm to run from source and build;
- the Windows SDK is only needed to regenerate the WinRT bindings. Generated files are included in src/winrt-generated.

### Run and build

From the project folder:

    npm install
    npm start

Build the Windows NSIS installer:

    npm run dist

The installer is created in the release folder. The normal build does not require the .NET SDK.

### Add the BeamNG widget

1. Install BeamNG Media Bridge and keep it running.
2. Add beamng-widget.js to a BeamNG.drive user-interface mod.
3. Add the widget from the in-game Apps menu.
4. Make sure music is playing in an app that publishes a Windows media session.

The bridge writes its state to:

    %LOCALAPPDATA%\BeamNG\BeamNG.drive\current\media_state.json

Local bridge interfaces:

- HTTP: http://127.0.0.1:12345
- WebSocket: ws://127.0.0.1:12346
- Status: GET /status
- Commands: /api/play, /api/pause, /api/next, /api/prev

WebSocket commands are JSON, for example:

    {"action":"next"}

The state includes track, artist, album, is_playing, thumbnail, position, and duration. Artwork is sent as a data URL. Metadata, artwork, and command support depend on what each media player publishes to Windows.

### Contributions
@geekyng7


Codex

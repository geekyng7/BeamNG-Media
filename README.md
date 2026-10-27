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

1. Скачайте установщик и установите приложение/распакуйте архив.
2. Скачайте виджет (BeamNG-Media.zip)
3. Добавьте виджет в BeamNG.drive через меню Apps.
4. Запустите музыку в Windows и оставьте BeamNG Media открытым.

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

BeamNG Media Bridge transmits data from the active Windows media session to the BeamNG.drive widget.

Features:

- track name, artist, album, and cover;
- playback status and commands for pause, play, next, and previous tracks;
- track position and duration are transmitted to the game to display a moving timeline;
- the app interface switches between Russian and English; the selection is saved;
- local data exchange via 127.0.0.1 — the app does not send media information to the internet.

### Requirements

- Windows 10 version 1809 or newer, or Windows 11, x64;
- Node.js 22.12 or newer and npm — for running from source and building;
- Windows SDK is needed only for regenerating WinRT bindings. The generated files are already located in src/winrt-generated.

### Running and building

In the project folder, run:

    npm install
    npm start

Create a Windows installer using NSIS:

    npm run dist

The build result will appear in the release folder. For a regular build, .NET SDK is not required.

### Adding a widget

1. Download the installer and install the application/unpack the archive.
2. Download the widget (BeamNG-Media.zip)
3. Add the widget to BeamNG.drive via the Apps menu.
4. Play music in Windows and leave BeamNG Media open.

The application records the state in:

    %LOCALAPPDATA%\BeamNG\BeamNG.drive\current\media_state.json

Local bridge interfaces:

- HTTP: http://127.0.0.1:12345
- WebSocket: ws://127.0.0.1:12346
- Status: GET /status
- Commands: /api/play, /api/pause, /api/next, /api/prev

JSON commands can be sent over WebSocket, for example:

    {"action":"next"}

The state includes track, artist, album, is_playing, thumbnail, position, and duration. The cover is transmitted as a data URL. Support for metadata, covers, and commands depends on what the specific player reports to Windows.

### Contributions
@geekyng7


Codex

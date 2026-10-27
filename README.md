# BeamNG Media Bridge

Windows desktop application for displaying the current Windows media session and pausing/resuming it from a small local BeamNG widget.

## Features

- Current track, artist, album, artwork, play state, and timeline.
- Pause/resume and previous/next track controls in the desktop interface and supplied BeamNG widget.
- Artwork is sent to the widget as a `thumbnail` data URL over WebSocket and is also included in `%LOCALAPPDATA%\BeamNG\BeamNG.drive\current\media_state.json`.
- HTTP endpoint `127.0.0.1:12345` and WebSocket `127.0.0.1:12346`; both bind only to loopback. GET/POST commands `/api/play`, `/api/pause`, `/api/next`, and `/api/prev` are supported.
- Album artwork is capped at 4 MB. The WebSocket sends the artwork only when it changes; consumers should keep the last received image until a new `thumbnail` value arrives or the session ends.

## Requirements

- Windows 10 (build 17763 or newer) or Windows 11, x64.
- Node.js 20+ and npm.
- .NET 8 SDK or newer (not just the .NET runtime).
- Internet access on first build to restore npm and NuGet packages.

## Run from source

Open PowerShell in the project folder and run:

```powershell
npm install
npm rebuild electron electron-winstaller
npm run build:native
npm start
```

The native helper reads Windows Global System Media Transport Controls. Windows exposes explicit play, pause, and toggle requests for media sessions; a player can still decline a request. See [Microsoft's session API](https://learn.microsoft.com/en-us/uwp/api/windows.media.control.globalsystemmediatransportcontrolssession).

## Build the installer

```powershell
npm run dist
```

This publishes a self-contained `media-helper.exe`, then creates the installer at:

```text
release\BeamNG-Media-Bridge-1.0.0-Setup.exe
```

Build on Windows x64. No Python installation is needed for the released app.

## Add it to BeamNG

1. Add `MediaWidget.zip` to the BeamNG.drive mods folder and install its UI app in game.
2. Start BeamNG Media Bridge before using the widget.
3. The included demo widget is at `http://127.0.0.1:12345/`. A custom widget can connect to `ws://127.0.0.1:12346` and read `track`, `artist`, `album`, `is_playing`, `thumbnail`, `position`, and `duration`.
4. The BeamNG directive sends GET /api/play, GET /api/next, and GET /api/prev; the bridge also accepts POST for those actions. WebSocket clients can send play, pause, toggle, next, or prev.

The app reads Windows media metadata and writes local state for BeamNG. It makes no outbound network requests at runtime. Publish source together with a signed installer and checksum; signing helps identify the publisher but cannot guarantee a VirusTotal result.



Use beamng-widget.js as the BeamNG app directive. It accepts a full thumbnail data URL or legacy raw JPEG Base64, and reads up to 8 MiB from the local state file so artwork is not truncated.





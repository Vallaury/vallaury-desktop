<div align="center">

<img src="assets/icon.png" alt="Vallaury icon" width="112" height="112">

# Vallaury for desktop

**Timetable, homework, exams and notes of your class, in a window of its own. Windows, Linux, macOS.**

[![License: GPL v3](https://img.shields.io/badge/license-GPL--3.0--only-blue.svg)](LICENSE)

[Website](https://app.vallaury.it) &nbsp;|&nbsp; [Privacy](PRIVACY.md) &nbsp;|&nbsp; [Android app](https://github.com/sappafrancesco/vallaury-android)

</div>

## What this is

[Vallaury](https://app.vallaury.it) is a school platform made for the students and teachers of the Vallauri institute in
Fossano, Italy. It is an independent project, not the official platform of any school.

This repository is the desktop app. It is deliberately small: an [Electron](https://www.electronjs.org/) window around
`https://app.vallaury.it`, with no feature logic of its own. Everything you use lives on the website and reaches the app as
soon as it is deployed. The app adds what a browser tab cannot: its own window that remembers where it was, signing in with
Google through your system browser, and (coming next) notifications and a tray icon.

| | |
|---|---|
| Source of the app | this repository, [GPL-3.0-only](LICENSE) |
| Source of the service | not published |
| Opens inside the window | `https://app.vallaury.it` only; every other address opens in your browser |

## Build and run

```sh
npm install
npm test        # type check, unit tests
npm start       # builds and opens the window
```

`VALLAURY_URL` points an unpackaged run at another HTTPS site (for example the demo). A packaged app ignores it.

## Status

Early releases. See [CHANGELOG.md](CHANGELOG.md).

## Install

Packages are on the [releases page](https://github.com/sappafrancesco/vallaury-desktop/releases). Every release carries `SHA256SUMS` and a build provenance statement.

| System | Package | Needs |
|---|---|---|
| Linux (x64, arm64) | `.AppImage` (any distribution), `.deb` (Debian, Ubuntu, Mint), `.rpm` (Fedora, openSUSE) | glibc 2.25 or newer (measured on the x64 build), GTK 3 and NSS from the system. A secret service (GNOME Keyring, KWallet) lets the app keep its key on disk; without one the key lives in memory only |
| Windows (x64, arm64) | `.exe` installer, per user, no administrator rights | Windows 10 or newer |
| macOS (Apple silicon and Intel) | `.dmg` | macOS 13 or newer |

The minimums are Electron's own, not ours. AppImage: `chmod +x Vallaury-*.AppImage && ./Vallaury-*.AppImage` (if FUSE is missing, add `--appimage-extract-and-run`).

Windows and macOS builds are not signed yet, so the system asks for one extra confirmation the first time. On Windows, SmartScreen: More info, then Run anyway. On macOS, right-click the app, Open, confirm.

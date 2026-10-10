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
| Telemetry, analytics, crash reporting | none |
| Opens inside the window | `https://app.vallaury.it` only; every other address opens in your browser |

## Build and run

```sh
npm install
npm test        # type check, unit tests
npm start       # builds and opens the window
```

`VALLAURY_URL` points an unpackaged run at another HTTPS site (for example the demo). A packaged app ignores it.

## Status

First steps. See [CHANGELOG.md](CHANGELOG.md). Plan and decisions: the design document in the service's repository is kept
in sync with this one: window and navigation rules, sign-in handoff, linking the computer, notifications, packages.

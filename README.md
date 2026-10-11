<div align="center">

<img src="assets/icon.png" alt="Vallaury" width="112" height="112">

# Vallaury for desktop

**Timetable, homework, exams and notes of your class, in a window of its own.**

<a href="https://github.com/Vallaury/vallaury-desktop/releases/latest"><img src="assets/badges/windows.svg" alt="Download Vallaury for Windows" height="54"></a>&nbsp;
<a href="https://github.com/Vallaury/vallaury-desktop/releases/latest"><img src="assets/badges/macos.svg" alt="Download Vallaury for macOS" height="54"></a>&nbsp;
<a href="https://github.com/Vallaury/vallaury-desktop/releases/latest"><img src="assets/badges/linux.svg" alt="Download Vallaury for Linux" height="54"></a>

<sub>Windows 10 or newer &nbsp;·&nbsp; macOS 13 or newer &nbsp;·&nbsp; Linux, x86_64 and arm64</sub>

[Website](https://vallaury.it) &nbsp;·&nbsp; [Open in the browser](https://app.vallaury.it) &nbsp;·&nbsp; [Privacy](PRIVACY.md) &nbsp;·&nbsp; [Android app](https://github.com/Vallaury/vallaury-android)

</div>

<br>

## Install

Pick your system. Each one has a plain download and a command for your package manager; the command also keeps the app up to date.

### <picture><source media="(prefers-color-scheme: dark)" srcset="assets/os/windows-dark.svg"><img src="assets/os/windows-light.svg" alt="" height="22"></picture>&nbsp;Windows

Download the `.exe` from the [latest release](https://github.com/Vallaury/vallaury-desktop/releases/latest) and run it. It installs for your user only and does not ask for administrator rights. Use `win-x64` on most computers, `win-arm64` on Arm laptops, `win-ia32` on 32-bit Windows.

With [Scoop](https://scoop.sh):

```powershell
scoop bucket add vallaury https://github.com/Vallaury/scoop-vallaury
scoop install vallaury
```

The installer is not signed yet, so SmartScreen shows "Windows protected your PC" the first time. Choose **More info**, then **Run anyway**.

### <picture><source media="(prefers-color-scheme: dark)" srcset="assets/os/macos-dark.svg"><img src="assets/os/macos-light.svg" alt="" height="22"></picture>&nbsp;macOS

Download the `.dmg` from the [latest release](https://github.com/Vallaury/vallaury-desktop/releases/latest), open it and drag Vallaury to Applications. One build runs on Apple silicon and on Intel.

With [Homebrew](https://brew.sh):

```sh
brew install --cask vallaury/vallaury/vallaury
```

The app is not signed yet, so macOS refuses the first opening. Right-click the app, choose **Open**, and confirm. Homebrew takes care of this step for you.

### <picture><source media="(prefers-color-scheme: dark)" srcset="assets/os/linux-dark.svg"><img src="assets/os/linux-light.svg" alt="" height="22"></picture>&nbsp;Linux

On Debian, Ubuntu and Mint, or on Fedora and openSUSE, add the signed repository and install from it. The steps for each distribution are on the [packages page](https://vallaury.github.io/vallaury-packages/); the package is called `vallaury-desktop`.

On any other distribution, download the AppImage from the [latest release](https://github.com/Vallaury/vallaury-desktop/releases/latest):

```sh
chmod +x Vallaury-*.AppImage
./Vallaury-*.AppImage
```

If FUSE is missing, add `--appimage-extract-and-run`. The `.deb` and `.rpm` files are on the same page, for both x86_64 and arm64.

### Check a download

Every release has a `SHA256SUMS` file and a build provenance statement made by GitHub Actions:

```sh
sha256sum -c SHA256SUMS --ignore-missing
gh attestation verify <file> --repo Vallaury/vallaury-desktop
```

<br>

## What it is

[Vallaury](https://app.vallaury.it) is a school platform made for the students and teachers of the Vallauri institute in Fossano, Italy. It is an independent project and not the official platform of any school.

This app is deliberately small. It is an [Electron](https://www.electronjs.org/) window around `https://app.vallaury.it` and has no feature logic of its own, so everything you use lives on the website and reaches the app as soon as it is published. The app adds what a browser tab cannot:

- a window that remembers its place and size;
- sign-in with Google through your system browser;
- notifications, and an icon in the tray or menu bar with shortcuts to Today, Timetable, Homework, Exams and New note;
- a count of new notifications on the dock or taskbar icon;
- start at login, if you want it;
- automatic updates on Windows and for the AppImage. Elsewhere the app tells you that a new version exists and opens the download page.

Only `app.vallaury.it` opens inside the window. Every other address opens in your browser. [PRIVACY.md](PRIVACY.md) says what the app stores and what it sends.

## Build it yourself

You need Node.js (the version in [`.nvmrc`](.nvmrc)).

```sh
npm install
npm test        # type check and unit tests
npm start       # build and open the window
```

`VALLAURY_URL` points an unpackaged run at another HTTPS site, for example the demo. A packaged app ignores it.

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) first. Security problems go through [SECURITY.md](SECURITY.md). The history of releases is in [CHANGELOG.md](CHANGELOG.md).

The code of the app is released under the [GPL-3.0-only](LICENSE). The service behind `app.vallaury.it` is not published.

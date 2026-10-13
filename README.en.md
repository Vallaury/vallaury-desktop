<div align="center">

<img src="assets/icon.png" alt="Vallaury" width="112" height="112">

# Vallaury for desktop

**Timetable, homework, exams and notes of your class, in a window of its own.**

<a href="https://github.com/Vallaury/vallaury-desktop/releases/latest"><img src="assets/badges/windows.svg" alt="Download Vallaury for Windows" height="54"></a>&nbsp;
<a href="https://github.com/Vallaury/vallaury-desktop/releases/latest"><img src="assets/badges/macos.svg" alt="Download Vallaury for macOS" height="54"></a>&nbsp;
<a href="https://github.com/Vallaury/vallaury-desktop/releases/latest"><img src="assets/badges/linux.svg" alt="Download Vallaury for Linux" height="54"></a>

<sub><a href="README.md">Italiano</a> &nbsp;·&nbsp; English</sub><br><sub>Windows 10 or newer &nbsp;·&nbsp; macOS 13 or newer &nbsp;·&nbsp; Linux, x86_64 and arm64</sub>

[Website](https://vallaury.it) &nbsp;·&nbsp; [Open in the browser](https://app.vallaury.it) &nbsp;·&nbsp; [Privacy](PRIVACY.md) &nbsp;·&nbsp; [Android app](https://github.com/Vallaury/vallaury-android)

</div>

<br>

## Install

Download **one file**, the one for your system, from the [latest release](https://github.com/Vallaury/vallaury-desktop/releases/latest) (the files are under **Assets**; ignore the others, they are for updates and checks). Each system also has a command for a package manager that keeps the app up to date.

### Windows

1. Download `Vallaury-<version>-win-x64.exe` (most PCs). Arm laptops: `win-arm64`. 32-bit Windows: `win-ia32`. To find out, open **Start, Settings, System, About** and read "System type".
2. Double-click it. It installs for your user only and needs no administrator rights.
3. The installer is not signed yet, so SmartScreen shows **"Windows protected your PC"**. This is expected. Choose **More info**, then **Run anyway**.

With [Scoop](https://scoop.sh):

```powershell
scoop bucket add vallaury https://github.com/Vallaury/scoop-vallaury
scoop install vallaury
```

### macOS

1. Download `Vallaury-<version>-mac-universal.dmg` (one build for Apple silicon and Intel) and open it.
2. Drag Vallaury to **Applications**.
3. The app is not signed yet, so the first opening is refused. Right-click the app, choose **Open**, confirm. On macOS 15 or newer, if only "Cancel" is offered, open **System Settings, Privacy & Security** and press **Open Anyway**.

With [Homebrew](https://brew.sh) (it takes care of that step for you):

```sh
brew install --cask vallaury/vallaury/vallaury
```

### Linux

Debian, Ubuntu, Mint, Fedora, openSUSE: add the signed repository and install from it, so updates arrive by themselves. The steps are on the [packages page](https://vallaury.github.io/vallaury-packages/); the package is called `vallaury-desktop`.

Any other distribution, or no installation at all: download the AppImage.

```sh
chmod +x Vallaury-*.AppImage
./Vallaury-*.AppImage
```

If it says FUSE is missing, install `libfuse2` (`libfuse2t64` on Ubuntu 24.04) or run it with `--appimage-extract-and-run`. A `.deb` or `.rpm` downloaded by hand installs with `sudo apt install ./file.deb` or `sudo dnf install ./file.rpm`, but does not update by itself.

### First start

Sign in with Google or with the e-mail code, using your school address. No installation wanted? [app.vallaury.it](https://app.vallaury.it) works the same in a browser.

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

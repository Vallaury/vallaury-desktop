# Changelog

## 0.1.8 (2026-11-06)

- Windows without administrator rights: every release now also carries `Vallaury-<version>-win-x64-portable.exe` (one file, no installation) and `Vallaury-<version>-win-x64.zip` (a folder that starts without extracting anything, for computers that block programs run from the temporary folder). Neither updates itself; the app tells the person once per version.
- The portable .exe registers the `vallaury://` links and the start at sign-in with the path of the file the person opened, not with the temporary copy it runs from.
- A Windows copy made by unpacking the zip no longer runs the installer updater, which would have installed a second copy.

## 0.1.7 (2026-11-04)

- A new version of the app now starts from clean kept files: the service worker and its caches are emptied once per version, so the app never keeps running on the scripts of the one before. Sign-in is not affected.
- A window that stops answering is restarted after ten seconds and shows the usual screen that reloads by itself, instead of staying frozen.
- Pairs with the site's new handling of slow connections and old open pages.

## 0.1.6 (2026-11-02)

- Updates are now passive. Windows and the Linux AppImage look for a release shortly after the start, about every four hours (spread out, with a back-off after failures), when the window gets focus and when the computer wakes up. The new version is downloaded in the background and installed when the app is closed, or by itself after the window has been hidden in the tray for ten minutes (the window then stays hidden after the restart). A visible window is never interrupted, and there is no notification on this path.
- Installations that cannot update themselves (deb, rpm, unsigned Mac, portable) are told once per version instead of once per start.
- The Profile shows where the update stands (looking, downloading, ready) with "Check now", "Restart now" and "Download" where they make sense. Needs the matching site version.

## 0.1.5 (2026-11-02)

- Passkeys: Linux and macOS have no passkey prompt for an embedded window, so "Sign in with a passkey" now opens the system browser, which asks for the passkey and hands a one-time code back to the app (the same hand-back as Google). Windows keeps its own prompt in the window. Needs the matching site version.
- Links: `vallaury://open?path=/page` and the site's own `https://app.vallaury.it/...` addresses open that page in the running app (also when the app was started by the link, on macOS too). Nothing outside the site can come out of such a link. A sign-in link that is too old now says so instead of doing nothing.
- Pages that open a blank window and fill it themselves (print views) now work; other windows stay locked down.

## 0.1.4 (2026-10-15)

- Signing in with Google now always ends inside the app. If the sign-in address was reached directly (a click before the page was ready, or an old copy of the page), the browser used to be signed in instead of the app; the app now catches that address and starts the hand-back itself.
- Rounded app icon, and the app can stay in the background without a tray icon (Ctrl+Q quits).
- Notifications can be switched on and off from the app, with the reason shown when they cannot be enabled.
- Snap Store package (`snap/`): strict confinement, amd64 and arm64, built and sent to the store by the release workflow. Updates come from the store, and starting at sign-in is written in the snap's own data folder.

## 0.1.3 (2026-10-13)

- Installation guide: the README is in Italian first (English in `README.en.md`), and every release page now explains which file to download for Windows, Mac and Linux, with the steps for the first opening.
- Every release also carries copies of the installers without the version in the name (`Vallaury-win-x64.exe`, `Vallaury-mac-universal.dmg`, `Vallaury-linux-x86_64.AppImage`, and the Arm ones), so `releases/latest/download/<name>` is a link that never goes out of date.
- The store page and menu entry say which school Vallaury is made for (the Vallauri institute in Fossano) and that it is independent.

## 0.1.2 (2026-10-11)

- Flatpak (Flathub): the manifest, store page, menu entry and screenshots are in `flatpak/`. Inside Flatpak the app no longer checks for updates (Flathub does) and starting at sign-in goes through the system's background portal.

## 0.1.1 (2026-10-10)

- Windows 32-bit installer (built with Electron 43, the last version that supports 32-bit Windows; it only tells when a new version exists instead of updating itself).

## 0.1.0 (2026-10-10)

- Updates: the Windows installer and the Linux AppImage look for a new version a minute after start and every six hours, download it quietly and install it when the app closes (a notice offers to restart now). The Mac app (until it is signed) and the deb and rpm packages only say that a new version exists and open the download page. Help > Check for updates asks by hand. No telemetry: the check is a plain request for the release list.
- Window around `https://app.vallaury.it`; remembers position, size and maximised state.
- Only the site stays inside the window; other addresses open in the system browser (web, mail and phone links only).
- Permissions: notifications, clipboard write and full screen for the site; everything else is refused.
- Offline and server-error screen with automatic retry.
- Sign in with Google through the system browser (`vallaury://signin`), finished inside the window with a one-time code and a secret that never leaves the app.
- Bridge for the page: link this computer to the account (key kept in the system secret store, in memory only where there is none), notifications with a poll to the service every five minutes, sign-out that erases the key, notifications on screen and, on request, cookies and kept pages.
- Notifications without any push service; a click opens the page the notification is about.
- Private pages (security, grades, moderation) are kept out of screenshots on Windows and macOS when the setting is on.
- A notification says where a downloaded file was saved.
- Icon in the system tray / menu bar with Open, Today, Timetable, Homework, Exams, New note, Notifications, Start at login and Quit. Where the desktop shows no tray (GNOME without an extension) closing the window quits instead of hiding.
- Closing the window keeps the app running when a linked computer has notifications on; a notice says so once.
- Start when you sign in to the computer, hidden (off by default).
- Count of new notifications on the dock icon, a dot on the Windows taskbar button and the tray tooltip.
- One window at a time; a second launch focuses the first.

# Changelog

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

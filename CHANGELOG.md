# Changelog

## 0.1.0 (unreleased)

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

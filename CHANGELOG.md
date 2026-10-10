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
- One window at a time; a second launch focuses the first.

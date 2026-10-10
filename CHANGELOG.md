# Changelog

## 0.1.0 (unreleased)

- Window around `https://app.vallaury.it`; remembers position, size and maximised state.
- Only the site stays inside the window; other addresses open in the system browser (web, mail and phone links only).
- Permissions: notifications, clipboard write and full screen for the site; everything else is refused.
- Offline and server-error screen with automatic retry.
- Sign in with Google through the system browser (`vallaury://signin`), finished inside the window with a one-time code and a secret that never leaves the app.
- One window at a time; a second launch focuses the first.

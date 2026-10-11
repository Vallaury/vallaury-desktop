# Flatpak (Flathub)

Everything Flathub needs, kept next to the code it builds.

| File | What it is |
|---|---|
| `it.vallaury.Vallaury.yml` | The manifest: runtime, permissions and how the app is built, offline |
| `generated-sources.json` | Every npm package and the Electron binary, with checksums (made by `flatpak-node-generator`) |
| `it.vallaury.Vallaury.metainfo.xml` | The store page: description (English and Italian), screenshots, releases, content rating |
| `it.vallaury.Vallaury.desktop` | The menu entry and the `vallaury://` handler |
| `screenshots/` | Four 1920×1080 pictures of the real app, with the demonstration data (a made-up class) |

## Why these permissions

The app is a website in a window. It needs the **network**, a **window** (Wayland, X11 as fallback) with **hardware drawing**, **sound** (some pages carry video), the **notifications** service, the **notification-area icon** (`StatusNotifierWatcher`) and the **secret store** where the key of the computer is kept. No access to the home folder or to any device other than the graphics card. Starting at sign-in goes through the system's background portal, not through a file; updates come from Flathub, so the built-in updater is off inside Flatpak.

## Test the build on this machine

```sh
# once
flatpak install --user flathub org.flatpak.Builder org.freedesktop.Sdk//25.08 org.freedesktop.Sdk.Extension.node22//25.08 org.electronjs.Electron2.BaseApp//25.08
pipx install "git+https://github.com/flatpak/flatpak-builder-tools.git#subdirectory=node"

# after a change to package-lock.json
flatpak-node-generator -o flatpak/generated-sources.json npm package-lock.json

# build and install (the manifest's git source can be swapped for a `dir` source of this folder to try uncommitted work)
flatpak run --filesystem=$PWD --command=flatpak-builder org.flatpak.Builder \
  --user --install --force-clean --repo=repo build flatpak/it.vallaury.Vallaury.yml
flatpak run it.vallaury.Vallaury
```

Check the store page and the menu entry before submitting:

```sh
appstreamcli validate --no-net flatpak/it.vallaury.Vallaury.metainfo.xml
desktop-file-validate flatpak/it.vallaury.Vallaury.desktop
flatpak run --command=flatpak-builder-lint org.flatpak.Builder manifest flatpak/it.vallaury.Vallaury.yml
```

## Publishing a new version

1. Release as usual (tag `vX.Y.Z`).
2. Regenerate `generated-sources.json` if the dependencies changed; add the `<release>` to the metainfo; put the new `tag` and `commit` in the manifest.
3. Open a pull request on the application's own repository on GitHub (`flathub/it.vallaury.Vallaury`) with those files.

## Screenshots

Taken from the real app (demo account) at 1280×720 CSS pixels, scale 1.5, with no test overlays. Retake them when the look of the app changes.

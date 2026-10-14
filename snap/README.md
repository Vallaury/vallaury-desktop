# Snap Store

`snapcraft.yaml` builds the app from source (strict confinement, core24, amd64 and arm64). The release workflow builds it on every tag and, when the secret exists, uploads it to the **candidate** channel.

## Once, by the owner

```sh
sudo snap install snapcraft --classic
snapcraft login
snapcraft register vallaury          # reserves the name
snapcraft export-login --snaps vallaury --acls package_access,package_push,package_update,package_release --channels candidate,edge -   # paste into the repository secret SNAPCRAFT_STORE_CREDENTIALS
```

On the store page (snapcraft.io/vallaury/listing) add the screenshots from `flatpak/screenshots/` and choose the category Education.

## Try it here

```sh
snapcraft pack                       # needs LXD or Multipass
sudo snap install --dangerous vallaury_*.snap
snap connect vallaury:password-manager-service
```

Check: window opens, Google sign-in returns through `vallaury://`, notifications, tray icon, start at sign-in.

## Release

Tag `vX.Y.Z` -> candidate. After trying it: `snapcraft release vallaury <revision> stable`.

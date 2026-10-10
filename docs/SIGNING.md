# Signing and distribution

Unsigned packages work, but the systems warn. This is what each system needs, what it costs, and where it is set.

| System | Without a signature | With one |
|---|---|---|
| Linux | Nothing to sign. Checksums and a build provenance statement are published with every release. | Same. |
| Windows | SmartScreen shows "Windows protected your PC": More info, then Run anyway. | No warning once the signing identity has reputation. |
| macOS | Gatekeeper refuses the first open: right-click the app, Open, confirm; or `xattr -cr /Applications/Vallaury.app`. | Opens normally. |

## Windows

- **Microsoft Store (free for individuals since 2025):** an MSIX is signed by the Store. Needs a Partner Center account; add an `appx` target and the identity values from Partner Center.
- **SignPath Foundation (free for open source):** apply at signpath.org with this repository (GPL-3.0, public, built by GitHub Actions). When approved, add the SignPath action to the `windows` job and publish the code signing policy on the project page. Not wired yet because approval is needed first.
- **Own certificate (OV):** set the repository secrets `WIN_CSC_LINK` (base64 of the .pfx) and `WIN_CSC_KEY_PASSWORD`; the release job signs by itself. Azure Artifact Signing is not open to individuals in Italy.

## macOS

Needs the Apple Developer Program (99 USD a year). Then set the repository secrets `CSC_LINK` (base64 of the Developer ID Application certificate .p12), `CSC_KEY_PASSWORD`, and for notarization `APPLE_API_KEY` (the .p8 contents), `APPLE_API_KEY_ID`, `APPLE_API_ISSUER`, and set `mac.notarize: true` in `electron-builder.yml`. `build/entitlements.mac.plist` already holds the smallest set Chromium needs.

## Verifying a download

```sh
sha256sum -c SHA256SUMS --ignore-missing
gh attestation verify Vallaury-0.1.0-linux-x86_64.AppImage --repo sappafrancesco/vallaury-desktop
```

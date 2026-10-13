## Come installare Vallaury sul computer

**Scarica un solo file**, quello della tua riga qui sotto. Gli altri file di questa pagina servono agli aggiornamenti automatici e alle verifiche: puoi ignorarli.

| Il tuo computer | Cosa scaricare |
|---|---|
| **Windows 10 o 11** (quasi tutti i PC) | [`Vallaury-{{VERSION}}-win-x64.exe`](https://github.com/Vallaury/vallaury-desktop/releases/download/v{{VERSION}}/Vallaury-{{VERSION}}-win-x64.exe) |
| Windows su processore Arm (Surface Pro X, portatili Snapdragon) | [`Vallaury-{{VERSION}}-win-arm64.exe`](https://github.com/Vallaury/vallaury-desktop/releases/download/v{{VERSION}}/Vallaury-{{VERSION}}-win-arm64.exe) |
| Windows a 32 bit (molto raro) | [`Vallaury-{{VERSION}}-win-ia32.exe`](https://github.com/Vallaury/vallaury-desktop/releases/download/v{{VERSION}}/Vallaury-{{VERSION}}-win-ia32.exe) |
| **Mac** (Apple silicon e Intel) | [`Vallaury-{{VERSION}}-mac-universal.dmg`](https://github.com/Vallaury/vallaury-desktop/releases/download/v{{VERSION}}/Vallaury-{{VERSION}}-mac-universal.dmg) |
| **Linux**: Ubuntu, Debian, Mint | [`Vallaury-{{VERSION}}-linux-amd64.deb`](https://github.com/Vallaury/vallaury-desktop/releases/download/v{{VERSION}}/Vallaury-{{VERSION}}-linux-amd64.deb) |
| **Linux**: Fedora, openSUSE | [`Vallaury-{{VERSION}}-linux-x86_64.rpm`](https://github.com/Vallaury/vallaury-desktop/releases/download/v{{VERSION}}/Vallaury-{{VERSION}}-linux-x86_64.rpm) |
| **Linux**: qualsiasi altra distribuzione | [`Vallaury-{{VERSION}}-linux-x86_64.AppImage`](https://github.com/Vallaury/vallaury-desktop/releases/download/v{{VERSION}}/Vallaury-{{VERSION}}-linux-x86_64.AppImage) |
| Linux su processore Arm | gli stessi file con `arm64` (`.deb`, `.AppImage`) o `aarch64` (`.rpm`) al posto di `amd64` e `x86_64` |

I file sono in fondo alla pagina, sotto **Assets**. Non sai che Windows hai? Apri **Start, Impostazioni, Sistema, Informazioni** e leggi "Tipo di sistema": se c'è scritto "x64", scarica `win-x64`.

### Windows

1. Scarica il file `.exe` e aprilo con un doppio clic. Non servono i permessi di amministratore.
2. Compare **"Windows ha protetto il PC"**: succede perché il programma non ha ancora la firma a pagamento di Microsoft. Non è un virus. Clicca **Ulteriori informazioni**, poi **Esegui comunque**.
3. Vallaury si installa da solo e si apre. Trovi l'icona sul desktop e nel menu Start.

### Mac

1. Scarica il file `.dmg` e aprilo.
2. Trascina **Vallaury** nella cartella **Applicazioni**.
3. La prima volta macOS rifiuta di aprirlo perché l'app non è ancora firmata da Apple. Fai clic destro (o Control e clic) su Vallaury in Applicazioni, scegli **Apri** e conferma.
4. Se compare solo il pulsante "Annulla" (succede con macOS 15 o più recente), apri **Impostazioni di Sistema, Privacy e sicurezza**, scorri in basso fino a "Vallaury è stato bloccato" e premi **Apri comunque**.

### Linux

- **Ubuntu, Debian, Mint**: `sudo apt install ./Vallaury-{{VERSION}}-linux-amd64.deb`
- **Fedora**: `sudo dnf install ./Vallaury-{{VERSION}}-linux-x86_64.rpm`
- **AppImage** (non installa nulla, parte e basta): `chmod +x Vallaury-*.AppImage` e poi `./Vallaury-*.AppImage`. Se risponde che manca FUSE, installa `libfuse2` (su Ubuntu 24.04 `libfuse2t64`) oppure avvia con `./Vallaury-*.AppImage --appimage-extract-and-run`.

Con `.deb` e `.rpm` scaricati a mano gli aggiornamenti non arrivano da soli. Se vuoi che arrivino, aggiungi il repository firmato: [vallaury.github.io/vallaury-packages](https://vallaury.github.io/vallaury-packages/). Su Windows e con l'AppImage l'app si aggiorna da sola.

### Alla prima apertura

Accedi con Google oppure con il codice che ricevi per email, usando l'**indirizzo email della scuola**. Se non riesci a entrare, o l'installazione si blocca, leggi le [domande frequenti](https://vallaury.it/domande) o scrivi a aiuto@vallaury.it. Non vuoi installare niente? Vallaury funziona uguale nel browser su [app.vallaury.it](https://app.vallaury.it).

---

## English

**Download one file only**, the one in your row of the table above; the other files are for automatic updates and checks.

- **Windows**: run the `.exe` (`win-x64` for most PCs, `win-arm64` for Arm, `win-ia32` for 32-bit). If SmartScreen says "Windows protected your PC", choose **More info**, then **Run anyway**: the installer is not code-signed yet.
- **macOS**: open the `.dmg`, drag Vallaury to Applications. The first time, right-click the app and choose **Open**. On macOS 15 or newer, if only "Cancel" shows, go to **System Settings, Privacy & Security** and press **Open Anyway**.
- **Linux**: `sudo apt install ./Vallaury-{{VERSION}}-linux-amd64.deb`, `sudo dnf install ./Vallaury-{{VERSION}}-linux-x86_64.rpm`, or make the AppImage executable and run it. Signed repositories with automatic updates: [vallaury.github.io/vallaury-packages](https://vallaury.github.io/vallaury-packages/).

Sign in with Google or an e-mail code, using your school address.

### Verify a download

`SHA256SUMS` lists the checksum of every file, and every file has a build provenance statement made by GitHub Actions:

```sh
sha256sum -c SHA256SUMS --ignore-missing
gh attestation verify <file> --repo Vallaury/vallaury-desktop
```

---

## Novità di questa versione / Changes

{{CHANGES}}

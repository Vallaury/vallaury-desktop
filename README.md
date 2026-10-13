<div align="center">

<img src="assets/icon.png" alt="Vallaury" width="112" height="112">

# Vallaury per computer

**Orario, compiti, verifiche e appunti della tua classe, in una finestra tutta loro.**

<a href="https://github.com/Vallaury/vallaury-desktop/releases/latest"><img src="assets/badges/windows.svg" alt="Scarica Vallaury per Windows" height="54"></a>&nbsp;
<a href="https://github.com/Vallaury/vallaury-desktop/releases/latest"><img src="assets/badges/macos.svg" alt="Scarica Vallaury per macOS" height="54"></a>&nbsp;
<a href="https://github.com/Vallaury/vallaury-desktop/releases/latest"><img src="assets/badges/linux.svg" alt="Scarica Vallaury per Linux" height="54"></a>

<sub>Italiano &nbsp;·&nbsp; <a href="README.en.md">English</a></sub><br><sub>Windows 10 o successivo &nbsp;·&nbsp; macOS 13 o successivo &nbsp;·&nbsp; Linux, x86_64 e arm64</sub>

[Sito](https://vallaury.it) &nbsp;·&nbsp; [Apri nel browser](https://app.vallaury.it) &nbsp;·&nbsp; [Privacy](PRIVACY.md) &nbsp;·&nbsp; [App Android](https://github.com/Vallaury/vallaury-android)

</div>

<br>

## Come si installa

Scarica **un solo file**, quello per il tuo computer, dall'[ultima versione](https://github.com/Vallaury/vallaury-desktop/releases/latest). I file stanno in fondo alla pagina, sotto **Assets**. Gli altri servono agli aggiornamenti automatici e alle verifiche: ignorali. Non vuoi installare niente? [app.vallaury.it](https://app.vallaury.it) funziona uguale nel browser.

| Il tuo computer | Il file da scaricare |
|---|---|
| Windows 10 o 11 (quasi tutti i PC) | `Vallaury-<versione>-win-x64.exe` |
| Windows su processore Arm | `win-arm64.exe` |
| Windows a 32 bit (molto raro) | `win-ia32.exe` |
| Mac (Apple silicon e Intel) | `mac-universal.dmg` |
| Ubuntu, Debian, Mint | `linux-amd64.deb` (o il repository, più sotto) |
| Fedora, openSUSE | `linux-x86_64.rpm` (o il repository) |
| Qualsiasi altro Linux | `linux-x86_64.AppImage` |

### <picture><source media="(prefers-color-scheme: dark)" srcset="assets/os/windows-dark.svg"><img src="assets/os/windows-light.svg" alt="" height="22"></picture>&nbsp;Windows

1. Scarica il file `.exe`. Non sai quale? Apri **Start, Impostazioni, Sistema, Informazioni** e leggi "Tipo di sistema": se c'è "x64", prendi `win-x64`.
2. Aprilo con un doppio clic. Si installa solo per il tuo utente e non chiede i permessi di amministratore.
3. Windows mostra **"Windows ha protetto il PC"**. È normale: l'installer non ha ancora la firma a pagamento di Microsoft. Clicca **Ulteriori informazioni**, poi **Esegui comunque**.
4. Vallaury si apre da solo. L'icona è sul desktop e nel menu Start.

Con [Scoop](https://scoop.sh), se lo usi:

```powershell
scoop bucket add vallaury https://github.com/Vallaury/scoop-vallaury
scoop install vallaury
```

### <picture><source media="(prefers-color-scheme: dark)" srcset="assets/os/macos-dark.svg"><img src="assets/os/macos-light.svg" alt="" height="22"></picture>&nbsp;macOS

1. Scarica il file `.dmg` e aprilo. Una sola versione va bene sia sui Mac con chip Apple sia su quelli Intel.
2. Trascina **Vallaury** nella cartella **Applicazioni**.
3. La prima volta macOS rifiuta di aprirlo, perché l'app non è ancora firmata da Apple. Fai clic destro (o Control e clic) sull'app, scegli **Apri** e conferma.
4. Con macOS 15 o successivo può comparire solo "Annulla". In quel caso apri **Impostazioni di Sistema, Privacy e sicurezza**, scorri in basso fino a "Vallaury è stato bloccato" e premi **Apri comunque**.

Con [Homebrew](https://brew.sh), che fa da solo il passaggio 3:

```sh
brew install --cask vallaury/vallaury/vallaury
```

### <picture><source media="(prefers-color-scheme: dark)" srcset="assets/os/linux-dark.svg"><img src="assets/os/linux-light.svg" alt="" height="22"></picture>&nbsp;Linux

**Il modo consigliato** su Debian, Ubuntu, Mint, Fedora e openSUSE: aggiungi il repository firmato e installa da lì, così gli aggiornamenti arrivano da soli. I comandi per ogni distribuzione sono nella [pagina dei pacchetti](https://vallaury.github.io/vallaury-packages/); il pacchetto si chiama `vallaury-desktop`.

**Un file scaricato a mano**: `sudo apt install ./Vallaury-<versione>-linux-amd64.deb` oppure `sudo dnf install ./Vallaury-<versione>-linux-x86_64.rpm`. Così però non si aggiorna da solo.

**Qualsiasi altra distribuzione, senza installare niente**: scarica l'AppImage.

```sh
chmod +x Vallaury-*.AppImage
./Vallaury-*.AppImage
```

Se risponde che manca FUSE, installa `libfuse2` (su Ubuntu 24.04 `libfuse2t64`) oppure avvia con `--appimage-extract-and-run`. Per Arm usa gli stessi file con `arm64` (`aarch64` per l'`.rpm`).

### Alla prima apertura

Accedi con Google o con il codice che ricevi per email, usando l'**indirizzo email della scuola**. Se qualcosa non va, leggi le [domande frequenti](https://vallaury.it/domande) o scrivi a [aiuto@vallaury.it](mailto:aiuto@vallaury.it).

### Verificare un download

Ogni versione ha un file `SHA256SUMS` e una dichiarazione di provenienza fatta da GitHub Actions:

```sh
sha256sum -c SHA256SUMS --ignore-missing
gh attestation verify <file> --repo Vallaury/vallaury-desktop
```

<br>

## Cos'è

[Vallaury](https://app.vallaury.it) è una piattaforma scolastica pensata per studenti e docenti dell'istituto Vallauri di Fossano. È un progetto indipendente, non la piattaforma ufficiale di nessuna scuola.

L'app è volutamente piccola: una finestra [Electron](https://www.electronjs.org/) su `https://app.vallaury.it`, senza logica propria. Tutto quello che usi sta sul sito e arriva nell'app appena viene pubblicato. L'app aggiunge ciò che una scheda del browser non può dare:

- una finestra che ricorda posizione e dimensione;
- l'accesso con Google attraverso il browser di sistema;
- le notifiche, e un'icona nell'area di notifica o nella barra dei menu con le scorciatoie a Oggi, Orario, Compiti, Verifiche e Nuova nota;
- il numero delle novità sull'icona nella barra delle applicazioni o nel Dock;
- l'avvio all'accesso al computer, se lo vuoi;
- gli aggiornamenti automatici su Windows e con l'AppImage. Altrove l'app ti avvisa che c'è una nuova versione e apre la pagina di download.

Nella finestra si apre solo `app.vallaury.it`; ogni altro indirizzo si apre nel browser. [PRIVACY.md](PRIVACY.md) spiega cosa l'app conserva e cosa invia.

## Compilarla da sé

Serve Node.js (la versione indicata in [`.nvmrc`](.nvmrc)).

```sh
npm install
npm test        # controllo dei tipi e test
npm start       # compila e apre la finestra
```

`VALLAURY_URL` indirizza una versione non impacchettata a un altro sito HTTPS, per esempio la demo. L'app impacchettata lo ignora.

## Contribuire

Leggi prima [CONTRIBUTING.md](CONTRIBUTING.md). I problemi di sicurezza seguono [SECURITY.md](SECURITY.md). La storia delle versioni è in [CHANGELOG.md](CHANGELOG.md). English: [README.en.md](README.en.md).

Il codice dell'app è rilasciato con licenza [GPL-3.0-only](LICENSE). Il servizio dietro `app.vallaury.it` non è pubblicato.

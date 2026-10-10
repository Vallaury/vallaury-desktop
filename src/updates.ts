import { app, Notification, shell } from "electron";

/** How this installation is kept up to date. */
export type Mode = "auto" | "notify" | "off";

export const RELEASES = "https://github.com/sappafrancesco/vallaury-desktop/releases/latest";
export const FIRST_CHECK_MS = 60_000;
export const EVERY_MS = 6 * 60 * 60_000;

/**
 * Windows (installer) and the Linux AppImage replace themselves. A Mac app that is not signed cannot (the system refuses the swap),
 * and the system packages (deb, rpm) belong to the package manager and need administrator rights: for those the person is told
 * and taken to the download. An unpackaged run never updates.
 */
export function modeFor(o: { platform: NodeJS.Platform; arch?: string; packaged: boolean; appImage: boolean; macSigned: boolean; portable: boolean }): Mode {
    if (!o.packaged) return "off";
    // The 32-bit Windows build comes from an older Electron and is not part of the update feed, so it only tells.
    if (o.platform === "win32") return o.portable || o.arch === "ia32" ? "notify" : "auto";
    if (o.platform === "darwin") return o.macSigned ? "auto" : "notify";
    return o.appImage ? "auto" : "notify";
}

type Updater = typeof import("electron-updater").autoUpdater;

/** Looks for a new version now and then. Nothing is shown unless there is something to do; errors (no network, no release) stay silent. */
export function start(hooks: { beforeInstall: () => void }) {
    const mode = modeFor({
        platform: process.platform,
        arch: process.arch,
        packaged: app.isPackaged,
        appImage: Boolean(process.env.APPIMAGE),
        macSigned: false, // becomes true when the Apple Developer account exists and the dmg is signed and notarised
        portable: Boolean(process.env.PORTABLE_EXECUTABLE_FILE),
    });
    if (mode === "off") return { mode, check: async (_manual: boolean) => undefined };

    // Loaded only now: an unpackaged run and the first paint do not pay for it.
    const updater: Updater = (require("electron-updater") as typeof import("electron-updater")).autoUpdater;
    updater.autoDownload = mode === "auto";
    updater.autoInstallOnAppQuit = mode === "auto";
    updater.allowPrerelease = false;
    updater.logger = null;

    let told = "";
    let manual = false;
    const say = (title: string, body: string, click?: () => void) => {
        if (!Notification.isSupported()) return;
        const n = new Notification({ title, body, silent: true });
        if (click) n.on("click", click);
        n.show();
    };

    updater.on("update-available", (info) => {
        if (mode === "auto") {
            if (manual) say("Aggiornamento in corso", `Scarico la versione ${info.version}.`);
            return;
        }
        if (told === info.version && !manual) return;
        told = info.version;
        say("È disponibile una nuova versione", `Vallaury ${info.version}. Tocca per scaricarla.`, () => void shell.openExternal(RELEASES));
    });
    updater.on("update-not-available", () => {
        if (manual) say("Vallaury è aggiornato", `Hai già l'ultima versione (${app.getVersion()}).`);
    });
    updater.on("update-downloaded", (info) => {
        say("Aggiornamento pronto", `La versione ${info.version} si installa alla chiusura. Tocca per riavviare ora.`, () => {
            hooks.beforeInstall();
            updater.quitAndInstall();
        });
    });
    updater.on("error", () => {
        if (manual) say("Impossibile cercare aggiornamenti", "Controlla la connessione e riprova più tardi.");
    });

    const check = async (byHand: boolean) => {
        manual = byHand;
        try {
            await updater.checkForUpdates();
        } catch {
            if (byHand) say("Impossibile cercare aggiornamenti", "Controlla la connessione e riprova più tardi.");
        } finally {
            manual = false;
        }
    };

    setTimeout(() => void check(false), FIRST_CHECK_MS).unref();
    setInterval(() => void check(false), EVERY_MS).unref();
    return { mode, check };
}

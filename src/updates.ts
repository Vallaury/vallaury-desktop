import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { app, ipcMain, Notification, powerMonitor, shell } from "electron";
import { isInside } from "./origin";
import * as store from "./store";
import { EVERY_MS, FIRST_CHECK_MS, installWhileHidden, isUnpackedWindows, isNewer, mayCheckNow, modeFor, nextCheckDelay, type Mode, type Phase, type Status } from "./update-policy";

export { modeFor, type Mode };
export const RELEASES = "https://github.com/Vallaury/vallaury-desktop/releases/latest";

type Updater = typeof import("electron-updater").autoUpdater;

/**
 * Keeps the app up to date without anyone noticing. Where the app can replace itself (Windows installer, Linux AppImage) it looks
 * for a release now and then, downloads it in the background and installs it when the app is closed, or when the window has been
 * hidden in the tray for a while. No notification, no question: the Profile shows one quiet line. Where it cannot (deb, rpm, an unsigned
 * Mac, the portable build) the person is told once per version, and the Profile offers the download. Errors stay silent and are retried later.
 */
export function start(hooks: { site: string; beforeInstall: () => void; windowHidden: () => boolean }) {
    const mode = modeFor({
        platform: process.platform,
        arch: process.arch,
        packaged: app.isPackaged,
        appImage: Boolean(process.env.APPIMAGE),
        macSigned: false, // becomes true when the Apple Developer account exists and the dmg is signed and notarised
        portable:
            Boolean(process.env.PORTABLE_EXECUTABLE_FILE) ||
            isUnpackedWindows({ platform: process.platform, packaged: app.isPackaged, uninstallerExists: existsSync(join(dirname(process.execPath), "Uninstall Vallaury.exe")) }),
        flatpak: Boolean(process.env.FLATPAK_ID || process.env.SNAP),
    });

    let phase: Phase = "idle";
    let version: string | undefined;
    let percent: number | undefined;
    let checkedAt = 0;
    let failures = 0;
    let hiddenSince: number | null = null;
    let timer: NodeJS.Timeout | null = null;
    let manual = false;
    let updater: Updater | null = null;

    const status = (): Status => ({ mode, phase, current: app.getVersion(), version, percent, checkedAt: checkedAt || undefined });
    const trusted = (e: Electron.IpcMainInvokeEvent) => Boolean(e.senderFrame && e.senderFrame === e.sender.mainFrame && isInside(e.senderFrame.url, hooks.site));
    const say = (title: string, body: string, click?: () => void) => {
        if (!Notification.isSupported()) return;
        const n = new Notification({ title, body, silent: true });
        if (click) n.on("click", click);
        n.show();
    };

    /** Restarts into the new version. `quiet` is for the install nobody asked for: the window then stays hidden after the restart. */
    const install = (quiet: boolean) => {
        if (!updater || phase !== "ready") return false;
        if (quiet) store.set({ quietAt: Date.now() });
        hooks.beforeInstall();
        updater.quitAndInstall(true, true);
        return true;
    };

    // The same four doors exist in every mode so the page never has to ask which one it is talking to.
    ipcMain.handle("updates-status", (e) => (trusted(e) ? { ok: true, ...status() } : { ok: false }));
    ipcMain.handle("updates-check", async (e) => {
        if (!trusted(e)) return { ok: false };
        await check(true);
        return { ok: true, ...status() };
    });
    ipcMain.handle("updates-install", (e) => (trusted(e) ? { ok: install(false) } : { ok: false }));
    ipcMain.handle("updates-open", (e) => {
        if (!trusted(e)) return { ok: false };
        void shell.openExternal(RELEASES);
        return { ok: true };
    });

    if (mode === "off") return { mode, check: async (_byHand: boolean) => undefined, status };

    function schedule(delay?: number) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => void check(false), delay ?? nextCheckDelay({ failures, random: Math.random() }));
        timer.unref();
    }

    function load(): Updater {
        if (updater) return updater;
        // Loaded only now: an unpackaged run and the first paint do not pay for it.
        const u = (require("electron-updater") as typeof import("electron-updater")).autoUpdater;
        u.autoDownload = mode === "auto";
        u.autoInstallOnAppQuit = mode === "auto";
        u.allowPrerelease = false;
        u.logger = null;

        u.on("update-available", (info) => {
            version = info.version;
            if (mode === "auto") {
                phase = "downloading";
                percent = 0;
                if (manual) say("Aggiornamento in corso", `Scarico la versione ${info.version}.`);
                return;
            }
            phase = "available";
            // Once per version, remembered across starts, so a computer that is opened every morning is not told every morning.
            if (store.get().told !== info.version || manual) {
                store.set({ told: info.version });
                say("È disponibile una nuova versione", `Vallaury ${info.version}. Tocca per scaricarla.`, () => void shell.openExternal(RELEASES));
            }
        });
        u.on("update-not-available", () => {
            phase = "idle";
            version = undefined;
            if (manual) say("Vallaury è aggiornato", `Hai già l'ultima versione (${app.getVersion()}).`);
        });
        u.on("download-progress", (p) => {
            phase = "downloading";
            percent = Math.round(p.percent);
        });
        u.on("update-downloaded", (info) => {
            if (!isNewer(info.version, app.getVersion())) return; // never "update" to the same or an older version
            phase = "ready";
            version = info.version;
            percent = 100;
            // Said only when the person asked by hand; otherwise the update waits for the next close in silence.
            if (manual) say("Aggiornamento pronto", `La versione ${info.version} si installa alla chiusura. Tocca per riavviare ora.`, () => void install(false));
        });
        u.on("error", () => {
            // A failed download is tried again from the start next time; a ready update stays ready.
            if (phase !== "ready") phase = "error";
        });
        updater = u;
        return u;
    }

    async function check(byHand: boolean) {
        if (phase === "checking" || phase === "downloading" || phase === "ready") return;
        manual = byHand;
        phase = "checking";
        try {
            await load().checkForUpdates();
            failures = 0;
            checkedAt = Date.now();
            // checkForUpdates ends with a verdict through the events above; "checking" must not outlive it.
            if (phase === "checking") phase = "idle";
        } catch {
            failures += 1;
            phase = "error";
            if (byHand) say("Impossibile cercare aggiornamenti", "Controlla la connessione e riprova più tardi.");
        } finally {
            manual = false;
            schedule();
        }
    }

    // Looks soon after the start, then about every four hours; again when the person comes back to the window or the computer wakes up.
    schedule(FIRST_CHECK_MS);
    const again = () => {
        if (mayCheckNow({ phase, lastCheck: checkedAt, now: Date.now() })) void check(false);
    };
    app.on("browser-window-focus", again);
    powerMonitor.on("resume", () => setTimeout(again, 30_000).unref());

    // A ready update is installed by itself once the window has been hidden for a while; a visible window is never interrupted.
    const idle = setInterval(() => {
        const now = Date.now();
        if (hooks.windowHidden()) hiddenSince ??= now;
        else hiddenSince = null;
        if (installWhileHidden({ phase, hiddenSince, now })) install(true);
    }, 60_000);
    idle.unref();

    return { mode, check, status, every: EVERY_MS };
}

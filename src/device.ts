import { app, BrowserWindow, ipcMain, net, Notification, powerMonitor, session, shell } from "electron";
import { hostname } from "node:os";
import { isInside, isSensitive } from "./origin";
import { lines, nextDelay, pair, Rejected, STALE_MS, unpair, type Fetcher } from "./link";
import * as store from "./store";

/**
 * The computer's side of the bridge: linking to the account, the notifications poll, the screen protection setting, sign-out cleanup.
 * Everything here answers only the site's own top frame.
 */
export function setUp(opts: { site: string; window: () => BrowserWindow | null; open: (path: string) => void }) {
    const { site } = opts;
    const fetcher: Fetcher = (url, init) => net.fetch(url, init) as ReturnType<Fetcher>;
    const shown = new Set<Notification>();
    let timer: NodeJS.Timeout | null = null;
    let failures = 0;
    let lastPoll = 0;

    const trusted = (e: Electron.IpcMainInvokeEvent) => Boolean(e.senderFrame && e.senderFrame === e.sender.mainFrame && isInside(e.senderFrame.url, site));

    const label = () => {
        const os = process.platform === "win32" ? "Windows" : process.platform === "darwin" ? "macOS" : "Linux";
        return `${hostname().split(".")[0] ?? "Computer"} (${os})`.slice(0, 60);
    };

    const enabled = () => Notification.isSupported() && store.get().notify;

    function clearShown() {
        for (const n of shown) n.close();
        shown.clear();
    }

    function stop() {
        if (timer) clearTimeout(timer);
        timer = null;
    }

    function schedule(delay?: number) {
        stop();
        if (!store.key() || !enabled()) return;
        timer = setTimeout(() => void poll(), delay ?? nextDelay({ failures, onBattery: powerMonitor.isOnBatteryPower(), random: Math.random() }));
    }

    async function poll() {
        const key = store.key();
        if (!key || !enabled()) return;
        lastPoll = Date.now();
        const s = store.get();
        const cursor = s.cursor !== null && Date.now() - s.at <= STALE_MS ? s.cursor : null;
        try {
            const r = await lines(fetcher, site, key, cursor);
            // The first answer only tells where the list stands; nothing old is shown.
            if (cursor !== null) for (const line of r.items) show(line.title, line.body, line.href);
            store.set({ cursor: r.cursor, at: Date.now() });
            failures = 0;
        } catch (e) {
            if (e instanceof Rejected && e.status === 401) {
                // The person removed this computer in the Profile: it stays unlinked until they link it again there.
                store.eraseKey();
                store.set({ removed: true, uid: 0, cursor: null, at: 0 });
                stop();
                return;
            }
            failures += 1;
        }
        schedule();
    }

    function show(title: string, body: string, href: string) {
        const n = new Notification({ title, body, silent: false });
        shown.add(n);
        n.on("click", () => opts.open(href));
        n.on("close", () => shown.delete(n));
        n.show();
    }

    ipcMain.handle("link-status", (e) => {
        if (!trusted(e)) return { ok: false };
        const s = store.get();
        return { ok: true, linked: Boolean(store.key()), declined: s.removed, uid: s.uid };
    });

    ipcMain.handle("link-pair", async (e, code: unknown, uid: unknown) => {
        if (!trusted(e) || typeof code !== "string" || typeof uid !== "number") return { ok: false };
        try {
            const old = store.key();
            const fresh = await pair(fetcher, site, code, label());
            if (old) void unpair(fetcher, site, old).catch(() => undefined);
            store.saveKey(fresh);
            store.set({ uid, removed: false, cursor: null, at: 0 });
            failures = 0;
            if (enabled()) void poll();
            return { ok: true, safe: store.canKeepKey() };
        } catch {
            return { ok: false };
        }
    });

    ipcMain.handle("link-unpair", async (e) => {
        if (!trusted(e)) return { ok: false };
        await release();
        return { ok: true };
    });

    async function release() {
        const key = store.key();
        stop();
        clearShown();
        if (key) await unpair(fetcher, site, key).catch(() => undefined);
        store.forgetPerson();
    }

    // Signing out: the computer keeps nothing of this person (key, notifications on screen, and when asked the cookie and every page kept).
    ipcMain.handle("link-forget", async (e, withSession: unknown) => {
        if (!trusted(e)) return { ok: false };
        await release();
        if (withSession === true) {
            await session.defaultSession.clearStorageData();
            await session.defaultSession.clearCache();
            await session.defaultSession.clearAuthCache();
        }
        return { ok: true };
    });

    ipcMain.handle("notify-status", (e) => (trusted(e) ? { ok: true, enabled: enabled() } : { ok: false }));

    ipcMain.handle("notify-enable", (e) => {
        if (!trusted(e) || !Notification.isSupported()) return { ok: false };
        store.set({ notify: true });
        failures = 0;
        if (store.key()) void poll();
        return { ok: true };
    });

    ipcMain.handle("configure", (e, settings: unknown) => {
        if (!trusted(e)) return;
        const protect = (settings as { protectScreen?: unknown } | null)?.protectScreen !== false;
        store.set({ protect });
        applyProtection();
    });

    /** Keeps private pages out of screenshots and screen sharing where the system can (Windows and macOS; Linux has no such switch). */
    function applyProtection() {
        const win = opts.window();
        if (!win || win.isDestroyed()) return;
        win.setContentProtection(store.get().protect && isSensitive(win.webContents.getURL()));
    }

    app.on("browser-window-focus", () => {
        // Back at the computer: ask for news, but not more often than once a minute.
        if (store.key() && enabled() && Date.now() - lastPoll > 60_000) void poll();
    });
    powerMonitor.on("resume", () => schedule(30_000));

    return {
        navigated: applyProtection,
        start: () => {
            if (store.key() && enabled()) void poll();
        },
        /** A file the site made was saved: say where, and open the folder on a click. */
        saved: (path: string, name: string) => {
            const n = new Notification({ title: "File salvato", body: name, silent: true });
            n.on("click", () => shell.showItemInFolder(path));
            shown.add(n);
            n.on("close", () => shown.delete(n));
            n.show();
        },
    };
}

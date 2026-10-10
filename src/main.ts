import { app, BrowserWindow, ipcMain, Menu, nativeTheme, screen, session, shell, type WebContents } from "electron";
import { join } from "node:path";
import { canOpenOutside, isInside, siteUrl, userAgent } from "./origin";
import { begin, finish, startUrl, type Pending } from "./signin";
import { DEFAULT_SIZE, load, save } from "./window-state";

const SITE = siteUrl(process.env.VALLAURY_URL, app.isPackaged);
const PAGE_BACKGROUND = "#F6FBF7";
/** Permissions the site may ask for. Everything else is refused without asking (the camera, the microphone and the location are not used yet). */
const PERMISSIONS = new Set(["notifications", "clipboard-sanitized-write", "fullscreen"]);

let win: BrowserWindow | null = null;
let quitting = false;
let pending: Pending | null = null;

if (!app.requestSingleInstanceLock()) {
    app.quit();
} else {
    app.on("second-instance", (_event, argv) => {
        show();
        handleLink(argv.find((a) => a.startsWith("vallaury://")));
    });
    app.on("open-url", (event, url) => {
        event.preventDefault();
        show();
        handleLink(url);
    });
    app.on("before-quit", () => (quitting = true));
    app.on("window-all-closed", () => app.quit());
    app.on("activate", () => (win ? show() : create()));
    app.on("web-contents-created", (_e, contents) => lockDown(contents));
    void app.whenReady().then(start);
}

function start() {
    nativeTheme.themeSource = "light";
    const ua = userAgent(session.defaultSession.getUserAgent(), app.getVersion(), process.platform);
    session.defaultSession.setUserAgent(ua);
    session.defaultSession.setPermissionRequestHandler((contents, permission, allow) => allow(PERMISSIONS.has(permission) && isInside(contents.getURL(), SITE)));
    session.defaultSession.setPermissionCheckHandler((_contents, permission, origin) => PERMISSIONS.has(permission) && isInside(origin, SITE));
    if (app.isPackaged) app.setAsDefaultProtocolClient("vallaury");
    else app.setAsDefaultProtocolClient("vallaury", process.execPath, [app.getAppPath()]);
    ipcMain.handle("google-signin", (event) => {
        // Only the site's own page, in the top frame, may start it.
        const frame = event.senderFrame;
        if (!frame || frame !== event.sender.mainFrame || !isInside(frame.url, SITE)) return;
        pending = begin();
        void shell.openExternal(startUrl(SITE, pending));
    });
    Menu.setApplicationMenu(buildMenu());
    create();
    handleLink(process.argv.find((a) => a.startsWith("vallaury://")));
}

function stateFile() {
    return join(app.getPath("userData"), "window-state.json");
}

function create() {
    const remembered = load(stateFile(), screen.getAllDisplays().map((d) => d.workArea));
    win = new BrowserWindow({
        ...(remembered?.bounds ?? DEFAULT_SIZE),
        minWidth: 480,
        minHeight: 600,
        show: false,
        backgroundColor: PAGE_BACKGROUND,
        title: "Vallaury",
        icon: join(__dirname, "..", "assets", "icon.png"),
        autoHideMenuBar: true,
        webPreferences: { contextIsolation: true, sandbox: true, nodeIntegration: false, preload: join(__dirname, "preload.js"), webviewTag: false, spellcheck: true },
    });
    if (remembered?.maximized) win.maximize();
    const w = win;
    // Shown once the first page is painted, so the window never opens as a blank sheet.
    w.once("ready-to-show", () => w.show());
    const remember = () => {
        if (w.isDestroyed() || w.isMinimized() || w.isFullScreen()) return;
        save(stateFile(), { bounds: w.getNormalBounds(), maximized: w.isMaximized() });
    };
    w.on("close", remember);
    w.on("resized", remember);
    w.on("moved", remember);
    w.on("maximize", remember);
    w.on("unmaximize", remember);
    w.on("closed", () => {
        win = null;
        if (!quitting && process.platform !== "darwin") app.quit();
    });
    w.webContents.on("did-fail-load", (_e, code, _desc, url, isMain) => {
        // -3 is a navigation that was replaced by another one; not a failure.
        if (isMain && code !== -3 && !url.startsWith("file:")) void showError(w.webContents, url, "offline");
    });
    w.webContents.on("did-navigate", (_e, url, status) => {
        if (status >= 500 && isInside(url, SITE)) void showError(w.webContents, url, "server");
    });
    void w.loadURL(SITE);
}

function showError(contents: WebContents, url: string, why: "offline" | "server") {
    if (contents.isDestroyed()) return;
    return contents.loadFile(join(__dirname, "pages", "offline.html"), { query: { to: isInside(url, SITE) ? url : SITE, why } });
}

function show() {
    if (!win) return create();
    if (win.isMinimized()) win.restore();
    win.show();
    win.focus();
}

/** Links of the form vallaury://... come from the system: the browser coming back from Google, later a notification. */
function handleLink(link: string | undefined) {
    if (!link) return;
    const next = finish(link, pending, SITE);
    if (!next) return;
    pending = null;
    void win?.webContents.loadURL(next);
}

/** Every window the app ever makes: stays on the site, hands the rest to the system browser, accepts no embedded views. */
function lockDown(contents: WebContents) {
    contents.on("will-attach-webview", (e) => e.preventDefault());
    contents.on("will-navigate", (e, url) => {
        if (isInside(url, SITE) || url.startsWith("file:") && contents === win?.webContents) return;
        e.preventDefault();
        if (canOpenOutside(url)) void shell.openExternal(url);
    });
    contents.setWindowOpenHandler(({ url }) => {
        if (isInside(url, SITE)) {
            setImmediate(() => void win?.webContents.loadURL(url));
        } else if (canOpenOutside(url)) {
            void shell.openExternal(url);
        }
        return { action: "deny" };
    });
}

function buildMenu() {
    const mac = process.platform === "darwin";
    // Italian, like the site and the Android app, until the person picks another language in the Profile.
    const it = true;
    return Menu.buildFromTemplate([
        ...(mac ? [{ role: "appMenu" as const }] : []),
        { label: "File", submenu: [mac ? { role: "close" as const } : { role: "quit" as const }] },
        { role: "editMenu" as const },
        {
            label: it ? "Visualizza" : "View",
            submenu: [
                { role: "reload" as const },
                { role: "forceReload" as const },
                { type: "separator" as const },
                { role: "resetZoom" as const },
                { role: "zoomIn" as const },
                { role: "zoomOut" as const },
                { type: "separator" as const },
                { role: "togglefullscreen" as const },
            ],
        },
        {
            label: it ? "Vai" : "Go",
            submenu: [
                { label: it ? "Indietro" : "Back", accelerator: mac ? "Cmd+[" : "Alt+Left", click: () => win?.webContents.navigationHistory.goBack() },
                { label: it ? "Avanti" : "Forward", accelerator: mac ? "Cmd+]" : "Alt+Right", click: () => win?.webContents.navigationHistory.goForward() },
            ],
        },
        { role: "windowMenu" as const },
    ]);
}

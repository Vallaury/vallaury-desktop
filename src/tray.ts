import { app, BrowserWindow, Menu, nativeImage, Tray } from "electron";
import { join } from "node:path";
import { badgeLabel, dotBitmap } from "./background";

export type TrayHandlers = {
    show: () => void;
    open: (path: string) => void;
    quit: () => void;
    /** What the menu's switches show now, and what they do. */
    state: () => { linked: boolean; notifications: boolean; autostart: boolean };
    toggleNotifications: () => void;
    toggleAutostart: () => void;
    window: () => BrowserWindow | null;
};

/** The icon in the system tray / menu bar, its menu, and the unread count (dock badge, taskbar dot, tooltip). */
export function create(h: TrayHandlers) {
    let tray: Tray | null = null;
    let unread = 0;
    const size = process.platform === "darwin" ? 18 : process.platform === "win32" ? 16 : 24;
    const icon = () => nativeImage.createFromPath(join(__dirname, "..", "assets", "icon.png")).resize({ width: size, height: size });

    function menu() {
        const st = h.state();
        return Menu.buildFromTemplate([
            { label: "Apri Vallaury", click: h.show },
            { type: "separator" },
            { label: "Oggi", click: () => h.open("/") },
            { label: "Orario", click: () => h.open("/timetable") },
            { label: "Compiti", click: () => h.open("/tasks") },
            { label: "Verifiche", click: () => h.open("/exams") },
            { label: "Nuova nota", click: () => h.open("/notes/capture") },
            { type: "separator" },
            { label: "Notifiche", type: "checkbox", checked: st.notifications, enabled: st.linked, click: h.toggleNotifications },
            { label: "Avvia all'accesso al computer", type: "checkbox", checked: st.autostart, click: h.toggleAutostart },
            { type: "separator" },
            { label: "Esci da Vallaury", click: h.quit },
        ]);
    }

    function refresh() {
        if (!tray) return;
        tray.setToolTip(badgeLabel(unread));
        tray.setContextMenu(menu());
    }

    return {
        /** Shows or removes the icon. */
        visible(on: boolean) {
            if (on && !tray) {
                tray = new Tray(icon());
                tray.on("click", h.show);
                refresh();
            } else if (!on && tray) {
                tray.destroy();
                tray = null;
            }
        },
        refresh,
        get unread() {
            return unread;
        },
        /** Something new arrived while the window was not in front, or the person looked: zero. */
        setUnread(n: number) {
            unread = Math.max(0, n);
            app.setBadgeCount(unread);
            const win = h.window();
            if (win && !win.isDestroyed() && process.platform === "win32") {
                win.setOverlayIcon(unread ? nativeImage.createFromBitmap(dotBitmap(16, [200, 50, 40]), { width: 16, height: 16 }) : null, unread ? badgeLabel(unread) : "");
            }
            refresh();
        },
    };
}

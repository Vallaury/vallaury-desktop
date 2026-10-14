/** Pure rules for staying in the background, so they can be tested without a desktop. */

/**
 * Whether an icon in the system tray will actually be visible. Windows and macOS always have one. On Linux it depends on the desktop:
 * GNOME shows none unless the person installed an extension, so hiding the window there would lose the app. Set VALLAURY_TRAY=1 to force it.
 */
export function trayUsable(platform: NodeJS.Platform, desktop: string | undefined, force: string | undefined): boolean {
    if (platform !== "linux") return true;
    if (force === "1") return true;
    if (force === "0") return false;
    const names = (desktop ?? "").toLowerCase().split(":");
    return names.length > 0 && names[0] !== "" && !names.includes("gnome") && !names.includes("ubuntu");
}

/**
 * Closing the window hides it only when there is something to keep running for: a linked computer with notifications on.
 * Without a tray icon (GNOME) it still keeps running: the app is reopened from the menu, and Ctrl+Q closes it for real.
 */
export function keepsRunning(o: { background: boolean; linked: boolean; notifications: boolean }): boolean {
    return o.background && o.linked && o.notifications;
}

/** The autostart entry for Linux desktops (freedesktop autostart). Paths with spaces are quoted. */
export function autostartEntry(exec: string[]): string {
    const quote = (a: string) => (/[\s"'\\$`]/.test(a) ? `"${a.replace(/(["\\$`])/g, "\\$1")}"` : a);
    return ["[Desktop Entry]", "Type=Application", "Name=Vallaury", "Comment=Orario, compiti e appunti della classe", `Exec=${exec.map(quote).join(" ")} --hidden`, "Icon=vallaury", "Terminal=false", "X-GNOME-Autostart-enabled=true", ""].join("\n");
}

/** A solid dot (BGRA, premultiplied) for the taskbar overlay on Windows: there is something new. */
export function dotBitmap(size: number, rgb: [number, number, number]): Buffer {
    const buf = Buffer.alloc(size * size * 4);
    const c = (size - 1) / 2;
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const d = Math.hypot(x - c, y - c);
            const a = Math.max(0, Math.min(1, c + 0.5 - d));
            const i = (y * size + x) * 4;
            buf[i] = Math.round(rgb[2] * a);
            buf[i + 1] = Math.round(rgb[1] * a);
            buf[i + 2] = Math.round(rgb[0] * a);
            buf[i + 3] = Math.round(255 * a);
        }
    }
    return buf;
}

export const badgeLabel = (n: number) => (n <= 0 ? "Vallaury" : n === 1 ? "Vallaury · 1 novità" : `Vallaury · ${n > 99 ? "99+" : n} novità`);

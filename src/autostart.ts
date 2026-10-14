import { app } from "electron";
import { execFile } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { autostartEntry } from "./background";
import * as store from "./store";

/** Start when the person signs in to the computer, hidden in the tray. Windows and macOS have a system call; Linux uses the freedesktop autostart folder. */
/** Inside a Snap the app may only write in its own data folder; snapd reads the autostart entries from there. */
const snapData = process.env.SNAP && process.env.SNAP_USER_DATA;
const linuxFile = () => (snapData ? join(snapData, ".config", "autostart", "vallaury.desktop") : join(process.env.XDG_CONFIG_HOME || join(homedir(), ".config"), "autostart", "it.vallaury.desktop.desktop"));

/** Inside Flatpak the app cannot write to the autostart folder: the system's background portal does it, and cannot be asked afterwards, so the choice is remembered here. */
const sandboxed = Boolean(process.env.FLATPAK_ID);

function portal(on: boolean): void {
    const options = `{'autostart': <${on}>, 'commandline': <['vallaury', '--hidden']>, 'reason': <'Per ricevere le notifiche di orario e compiti'>}`;
    execFile("gdbus", ["call", "--session", "--dest", "org.freedesktop.portal.Desktop", "--object-path", "/org/freedesktop/portal/desktop", "--method", "org.freedesktop.portal.Background.RequestBackground", "", options], () => undefined);
}

export function isOn(): boolean {
    if (sandboxed) return store.get().login;
    return process.platform === "linux" ? existsSync(linuxFile()) : app.getLoginItemSettings({ args: ["--hidden"] }).openAtLogin;
}

export function set(on: boolean): boolean {
    if (sandboxed) {
        portal(on);
        store.set({ login: on });
        return true;
    }
    try {
        if (process.platform === "linux") {
            if (!on) rmSync(linuxFile(), { force: true });
            else {
                mkdirSync(dirname(linuxFile()), { recursive: true });
                const exec = snapData ? ["vallaury"] : process.env.APPIMAGE ? [process.env.APPIMAGE] : app.isPackaged ? [process.execPath] : [process.execPath, app.getAppPath()];
                writeFileSync(linuxFile(), autostartEntry(exec));
            }
        } else {
            app.setLoginItemSettings({ openAtLogin: on, args: ["--hidden"] });
        }
        return isOn() === on;
    } catch {
        return false;
    }
}

/** Opened by the system at sign-in rather than by the person: stay hidden. */
export function startedHidden(): boolean {
    return process.argv.includes("--hidden") || (process.platform === "darwin" && app.getLoginItemSettings().wasOpenedAtLogin);
}

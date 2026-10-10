import { app } from "electron";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { autostartEntry } from "./background";

/** Start when the person signs in to the computer, hidden in the tray. Windows and macOS have a system call; Linux uses the freedesktop autostart folder. */
const linuxFile = () => join(process.env.XDG_CONFIG_HOME || join(homedir(), ".config"), "autostart", "it.vallaury.desktop.desktop");

export function isOn(): boolean {
    return process.platform === "linux" ? existsSync(linuxFile()) : app.getLoginItemSettings({ args: ["--hidden"] }).openAtLogin;
}

export function set(on: boolean): boolean {
    try {
        if (process.platform === "linux") {
            if (!on) rmSync(linuxFile(), { force: true });
            else {
                mkdirSync(dirname(linuxFile()), { recursive: true });
                const exec = process.env.APPIMAGE ? [process.env.APPIMAGE] : app.isPackaged ? [process.execPath] : [process.execPath, app.getAppPath()];
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

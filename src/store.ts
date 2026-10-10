import { app, safeStorage } from "electron";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/**
 * What the app remembers besides the website's own cookies: whose computer this is, whether the person removed it on purpose,
 * the notifications switch, and the key. The key is kept with the system's secret store (DPAPI, Keychain, libsecret). Where the
 * system has none worth the name, the key lives in memory only: notifications then work until the app closes, and nothing readable is written.
 */
export type Settings = { uid: number; removed: boolean; notify: boolean; protect: boolean; background: boolean; noted: boolean; cursor: number | null; at: number };

const DEFAULTS: Settings = { uid: 0, removed: false, notify: false, protect: true, background: true, noted: false, cursor: null, at: 0 };
const file = (name: string) => join(app.getPath("userData"), name);

let settings: Settings | null = null;
let memoryKey: string | null = null;

export function get(): Settings {
    if (!settings) {
        try {
            settings = { ...DEFAULTS, ...(JSON.parse(readFileSync(file("device.json"), "utf8")) as Partial<Settings>) };
        } catch {
            settings = { ...DEFAULTS };
        }
    }
    return settings;
}

export function set(change: Partial<Settings>): Settings {
    settings = { ...get(), ...change };
    try {
        writeFileSync(file("device.json"), JSON.stringify(settings));
    } catch {
        /* the next start simply begins from the defaults */
    }
    return settings;
}

/** True when a key can be written to disk without being readable by another program. */
export function canKeepKey(): boolean {
    if (!safeStorage.isEncryptionAvailable()) return false;
    return process.platform !== "linux" || safeStorage.getSelectedStorageBackend() !== "basic_text";
}

export function saveKey(key: string): void {
    memoryKey = key;
    if (canKeepKey()) {
        try {
            writeFileSync(file("device.key"), safeStorage.encryptString(key), { mode: 0o600 });
        } catch {
            /* memory only */
        }
    }
}

export function key(): string | null {
    if (memoryKey) return memoryKey;
    if (!canKeepKey() || !existsSync(file("device.key"))) return null;
    try {
        memoryKey = safeStorage.decryptString(readFileSync(file("device.key")));
    } catch {
        memoryKey = null;
    }
    return memoryKey;
}

export function eraseKey(): void {
    memoryKey = null;
    rmSync(file("device.key"), { force: true });
}

/** Forgets the person: key, who, the cursor. The notification switch and the screen setting are the computer's own and stay. */
export function forgetPerson(): void {
    eraseKey();
    set({ uid: 0, removed: false, cursor: null, at: 0 });
}

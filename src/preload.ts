import { contextBridge, ipcRenderer } from "electron";

/**
 * The one door between the page and the app. Same name and shape as on Android (see src/lib/app-bridge.ts on the service).
 * What is not offered here (haptics, the share sheet) the page does by itself with the browser's own means.
 * The main process answers only the site's own top frame, whatever is called here.
 */
const ask = <T>(channel: string, ...args: unknown[]) => ipcRenderer.invoke(channel, ...args).catch(() => ({ ok: false })) as Promise<T>;

contextBridge.exposeInMainWorld(
    "VallauryApp",
    Object.freeze({
        platform: "desktop" as const,
        signInWithGoogle: () => void ipcRenderer.invoke("google-signin"),
        configure: (settings: { protectScreen: boolean }) => void ipcRenderer.invoke("configure", { protectScreen: Boolean(settings?.protectScreen) }),
        phoneLink: Object.freeze({
            status: () => ask("link-status"),
            pair: (code: string, uid: number) => ask("link-pair", String(code), Number(uid)),
            unpair: () => ask("link-unpair"),
            forget: (session?: boolean) => ask("link-forget", Boolean(session)),
        }),
        notifications: Object.freeze({
            status: () => ask("notify-status"),
            enable: () => ask("notify-enable"),
        }),
    }),
);

import { contextBridge, ipcRenderer } from "electron";

/**
 * The one door between the page and the app. Same name and shape as on Android (see src/lib/app-bridge.ts on the service).
 * The main process answers only the site's own top frame, whatever is called here.
 */
contextBridge.exposeInMainWorld(
    "VallauryApp",
    Object.freeze({
        platform: "desktop" as const,
        signInWithGoogle: () => void ipcRenderer.invoke("google-signin"),
    }),
);

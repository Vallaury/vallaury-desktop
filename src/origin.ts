/** What counts as "inside" the app. Everything else is somebody else's page and opens in the system browser. */
export const SITE = "https://app.vallaury.it";

export function siteUrl(env: string | undefined, packaged: boolean): string {
    if (packaged || !env) return SITE;
    try {
        const u = new URL(env);
        return u.protocol === "https:" ? u.origin : SITE;
    } catch {
        return SITE;
    }
}

export function isInside(url: string, site: string): boolean {
    try {
        return new URL(url).origin === new URL(site).origin;
    } catch {
        return false;
    }
}

/** Only these leave the app, and only to the system: a web page, a mail link, a phone number. Anything else (file:, javascript:, custom schemes) is dropped. */
export function canOpenOutside(url: string): boolean {
    try {
        return ["https:", "http:", "mailto:", "tel:"].includes(new URL(url).protocol);
    } catch {
        return false;
    }
}

/** The page identifies the app by this suffix, and the real browser engine stays visible so the server sees "Chrome on <system>". */
export function userAgent(fallback: string, version: string, platform: NodeJS.Platform): string {
    const base = fallback.replace(/ Electron\/\S+/, "").replace(/ vallaury-desktop\/\S+/i, "").replace(/ Vallaury\/\S+/, "");
    const os = platform === "win32" ? "Windows" : platform === "darwin" ? "macOS" : "Linux";
    return `${base} VallauryApp/${version} (Desktop; ${os})`;
}

/** Pages that show private things (account security, grades, moderation decisions): kept out of screenshots when the person asks (same list as the Android app). */
export function isSensitive(url: string): boolean {
    try {
        const p = new URL(url).pathname;
        return /^\/(security|grades|moderation)(\/|$)/.test(p) || p === "/recover";
    } catch {
        return false;
    }
}

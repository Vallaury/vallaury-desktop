import { isInside } from "./origin";

/**
 * Links that reach the app from outside (a notification, the system, another program, a page of the site):
 *   vallaury://open?path=/homework/abc   opens that page of the site
 *   https://app.vallaury.it/...          the site's own address, handed to the app by "open with"
 * Only a page of the site can ever come out; anything else (another host, a scheme, a path that climbs out) gives null.
 */
export function openTarget(link: string, site: string): string | null {
    let u: URL;
    try {
        u = new URL(link);
    } catch {
        return null;
    }
    if (u.protocol === "https:") return isInside(link, site) ? u.href : null;
    if (u.protocol !== "vallaury:" || u.hostname !== "open") return null;
    const path = u.searchParams.get("path") ?? "/";
    if (!/^\/(?!\/)[^\s\\]*$/.test(path)) return null;
    const target = new URL(path, site);
    return isInside(target.href, site) ? target.href : null;
}

/** The first thing on a command line that is a link for this app. */
export function linkIn(argv: readonly string[], site: string): string | undefined {
    return argv.find((a) => a.startsWith("vallaury://") || (a.startsWith("https://") && isInside(a, site)));
}

/** A sign-in link that could not be used (too old, or this app did not ask for it): worth telling the person. */
export const isSigninLink = (link: string) => link.startsWith("vallaury://signin");

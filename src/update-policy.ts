/**
 * The rules of the update system, kept apart from Electron so they can be tested. The aim is an update nobody has to think about:
 * it is looked for, downloaded and installed in the background, the window is never interrupted, and the only visible trace is one
 * quiet line in the Profile.
 */

/** How this installation is kept up to date. */
export type Mode = "auto" | "notify" | "off";

/** Where an update stands. `available` is only used when the app cannot install it by itself. */
export type Phase = "idle" | "checking" | "downloading" | "ready" | "available" | "error";

export const FIRST_CHECK_MS = 20_000;
export const EVERY_MS = 4 * 60 * 60_000;
export const RETRY_MS = 5 * 60_000;
/** Coming back to the window checks again, but not more than once an hour. */
export const FOCUS_GAP_MS = 60 * 60_000;
/** A ready update is installed by itself once the window has been out of sight (tray) this long. */
export const HIDDEN_BEFORE_INSTALL_MS = 10 * 60_000;
/** After a restart made by the updater the window stays hidden if it was hidden before; the mark is only believed for this long. */
export const QUIET_RESTART_MS = 5 * 60_000;

/**
 * Windows (installer) and the Linux AppImage replace themselves. A Mac app that is not signed cannot (the system refuses the swap),
 * and the system packages (deb, rpm) belong to the package manager and need administrator rights: for those the person is told
 * and taken to the download. An unpackaged run never updates.
 */
export function modeFor(o: { platform: NodeJS.Platform; arch?: string; packaged: boolean; appImage: boolean; macSigned: boolean; portable: boolean; flatpak?: boolean }): Mode {
    if (!o.packaged || o.flatpak) return "off"; // a Flatpak or a Snap is updated by its store, not by the app
    // The 32-bit Windows build comes from an older Electron and is not part of the update feed, so it only tells.
    if (o.platform === "win32") return o.portable || o.arch === "ia32" ? "notify" : "auto";
    if (o.platform === "darwin") return o.macSigned ? "auto" : "notify";
    return o.appImage ? "auto" : "notify";
}

/**
 * Time until the next look. Normally about every four hours, spread by up to 15% either way so that the school's computers,
 * which all start together, do not ask together. After failures (no network, no release yet) it backs off from five minutes up to the normal gap.
 */
export function nextCheckDelay(o: { failures: number; random: number }): number {
    const base = o.failures > 0 ? Math.min(RETRY_MS * 2 ** (o.failures - 1), EVERY_MS) : EVERY_MS;
    const spread = 0.85 + 0.3 * Math.min(Math.max(o.random, 0), 1);
    return Math.round(base * spread);
}

/** Back at the window (or the computer woke up): ask again only if the last look is old enough. */
export function mayCheckNow(o: { phase: Phase; lastCheck: number; now: number }): boolean {
    if (o.phase === "checking" || o.phase === "downloading" || o.phase === "ready") return false;
    return o.now - o.lastCheck >= FOCUS_GAP_MS;
}

/**
 * Whether a downloaded update should be installed now, without the person asking. Only when nobody is looking at the window:
 * it has been hidden (tray) for a while. A visible window is never interrupted; the update then waits for the next quit.
 * `hiddenSince` is when the window was first seen hidden, or null while it is visible.
 */
export function installWhileHidden(o: { phase: Phase; hiddenSince: number | null; now: number }): boolean {
    return o.phase === "ready" && o.hiddenSince !== null && o.now - o.hiddenSince >= HIDDEN_BEFORE_INSTALL_MS;
}

/** Whether the start that follows an update should keep the window hidden: the app was hidden when it restarted itself, a moment ago. */
export function startHiddenAfterUpdate(o: { mark: number; now: number }): boolean {
    return o.mark > 0 && o.now - o.mark >= 0 && o.now - o.mark <= QUIET_RESTART_MS;
}

/** The version a release feed names, when it is a normal x.y.z and newer than the running one. */
export function isNewer(candidate: string, current: string): boolean {
    const parse = (v: string) => /^(\d+)\.(\d+)\.(\d+)/.exec(v)?.slice(1, 4).map(Number) ?? null;
    const a = parse(candidate);
    const b = parse(current);
    if (!a || !b) return false;
    for (let i = 0; i < 3; i++) if (a[i]! !== b[i]!) return a[i]! > b[i]!;
    return false;
}

/** What the page is told. Plain data, nothing about the files on disk. */
export type Status = { mode: Mode; phase: Phase; current: string; version?: string; percent?: number; checkedAt?: number };

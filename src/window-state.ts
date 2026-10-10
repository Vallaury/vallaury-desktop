import { readFileSync, writeFileSync } from "node:fs";

export type Rect = { x: number; y: number; width: number; height: number };
export type WindowState = { bounds: Rect; maximized: boolean };

export const DEFAULT_SIZE = { width: 1280, height: 860 };
const MIN = { width: 480, height: 600 };

const num = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n);

/** What was kept last time, trusted only if it is well formed and still lands on a screen that exists. */
export function usable(raw: unknown, screens: Rect[]): WindowState | null {
    const s = raw as Partial<WindowState> | null;
    const b = s?.bounds;
    if (!b || !num(b.x) || !num(b.y) || !num(b.width) || !num(b.height)) return null;
    if (b.width < MIN.width || b.height < MIN.height) return null;
    const visible = screens.some((r) => b.x < r.x + r.width - 80 && b.x + b.width > r.x + 80 && b.y >= r.y - 10 && b.y < r.y + r.height - 80);
    return visible ? { bounds: b, maximized: s?.maximized === true } : null;
}

export function load(file: string, screens: Rect[]): WindowState | null {
    try {
        return usable(JSON.parse(readFileSync(file, "utf8")), screens);
    } catch {
        return null;
    }
}

export function save(file: string, state: WindowState): void {
    try {
        writeFileSync(file, JSON.stringify(state));
    } catch {
        /* the window simply opens at its default size next time */
    }
}

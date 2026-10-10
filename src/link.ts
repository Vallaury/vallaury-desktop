/**
 * Linking this computer to the account, and asking for its notifications. Same calls as the Android app
 * (src/app/api/widget/* on the service): a one-time code is swapped for the computer's own key, and the key proves who is asking.
 * The network is passed in so the logic can be tested without one.
 */
export type Fetcher = (url: string, init?: { method?: string; headers?: Record<string, string>; body?: string }) => Promise<{ ok: boolean; status: number; json: () => Promise<unknown> }>;

export class Rejected extends Error {
    constructor(readonly status: number) {
        super(`HTTP ${status}`);
    }
}

export type Line = { id: number; kind: string; title: string; body: string; href: string };
export type Lines = { items: Line[]; cursor: number };

const CODE = /^[A-Za-z0-9_-]{20,80}$/;
const KEY = /^[A-Za-z0-9_-]{20,80}$/;

async function call(fetcher: Fetcher, site: string, path: string, init: { method: string; token?: string; body?: unknown }): Promise<unknown> {
    const res = await fetcher(`${site}${path}`, {
        method: init.method,
        headers: { "content-type": "application/json", ...(init.token ? { authorization: `Bearer ${init.token}` } : {}) },
        body: init.body === undefined ? undefined : JSON.stringify(init.body),
    });
    if (!res.ok) throw new Rejected(res.status);
    return res.json();
}

/** Swaps the one-time code from the page for the computer's key. */
export async function pair(fetcher: Fetcher, site: string, code: string, label: string): Promise<string> {
    if (!CODE.test(code)) throw new Rejected(400);
    const r = (await call(fetcher, site, "/api/widget/pair", { method: "POST", body: { code, label: label.slice(0, 60) } })) as { token?: unknown };
    if (typeof r.token !== "string" || !KEY.test(r.token)) throw new Rejected(502);
    return r.token;
}

/** Gives the key back. Offline or already gone is fine: the key is erased here either way. */
export async function unpair(fetcher: Fetcher, site: string, token: string): Promise<void> {
    await call(fetcher, site, "/api/widget/unpair", { method: "POST", token, body: {} });
}

export async function lines(fetcher: Fetcher, site: string, token: string, after: number | null): Promise<Lines> {
    const r = (await call(fetcher, site, `/api/widget/notifications${after === null ? "" : `?after=${after}`}`, { method: "GET", token })) as { items?: unknown; cursor?: unknown };
    if (!Array.isArray(r.items) || typeof r.cursor !== "number") throw new Rejected(502);
    const items = r.items.flatMap((i): Line[] => {
        const l = i as Partial<Line> | null;
        return l && typeof l.id === "number" && typeof l.title === "string" && typeof l.body === "string" ? [{ id: l.id, kind: String(l.kind ?? ""), title: l.title, body: l.body, href: safePath(l.href) }] : [];
    });
    return { items, cursor: r.cursor };
}

/** A notification may only lead to a page of the site, never to another address. */
export function safePath(href: unknown): string {
    return typeof href === "string" && /^\/(?!\/)[^\s\\]*$/.test(href) ? href : "/";
}

/** How long to wait before asking again: a regular rhythm with a little spread, longer on battery, much longer after failures. */
export function nextDelay(opts: { failures: number; onBattery: boolean; random: number }): number {
    const base = (opts.onBattery ? 15 : 5) * 60_000;
    const spread = (opts.random - 0.5) * 2 * 60_000;
    return Math.min(30 * 60_000, base * 2 ** Math.min(opts.failures, 3)) + spread;
}

/** A cursor older than the server's memory is dropped so old lines are never shown late. */
export const STALE_MS = 24 * 3600_000;

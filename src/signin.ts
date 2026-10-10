import { createHash, randomBytes } from "node:crypto";

/**
 * Signing in with Google. Google refuses embedded browsers, so the Google step runs in the system browser and comes back as
 * vallaury://signin?code=... The session itself is made inside this window: the app keeps a random secret (the proof), tells
 * the server only its SHA-256 (the challenge), and sends the proof again with the code. A code caught by another program is
 * useless without the proof. Same scheme as the Android app (src/lib/auth/app-handoff.ts on the server).
 */
const CODE = /^[A-Za-z0-9_-]{20,80}$/;
/** The browser step is short; a proof older than this is forgotten. */
export const PROOF_MS = 10 * 60_000;

export type Pending = { proof: string; challenge: string; at: number };

export function begin(now = Date.now()): Pending {
    const proof = randomBytes(32).toString("base64url");
    return { proof, challenge: createHash("sha256").update(proof).digest("base64url"), at: now };
}

export const startUrl = (site: string, p: Pending) => `${site}/api/auth/google/start?app=${p.challenge}`;

/** The address that makes the session in this window, or null when the link is not the one we are waiting for. */
export function finish(link: string, pending: Pending | null, site: string, now = Date.now()): string | null {
    if (!pending || now - pending.at > PROOF_MS) return null;
    let u: URL;
    try {
        u = new URL(link);
    } catch {
        return null;
    }
    if (u.protocol !== "vallaury:" || u.hostname !== "signin") return null;
    const code = u.searchParams.get("code") ?? "";
    if (!CODE.test(code)) return null;
    return `${site}/api/auth/app?code=${encodeURIComponent(code)}&proof=${encodeURIComponent(pending.proof)}`;
}

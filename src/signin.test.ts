import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { begin, finish, PROOF_MS, startUrl } from "./signin";

const SITE = "https://app.vallaury.it";
const CODE = "A".repeat(32);

test("the server only ever sees the challenge, which is the proof's SHA-256", () => {
    const p = begin();
    assert.equal(p.challenge, createHash("sha256").update(p.proof).digest("base64url"));
    assert.match(p.challenge, /^[A-Za-z0-9_-]{43}$/);
    assert.match(p.proof, /^[A-Za-z0-9_-]{43}$/);
    assert.equal(startUrl(SITE, p), `${SITE}/api/auth/google/start?app=${p.challenge}`);
});

test("the returning link becomes the address that makes the session here", () => {
    const p = begin(1000);
    const url = finish(`vallaury://signin?code=${CODE}`, p, SITE, 2000);
    assert.equal(url, `${SITE}/api/auth/app?code=${CODE}&proof=${p.proof}`);
});

test("nothing is accepted without a sign-in we started, or when it is too old or malformed", () => {
    const p = begin(0);
    assert.equal(finish(`vallaury://signin?code=${CODE}`, null, SITE), null);
    assert.equal(finish(`vallaury://signin?code=${CODE}`, p, SITE, PROOF_MS + 1), null);
    assert.equal(finish("vallaury://signin?code=short", p, SITE, 1), null);
    assert.equal(finish(`vallaury://widget-link?code=${CODE}`, p, SITE, 1), null);
    assert.equal(finish(`https://evil.example/?code=${CODE}`, p, SITE, 1), null);
    assert.equal(finish("not a url", p, SITE, 1), null);
});

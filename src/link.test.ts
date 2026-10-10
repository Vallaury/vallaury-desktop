import assert from "node:assert/strict";
import { test } from "node:test";
import { lines, nextDelay, pair, Rejected, safePath, unpair, type Fetcher } from "./link";

const SITE = "https://app.vallaury.it";
const CODE = "C".repeat(30);
const KEY = "K".repeat(43);

const answer = (status: number, body: unknown = {}): Fetcher => async () => ({ ok: status >= 200 && status < 300, status, json: async () => body });

test("the code is swapped for the key, sent with the label", async () => {
    const seen: { url?: string; body?: string; auth?: string } = {};
    const f: Fetcher = async (url, init) => {
        Object.assign(seen, { url, body: init?.body, auth: init?.headers?.authorization });
        return { ok: true, status: 200, json: async () => ({ token: KEY }) };
    };
    assert.equal(await pair(f, SITE, CODE, "Studio (Linux)"), KEY);
    assert.equal(seen.url, `${SITE}/api/widget/pair`);
    assert.deepEqual(JSON.parse(seen.body ?? "{}"), { code: CODE, label: "Studio (Linux)" });
    assert.equal(seen.auth, undefined);
});

test("a bad code never reaches the network, and a strange answer is refused", async () => {
    await assert.rejects(pair(answer(200, { token: KEY }), SITE, "short", "x"), Rejected);
    await assert.rejects(pair(answer(200, { token: 5 }), SITE, CODE, "x"), Rejected);
    await assert.rejects(pair(answer(410), SITE, CODE, "x"), (e: Rejected) => e.status === 410);
});

test("lines carry the key and the cursor, and only pages of the site", async () => {
    let url = "";
    let auth = "";
    const f: Fetcher = async (u, init) => {
        url = u;
        auth = init?.headers?.authorization ?? "";
        return { ok: true, status: 200, json: async () => ({ cursor: 9, items: [{ id: 1, kind: "homework", title: "T", body: "B", href: "//evil.example" }, { id: 2, kind: "x", title: "T2", body: "B2", href: "/tasks" }, { nope: true }] }) };
    };
    const r = await lines(f, SITE, KEY, 5);
    assert.equal(url, `${SITE}/api/widget/notifications?after=5`);
    assert.equal(auth, `Bearer ${KEY}`);
    assert.deepEqual(r.items.map((i) => i.href), ["/", "/tasks"]);
    assert.equal(r.cursor, 9);
    await lines(f, SITE, KEY, null);
    assert.equal(url, `${SITE}/api/widget/notifications`);
});

test("a rejected key shows as 401", async () => {
    await assert.rejects(lines(answer(401), SITE, KEY, null), (e: Rejected) => e.status === 401);
    await assert.rejects(unpair(answer(401), SITE, KEY), Rejected);
});

test("paths", () => {
    assert.equal(safePath("/home?x=1"), "/home?x=1");
    assert.equal(safePath("https://evil.example"), "/");
    assert.equal(safePath("//evil.example"), "/");
    assert.equal(safePath(undefined), "/");
});

test("the rhythm is five minutes, fifteen on battery, and backs off after failures up to half an hour", () => {
    const mid = { random: 0.5 };
    assert.equal(nextDelay({ ...mid, failures: 0, onBattery: false }), 5 * 60_000);
    assert.equal(nextDelay({ ...mid, failures: 0, onBattery: true }), 15 * 60_000);
    assert.equal(nextDelay({ ...mid, failures: 1, onBattery: false }), 10 * 60_000);
    assert.equal(nextDelay({ ...mid, failures: 9, onBattery: false }), 30 * 60_000);
    assert.ok(nextDelay({ random: 0, failures: 0, onBattery: false }) < 5 * 60_000);
});

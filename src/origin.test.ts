import assert from "node:assert/strict";
import { test } from "node:test";
import { canOpenOutside, isInside, siteUrl, userAgent } from "./origin";

test("only the site itself is inside", () => {
    const site = "https://app.vallaury.it";
    assert.equal(isInside("https://app.vallaury.it/home", site), true);
    assert.equal(isInside("https://app.vallaury.it.evil.example/", site), false);
    assert.equal(isInside("http://app.vallaury.it/", site), false);
    assert.equal(isInside("https://accounts.google.com/", site), false);
    assert.equal(isInside("not a url", site), false);
});

test("only safe kinds of address leave the app", () => {
    assert.equal(canOpenOutside("https://example.org"), true);
    assert.equal(canOpenOutside("mailto:a@b.it"), true);
    assert.equal(canOpenOutside("file:///etc/passwd"), false);
    assert.equal(canOpenOutside("javascript:alert(1)"), false);
    assert.equal(canOpenOutside("ms-msdt:/id"), false);
});

test("a packaged app always opens the real site", () => {
    assert.equal(siteUrl("https://demo.vallaury.it/x", true), "https://app.vallaury.it");
    assert.equal(siteUrl("https://demo.vallaury.it/x", false), "https://demo.vallaury.it");
    assert.equal(siteUrl("http://localhost:3000", false), "https://app.vallaury.it");
    assert.equal(siteUrl(undefined, false), "https://app.vallaury.it");
});

test("the user agent drops Electron and names the app", () => {
    const ua = userAgent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) vallaury-desktop/0.1.0 Chrome/150.0.0.0 Electron/44.7.0 Safari/537.36", "0.1.0", "linux");
    assert.ok(!/Electron/.test(ua));
    assert.ok(!/vallaury-desktop/.test(ua));
    assert.match(ua, /Chrome\/150/);
    assert.match(ua, /VallauryApp\/0\.1\.0 \(Desktop; Linux\)$/);
});

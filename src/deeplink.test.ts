import assert from "node:assert/strict";
import { test } from "node:test";
import { isSigninLink, linkIn, openTarget } from "./deeplink";

const SITE = "https://app.vallaury.it";

test("open links lead to a page of the site", () => {
    assert.equal(openTarget("vallaury://open?path=/homework/abc", SITE), `${SITE}/homework/abc`);
    assert.equal(openTarget("vallaury://open", SITE), `${SITE}/`);
    assert.equal(openTarget("vallaury://open?path=%2Fnotes%3Fq%3D1", SITE), `${SITE}/notes?q=1`);
});

test("the site's own address is accepted, another is not", () => {
    assert.equal(openTarget(`${SITE}/c/abc`, SITE), `${SITE}/c/abc`);
    assert.equal(openTarget("https://evil.example/c/abc", SITE), null);
    assert.equal(openTarget("https://app.vallaury.it.evil.example/", SITE), null);
});

test("nothing can lead outside the site", () => {
    for (const bad of ["vallaury://open?path=//evil.example", "vallaury://open?path=https://evil.example", "vallaury://open?path=/a%20b", "vallaury://open?path=/\\evil", "vallaury://other?path=/", "file:///etc/passwd", "javascript:alert(1)", "not a url"]) {
        assert.equal(openTarget(bad, SITE), null, bad);
    }
});

test("the command line is searched for a link", () => {
    assert.equal(linkIn(["app", "--hidden", "vallaury://open?path=/"], SITE), "vallaury://open?path=/");
    assert.equal(linkIn(["app", `${SITE}/x`], SITE), `${SITE}/x`);
    assert.equal(linkIn(["app", "https://other.example/"], SITE), undefined);
    assert.ok(isSigninLink("vallaury://signin?code=x"));
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { modeFor } from "./updates";

const base = { platform: "linux" as NodeJS.Platform, packaged: true, appImage: false, macSigned: false, portable: false };

test("an unpackaged run never updates", () => {
    assert.equal(modeFor({ ...base, packaged: false }), "off");
});
test("Windows installer updates itself, the portable build only tells", () => {
    assert.equal(modeFor({ ...base, platform: "win32" }), "auto");
    assert.equal(modeFor({ ...base, platform: "win32", portable: true }), "notify");
});
test("32-bit Windows only tells", () => {
    assert.equal(modeFor({ ...base, platform: "win32", arch: "ia32" }), "notify");
});
test("an unsigned Mac only tells, a signed one updates itself", () => {
    assert.equal(modeFor({ ...base, platform: "darwin" }), "notify");
    assert.equal(modeFor({ ...base, platform: "darwin", macSigned: true }), "auto");
});
test("AppImage updates itself, deb and rpm only tell", () => {
    assert.equal(modeFor({ ...base, appImage: true }), "auto");
    assert.equal(modeFor(base), "notify");
});

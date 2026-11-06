import { test } from "node:test";
import assert from "node:assert/strict";
import { isUnpackedWindows, EVERY_MS, FOCUS_GAP_MS, HIDDEN_BEFORE_INSTALL_MS, installWhileHidden, isNewer, mayCheckNow, modeFor, nextCheckDelay, QUIET_RESTART_MS, RETRY_MS, startHiddenAfterUpdate } from "./update-policy";

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
test("a Flatpak is updated by Flathub", () => {
    assert.equal(modeFor({ ...base, flatpak: true }), "off");
});
test("an unsigned Mac only tells, a signed one updates itself", () => {
    assert.equal(modeFor({ ...base, platform: "darwin" }), "notify");
    assert.equal(modeFor({ ...base, platform: "darwin", macSigned: true }), "auto");
});
test("AppImage updates itself, deb and rpm only tell", () => {
    assert.equal(modeFor({ ...base, appImage: true }), "auto");
    assert.equal(modeFor(base), "notify");
});

test("the normal gap is about four hours, spread so that a classroom does not ask together", () => {
    const low = nextCheckDelay({ failures: 0, random: 0 });
    const high = nextCheckDelay({ failures: 0, random: 1 });
    assert.ok(low >= EVERY_MS * 0.85 - 1 && high <= EVERY_MS * 1.15 + 1 && high > low);
});
test("failures back off from five minutes and never beyond the normal gap", () => {
    const at = (failures: number) => nextCheckDelay({ failures, random: 0.5 });
    assert.equal(at(1), RETRY_MS);
    assert.equal(at(2), RETRY_MS * 2);
    assert.ok(at(3) > at(2));
    assert.equal(at(30), EVERY_MS);
});
test("coming back to the window checks only when the last look is an hour old and nothing is in progress", () => {
    const now = 10 * FOCUS_GAP_MS;
    assert.equal(mayCheckNow({ phase: "idle", lastCheck: now - FOCUS_GAP_MS + 1, now }), false);
    assert.equal(mayCheckNow({ phase: "idle", lastCheck: now - FOCUS_GAP_MS, now }), true);
    assert.equal(mayCheckNow({ phase: "error", lastCheck: 0, now }), true);
    for (const phase of ["checking", "downloading", "ready"] as const) assert.equal(mayCheckNow({ phase, lastCheck: 0, now }), false);
});
test("a ready update installs itself only after the window has been hidden long enough", () => {
    const now = 100 * HIDDEN_BEFORE_INSTALL_MS;
    assert.equal(installWhileHidden({ phase: "ready", hiddenSince: null, now }), false, "a visible window is never interrupted");
    assert.equal(installWhileHidden({ phase: "ready", hiddenSince: now - HIDDEN_BEFORE_INSTALL_MS + 1, now }), false);
    assert.equal(installWhileHidden({ phase: "ready", hiddenSince: now - HIDDEN_BEFORE_INSTALL_MS, now }), true);
    assert.equal(installWhileHidden({ phase: "downloading", hiddenSince: 0, now }), false);
    assert.equal(installWhileHidden({ phase: "available", hiddenSince: 0, now }), false);
});
test("the window stays hidden after a quiet restart, but a stale mark is not believed", () => {
    const now = 1_000_000_000;
    assert.equal(startHiddenAfterUpdate({ mark: now - 30_000, now }), true);
    assert.equal(startHiddenAfterUpdate({ mark: now - QUIET_RESTART_MS - 1, now }), false);
    assert.equal(startHiddenAfterUpdate({ mark: 0, now }), false);
    assert.equal(startHiddenAfterUpdate({ mark: now + 60_000, now }), false, "a clock that went back");
});
test("only a newer x.y.z counts as an update", () => {
    assert.equal(isNewer("0.2.0", "0.1.5"), true);
    assert.equal(isNewer("0.1.10", "0.1.9"), true);
    assert.equal(isNewer("0.1.5", "0.1.5"), false);
    assert.equal(isNewer("0.1.4", "0.1.5"), false);
    assert.equal(isNewer("1.0.0-beta", "0.9.9"), true);
    assert.equal(isNewer("garbage", "0.1.5"), false);
});

test("a Windows folder without the uninstaller is a copy made by hand and never runs the installer updater", () => {
    assert.equal(isUnpackedWindows({ platform: "win32", packaged: true, uninstallerExists: false }), true);
    assert.equal(isUnpackedWindows({ platform: "win32", packaged: true, uninstallerExists: true }), false);
    assert.equal(isUnpackedWindows({ platform: "linux", packaged: true, uninstallerExists: false }), false);
    assert.equal(isUnpackedWindows({ platform: "win32", packaged: false, uninstallerExists: false }), false);
});

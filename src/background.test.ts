import assert from "node:assert/strict";
import { test } from "node:test";
import { autostartEntry, badgeLabel, dotBitmap, keepsRunning, trayUsable } from "./background";

test("the tray is trusted on Windows and macOS, and on Linux except GNOME", () => {
    assert.equal(trayUsable("win32", undefined, undefined), true);
    assert.equal(trayUsable("darwin", undefined, undefined), true);
    assert.equal(trayUsable("linux", "KDE", undefined), true);
    assert.equal(trayUsable("linux", "XFCE", undefined), true);
    assert.equal(trayUsable("linux", "GNOME", undefined), false);
    assert.equal(trayUsable("linux", "ubuntu:GNOME", undefined), false);
    assert.equal(trayUsable("linux", undefined, undefined), false);
    assert.equal(trayUsable("linux", "GNOME", "1"), true);
    assert.equal(trayUsable("linux", "KDE", "0"), false);
});

test("closing the window keeps the app only when something needs it", () => {
    const all = { background: true, linked: true, notifications: true };
    assert.equal(keepsRunning(all), true);
    for (const k of Object.keys(all) as (keyof typeof all)[]) assert.equal(keepsRunning({ ...all, [k]: false }), false, k);
});

test("the Linux autostart entry starts hidden and quotes paths", () => {
    const e = autostartEntry(["/opt/Vallaury App/vallaury"]);
    assert.match(e, /^Exec="\/opt\/Vallaury App\/vallaury" --hidden$/m);
    assert.match(autostartEntry(["/usr/bin/vallaury"]), /^Exec=\/usr\/bin\/vallaury --hidden$/m);
});

test("the overlay dot is round and opaque in the middle", () => {
    const b = dotBitmap(16, [200, 30, 30]);
    assert.equal(b.length, 16 * 16 * 4);
    assert.equal(b[(8 * 16 + 8) * 4 + 3], 255);
    assert.equal(b[3], 0);
});

test("the tooltip counts what is new", () => {
    assert.equal(badgeLabel(0), "Vallaury");
    assert.equal(badgeLabel(1), "Vallaury · 1 novità");
    assert.equal(badgeLabel(250), "Vallaury · 99+ novità");
});

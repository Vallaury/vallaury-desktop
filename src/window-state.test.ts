import assert from "node:assert/strict";
import { test } from "node:test";
import { usable } from "./window-state";

const screens = [{ x: 0, y: 0, width: 1920, height: 1080 }];

test("a window that fits a screen is kept", () => {
    const s = usable({ bounds: { x: 100, y: 80, width: 1200, height: 800 }, maximized: true }, screens);
    assert.equal(s?.maximized, true);
});

test("a window left on a screen that is gone is not", () => {
    assert.equal(usable({ bounds: { x: 3000, y: 80, width: 1200, height: 800 }, maximized: false }, screens), null);
});

test("garbage and tiny windows are ignored", () => {
    assert.equal(usable(null, screens), null);
    assert.equal(usable({ bounds: { x: "a" } }, screens), null);
    assert.equal(usable({ bounds: { x: 0, y: 0, width: 100, height: 100 } }, screens), null);
});

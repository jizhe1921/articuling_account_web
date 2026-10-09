import test from "node:test";
import assert from "node:assert/strict";
import { buildDesktopActionUrl, openDesktopAction } from "../assets/desktop-link.js";

const token = "abcdefghijklmnopqrstuvwxyz123456";

test("builds verify-email desktop URL", () => {
  assert.equal(
    buildDesktopActionUrl("verify-email", token),
    `articuling://verify-email?token=${token}`,
  );
});

test("builds reset-password desktop URL", () => {
  assert.equal(
    buildDesktopActionUrl("reset-password", token),
    `articuling://reset-password?token=${token}`,
  );
});

test("URL-encodes token content", () => {
  assert.equal(
    buildDesktopActionUrl("verify-email", "abcdefghijklmnop+/_="),
    "articuling://verify-email?token=abcdefghijklmnop%2B%2F_%3D",
  );
});

test("rejects unknown desktop action", () => {
  assert.throws(() => buildDesktopActionUrl("other", token), /Unsupported/);
});

test("opens action through supplied location object", () => {
  let assigned = "";
  const locationObject = { assign(value) { assigned = value; } };
  const url = openDesktopAction("verify-email", token, { locationObject });
  assert.equal(assigned, url);
  assert.equal(url, `articuling://verify-email?token=${token}`);
});

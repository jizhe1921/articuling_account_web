import test from "node:test";
import assert from "node:assert/strict";
import { readActionToken, sanitizedRelativeUrl } from "../assets/token-utils.js";

const token = "abcdefghijklmnopqrstuvwxyz123456";

test("reads preferred fragment token", () => {
  assert.equal(readActionToken(`https://account.articuling.com/verify-email/#token=${token}`), token);
});

test("reads current query token", () => {
  assert.equal(readActionToken(`https://account.articuling.com/verify-email/?token=${token}`), token);
});

test("fragment token wins over query token", () => {
  assert.equal(readActionToken(`https://example.test/path?token=queryqueryquery1#token=${token}`), token);
});

test("rejects missing and short tokens", () => {
  assert.equal(readActionToken("https://example.test/path"), "");
  assert.equal(readActionToken("https://example.test/path?token=short"), "");
});

test("sanitizes token while preserving unrelated query values", () => {
  assert.equal(
    sanitizedRelativeUrl(`https://example.test/reset-password/?lang=zh-CN&token=${token}#token=${token}`),
    "/reset-password/?lang=zh-CN",
  );
});

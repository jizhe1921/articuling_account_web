import test from "node:test";
import assert from "node:assert/strict";
import { readActionTarget, resolveApiBaseUrl } from "../assets/site-config.js";

test("development action links use the development API", () => {
  const url = "https://account.articuling.com/verify-email/?action_target=development&token=abcdefghijklmnopqrstuvwxyz123456";
  const target = readActionTarget(url);
  assert.equal(target, "development");
  assert.equal(resolveApiBaseUrl("account.articuling.com", target), "https://dev-api.articuling.com");
});

test("deployment and legacy links use the deployment API", () => {
  const deployment = readActionTarget("https://account.articuling.com/verify-email/?action_target=deployment");
  const legacy = readActionTarget("https://account.articuling.com/verify-email/");
  assert.equal(deployment, "deployment");
  assert.equal(legacy, "deployment");
  assert.equal(resolveApiBaseUrl("account.articuling.com", deployment), "https://api.articuling.com");
  assert.equal(resolveApiBaseUrl("account.articuling.com", legacy), "https://api.articuling.com");
});

test("local page debugging stays local regardless of action target", () => {
  assert.equal(resolveApiBaseUrl("127.0.0.1", "development"), "http://127.0.0.1:8766");
  assert.equal(resolveApiBaseUrl("localhost", "deployment"), "http://127.0.0.1:8766");
});

import test from "node:test";
import assert from "node:assert/strict";
import { AccountApiError, postJson } from "../assets/api-client.js";

test("posts strict JSON without credentials or referrer", async () => {
  let captured;
  const result = await postJson("/v1/test", { value: 1 }, {
    apiBaseUrl: "https://api.example.test/",
    fetchImpl: async (url, options) => {
      captured = { url, options };
      return { ok: true, status: 200, json: async () => ({ ok: true, data: { done: true } }) };
    },
  });
  assert.deepEqual(result, { done: true });
  assert.equal(captured.url, "https://api.example.test/v1/test");
  assert.equal(captured.options.credentials, "omit");
  assert.equal(captured.options.referrerPolicy, "no-referrer");
  assert.equal(captured.options.cache, "no-store");
  assert.equal(captured.options.body, JSON.stringify({ value: 1 }));
});

test("preserves stable public error code", async () => {
  await assert.rejects(
    postJson("/v1/test", {}, {
      apiBaseUrl: "https://api.example.test",
      fetchImpl: async () => ({
        ok: false,
        status: 400,
        json: async () => ({ ok: false, error: { code: "verification_token_invalid", message: "safe", request_id: "r1" } }),
      }),
    }),
    (error) => error instanceof AccountApiError && error.code === "verification_token_invalid" && error.status === 400,
  );
});

test("classifies malformed server response", async () => {
  await assert.rejects(
    postJson("/v1/test", {}, {
      apiBaseUrl: "https://api.example.test",
      fetchImpl: async () => ({ ok: false, status: 502, json: async () => { throw new Error("bad json"); } }),
    }),
    (error) => error instanceof AccountApiError && error.code === "invalid_server_response",
  );
});

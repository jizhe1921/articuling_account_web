export class AccountApiError extends Error {
  constructor(code, message, status = 0) {
    super(message);
    this.name = "AccountApiError";
    this.code = code;
    this.status = status;
  }
}

function normalizeBaseUrl(value) {
  return String(value).replace(/\/+$/, "");
}

export async function postJson(path, payload, options = {}) {
  const apiBaseUrl = normalizeBaseUrl(options.apiBaseUrl);
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  if (!apiBaseUrl || typeof fetchImpl !== "function") {
    throw new AccountApiError("client_configuration_error", "API client is not configured");
  }

  const controller = new AbortController();
  const timeoutMs = options.timeoutMs ?? 15000;
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetchImpl(`${apiBaseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
      credentials: "omit",
      mode: "cors",
      redirect: "error",
      referrerPolicy: "no-referrer",
      signal: controller.signal,
    });

    let body;
    try {
      body = await response.json();
    } catch {
      throw new AccountApiError("invalid_server_response", "The server returned an invalid response", response.status);
    }

    if (!response.ok || body?.ok !== true) {
      const code = body?.error?.code || "request_failed";
      throw new AccountApiError(code, "The account request failed", response.status);
    }
    return body.data;
  } catch (error) {
    if (error instanceof AccountApiError) throw error;
    if (error?.name === "AbortError") {
      throw new AccountApiError("request_timeout", "The account request timed out");
    }
    throw new AccountApiError("network_error", "The account service could not be reached");
  } finally {
    clearTimeout(timer);
  }
}

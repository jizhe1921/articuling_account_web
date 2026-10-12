const DEVELOPMENT_API_BASE_URL = "https://dev-api.articuling.com";
const DEPLOYMENT_API_BASE_URL = "https://api.articuling.com";
const LOCAL_API_BASE_URL = "http://127.0.0.1:8766";
const DEFAULT_ACTION_TARGET = "deployment";

export function readActionTarget(urlValue = globalThis.location?.href ?? "") {
  try {
    const value = new URL(urlValue).searchParams.get("action_target");
    return String(value ?? "").toLowerCase() === "development"
      ? "development"
      : DEFAULT_ACTION_TARGET;
  } catch {
    return DEFAULT_ACTION_TARGET;
  }
}

export function resolveApiBaseUrl(
  hostname = globalThis.location?.hostname ?? "",
  actionTarget = readActionTarget(),
) {
  const normalizedHost = String(hostname).toLowerCase();
  if (normalizedHost === "localhost" || normalizedHost === "127.0.0.1" || normalizedHost === "::1") {
    return LOCAL_API_BASE_URL;
  }
  return String(actionTarget).toLowerCase() === "development"
    ? DEVELOPMENT_API_BASE_URL
    : DEPLOYMENT_API_BASE_URL;
}

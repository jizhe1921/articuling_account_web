const PRODUCTION_API_BASE_URL = "https://api.articuling.com";
const LOCAL_API_BASE_URL = "http://127.0.0.1:8766";

export function resolveApiBaseUrl(hostname = globalThis.location?.hostname ?? "") {
  const normalized = String(hostname).toLowerCase();
  if (normalized === "localhost" || normalized === "127.0.0.1" || normalized === "::1") {
    return LOCAL_API_BASE_URL;
  }
  return PRODUCTION_API_BASE_URL;
}

const TOKEN_NAME = "token";
const MIN_TOKEN_LENGTH = 16;
const MAX_TOKEN_LENGTH = 4096;

function validateToken(value) {
  if (typeof value !== "string") return "";
  const token = value.trim();
  if (
    token.length < MIN_TOKEN_LENGTH ||
    token.length > MAX_TOKEN_LENGTH ||
    token.includes("\n") ||
    token.includes("\r")
  ) {
    return "";
  }
  return token;
}

export function readActionToken(urlValue) {
  const url = new URL(urlValue);
  const fragment = url.hash.startsWith("#") ? url.hash.slice(1) : url.hash;
  const fragmentToken = new URLSearchParams(fragment).get(TOKEN_NAME);
  return validateToken(fragmentToken) || validateToken(url.searchParams.get(TOKEN_NAME));
}

export function sanitizedRelativeUrl(urlValue) {
  const url = new URL(urlValue);
  url.searchParams.delete(TOKEN_NAME);
  url.hash = "";
  const query = url.searchParams.toString();
  return `${url.pathname}${query ? `?${query}` : ""}`;
}

export function clearActionTokenFromAddressBar({ locationObject, historyObject }) {
  const safeUrl = sanitizedRelativeUrl(locationObject.href);
  historyObject.replaceState(null, "", safeUrl);
}

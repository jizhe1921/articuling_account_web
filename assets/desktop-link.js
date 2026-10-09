const DESKTOP_SCHEME = "articuling";
const ALLOWED_ACTIONS = new Set(["verify-email", "reset-password"]);

function validateAction(action) {
  if (!ALLOWED_ACTIONS.has(action)) {
    throw new Error(`Unsupported ArticuLing desktop action: ${action}`);
  }
  return action;
}

function validateToken(token) {
  if (typeof token !== "string") throw new Error("Missing ArticuLing action token");
  const value = token.trim();
  if (!value || value.includes("\n") || value.includes("\r")) {
    throw new Error("Invalid ArticuLing action token");
  }
  return value;
}

export function buildDesktopActionUrl(action, token) {
  const route = validateAction(action);
  const value = validateToken(token);
  const query = new URLSearchParams({ token: value });
  return `${DESKTOP_SCHEME}://${route}?${query.toString()}`;
}

export function openDesktopAction(action, token, { locationObject = window.location } = {}) {
  const url = buildDesktopActionUrl(action, token);
  if (typeof locationObject.assign === "function") locationObject.assign(url);
  else locationObject.href = url;
  return url;
}

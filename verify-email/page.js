import { postJson } from "../assets/api-client.js";
import { messageForError, setStatus } from "../assets/page-ui.js";
import { readActionTarget, resolveApiBaseUrl } from "../assets/site-config.js";
import { clearActionTokenFromAddressBar, readActionToken } from "../assets/token-utils.js";

const statusElement = document.querySelector("#status");
const actionTarget = readActionTarget(window.location.href);
let token = readActionToken(window.location.href);
clearActionTokenFromAddressBar({ locationObject: window.location, historyObject: window.history });

if (!token) {
  setStatus(statusElement, "error", "验证链接缺少有效 token，请重新打开最新邮件。", { busy: false });
} else {
  try {
    const result = await postJson(
      "/v1/identity/email-verifications",
      { verification_token: token },
      { apiBaseUrl: resolveApiBaseUrl(window.location.hostname, actionTarget) },
    );
    token = "";
    if (result?.verified !== true) throw new Error("verification result missing");
    setStatus(statusElement, "success", "邮箱验证成功。现在可以返回 ArticuLing 登录。", { busy: false });
  } catch (error) {
    token = "";
    setStatus(statusElement, "error", messageForError(error?.code, "verify"), { busy: false });
  }
}

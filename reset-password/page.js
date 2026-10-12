import { postJson } from "../assets/api-client.js";
import { messageForError, setStatus } from "../assets/page-ui.js";
import { readActionTarget, resolveApiBaseUrl } from "../assets/site-config.js";
import { clearActionTokenFromAddressBar, readActionToken } from "../assets/token-utils.js";

const form = document.querySelector("#reset-form");
const passwordInput = document.querySelector("#new-password");
const confirmInput = document.querySelector("#confirm-password");
const submitButton = document.querySelector("#submit-button");
const statusElement = document.querySelector("#status");

const actionTarget = readActionTarget(window.location.href);
let token = readActionToken(window.location.href);
clearActionTokenFromAddressBar({ locationObject: window.location, historyObject: window.history });

if (!token) {
  form.hidden = true;
  setStatus(statusElement, "error", "密码重置链接缺少有效 token，请重新申请。", { busy: false });
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!token) return;

  const newPassword = passwordInput.value;
  const confirmedPassword = confirmInput.value;
  if (newPassword.length < 10) {
    setStatus(statusElement, "error", "新密码至少需要 10 个字符。", { busy: false });
    passwordInput.focus();
    return;
  }
  if (newPassword !== confirmedPassword) {
    setStatus(statusElement, "error", "两次输入的密码不一致。", { busy: false });
    confirmInput.focus();
    return;
  }

  submitButton.disabled = true;
  passwordInput.disabled = true;
  confirmInput.disabled = true;
  setStatus(statusElement, "working", "正在重置密码……", { busy: true });

  try {
    const result = await postJson(
      "/v1/identity/password-resets",
      { reset_token: token, new_password: newPassword },
      { apiBaseUrl: resolveApiBaseUrl(window.location.hostname, actionTarget) },
    );
    token = "";
    passwordInput.value = "";
    confirmInput.value = "";
    if (result?.password_reset !== true) throw new Error("password reset result missing");
    form.hidden = true;
    setStatus(statusElement, "success", "密码已重置。所有旧登录已退出，请使用新密码重新登录 ArticuLing。", { busy: false });
  } catch (error) {
    passwordInput.value = "";
    confirmInput.value = "";
    submitButton.disabled = false;
    passwordInput.disabled = false;
    confirmInput.disabled = false;
    setStatus(statusElement, "error", messageForError(error?.code, "reset"), { busy: false });
    passwordInput.focus();
  }
});

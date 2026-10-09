import { openDesktopAction } from "../assets/desktop-link.js";
import { setStatus } from "../assets/page-ui.js";
import { clearActionTokenFromAddressBar, readActionToken } from "../assets/token-utils.js";

const openButton = document.querySelector("#open-app-button");
const statusElement = document.querySelector("#status");

const token = readActionToken(window.location.href);
clearActionTokenFromAddressBar({ locationObject: window.location, historyObject: window.history });

function openArticuLing() {
  if (!token) return;
  setStatus(statusElement, "working", "正在打开 ArticuLing……如果没有自动打开，请再次点击下方按钮。", { busy: true });
  openDesktopAction("verify-email", token);
}

if (!token) {
  openButton.hidden = true;
  setStatus(statusElement, "error", "验证链接缺少有效 token，请重新打开最新邮件。", { busy: false });
} else {
  openButton.hidden = false;
  openButton.addEventListener("click", openArticuLing);
  setStatus(statusElement, "working", "正在打开 ArticuLing 完成邮箱验证……", { busy: true });
  window.setTimeout(openArticuLing, 100);
}

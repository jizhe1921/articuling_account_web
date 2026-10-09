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
  openDesktopAction("reset-password", token);
}

if (!token) {
  openButton.hidden = true;
  setStatus(statusElement, "error", "密码重置链接缺少有效 token，请重新申请密码重置。", { busy: false });
} else {
  openButton.hidden = false;
  openButton.addEventListener("click", openArticuLing);
  setStatus(statusElement, "working", "正在打开 ArticuLing 重置密码……", { busy: true });
  window.setTimeout(openArticuLing, 100);
}

export function setStatus(element, tone, message, { busy = false } = {}) {
  element.dataset.tone = tone;
  element.replaceChildren();
  if (busy) {
    const spinner = document.createElement("span");
    spinner.className = "spinner";
    spinner.setAttribute("aria-hidden", "true");
    element.append(spinner);
  }
  element.append(document.createTextNode(message));
  element.hidden = false;
  element.setAttribute("aria-live", tone === "error" ? "assertive" : "polite");
}

export function messageForError(code, action) {
  const shared = {
    rate_limit_exceeded: "操作过于频繁，请稍后重试。",
    request_timeout: "请求超时，请检查网络后重试。",
    network_error: "暂时无法连接账号服务，请稍后重试。",
    service_unavailable: "账号服务暂不可用，请稍后重试。",
    request_invalid: "提交的数据格式不正确。",
  };
  if (shared[code]) return shared[code];

  if (action === "verify") {
    return {
      verification_token_expired: "验证链接已经过期，请在 ArticuLing 中重新发送验证邮件。",
      verification_token_invalid: "验证链接无效或已经使用。",
    }[code] || "邮箱验证未完成，请重新打开最新的验证邮件。";
  }

  return {
    password_reset_token_expired: "密码重置链接已经过期，请重新申请。",
    password_reset_token_invalid: "密码重置链接无效或已经使用。",
    invalid_password: "新密码不符合要求，请至少输入 10 个字符。",
    new_password_matches_current: "新密码不能与当前密码相同。",
  }[code] || "密码重置未完成，请重新打开最新的重置邮件。";
}

# ArticuLing Account Web

`articuling_account_web` 是 ArticuLing 账号生命周期的静态网页项目，计划由 GitHub Pages 托管。

正式页面：

```text
https://account.articuling.com/verify-email/
https://account.articuling.com/reset-password/
```

## 架构边界

这个仓库只包含 HTML、CSS 和 JavaScript：

```text
GitHub Pages 静态页面
        ↓ HTTPS JSON API
Operation Center Python 后端
```

GitHub Pages 不运行 Python，也不需要部署 `operation_center` 源码。Python 后端继续独立运行；网页只调用它的公开 HTTP API。

仓库不得包含数据库、密码、API Key、JWT 签名密钥、Resend Key 或任何真实 token。

## 当前 API

页面调用现有 Operation Center 接口：

```text
POST /v1/identity/email-verifications
POST /v1/identity/password-resets
```

生产环境默认 API 地址：

```text
https://api.articuling.com
```

本机通过 `localhost` 或 `127.0.0.1` 打开网页时，自动使用：

```text
http://127.0.0.1:8766
```

## 本地运行

从 `D:\Projects` 执行：

```powershell
python -m dev_services start operation_center
python -m http.server 4173 --directory articuling_account_web
```

打开：

```text
http://127.0.0.1:4173/verify-email/?token=测试令牌
http://127.0.0.1:4173/reset-password/?token=测试令牌
```

Operation Center 本地 CORS 至少加入：

```text
http://127.0.0.1:4173
```

例如：

```powershell
$env:OPERATION_CENTER_CORS_ORIGINS="http://127.0.0.1:4173,https://account.articuling.com"
```

本地真实邮件测试时，可临时设置：

```powershell
$env:OPERATION_CENTER_EMAIL_VERIFICATION_URL="http://127.0.0.1:4173/verify-email/"
$env:OPERATION_CENTER_PASSWORD_RESET_URL="http://127.0.0.1:4173/reset-password/"
```

修改环境变量后重新启动 `operation_center`。

## 自动检查

项目不需要安装 npm 依赖。安装 Node.js 20+ 后运行：

```powershell
cd D:\Projects\articuling_account_web
npm test
npm run check
```

## GitHub 发布

仓库固定为：

```text
https://github.com/jizhe1921/articuling_account_web
```

在本目录执行：

```powershell
.\publish_to_github.cmd
```

脚本负责初始化 Git、提交并推送。第一次发布后，在 GitHub 网页完成一次设置：

```text
Settings
→ Pages
→ Source: Deploy from a branch
→ Branch: main
→ Folder: / (root)
→ Save
```

然后设置自定义域名：

```text
account.articuling.com
```

Cloudflare DNS 增加：

```text
Type: CNAME
Name: account
Target: jizhe1921.github.io
```

GitHub Pages 就绪后开启 `Enforce HTTPS`。

## 正式后端配置

当 `https://api.articuling.com` 已经提供 Operation Center HTTPS API 后：

```text
OPERATION_CENTER_CORS_ORIGINS=https://account.articuling.com
OPERATION_CENTER_EMAIL_VERIFICATION_URL=https://account.articuling.com/verify-email/
OPERATION_CENTER_PASSWORD_RESET_URL=https://account.articuling.com/reset-password/
```

公开 HTTPS 页面不能直接调用用户电脑上的 `http://127.0.0.1:8766`。因此 GitHub Pages 可以先发布，但正式线上验证还需要 `api.articuling.com` 的 HTTPS 后端入口。

## Token 安全

页面：

- 不使用第三方脚本、字体或统计服务；
- 使用 `Referrer-Policy: no-referrer`；
- 同时支持 `?token=` 和 `#token=`；
- 读取后立即从地址栏清除 token；
- 不把 token 写入 LocalStorage、SessionStorage、Cookie 或日志；
- API 请求完成后释放内存中的 token。

当前 Operation Center 邮件链接使用 `?token=`。正式生产前应把后端链接升级为 `#token=`，这样浏览器请求 GitHub Pages 时不会把 token 发给静态站点服务器。

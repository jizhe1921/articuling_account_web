# ArticuLing Account Web

`articuling_account_web` 是 ArticuLing 账号生命周期的静态网页项目，由 GitHub Pages 托管。

更新时间：2026-07-20

正式页面：

```text
https://account.articuling.com/verify-email/
https://account.articuling.com/reset-password/
```

正式公网开发 API：

```text
https://api.articuling.com
```

## 架构边界

这个仓库只包含 HTML、CSS 和 JavaScript：

```text
GitHub Pages 静态页面
        ↓ HTTPS JSON API
Operation Center Python 后端
```

GitHub Pages 不运行 Python，也不需要部署 `operation_center` 源码。网页只调用公开 HTTP API。

仓库不得包含数据库、密码、API Key、JWT 签名密钥、Resend Key 或任何真实 token。

## 当前 API

页面调用：

```text
POST /v1/identity/email-verifications
POST /v1/identity/password-resets
```

生产域名页面默认调用：

```text
https://api.articuling.com
```

本机通过 `localhost` 或 `127.0.0.1` 打开网页时，自动使用：

```text
http://127.0.0.1:8766
```

## 当前状态

已完成：

- GitHub 仓库发布；
- GitHub Pages；
- `account.articuling.com` 自定义域名；
- HTTPS；
- `api.articuling.com` Cloudflare Tunnel；
- Operation Center CORS；
- 真实邮箱验证页面验收；
- 真实密码重置页面验收。

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

本地页面需要把 `http://127.0.0.1:4173` 加入 Operation Center CORS。公网开发配置已经固化在：

```text
D:\Projects\runtime_data\dev_services\dev.env
```

不要在当前 PowerShell 临时覆盖公网配置后忘记恢复；本地页面调试结束后应恢复并重启 Operation Center。

## 自动检查

项目不需要安装 npm 依赖。安装 Node.js 20+ 后运行：

```powershell
cd D:\Projects\articuling_account_web
npm test
npm run check
```

## GitHub 发布

仓库：

```text
https://github.com/jizhe1921/articuling_account_web
```

发布：

```powershell
cd D:\Projects\articuling_account_web
.\publish_to_github.cmd
```

## Token 安全

页面：

- 不使用第三方脚本、字体或统计服务；
- 使用 `Referrer-Policy: no-referrer`；
- 同时支持 `?token=` 和 `#token=`；
- 读取后立即从地址栏清除 token；
- 不把 token 写入 LocalStorage、SessionStorage、Cookie 或日志；
- API 请求完成后释放内存中的 token。

当前 Operation Center 邮件链接使用 `?token=`。正式生产前仍应评估升级为 `#token=`，避免 token 出现在静态站点首次请求 URL 中。

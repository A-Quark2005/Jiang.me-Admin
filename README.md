# admin_console

`admin_console` 是讲了么后端的独立管理后台网页工程。

当前目标不是做一套重型后台框架，而是先把已经存在的后端管理接口收进一个可部署网页里：

- 管理员登录
- 公众号列表
- 创建公众号
- 规则接口读取与保存
- 认证申请审核

## 目录说明

- `index.html`
  - 后台入口页
- `styles.css`
  - 页面样式
- `app.js`
  - 前端逻辑，直接调用 `backend_service` 的管理接口
- `scripts/dev-server.js`
  - 无依赖本地静态服务

## 本地打开

```bash
cd admin_console
npm start
```

默认会启动在：

```text
http://localhost:4173
```

## 部署到服务器

这是纯静态网页，不需要打包。

后续可以直接把整个 `admin_console` 目录部署到服务器静态目录，例如：

- Nginx 站点目录
- `backend_service` 同域名下的静态目录
- 任意能提供静态文件的 Web 服务器

建议部署成和后端同域或同主域，减少跨域和环境变量管理复杂度。

## 当前已知限制

这版后台已经接通了：

- `POST /api/admin/auth/login`
- `GET /api/admin/auth/accounts`
- `GET /api/admin/public-accounts`
- `POST /api/admin/public-accounts`
- `GET /api/admin/public-accounts/:id/rule-interface`
- `PUT /api/admin/public-accounts/:id/rule-interface`
- `GET /api/admin/public-accounts/:id/posts`
- `POST /api/applications/:id/reviews`

但当前后端还缺一块正式的“申请类型管理”入口。  
所以新建公众号后，即使已经打开认证入口，若没有对应 `applicationType`，个人侧仍然不能完整提交认证申请。

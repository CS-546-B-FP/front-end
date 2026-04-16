# LeaseWise NYC Front-End

## 已实现

- 可运行的 `Express + Handlebars`
- 基础目录结构：
  - `routes/`
  - `services/`
  - `adapters/`
  - `middleware/`
  - `utils/`
  - `locales/`
  - `views/`
  - `public/`
- 与 proposal 对齐的路由分组占位：
  - `/`
  - `/buildings`
  - `/buildings/:id`
  - `/portfolios/:type/:id`
  - `/login`
  - `/register`
  - `/account`
  - `/watchlist`
  - `/shortlists`
  - `/shortlists/:id`
  - `/compare`
  - `/admin/buildings`
  - `/admin/buildings/new`
  - `/admin/buildings/:id/edit`
  - `/api/...`
- 通用 placeholder 页面
- 通用 layout、header、footer、404/500 页面
- i18n 基础设施：
  - `locales/en.js`
  - `locales/zh-CN.js`
  - `utils/translate.js`
  - `t` Handlebars helper
  - `?lang=en` / `?lang=zh-CN` 切换
- design token 预留位：
  - `public/css/tokens.css`
  - `public/css/semantic-tokens.css`
  - `public/figma-tokens/README.md`
- 前端 service / adaptor / mock 占位：
  - `services/leasewise-service.js`
  - `adapters/view-models.js`
  - `data/mock-store.js`
- 客户端入口 `public/js/app.js`

## 待实现

- 真实页面设计
- 真实 API 对接
- 真实 MongoDB 数据
- 登录、注册、鉴权、权限控制
- 搜索、评论、watchlist、shortlist、compare、admin CRUD 业务逻辑
- 真实表单校验与错误处理
- seed 数据、演示账号、完整 mock 流程
- 最终视觉稿、正式 design token、完整无障碍和 rubric 收尾

## 目录说明

- `app.js`：应用入口
- `routes/`：按功能域拆分的路由文件，便于分工
- `services/`：未来对接后端或整合页面数据的位置
- `adapters/`：未来 view-model 转换的位置
- `middleware/`：视图上下文、鉴权占位等中间件
- `utils/`：翻译、错误、校验等基础工具
- `locales/`：多语言字典
- `views/`：layout、通用占位页、基础 partial
- `public/css/`：design token
- `public/js/`：客户端脚本入口占位
- `data/`：mock shape 占位

## 运行

1. `npm install`
2. `npm start`

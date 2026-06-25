# CLAUDE.md

 when working with code in this repository.

---

## 项目概述

**jxmh5** — 使用传统文化为工具，为企业、个人提供策划服务的 H5 平台，以运势播报与深度解读为核心拳头产品

**目标**: H5 持续迭代，逐步完善 C 端服务与商城

本项目是九信人文策划服务平台的 H5 项目，包含前端（Next.js）、后端（FastAPI）、数据库（PostgreSQL）。APK 打包作为独立项目另行管理。

---

## 🚨 上线前必做清单（Deferred Items）

> **现状**：2026-06-14 全栈 code-review 找出 20 项问题，已修 P0 必堵项（CORS 冗余 / .env gitignore / 验证码日志 / 死文件清理）。**剩余 P0-3/4/6/7/8 + P1-9/12/13 + P2-16/17/18/20 共 12 项延后到上线前修**，理由是开发期不需要完整鉴权/完整会员体系，跑通业务反而更重要。

### P0 安全（必做）

| # | 项 | 涉及文件 | 风险 |
|---|----|---------|------|
| **P0-3** | JWT_SECRET_KEY 用生产强密钥（替换 `jx_m_apk_secret_key_dev_2024_change_in_production`） | `backend/.env` | 当前弱密钥可被攻击者伪造任意用户 token |
| **P0-4** | 后端全部 `secure=False` cookie 改为 `secure=True`（HTTPS-only） | `backend/app/routers/auth.py`（register/login/refresh/phone-login） | 中间人可窃取 token |
| **P0-6** | `_verification_codes` 全局 dict 改 Redis/DB 存储（带 TTL） | `backend/app/routers/auth.py:229` | 多实例部署验证码无法共享 |
| **P0-7** | ~~User model 加 `password_hash` 列~~ ✅ **已完成**；缺 `/register` + `/login` (password) 端点 + bcrypt 启用 | `backend/app/routers/auth.py` | model 已有字段但注册仍以验证码为主，密码通道未真正启用 |
| **P0-8** | JWT 鉴权中间件启用（当前 `get_current_user` 依赖未在任何**业务**接口强制，但 `page.py` 反而强制了 JWT） | `backend/app/utils/deps.py` + `backend/app/routers/page.py` | page.py 公开页面 401，业务路由（appointment/fortune/knowledge）反而无鉴权 |

### P1 健壮性（必做）

| # | 项 | 涉及文件 | 风险 |
|---|----|---------|------|
| **P1-9** | JWT access token 加黑名单（登出/吊销） | `backend/app/services/auth_service.py` | 当前登出只删 cookie，token 仍有效到过期 |
| **P1-12** | 后端 `_verification_codes` dict 加线程安全锁（asyncio.Lock） | `backend/app/routers/auth.py` | 高并发下验证码竞争 |
| **P1-13** | `auth.py` 7 个端点重复的 cookie 设置抽公共函数 `set_auth_cookies(response, tokens, user)` | `backend/app/routers/auth.py` | 修改一处忘改五处 bug 高发区 |

### P2 体验/质量（必做）

| # | 项 | 涉及文件 | 风险 |
|---|----|---------|------|
| **P2-16** | `services` 列加 `service_code` 唯一索引（当前按 name 模糊匹配，可能误匹配） | `backend/app/routers/appointment.py` | 改个名字就把别人的预约绑过来 |
| **P2-17** | 前端所有用户态操作走 JWT（当前 `/user/profile` 只读 cookie） | `src/app/user/profile/page.tsx` | cookie 不可信状态被前端篡改 |
| **P2-18** | 验证码发送加 rate-limit（同手机 60s 一次，IP 1min 5 次） | `backend/app/routers/auth.py`（`/send-code`） | 短信轰炸/刷验证码 |
| **P2-20** | `dependencies` 锁版本（当前 FastAPI/SQLAlchemy 用 `^`，小版本可能 breaking） | `backend/pyproject.toml` | 部署时突遇不兼容升级 |

### 新增发现（2026-06-21 Debug & Code Review）

> **⚠️ 注意**：`con.md` 中的待办/进行列表已过时（最后更新 2026-06-06），以下信息以本次 debug 实际状态为准。

#### 🟡 booking 流程 — `delivery_form` 未提交

| 项 | 说明 | 涉及文件 |
|----|------|---------|
| **F1** | `booking/page.tsx` 和 `JmBookingFlow` 提交时只传 `delivery_space`，**缺少 `delivery_form`** | `src/app/booking/page.tsx:176` + `JmBookingFlow/index.tsx:127` |
| **影响** | 后端 schema 中 `delivery_form` 为 `Optional`，不传为 `None` → 预约单该列永远为空，无法区分"文档/谈话" | `backend/app/schemas/appointment.py:41` |
| **修复方向** | 前端需增加 delivery_form UI 选择，并在提交时一并提交；后端不改 | — |

#### 🟡 page.py 鉴权策略矛盾

| 项 | 说明 | 涉及文件 |
|----|------|---------|
| **F2** | `backend/app/routers/page.py` **全部 8 个端点**都强制 `Depends(get_current_user)` | `page.py:34/60/83/105/133/156/183/206/227` |
| **矛盾** | CLAUDE.md 明确说 "`/p/[slug]` 无需认证（公开内容）"，但 P0-8 又批评 "业务接口无鉴权" | `CLAUDE.md` + `deps.py` |
| **影响** | 未登录用户访问运营落地页（`/p/*`）会 401，而预约提交/运势查看等真正需要控制的路由反而公开 | — |
| **修复方向** | `page.py` 改为公开路由（删除 JWT 依赖），业务路由按需加 `@require_auth` 装饰器 | — |

#### 🟢 已完成项更新

| # | 项 | 状态 |
|---|----|------|
| P0-7 | `password_hash` 列 | ✅ 已存在于 `User` model (`backend/app/models/user.py:13`) |
| P0-1 | CORS 冲突 | ✅ 已修（`main.py` 删冗余） |
| P0-2 | `.env` gitignore | ✅ 已修 |
| P0-5 | 验证码 `print` | ✅ 已修（`logger.debug`） |

### 已修 P0（2026-06-14）

| # | 项 | 修复 |
|---|----|------|
| P0-1 | CORS 双中间件冲突 | `backend/main.py` 删冗余 `CORSMiddleware`，`SmartCORSMiddleware` 自己处理 OPTIONS 预检 |
| P0-2 | `.env` 未进 `.gitignore` | 加 `.env*` + `backend/.env` 到 .gitignore |
| P0-5 | `/send-code` 用 `print` 输出验证码 | 改 `logger.debug` |

### 回归验证（2026-06-14）

- 后端 systemd 服务 `jxmapk-backend.service` active（端口 8009）
- `/health` + `/api/v1/health` 返回 `database: connected`
- CORS OPTIONS 预检 `http://localhost:3007` → 200 + 完整 CORS 头
- 9 个页面（home/services/knowledge/shop/mindmap/yunshi/booking/debug/user/profile/user/login/p/[slug]）全部 0 console errors

---

## 📌 近期开发（2026-06-14
## 📌 近期开发（2026-06-14，**booking 首屏改造 + 死代码清理**）

> 本轮 **jxmapk 独立主项目改动**，不动 jiuxin。理由：人文行业客户最关心"谁给我做"，原 booking 首屏选交付方式背离业务；服务展示页早已迁 newproduct + JmCateMindMap，老 mobile_service 列表/categories 路径已无调用方。

### 业务变更

| 项 | 旧 | 新 |
|----|----|----|
| booking 首屏 | 选交付方式（线上/到店/上门） | **选策划师**（卡片列表 + 就地展开双维 chip） |
| 交付字段 | `delivery_mode` 单字段 | `delivery_space` + `delivery_form` 两个字段（硬编码 enum） |
| 第 1 步 id | `delivery` | `planner` |
| planner 来源 | 无 | `jx_apk_planner` 全量池（按 sort_order 排序） |

### 改动清单

| 层 | 文件 | 改动 |
|----|------|------|
| DB migration | `backend/database/migrations/2026_06_14_appointment_planner.sql` | **新**：`jx_apk_appointments` 加 `planner_id` (INDEX) / `delivery_space` / `delivery_form` 三列 |
| 后端常量 | `backend/app/constants/delivery.py` | **新**：`DeliverySpace` / `DeliveryForm` Enum + label 字典 |
| 后端模型 | `backend/app/models/appointment.py` | 加 3 字段 |
| 后端 schema | `backend/app/schemas/appointment.py` | 加 3 Optional 字段 + Literal 校验 |
| 后端路由 | `backend/app/routers/appointment.py` | 提交 body 接收 3 字段 |
| 后端清理 | `backend/app/routers/mobile_service.py` | **删** `/` 和 `/categories` 路由，仅保留 `/{service_id}` |
| 后端清理 | `backend/app/services/mobile_service_service.py` | **删** `get_categories` / `get_category` / `get_services` / `get_service_by_slug` |
| 后端清理 | `backend/app/routers/mobile_category.py` | **整文件删** |
| 后端清理 | `backend/main.py` | 注销 `mobile_category_router` 注册 |
| 后端清理 | `backend/app/schemas/service.py` | 删 `ServiceListResponse` / `ServiceCategoryListResponse` 等 |
| 前端常量 | `src/lib/delivery.ts` | **新**：`DELIVERY_SPACES` / `DELIVERY_FORMS` const + label map + type guard |
| 前端 API | `src/lib/mobile-api.ts` | 删 `servicesAPI.getCategories` / `getServices` |
| 前端 local-api | `src/lib/local-api/handlers/services.ts` | 删 `mobile/services/categories` / `mobile/services` 段，仅保留单条 |
| 前端组件 | `components/jmaui/.../JmPlannerList/{props,index}.tsx` | **升级**：受控（`selectedPlannerId` + `selectedDeliverySpace` + `selectedDeliveryForm`）+ 卡片就地展开双维 chip |
| 前端组件 | `components/jmaui/.../JmAppointmentTips/props.ts` | `DEFAULT_APPOINTMENT_STEPS` 第 1 步 `delivery → planner` |
| 前端组件 | `components/jmaui/.../JmBookingSuccessCard/{props,index}.tsx` | 加 `plannerName` + `deliveryLabel` 字段渲染 |
| 前端 CSS | `src/app/globals.css` | 追加 `.jm-pl-card--selected` / `.jm-pl-card__expand` / `.jm-pl-chip*` |
| 前端页面 | `src/app/booking/page.tsx` | **重写**：4 步 `planner → time → info → confirm`，首屏 `JmPlannerList`，提交 body 含 `planner_id` + `delivery_space` + `delivery_form` |
| 文档 | `jxmapk/CLAUDE.md` | API 路由表 / 组件 vs 页面职责段 / 近期开发段 |

### 业务设计决策（已拍板）

| 决策点 | 选定 |
|--------|------|
| booking 第一屏 | 策划师卡片列表（**单选** + 卡片就地展开） |
| 卡片展开后交付双维 | 空间（线上/到店/上门，3 选 1）+ 形式（文档/谈话，2 选 1） |
| planner 来源 | 全量 planner 池（不分服务类型，按 sort_order 排序） |
| planner 必选性 | 必选，不选不能提交 |
| planner 表是否扩字段 | **不扩**，双维组合全局 6 种 |
| planner_id 必填性 | **可空**（保留以后做"跳过选人"业务的扩展性） |
| 旧 mobile_service 列表/categories 路径 | 全清（无调用方） |
| `jx_apk_m_services` 表本身 | **保留**（booking 详情仍用 `/{service_id}` 拉单条） |

### 本轮明确不做

- ❌ planner 后台管理界面（本轮只做接口 + 前端展示）
- ❌ 旧预约单数据迁移 / 旧表 schema 改造（下一轮讨论）

---

## 架构概览
## 架构概览

```
jx_m_apk/
├── src/              # Next.js 16 移动端 H5
├── backend/         # FastAPI 后端（仅移动端 API）
├── assets/         # 图标、Logo、背景图等资源
└── database/       # 数据库迁移脚本
```

| 组件 | 端口 | 说明 |
|------|------|------|
| 前端 H5 | 3007 | Next.js 移动端 H5 |
| 后端 API | 8009 | FastAPI 后端接口 |

---

## 数据库

**容器**: `jx_m_apk_postgres` (Docker，端口 5434)
**库名**: `jx_m_apk`
**用户**: `jx_m_apk_adu` / `<从 .env 读>`
**表前缀**: `jx_apk_`

### 表清单（更新 2026-06-21）

| 表名 | 说明 | 新增时间 |
|------|------|---------|
| `jx_apk_appointments` | 预约单（含 planner_id + delivery_space + delivery_form） | 初始 |
| `jx_apk_fortune_readings` | 运势播报 | 初始 |
| `jx_apk_guests` | 访客系统（游客 token） | 近期 |
| `jx_apk_knowledge_articles` | 知识文章 | 初始 |
| `jx_apk_knowledge_categories` | 知识分类 | 初始 |
| `jx_apk_m_services` | 移动端服务（单条详情用，列表已弃） | 初始 |
| `jx_apk_messages` | 站内消息（系统通知 + 客服消息） | 近期 |
| `jx_apk_newproduct` | 新产品（newproduct 数据源） | 近期 |
| `jx_apk_planner` | 策划师（booking 首屏专用） | 2026-06-14 |
| `jx_apk_shop_cart_items` | 购物车 | 初始 |
| `jx_apk_shop_categories` | 商城分类 | 初始 |
| `jx_apk_shop_order_items` | 订单项 | 初始 |
| `jx_apk_shop_orders` | 订单 | 初始 |
| `jx_apk_shop_products` | 商城商品 | 初始 |
| `jx_apk_style_showcases` | 风采展示 | 初始 |
| `jx_apk_users` | C 端用户（含 password_hash） | 初始 |

---

---
## 数据库操作默认原则（重要）

> 本项目使用独立数据库 `jx_m_apk_postgres`，不要操作项目外的库。

| 项 | 值 |
|----|---|
| 容器 | `jx_m_apk_postgres`（Docker） |
| 端口 | `5434` |
| 库 | `jx_m_apk` |
| 用户 | `jx_m_apk_adu` / `<从 .env 读>` |
| 表前缀 | `jx_apk_` |


## 前端（src/）

### 技术栈

- **框架**: Next.js 16 (App Router)
- **样式**: Tailwind CSS v4 + postcss-px-to-viewport
- **组件库**: jmaui（九信阁移动端组件库，47+ 组件）

### 目录结构

```
src/
├── app/              # App Router 页面
│   ├── page.tsx     # 首页
│   ├── services/     # 服务页面
│   ├── booking/      # 预约页面
│   ├── knowledge/    # 知识页面
│   ├── yunshi/      # 运势页面
│   ├── shop/        # 商城页面
│   ├── user/        # 用户模块
│   └── test/coms/   # 全 jmaui 组件展示页
├── assets/          # 静态资源（图片/SVG）
│   ├── shuxiang/   # 12 生肖图标
│   ├── backgrounds/ # 20 张背景图
│   ├── logo/       # Logo
│   └── svg/        # 矢量素材
│       ├── animated/
│       ├── icon_page/
│       │   ├── btnarea/
│       │   └── topares/
│       └── static/
└── components/       # 组件（jmaui/）
    └── jmaui/
        ├── assets/        # 资源索引层（.ts）
        ├── components/
        │   ├── content/    # 内容组件（20 个）
        │   ├── functional/ # 功能组件
        │   ├── navigation/ # 导航组件
        │   └── visual/     # 视觉组件
        └── index.ts        # 总入口
```

### 核心设计约束

**移动端展示效果 > 其他一切考量**
- ✅ Flex/Grid 流式布局（不固定坐标）
- ✅ iOS/Android/鸿蒙 三端适配
- ✅ 安全区域适配（刘海屏、全面屏）
- ✅ CSS Animation 优先（不用 GSAP CDN）
- ❌ 不做绝对定位（px 坐标）

### 移动端字体规范

#### 适配方案：postcss-px-to-viewport
- **配置**: `viewportWidth: 375`（设计稿基准）
- **原理**: px 自动转为 vw，实现物理像素级一致性
- **验证**: 在 320px~768px 屏幕宽度内保持阅读一致性

#### 字体系统（App 基准 18px）

| Token | 设计稿值 | vw 值 | 用途 |
|-------|---------|-------|------|
| xs | 13px | 3.467vw | 辅助文字（最小允许值） |
| sm | 14px | 3.733vw | 次要文字、说明 |
| base | 18px | 4.8vw | 正文基准 |
| lg | 20px | 5.333vw | 小标题 |
| xl | 24px | 6.4vw | 标题 |
| 2xl | 28px | 7.467vw | 大标题 |
| 3xl | 32px | 8.533vw | 页面标题 |

#### 阅读舒适度配置
- **行高**: 正文 1.8，标题 1.3
- **字间距**: 中文正文 0.02em，标题 0
- **段落间距**: 1em
- **最小字号**: 13px（xs），不允许小于此值

### 布局规范
- 所有字号 ≥ 13px，低于 13px 一律不允许
- 按钮最小高度 44px（Apple HIG 标准）— **例外**: 芯片(chip)按钮、内容型 chip 不受此约束
- 卡片内边距 ≥ 16px
- 触摸热区最小 44×44px
- 使用 viewport 适配，不缩放文字

### 视觉基调
- 以线条为主视觉元素
- 点缀色克制使用
- **页面基础背景色：#fafafa**，所有页面内容区默认使用此色
- 非特殊情况不使用纯白色背景（纯白仅用于需要突出内容的卡片/弹窗）
- 舒适阅读的文字排版
- 主色调：红色 #da5342 / #D94E3D + 绿色 #A6BA43 点缀

### 品牌色 = 页眉主题色（重要规则）

**每个页面的"品牌色" = 该页面页眉的 `themeColor`**，统一通过 CSS 变量 `--page-theme-color` 传递：

```tsx
// 页面顶层 div
<div
  className="..."
  style={{ '--page-theme-color': 'var(--jm-color-brand-vermilion, #D94E3D)' } as React.CSSProperties}
>
  <JmBookingHeader themeColor="var(--jm-color-brand-vermilion, #D94E3D)" ... />
  ...
</div>
```

| 页面 | 品牌色 |
|------|--------|
| `/services` | `--jm-color-brand-rose` 玫红 `#da2e75` |
| `/shop` | **`--jm-color-brand-green` 苔绿 `#A6BA43`**（页眉用购物袋徽章） |
| `/knowledge` | `--jm-color-brand-cyan` 青 `#2f748a` |
| `/booking` | `--jm-color-brand-vermilion` 朱红 `#D94E3D` |
| `/yunshi` | `--jm-color-brand-orange` 橙 `#fb5c3e` |

**应用场景**：
- 表单卡片标题选中态（见下条）
- 表单必填星号 `*`
- 步骤条 / Tips 当前步骤
- Footer 选中色
- 按钮主色
- 商品按钮 chip / 详情价格 / 顶部 tab 激活态 — **shop 页全链 themeColor 贯通**
- 任何"页面级主色"需求

### 表单卡片标题规范（`.jm-form-card-title`）

**所有表单卡片标题**（选择服务 / 联系人信息 / 预约时间 / 备注 等）统一使用：

```tsx
<div className={`jm-form-card-title mb-3 ${hasValue ? 'jm-form-card-title--active' : ''}`}>
  <svg .../>           {/* 16×16 线性图标 */}
  <span>标题文字</span>
  <span className="jm-form-card-required">*</span>  {/* 选填字段不加 */}
</div>
```

| 规范项 | 规则 |
|--------|------|
| 字体 | `cwTeXMing, 'Noto Serif SC', serif` 品牌衬线字体 |
| 字号 | **15px**（正文 13px 基础上"大两号"） |
| 默认字色 | `#171717` 黑色 |
| 图标颜色 | 默认黑色，与标题一致 |
| 选中态 | 标题 + 图标同步变为 `--page-theme-color`（页面品牌色） |
| 触发条件 | 该卡片内有有效输入/选中时加 `--active` 类 |
| 必填星号 | `.jm-form-card-required`，主色，不参与选中态切换 |

**绝对禁止**：
- ❌ 用 `text-[13px] text-[#999]` 灰色小字作为卡片标题
- ❌ 用 `<h3>` + 内联字号
- ❌ 硬编码品牌色 hex（必须用 `--page-theme-color` 或 jm CSS 变量）

### 组件 vs 页面职责（强制分层）

**原则**：H5 项目里，**页面管交互/动画/业务编排，组件管内容/视觉/自身状态**。改样式查组件 CSS，改交互查页面 state/回调，各司其职，好维护、好定位。

#### 页面管（`app/<page>/page.tsx`）

| 职责 | 例子 |
|------|------|
| 业务核心 state | `selectedService`、`selectedDateIndex`、`name`、`phone` |
| 跨组件编排 | 选完服务后自动滚到联系人（`useEffect` + `ref`） |
| API 调用 + 数据拉取 | `useEffect(() => fetch('/api/v1/mobile/services'))` |
| 业务级副作用 | 滚动到锚点、改页面标题、提交预约 |
| 业务级动画 | 整页淡入、loading 流程、成功提示 |
| 业务配置 | 仅限"业务上下文"（可预约日期范围、用户已选值），不写默认配置 |

#### 组件管（`src/components/jmaui/components/...`）

| 职责 | 例子 |
|------|------|
| 视觉/外观 | 全部在 `globals.css`，命名 `jm-{component}__{element}` |
| 自身微交互 | 展开/收起、hover、选中态、点击反馈 |
| 临时 UI state | 下拉是否展开、tooltip、modal 开关 |
| 默认配置 | `DEFAULT_TIME_SLOTS`、`DEFAULT_APPOINTMENT_STEPS` |
| 静态文案/图标 | 组件默认 + props 可覆盖 |
| 子→父通信 | 用 `onChange`/`onClick` 回调，绝不直接改外部 |

#### 数据流（单向）

```
页面 useState/useRef
   ↓ props
组件（受控或非受控，优先受控）
   ↓ onChange 回调
页面 setState
```

#### 红线

- ❌ **页面硬编码视觉工具类**：`className="border-red-500 shadow-sm text-[#999]"`
- ❌ **组件拉 API**：组件内部 `fetch('/api/...')` — 必须由页面拉，通过 props 传
- ❌ **组件改外部 state**：组件直接调 `setXxx` 父级 setter — 必须通过 `onChange` 通知
- ❌ **业务配置塞到页面**：`timeSlots = ['10:00', ...]` 这种默认配置，应该作为组件 `DEFAULT_*` 导出
- ❌ **页面写动画 class**：`opacity-0 transition-all duration-300` 这种纯视觉过渡，放组件 CSS
- ❌ **页面写大量内联 style**：详情页/列表项的视觉细节，抽到 `jmaui/components/<Xxx>/` + globals.css BEM

#### 决策速查

| 我要改的东西... | 去哪改 |
|----------------|--------|
| 卡片颜色/边框/阴影 | 组件 CSS（`globals.css` 里的 `.jm-form-card-*` 等） |
| 步骤条当前在哪一步 | 组件 CSS + props 传入 `currentStepId` |
| 选完服务后做什么 | 页面 useEffect |
| 提交前校验表单 | 页面 validate 函数 |
| 时段默认 10-19 还是 9-21 | 组件 `DEFAULT_TIME_SLOTS` |
| 商品详情长什么样 | 抽 `JmProductDetail` 组件 |
| 页眉徽章换 SVG | `JmOursHeader` 加 `badgeIcon` prop |

#### booking 流程（4 步，2026-06-14 改造）

| 步骤 | step id | 解锁条件 |
|------|---------|---------|
| 1. 选策划师 + 交付空间 + 交付形式 | `planner` | 三者全选齐 → 解锁 time |
| 2. 选预约时间 | `time` | 日期 + 时段齐 → 解锁 info |
| 3. 填联系人（姓名 + 手机）| `info` | name + phone 合法 → 解锁 confirm |
| 4. 备注 + 确认提交 | `confirm` | 全部填齐 → 提交按钮可点 |

**关键设计**：
- 第 1 步的「交付空间 + 交付形式」**不**单独成 step，而是**就地展开**在选中的策划师卡片下方，双维 chip 各管各的枚举（空间 3 选 1 / 形式 2 选 1）
- 双维字段名：`delivery_space` + `delivery_form`（**硬编码 enum**，集中在 `src/lib/delivery.ts` + `backend/app/constants/delivery.py`，改 enum 必须同步两端）
- 切策划师 → 清空已选的空间/形式（避免"换人后旧选项残留"）
- 第 1 步完成才解锁后续步骤，未解锁步骤整段不渲染（page 层 `firstStepReady` gate）

### 颜色贯通全链（page → 组件 → CSS 变量）

**所有需要跟页眉色的组件，遵循统一模式**：

```tsx
// 1. 组件接 prop
export function JmXxxCard({ themeColor = 'var(--jm-color-brand-rose, #da2e75)' }) {
  // 2. 注入到根 div 的 CSS 变量
  return <div style={{ '--xxx-theme-color': themeColor }}>
}

// 3. CSS 用 var() 接管
.jm-xxx-card__btn {
  color: var(--xxx-theme-color, #da2e75);
  border-color: var(--xxx-theme-color, #da2e75);
}
```

**已在 jmaui 实现的颜色贯通链**：
- `JmOursHeader` `themeColor` → `JmShopProductList.themeColor` → `JmProductGrid.themeColor` → `JmProductCard.themeColor` → CSS 变量 `--product-theme-color` → 卡片按钮 chip
- `JmProductDetail.themeColor` → CSS 变量 `--product-detail-color` → 分类 chip / 价格 / 按钮
- `JmCategoryTabs.themeColor` → CSS 变量 `--tab-color` → tab 激活态
- `JmFooter.themeColors[url]` → 选中 tab 颜色
- `JmShoppingBagBadge.color` → 内部 SVG `currentColor`

**shop 页全链**：页眉苔绿 → tab 描边 → 商品卡 chip → 详情价格/分类 → 详情加购按钮 → Footer 选中

### 抽屉（JmModal / JmServiceDetailDrawer / JmYunshiDrawer）

**所有抽屉**右上角必须有 × 关闭按钮（绝对定位，状态栏安全区下方）：
- 实现方式：抽屉根 div 内无条件渲染 `<button class="jm-{name}__close">`
- CSS：`.jm-xxx-drawer__close { position: absolute; top: 24px; right: 12px; ... }`
- 全屏抽屉：top 加 `env(safe-area-inset-top)`
- 长面包屑时父 header 加 `padding-right: 52px` 让出空间

### 测试目录 `app/test/`

所有测试内容（图片、组件、字体等）统一存放在此目录，禁止散落在其他位置。

```
app/test/
├── 图片测试/         # 图片资源测试
├── 组件测试/         # 组件 demo 测试
└── 字体测试/         # 字体效果测试
```

**实际新增** `app/test/coms/page.tsx` — 全 jmaui 组件展示页（47+ 个 ShowcaseItem），按 9 个 Tab 分类：home / services / booking / shop / yunshi / knowledge / nav / visual / form。

### 关键设计模式

**chip 按钮（不受 44px 最小约束）**：
```css
.jm-xxx-chip {
  min-height: auto;       /* 显式覆盖 44px 最小高度 */
  height: auto;
  padding: 5px 14px;
  border-radius: 16px;    /* 软矩形 */
  font-size: 13px;
  border: 1px solid var(--xxx-color);
  background: transparent; /* 透明底 */
  color: var(--xxx-color);
}
```

**加载图片最佳实践**：
```tsx
<img
  src={localUrl}
  loading="lazy"          /* 仅进入视口才下载 */
  decoding="async"       /* 异步解码，不阻塞主线程 */
  fetchPriority="low"    /* 让位给关键内容 */
/>
```

**卡片网格 2 列不能被内容撑爆**：
```css
.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));  /* 关键!minmax(0, ...) */
  gap: 12px;
}
.grid > * { min-width: 0; max-width: 100%; }  /* 子项也要 min-width: 0 */
```

**BEM 命名空间陷阱**：
- CSS 选择器必须跟 JSX className **完全一致**（包括前缀）
- 顶层容器用组件自己的前缀（如 `.jm-knowledge-page`）
- 子元素用 `__` 拼接（如 `.jm-knowledge-page__grid`）
- **CLAUDE.md 全局组件**用 `jm-` 前缀（如 `.jm-form-card-title`）
- 复用 jmaui 内部组件的页眉可有自己的 className（如 `JmKnowledgeHeader` 内部用 `jm-ours-header__*`）

---

## 后端（backend/）

### 技术栈

- **框架**: FastAPI + SQLAlchemy 2.0 (async)
- **数据库**: PostgreSQL + asyncpg
- **认证**: JWT

### API 路由（更新 2026-06-21）

| 路由 | 文件 | 说明 | 鉴权 |
|------|------|------|------|
| `/api/v1/auth` | auth.py | 用户注册/登录/JWT | 公开 |
| `/api/v1/fortune` | fortune.py | 运势播报 | 公开 |
| `/api/v1/garden` | garden.py | 综合园地/首页内容 | 公开 |
| `/api/v1/knowledge` | knowledge.py | 知识文章/课程 | 公开 |
| `/api/v1/mobile/newproduct` | newproduct.py | 移动端产品(扁平 `categories[].products[]`,JmCateMindMap 动态模式专用) | 公开 |
| `/api/v1/mobile/services/{id}` | mobile_service.py | 服务详情(仅单条;`/services` 展示页已迁 newproduct + JmCateMindMap,本接口不再作为展示源) | 公开 |
| `/api/v1/mobile/planner` | planner.py | 策划师列表(booking 首屏专用) | 公开 |
| `/api/v1/mobile/appointments` | appointment.py | 预约提交/查询 | 公开 |
| `/api/v1/pages/*` | page.py | 页面内容 | **强制 JWT** ⚠️ |
| `/api/v1/shop/*` | mall.py | 商城 | 公开 |
| `/api/v1/guest` | guest.py | 访客系统(游客 token 签发) | 公开 |
| `/api/v1/messages` | message.py | 站内消息 | 需 JWT |
| `/api/v1/admin/notifications` | admin_notification.py | 管理后台通知 | 需 JWT |

> **2026-06-14 清理**：`/api/v1/mobile/services` 列表/分类接口 + `/api/v1/mobile/categories` 整路由已删除（无调用方）。仅保留 `/api/v1/mobile/services/{id}` 单条（booking 详情）。

### 后端启动

```bash
cd backend
source .venv/bin/activate
python -m uvicorn main:app --host 0.0.0.0 --port 8009
```

### 环境变量

`.env` 文件需要配置:
- `JWT_SECRET_KEY` — JWT 密钥（必须）
- `DATABASE_URL` — 数据库连接（已有默认值）

---

## 用户体系

| 类型 | 说明 |
|------|------|
| 游客 | 无需注册，直接浏览 |
| 注册用户 | 手机+验证码注册 |
| 会员用户 | 订阅制/买断制 |

**JWT Token 字段**: user_id, phone, is_vip, vip_type, vip_expire_at

---

## 命名规范

| 类型 | 规则 | 示例 |
|------|------|------|
| API 路由 | snake_case | `/api/v1/user_profile` |
| 组件 | PascalCase | `JmServiceCard` |
| 文件 | kebab-case | `auth-service.py` |
| Git 提交 | Conventional Commits | `feat(apk): add fortune module` |

---

## 前端资源引用规范

**项目根的 `assets/` 是前端静态资源库**（图标 / Logo / 背景图 / 矢量素材）。Next.js 通过 `src/assets/` 真实目录加载（Turbopack 限制：必须位于项目根内部）。

> **说明**: 真实目录位于 `src/assets/`（Turbopack 限制资源必须在项目根内部），所有前端静态资源存于此。

### 索引层（jmaui/assets）

所有资源通过 jmaui 内部的索引层统一暴露，**避免每个组件各自 `import` 单文件**：

| 索引文件 | 内容 |
|---------|------|
| `shuxiang.ts` | 12 生肖 × 4 格式（48 个） |
| `logo.ts` | 3 个 Logo |
| `backgrounds.ts` | 20 张背景图（按 山/海/中式/天空 分类） |
| `svg.ts` | 20 个矢量素材（animated / icon_page / static） |
| `index.ts` | 总入口（re-export 上面 4 个） |

**为什么用 `.src` 而非直接 `import` 原对象**：Next.js 16 + Turbopack 下，import 进来的是 `StaticImageData` 对象（带 width/height/src 元信息）。索引层统一取 `.src` 拿到 URL 字符串，类型干净，可直接给 `<img src>` 用。

### 用法示例

```tsx
// 1. 用索引（推荐，类型安全 + tree-shaking）
import { shuxiangWebp, ZODIACS, BACKGROUNDS_BY_CATEGORY } from '@/components/jmaui/assets'

function ZodiacPicker() {
  return ZODIACS.map(z => (
    <img key={z.key} src={z.webp} title={z.cn + '·' + z.dizhi} />
  ))
}

function YardsBg() {
  return <img src={BACKGROUNDS_BY_CATEGORY.mountain[0].src} />
}

// 2. 偶尔直接拿原文件
import ratSvg from '@/assets/shuxiang/v2_rat.svg'  // 拿到 StaticImageData 对象
```

### 新增资源

1. 把文件丢到 `src/assets/{类别}/`
2. 打开对应 `jmaui/assets/{类别}.ts` 加一行 import + 加进 map
3. 跑 `npm run build` 验证类型

### 已有资源清单

| 类别 | 数量 | 路径 |
|------|------|------|
| 12 生肖 SVG | 12 | `src/assets/shuxiang/v2_*.svg` |
| 12 生肖 WebP | 12 | `src/assets/shuxiang/v2_*.webp` |
| 12 生肖 PNG | 12 | `src/assets/shuxiang/v2_*.png` |
| 12 生肖 JPG | 12 | `src/assets/shuxiang/v2_*.jpg` |
| Logo | 3 | `src/assets/logo/` |
| 背景图 | 20 | `src/assets/backgrounds/` (山6/海9/中式4/天空1) |
| SVG 矢量 | 20+ | `src/assets/svg/` (animated/icon_page/static) |
| 购物袋徽章 | 1 | `src/assets/svg/icon_page/shopping-bag.svg` (仅 shop 用) |

---

## 常用命令

```bash
# 后端开发
cd backend && source .venv/bin/activate && python -m uvicorn main:app --port 8009

# 数据库（dc-bot 机）
ssh dc
psql -h 127.0.0.1 -p 5434 -U jx_m_apk_adu -d jx_m_apk
```

---

## 重要文件

| 用途 | 路径 |
|------|------|
| 后端入口 | `backend/main.py` |
| 数据库配置 | `backend/config.py` |
| 资源根目录 | `src/assets/` |
| 全局 CSS（含所有 jmaui 组件样式） | `src/app/globals.css` |
| jmaui 总入口 | `src/components/jmaui/index.ts` |
| jmaui 资产索引 | `src/components/jmaui/assets/` |
| 项目文档 | `con.md`（项目进展 + 待办） |

---

## 已知坑 / 经验

1. **Turbopack 资源必须在项目根内部** — 软链 `src/assets → ../../assets` 会报 `Module not found`，必须用真实目录
2. **HMR 不接住 globals.css 新增类** — 改完大块 globals.css 后建议 `rm -rf .next && 重启 dev`
3. **CSS 选择器跟 JSX className 必须严格一致** — 之前 `.jm-knowledge-page__grid` vs `knowledge-page__grid` 错位导致 grid 样式完全失效
4. **grid 2 列要用 `minmax(0, 1fr)` + 子项 `min-width: 0`** — 否则子项 `min-width: auto` 被内容撑爆，2 列退化成 1 列
5. **`loading="lazy"` 必须配合 `decoding="async"`** — 否则解码阻塞主线程
6. **已删除路由仍被前端调用 → 需同步清理前后端** — `/api/v1/mobile/services/categories` 和 `/api/v1/mobile/services` 列表路由已被后端删除，但前端 `local-api/handlers/services.ts` 中残留旧 handler 导致 404；同理 `mobile_category_router`、`mobile_product_router` 已删
7. **FastAPI 422 排查：先看请求体格式** — 预约 POST 返回 422 通常是 `appointment_date` 或 `appointment_time` 为空字符串，后端 schema 要求 `YYYY-MM-DD` / `HH:MM` 格式
8. **未提交改动过多 → 尽早 commit** — 当前有 60+ 文件 dirty（含模型、路由、组件），建议每天 commit 一次避免丢失
6. **抽屉关闭按钮从 header 解耦** — 之前 `title &&` 条件渲染导致不传 title 时没有 ×，改成无条件渲染


---

## 🚀 部署 / 机器信息（2026-06-25 补录）

> 本节由本机 Claude Code 在 `txj` 服务器首次探查后追加，描述当前部署环境。
> 不重复 2026-06-21 之前的开发规范；如冲突以日期更近者为准。

### 主机身份（txj 部署机）

| 字段 | 值 |
|------|---|
| 主机名 | `VM-0-6-debian`（腾讯云） |
| 公网 IP | `101.33.215.39`（label: `txj`） |
| 内网 IP | `10.1.0.6/22`（腾讯云 VPC） |
| OS | Debian 13 (trixie), kernel 6.12.86 |
| 配置 | 2C / 1.9G RAM / 2G swap / 39G 系统盘 |
| 资源 | 内存偏紧（avail ~655M, swap 用了 303M） |
| 用户 | root（UID 0）；项目 owner 是 UID 1001 |

### 端口对位（实测 2026-06-25）

| 端口 | 进程 | 对应本项目 |
|------|------|-----------|
| **3007** | next-server (v1) | ✅ `jiuxin_yun` 前端（`package.json` dev script `next dev -p 3007`） |
| **8009** | python (pid 38677) | ✅ `backend/main.py` FastAPI 后端 |
| **5434** | docker-proxy → `jx_m_apk_postgres` | ✅ 本项目 Postgres 数据库 |
| 80/443 | nginx | 反代入口（具体路由规则未查） |
| 8099 | python3 (127.0.0.1) | price-tracker 服务（详见 `/home/tempprice/CLAUDE.md`） |
| 22 | sshd | SSH（凭证见本机 `~/.claude/memory/ssh-txj-host.md`，**不在本文件**） |

### 服务启动方式

| 服务 | 当前方式 | 推荐改进 |
|------|----------|----------|
| Next.js (3007) | 手动 `pnpm dev`（无 systemd 单元） | 加 systemd 单元（参考 `/home/jxmh5` 模板） |
| FastAPI (8009) | 手动 uvicorn（pid 38677） | 加 systemd 单元 |
| Postgres (5434) | `docker start jx_m_apk_postgres` | 写 `docker-compose.yml` + systemd 拉起 |
| nginx | systemd | 已 OK |
| price-tracker | systemd ✅ | 已 OK（`/etc/systemd/system/price-tracker.service`） |

### ⚠️ 当前部署隐患

1. **Postgres 5434 公网全开** — `0.0.0.0:5434` 监听，任何持 IP 的人都能尝试连。**强烈建议**改 `127.0.0.1:5434` + 走 nginx stream 或 SSH tunnel，避免被扫爆
2. **8009 / 3007 无 systemd 保护** — 服务器重启后服务不会自启，pid 文件 / tmux / nohup 方式未确认。建议参考本机 `~/.claude/templates/systemd-service.template` 模板化
3. **内存偏紧** — avail 仅 655M，加新功能或跑 build 前先 `free -h` 评估，必要时加 1-2G swap
4. **"60+ 文件 dirty" 风险** — 本项目 CLAUDE.md 已知坑 #8 提到未提交改动过多，部署机上的工作副本可能含未提交改动，部署前必须 `git status` 评估
5. **未配置防火墙规则** — `dcbot-vpn-ssh-entry` 提示新端口监听后需 `ufw allow from 192.168.31.0/24`，当前 3007/8009/5434 是否在 ufw 白名单未确认（参考本机 [[feedback-dcbot-ufw-allow]]）

### 同步到本机

- 本机 `~/.claude/memory/ssh-txj-host.md` 已记录这台机的 SSH 凭证 + 探查画像
- 本机 `~/.claude/memory/MEMORY.md` 索引已加 `ssh-txj-host` 条目
- 凭证（密码）**不在本文件**，避免 CLAUDE.md 被 git / 备份带走时泄漏

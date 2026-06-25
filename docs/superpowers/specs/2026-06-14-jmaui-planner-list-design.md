# JmPlannerList 策划师展示组件 — 设计

| 项目 | 值 |
|------|---|
| 日期 | 2026-06-14 |
| 状态 | Draft（待审阅） |
| 范围 | jxmapk 项目内的新建组件 + 后端表 + API |

## 1. 概述

`JmPlannerList` 是 jmaui 库中一个 **content 类**组件，用于纵向堆叠展示"策划师"（占卜师/咨询师）卡片。每个卡片左侧是圆角头像，右侧依次显示 4 行文字字段（姓名 / 特长 / 简介 / 价格）。组件走 **纯动态** 数据源，自管 fetch；page 只做装载与交互编排。

**业务定位**：从产品目录（`newproduct`）思维导图，到具体"由谁来做"——策划师卡片是服务交付侧的人格化呈现。

## 2. 目标

- 把"策划师"作为一个独立可维护的概念进入数据层和 UI 层
- 复用 jmaui 现有约定（BEM/CSS/双模式/主题色贯通/7 原则）
- 为后续 admin 后台管理策划师 / 1v1 预约 / 选策划师页等场景提供底层组件
- 单个组件完成后能直接被未来 `app/planner/page.tsx`（或 `/services/planner`）页面使用

## 3. 架构

```
后端 (FastAPI + SQLAlchemy 2.0 async)
─────────────────────────────────────
jx_apk_planner  ──ORM──▶  routers/planner.py
(新建表)                     (新建)
                                    │
                                    │ HTTP
                                    ▼
前端 (Next.js + jmaui)
─────────────────────────────────────
mobile-api.ts (plannerAPI.getList)
            │
            ▼
JmPlannerList/index.tsx
  ├─ useEffect fetch
  ├─ 三态: loading / error / empty / data
  └─ 列表渲染
       ├─ PlannerCard (内部子组件)
       └─ onBookNow callback ──▶ page.tsx
```

### 3.1 文件清单

| 类型 | 路径 | 说明 |
|------|------|------|
| 后端 Model | `backend/app/models/planner.py` | SQLAlchemy ORM |
| 后端 Schema | `backend/app/schemas/planner.py` | Pydantic v2 |
| 后端 Router | `backend/app/routers/planner.py` | GET /api/v1/mobile/planner |
| 后端 init | `backend/init_db.py` | 注册新表 |
| 前端 API | `frontend/src/lib/mobile-api.ts` | 追加 `plannerAPI` |
| 前端组件 | `frontend/src/components/jmaui/components/content/JmPlannerList/index.tsx` | 主体 |
| 前端类型 | `frontend/src/components/jmaui/components/content/JmPlannerList/props.ts` | PlannerItem + JmPlannerListProps |
| 前端 CSS | `frontend/src/app/globals.css` | 追加 `jm-pl-*` 命名空间 |
| 前端注册 | `frontend/src/components/jmaui/index.ts` | export JmPlannerList + PlannerItem 类型 |
| Seed | `frontend/public/db/seed.sql` | 追加 jx_apk_planner 表 + 3 条样例数据 |
| 页面 | 待定 | 本次不创建 |

## 4. 组件 API

### 4.1 props.ts

```ts
export interface PlannerItem {
  id: number
  name: string                // 姓名
  specialty: string           // 特长
  description: string         // 简介
  single_price: number        // 单项价格（单次答疑）
  full_price: number          // 全面价格（全案策划）
  avatar_url: string | null   // 头像 URL（null 时用占位）
  sort_order: number
}

export interface JmPlannerListProps {
  /** 主题色：沿用 --page-theme-color，CSS 变量透传
   *  默认 'var(--jm-color-brand-vermilion, #D94E3D)' */
  themeColor?: string
  /** 立即预约回调（不传则不渲染 chip 按钮）
   *  本次先做最简版：仅 console.log + 弹窗提示
   *  后续业务接入待定 */
  onBookNow?: (planner: PlannerItem) => void
  className?: string
}
```

### 4.2 DEFAULT

- `themeColor` 默认值在 index.tsx 内部 default-param 兜底
- 无业务数据常量（纯动态模式）
- 无 mock DEFAULT_PLANNERS（不污染组件层）

## 5. 数据库 schema

**表名**：`jx_apk_planner`

| 字段 | 类型 | 约束 | 默认 | 说明 |
|------|------|------|------|------|
| id | Integer | PK, autoincrement | — | 主键 |
| name | String(100) | NOT NULL | — | 姓名 |
| specialty | String(255) | NOT NULL | — | 特长 |
| description | Text | NOT NULL | — | 简介 |
| single_price | Numeric(10,2) | NOT NULL | 0 | 单项价格（单次答疑） |
| full_price | Numeric(10,2) | NOT NULL | 0 | 全面价格（全案策划） |
| avatar_url | String(500) | NULL | NULL | 头像 URL |
| sort_order | Integer | NOT NULL | 0 | 排序（小→前） |
| status | SmallInteger | NOT NULL | 1 | 0=禁用 1=启用 |
| created_at | TIMESTAMP | NOT NULL | now() | TimestampMixin |
| updated_at | TIMESTAMP | NOT NULL | now() | TimestampMixin |

**ORM 基类**：复用 `Base, TimestampMixin`（与 mobile_service.py 一致）

**id 用 Integer 不用 UUID** 的理由：
- 排序展示友好
- 与 jx_apk_newproduct 一致
- admin 端管理列表渲染性能更好

**索引**：`status`（where 过滤）、`(sort_order, id)`（order by）

**SQLAlchemy 模型示例**（参考 `mobile_service.py`）：

```python
class Planner(Base, TimestampMixin):
    __tablename__ = "jx_apk_planner"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    specialty: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    single_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    full_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[int] = mapped_column(SmallInteger, default=1)
```

## 6. API

### 6.1 端点

| 方法 | 路径 | 鉴权 | 说明 |
|------|------|------|------|
| GET | `/api/v1/mobile/planner` | 无 | 拉取所有启用的策划师 |

### 6.2 返回结构

```json
{
  "error": false,
  "message": "success",
  "data": {
    "planners": [
      {
        "id": 1,
        "name": "张三",
        "specialty": "八字/奇门遁甲",
        "description": "从业15年，擅长企业战略规划与个人运势咨询",
        "single_price": 500,
        "full_price": 5000,
        "avatar_url": "https://example.com/avatar1.jpg",
        "sort_order": 1
      }
    ],
    "total": 1
  }
}
```

### 6.3 行为

- `WHERE status = 1` 仅返回启用的
- `ORDER BY sort_order ASC, id ASC`
- 错误：返回 `{ error: true, message: "<err>", data: null }`（与 newproduct 对齐）
- 鉴权：无（公开内容，与 services / newproduct 一致）

## 7. UI / CSS

### 7.1 卡片布局（375px 设计稿基准，px→vw 自动转换）

```
┌─────────────────────────────────────────┐
│ ┌──────┐                                │
│ │头像   │  张三                          │  ← 姓名(粗,15px)
│ │64×64  │  八字/奇门遁甲                 │  ← 特长(12px,次要色)
│ │圆角 8 │  从业15年，擅长...              │  ← 简介(13px,主文)
│ └──────┘                                │
│           单次答疑 ¥500  全案策划 ¥5000  │  ← 价格行(12px)
│                          [立即预约]      │  ← 按钮(主题色字)
└─────────────────────────────────────────┘
```

### 7.2 CSS 命名空间

全部以 `jm-pl-` 前缀，集中注册到 `globals.css`：

| 类名 | 用途 |
|------|------|
| `.jm-pl` | 容器 |
| `.jm-pl__card` | 单卡片 |
| `.jm-pl__avatar` / `__placeholder` | 头像图 / 头像失效占位 |
| `.jm-pl__body` | 右侧文本区 |
| `.jm-pl__name` / `__specialty` / `__desc` | 三行文本 |
| `.jm-pl__prices` | 价格行 |
| `.jm-pl__price-single` / `__price-full` | 两段价格 |
| `.jm-pl__book` | 预约按钮（仅当 onBookNow 传了才渲染） |
| `.jm-pl__loading` / `__error` / `__empty` | 三态 |

### 7.3 主题色贯通

```tsx
// index.tsx 容器
<div
  className="jm-pl"
  style={{ '--pl-color': themeColor } as React.CSSProperties}
>
```

CSS 中所有"主题色"用法：
- 价格行强调（数字颜色）
- 立即预约按钮字色
- 头像失效占位的边框

价格格式（按用户决策）：
```ts
const fmt = (n: number) => n > 0 ? `¥${Math.round(n)}` : '价格待定'
// 500 → "¥500"
// 5000 → "¥5000"
// 0 → "价格待定"
// 500.5 → "¥501"（无小数点，无千分位）
```

## 8. 错误处理

| 场景 | UI 表现 | 实现 |
|------|---------|------|
| 加载中 | `.jm-pl__loading` + spinner | fetch 进行中 |
| API 失败 | `.jm-pl__error` + 重试按钮 | `error: true` 或网络异常 |
| 数据为空 | `.jm-pl__empty` "暂无策划师" | `planners.length === 0` |
| 头像 URL 失效 | `<img onError>` 切到 `__placeholder` | 圆形 + 姓氏首字 + 主题色边框 |
| 价格 = 0 | "价格待定"（不是"¥0"） | fmt 函数 |
| onBookNow 未传 | 不渲染按钮 | `{onBookNow && <button .../>}` |
| onBookNow 行为 | 本次最简：`alert("即将为 ${name} 开启预约")` | 后续接入业务待定 |

**三态 + 重试** 模式：与 `JmCateMindMap` 一致（参考其 `loading/error/empty + retry` 实现）。

## 9. 测试 / 验证

| 项 | 命令 / 方法 | 预期 |
|----|------------|------|
| 后端健康 | `curl http://localhost:8009/api/v1/mobile/planner` | 200 + 样例数据 |
| PGlite seed | 重启 dev server (PGlite 灌 seed.sql) | 4 个 table 都在 |
| 前端 200 | 浏览器访问 (待定页面路由) | HTTP 200 |
| 卡片渲染 | `browser_evaluate` 读 `.jm-pl__card` 数量 ≥ 1 | DOM 出现 |
| 头像占位 | 故意传一个失效的 avatar_url → 触发 onError | 切到 placeholder |
| 价格格式 | 给 single_price=500.5 → 渲染 ¥501 | 无小数点 |
| 主题色 | 不同 themeColor → `--pl-color` CSS 变量值不同 | 跟随 |

## 10. 实施步骤

1. **后端 Model + Schema**：`backend/app/models/planner.py` + `schemas/planner.py`
2. **后端 Router**：`backend/app/routers/planner.py`，GET 端点
3. **init_db 注册**：`backend/init_db.py` 导入 Planner
4. **重启后端**：`make dev` 或手动重启 8009
5. **curl 验证**：本地 hit 新接口
6. **前端 API client**：`mobile-api.ts` 追加 `plannerAPI.getList()`
7. **前端组件骨架**：`JmPlannerList/{index,props}.tsx`（先 loading/error/empty）
8. **前端组件渲染**：列表 + 卡片 + 三行文字 + 头像
9. **CSS**：`globals.css` 追加 `.jm-pl-*` 整段
10. **jmaui 注册**：`index.ts` export JmPlannerList + PlannerItem
11. **PGlite seed**：dump `jx_apk_planner` 到 `frontend/public/db/seed.sql`，加 3 条样例
12. **重启前端**：`./node_modules/.bin/next dev -H 0.0.0.0 -p 3007`
13. **浏览器验证**：在 `app/test/coms/page.tsx` 的 `services` Tab 下追加 `<JmPlannerList themeColor="..." onBookNow={...} />` ShowcaseItem（数据走 API 真实拉取）
14. **commit**：`feat(jmaui+backend): JmPlannerList + jx_apk_planner`

## 11. 不做（YAGNI）

- ❌ 卡片点击进入详情（后续单独做 JmPlannerDetail）
- ❌ 选策划师（多选 / 排序 / 筛选）
- ❌ 1v1 聊天
- ❌ 收藏 / 关注
- ❌ 评分 / 评论
- ❌ 头像上传（admin 端做，本组件只读 URL）
- ❌ 单独的 `/planner` 正式页面路由（用户决策：先不管，组件入口暂挂在 `app/test/coms` 展示页）
- ❌ admin 端管理界面（后续单独迭代）
- ❌ 翻页 / 加载更多（一期假设策划师 < 20 人，一次拿全）

## 12. 风险 / 已知限制

1. **页面入口未定**：组件实现后归到 `app/test/coms/page.tsx` 展示页（services Tab）。后续接入正式页面时，page 层只需挂 `<JmPlannerList />` 即可。
2. **onBookNow 行为简化**：本次仅 `alert`，业务跳转待后续。
3. **价格"无小数点"约束**：用 `Math.round` 截断；如果 DB 入库带小数（如 500.50）会显示 501，需与 admin 录入端约定整数。
4. **头像失效占位的"姓氏首字"**：需从 `planner.name` 取第一个字符，注意 unicode（CJK 字符为单字 length=1，安全）。

# JmPlannerList 策划师展示组件 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 jmaui 组件库中新增 `JmPlannerList` 策划师展示组件，配套后端 `jx_apk_planner` 表 + `GET /api/v1/mobile/planner` 接口，并在 `app/test/coms` 展示页挂上。

**Architecture:** 纯动态数据源（组件自管 fetch，page 只做装载）。后端 SQLAlchemy ORM + Pydantic schema + 单 router 直接 query（无 service 层，简单列表）。前端 jmaui 组件 + BEM CSS（`jm-pl-*` 命名空间）+ themeColor 透传。

**Tech Stack:** FastAPI + SQLAlchemy 2.0 async + Pydantic v2 / Next.js 16 (App Router, Turbopack) + React 19 + TypeScript + PGlite (dev seed) / PostgreSQL (prod)

**Spec:** `docs/superpowers/specs/2026-06-14-jmaui-planner-list-design.md` (commit ed7a83e)

---

## File Structure

### 后端 (4 个新文件 + 3 个修改)
- **Create** `backend/app/models/planner.py` — SQLAlchemy ORM
- **Create** `backend/app/schemas/planner.py` — Pydantic schema
- **Create** `backend/app/routers/planner.py` — FastAPI router (GET only)
- **Modify** `backend/app/models/__init__.py` — 加 `Planner` 到 `__all__`
- **Modify** `backend/init_db.py` — import `Planner`
- **Modify** `backend/main.py` — import + `include_router(planner_router)`

### 前端 (2 个新文件 + 5 个修改)
- **Create** `frontend/src/components/jmaui/components/content/JmPlannerList/props.ts` — PlannerItem + JmPlannerListProps
- **Create** `frontend/src/components/jmaui/components/content/JmPlannerList/index.tsx` — 主体
- **Modify** `frontend/src/components/jmaui/index.ts` — register JmPlannerList + PlannerItem type
- **Modify** `frontend/src/lib/mobile-api.ts` — 加 `plannerAPI.getPlanners()`
- **Modify** `frontend/src/app/globals.css` — 加 `jm-pl-*` 整段 CSS（约 100 行）
- **Modify** `frontend/src/app/test/coms/page.tsx` — services Tab 追加 `<JmPlannerList>` ShowcaseItem

### 数据
- **Modify** `frontend/public/db/seed.sql` — 加 `jx_apk_planner` 表 + 索引 + 3 条样例

---

## Task 1: SQLAlchemy Planner Model

**Files:**
- Create: `backend/app/models/planner.py`

- [ ] **Step 1: 写 model 文件**

```python
from sqlalchemy import Integer, String, Text, Numeric, SmallInteger
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base, TimestampMixin


class Planner(Base, TimestampMixin):
    """
    策划师模型

    jx_apk_planner — 移动端公开数据
    与 jx_apk_newproduct 一致:Integer id, snake_case 字段
    """
    __tablename__ = "jx_apk_planner"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    specialty: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    single_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    full_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, default=0)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    status: Mapped[int] = mapped_column(SmallInteger, default=1, nullable=False)
```

- [ ] **Step 2: 注册到 `backend/app/models/__init__.py`**

在 `from app.models.appointment import Appointment` 之后追加：
```python
from app.models.planner import Planner
```

在 `__all__` 列表 `"Appointment"` 之后追加：
```python
"Planner",
```

- [ ] **Step 3: 在 `backend/init_db.py` import Planner**

在 `from app.models import (... Appointment,)` 之后加 `Planner,`：
```python
    Appointment,
    Planner,
)
```

- [ ] **Step 4: 验证导入**

Run: `cd /home/masterdododo/jxmapk/backend && python -c "from app.models.planner import Planner; print(Planner.__tablename__)"`
Expected: `jx_apk_planner`

- [ ] **Step 5: Commit**

```bash
git add backend/app/models/planner.py backend/app/models/__init__.py backend/init_db.py
git commit -m "feat(backend): Planner SQLAlchemy model + register"
```

---

## Task 2: Pydantic Planner Schema

**Files:**
- Create: `backend/app/schemas/planner.py`

- [ ] **Step 1: 写 schema 文件**

```python
from typing import Optional
from pydantic import BaseModel, Field


class PlannerItem(BaseModel):
    """策划师项（移动端公开 DTO）"""
    id: int
    name: str
    specialty: str
    description: str
    single_price: float
    full_price: float
    avatar_url: Optional[str] = None
    sort_order: int


class PlannerListData(BaseModel):
    """列表数据容器"""
    planners: list[PlannerItem]
    total: int


class PlannerListResponse(BaseModel):
    """GET /api/v1/mobile/planner 标准返回结构"""
    error: bool = False
    message: str = "success"
    data: Optional[PlannerListData] = None
```

- [ ] **Step 2: 验证导入**

Run: `cd /home/masterdododo/jxmapk/backend && python -c "from app.schemas.planner import PlannerItem, PlannerListResponse; print('ok')"`
Expected: `ok`

- [ ] **Step 3: Commit**

```bash
git add backend/app/schemas/planner.py
git commit -m "feat(backend): Planner Pydantic schemas"
```

---

## Task 3: Planner Router

**Files:**
- Create: `backend/app/routers/planner.py`
- Modify: `backend/main.py`

- [ ] **Step 1: 写 router 文件**

```python
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from database import get_db
from app.models.planner import Planner
from app.schemas.planner import (
    PlannerItem,
    PlannerListData,
    PlannerListResponse,
)


router = APIRouter(prefix="/api/v1/mobile/planner", tags=["mobile-planner"])


@router.get("", response_model=PlannerListResponse)
async def get_planners(db: AsyncSession = Depends(get_db)):
    """
    移动端公开接口 - 获取所有启用的策划师
    ORDER BY sort_order ASC, id ASC
    """
    try:
        stmt = (
            select(Planner)
            .where(Planner.status == 1)
            .order_by(Planner.sort_order.asc(), Planner.id.asc())
        )
        result = await db.execute(stmt)
        rows = result.scalars().all()

        planners = [
            PlannerItem(
                id=r.id,
                name=r.name,
                specialty=r.specialty,
                description=r.description,
                single_price=float(r.single_price or 0),
                full_price=float(r.full_price or 0),
                avatar_url=r.avatar_url,
                sort_order=r.sort_order,
            )
            for r in rows
        ]

        return PlannerListResponse(
            error=False,
            message="success",
            data=PlannerListData(planners=planners, total=len(planners)),
        )
    except Exception as e:
        return PlannerListResponse(
            error=True,
            message=str(e),
            data=None,
        )
```

- [ ] **Step 2: 在 `backend/main.py` 注册 router**

在 `from app.routers.newproduct import router as newproduct_router` 之后追加：
```python
from app.routers.planner import router as planner_router
```

在 `app.include_router(newproduct_router)` 之后追加：
```python
app.include_router(planner_router)
```

- [ ] **Step 3: 验证 import**

Run: `cd /home/masterdododo/jxmapk/backend && python -c "from app.routers.planner import router; print([r.path for r in router.routes])"`
Expected: `['/api/v1/mobile/planner']`

- [ ] **Step 4: Commit**

```bash
git add backend/app/routers/planner.py backend/main.py
git commit -m "feat(backend): GET /api/v1/mobile/planner router"
```

---

## Task 4: 建表 + 灌种子数据 + 端到端验证

**Files:**
- Modify: `frontend/public/db/seed.sql` (PGlite seed)

- [ ] **Step 1: 在 seed.sql 追加 jx_apk_planner 建表 + 索引 + 3 条数据**

在文件末尾追加（注意 PGlite 兼容：纯 SQL，无元数据）：

```sql
-- ============================================================
-- 策划师表
-- ============================================================
DROP TABLE IF EXISTS jx_apk_planner;
CREATE TABLE jx_apk_planner (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialty VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    single_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    full_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    avatar_url VARCHAR(500),
    sort_order INTEGER NOT NULL DEFAULT 0,
    status SMALLINT NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_jx_apk_planner_status ON jx_apk_planner(status);
CREATE INDEX idx_jx_apk_planner_sort ON jx_apk_planner(sort_order, id);

INSERT INTO jx_apk_planner (name, specialty, description, single_price, full_price, avatar_url, sort_order, status) VALUES
('张三', '八字命理 / 奇门遁甲', '从业15年，擅长企业战略规划与个人运势咨询。曾任多家上市公司顾问，发表学术论文20余篇。', 500, 5000, 'https://i.pravatar.cc/120?img=11', 1, 1),
('李四', '紫微斗数 / 面相学', '师从名家，专注紫微斗数30年。善于从细微处发现客户问题根源，提供切实可行的调整建议。', 800, 8000, 'https://i.pravatar.cc/120?img=32', 2, 1),
('王五', '塔罗占卜 / 周公解梦', '东西方神秘学兼修，擅长结合心理学解读。亲和力强，咨询风格轻松易懂。', 300, 3000, 'https://i.pravatar.cc/120?img=47', 3, 1);
```

- [ ] **Step 2: 通过本地 docker 灌入 PGlite 不需要（seed.sql 是 PGlite 自动加载）— 但需要让真 PG 也建表**

> 提示：jxmapk 用 docker 容器 `jx_m_apk_postgres` 做主库，PGlite 是 dev 端离线副本。本次只需建 docker 库表 + 让 seed.sql 同步。

```bash
# 进入 docker 容器建表
docker exec jx_m_apk_postgres psql -U jx_m_apk_adu -d jx_m_apk -c "
CREATE TABLE IF NOT EXISTS jx_apk_planner (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialty VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    single_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    full_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    avatar_url VARCHAR(500),
    sort_order INTEGER NOT NULL DEFAULT 0,
    status SMALLINT NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO jx_apk_planner (name, specialty, description, single_price, full_price, avatar_url, sort_order) VALUES
('张三', '八字命理 / 奇门遁甲', '从业15年，擅长企业战略规划与个人运势咨询。', 500, 5000, 'https://i.pravatar.cc/120?img=11', 1),
('李四', '紫微斗数 / 面相学', '师从名家，专注紫微斗数30年。', 800, 8000, 'https://i.pravatar.cc/120?img=32', 2),
('王五', '塔罗占卜 / 周公解梦', '东西方神秘学兼修。', 300, 3000, 'https://i.pravatar.cc/120?img=47', 3)
ON CONFLICT DO NOTHING;
"
```

Expected: `INSERT 0 3` (或 ON CONFLICT 提示已存在)

- [ ] **Step 3: 重启后端 (8009)**

```bash
# 找到后端进程
ps aux | grep -E "uvicorn|fastapi" | grep -v grep
# 杀掉
kill <pid>
# 后台启动
cd /home/masterdododo/jxmapk/backend && nohup python -m uvicorn main:app --host 0.0.0.0 --port 8009 > /tmp/jxmapk-backend.log 2>&1 &
```

- [ ] **Step 4: curl 验证新接口**

Run: `curl -s http://localhost:8009/api/v1/mobile/planner | python -m json.tool | head -40`
Expected:
```json
{
    "error": false,
    "message": "success",
    "data": {
        "planners": [
            {
                "id": 1,
                "name": "张三",
                "specialty": "八字命理 / 奇门遁甲",
                "description": "从业15年，...",
                "single_price": 500.0,
                "full_price": 5000.0,
                "avatar_url": "https://i.pravatar.cc/120?img=11",
                "sort_order": 1
            },
            ...
        ],
        "total": 3
    }
}
```

- [ ] **Step 5: Commit**

```bash
git add frontend/public/db/seed.sql
git commit -m "chore(seed): jx_apk_planner 表 + 3 条样例数据"
```

---

## Task 5: 前端 API client (plannerAPI)

**Files:**
- Modify: `frontend/src/lib/mobile-api.ts`

- [ ] **Step 1: 在 `newproductAPI` 之后追加 `plannerAPI`**

找到这行（行 159）：
```ts
};

export const newproductAPI = {
  getProducts: () => get('/api/v1/mobile/newproduct'),
};
```

在 `newproductAPI` 之后追加：
```ts
// ==================== 策划师 API (planner 表) ====================

export const plannerAPI = {
  getPlanners: () => get('/api/v1/mobile/planner'),
};
```

- [ ] **Step 2: 验证 (前端 dev server 启动后能编译)**

Run: `cd /home/masterdododo/jxmapk/frontend && ./node_modules/.bin/next dev -H 0.0.0.0 -p 3007 2>&1 | head -20`
Expected: 服务启动，编译无错（mobile-api.ts 改动）

- [ ] **Step 3: Commit**

```bash
git add frontend/src/lib/mobile-api.ts
git commit -m "feat(frontend): plannerAPI client"
```

---

## Task 6: JmPlannerList props.ts

**Files:**
- Create: `frontend/src/components/jmaui/components/content/JmPlannerList/props.ts`

- [ ] **Step 1: 写 props.ts**

```ts
export interface PlannerItem {
  id: number
  name: string
  specialty: string
  description: string
  single_price: number
  full_price: number
  avatar_url: string | null
  sort_order: number
}

export interface JmPlannerListProps {
  /**
   * 主题色：CSS 变量透传，影响价格强调色 / 按钮字色
   * 默认 'var(--jm-color-brand-vermilion, #D94E3D)'
   */
  themeColor?: string
  /**
   * 立即预约回调（不传则不渲染按钮）
   * 本版本：仅 console.log + alert 提示
   * 后续业务接入待定
   */
  onBookNow?: (planner: PlannerItem) => void
  className?: string
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/jmaui/components/content/JmPlannerList/props.ts
git commit -m "feat(jmaui): JmPlannerList props"
```

---

## Task 7: JmPlannerList 组件骨架（含三态 + 列表）

**Files:**
- Create: `frontend/src/components/jmaui/components/content/JmPlannerList/index.tsx`

- [ ] **Step 1: 写组件主体**

```tsx
'use client'

import { useEffect, useState } from 'react'
import { JmPlannerListProps, PlannerItem } from './props'
import { plannerAPI } from '@/lib/mobile-api'

const formatPrice = (n: number): string => {
  return n > 0 ? `¥${Math.round(n)}` : '价格待定'
}

export function JmPlannerList({
  themeColor = 'var(--jm-color-brand-vermilion, #D94E3D)',
  onBookNow,
  className = '',
}: JmPlannerListProps) {
  const [planners, setPlanners] = useState<PlannerItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [avatarFailed, setAvatarFailed] = useState<Set<number>>(new Set())

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    ;(async () => {
      try {
        const res = await plannerAPI.getPlanners()
        if (cancelled) return
        if (res.error || !res.data) {
          throw new Error(res.message || '策划师接口返回异常')
        }
        setPlanners(res.data.planners)
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  return (
    <div
      className={`jm-pl ${className}`}
      style={{ '--pl-color': themeColor } as React.CSSProperties}
    >
      {loading && (
        <div className="jm-pl__loading" role="status" aria-live="polite">
          <div className="jm-pl__spinner" />
          <span>策划师加载中...</span>
        </div>
      )}

      {!loading && error && (
        <div className="jm-pl__error" role="alert">
          <p>策划师加载失败：{error}</p>
          <button
            type="button"
            className="jm-pl__retry"
            onClick={() => {
              setError(null)
              setPlanners([])
              // 触发 useEffect 重跑：loading true 让 spinner 先出现再 fetch
              setLoading(true)
            }}
          >
            重试
          </button>
        </div>
      )}

      {!loading && !error && planners.length === 0 && (
        <div className="jm-pl__empty">暂无策划师</div>
      )}

      {!loading && !error && planners.length > 0 && (
        <div className="jm-pl__list">
          {planners.map(p => {
            const placeholderChar = p.name.trim().charAt(0) || '?'
            const showPlaceholder = !p.avatar_url || avatarFailed.has(p.id)
            return (
              <div key={p.id} className="jm-pl__card">
                <div className="jm-pl__avatar">
                  {showPlaceholder ? (
                    <div className="jm-pl__placeholder" aria-hidden>{placeholderChar}</div>
                  ) : (
                    <img
                      src={p.avatar_url!}
                      alt={p.name}
                      loading="lazy"
                      onError={() => {
                        setAvatarFailed(prev => {
                          const next = new Set(prev)
                          next.add(p.id)
                          return next
                        })
                      }}
                    />
                  )}
                </div>

                <div className="jm-pl__body">
                  <div className="jm-pl__name">{p.name}</div>
                  <div className="jm-pl__specialty">{p.specialty}</div>
                  <div className="jm-pl__desc">{p.description}</div>
                  <div className="jm-pl__prices">
                    <span className="jm-pl__price-single">
                      <span className="jm-pl__price-label">单次答疑</span>
                      <span className="jm-pl__price-num">{formatPrice(p.single_price)}</span>
                    </span>
                    <span className="jm-pl__price-sep" aria-hidden>·</span>
                    <span className="jm-pl__price-full">
                      <span className="jm-pl__price-label">全案策划</span>
                      <span className="jm-pl__price-num">{formatPrice(p.full_price)}</span>
                    </span>
                  </div>
                </div>

                {onBookNow && (
                  <button
                    type="button"
                    className="jm-pl__book"
                    onClick={() => {
                      onBookNow(p)
                      // 最简版：额外给个 alert 反馈
                      // 后续业务接入时删掉
                      // eslint-disable-next-line no-alert
                      alert(`即将为「${p.name}」开启预约（演示）`)
                    }}
                    aria-label={`${p.name} - 立即预约`}
                  >
                    立即预约
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default JmPlannerList
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/jmaui/components/content/JmPlannerList/index.tsx
git commit -m "feat(jmaui): JmPlannerList 组件 (含三态+列表+头像占位+onBookNow)"
```

---

## Task 8: globals.css 加 jm-pl-* 整段 CSS

**Files:**
- Modify: `frontend/src/app/globals.css`

- [ ] **Step 1: 找到现有 CSS 中 JmCateMindMap 段（参考 jm-mm*）**

```bash
grep -n "jm-mm" /home/masterdododo/jxmapk/frontend/src/app/globals.css | tail -5
```

Expected: 类似 `/* === JmCateMindMap === */` 标记

- [ ] **Step 2: 在 globals.css 末尾追加 JmPlannerList 段**

```css
/* === JmPlannerList === */
/* 策划师列表
   卡片:左侧 64×64 圆角头像 / 右侧 4 行(姓名/特长/简介/价格)
   主题色: --pl-color 透传,跟随 themeColor prop
   价格简化:无小数无千分位
   立即预约:仅在传 onBookNow 时渲染 */

.jm-pl {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 0;
}

.jm-pl__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.jm-pl__card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 12px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e8e8e8;
}

.jm-pl__avatar {
  flex: 0 0 auto;
  width: 64px;
  height: 64px;
  border-radius: 8px;
  overflow: hidden;
  background: #fafafa;
}

.jm-pl__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.jm-pl__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 1.5px solid var(--pl-color, #D94E3D);
  color: var(--pl-color, #D94E3D);
  font-size: 24px;
  font-weight: 600;
  font-family: 'Noto Serif SC', serif;
  border-radius: 8px;
  box-sizing: border-box;
}

.jm-pl__body {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.jm-pl__name {
  font-size: 15px;
  font-weight: 600;
  color: #171717;
  line-height: 1.3;
  letter-spacing: 0.02em;
}

.jm-pl__specialty {
  font-size: 12px;
  color: #888;
  line-height: 1.4;
}

.jm-pl__desc {
  font-size: 13px;
  color: #555;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-top: 2px;
}

.jm-pl__prices {
  margin-top: 6px;
  display: flex;
  align-items: baseline;
  gap: 6px;
  flex-wrap: wrap;
}

.jm-pl__price-single,
.jm-pl__price-full {
  display: inline-flex;
  align-items: baseline;
  gap: 3px;
}

.jm-pl__price-label {
  font-size: 11px;
  color: #999;
}

.jm-pl__price-num {
  font-size: 14px;
  font-weight: 600;
  color: var(--pl-color, #D94E3D);
  letter-spacing: 0.02em;
}

.jm-pl__price-sep {
  color: #ddd;
  font-size: 12px;
  margin: 0 2px;
}

.jm-pl__book {
  flex: 0 0 auto;
  align-self: center;
  display: inline-block;
  min-height: auto;
  min-width: auto;
  padding: 4px 10px;
  border: none;
  border-radius: 0;
  background: transparent;
  color: var(--pl-color, #D94E3D);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 1px;
  line-height: 1.4;
  text-align: center;
  white-space: nowrap;
  cursor: pointer;
  outline: none;
  -webkit-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition:
    color 0.2s ease,
    transform 0.2s ease;
}

.jm-pl__book:hover {
  color: color-mix(in srgb, var(--pl-color, #D94E3D) 70%, #000);
}

.jm-pl__book:active {
  transform: scale(0.96);
}

/* 加载 */
.jm-pl__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 32px 0;
  color: #999;
  font-size: 13px;
}

.jm-pl__spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #e8e8e8;
  border-top-color: var(--pl-color, #D94E3D);
  border-radius: 50%;
  animation: jm-pl-spin 0.8s linear infinite;
}

@keyframes jm-pl-spin {
  to { transform: rotate(360deg); }
}

/* 错误 */
.jm-pl__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px 0;
  color: #888;
  font-size: 13px;
}

.jm-pl__retry {
  padding: 4px 12px;
  border: 1px solid var(--pl-color, #D94E3D);
  border-radius: 4px;
  background: transparent;
  color: var(--pl-color, #D94E3D);
  font-size: 12px;
  cursor: pointer;
}

/* 空 */
.jm-pl__empty {
  padding: 32px 0;
  text-align: center;
  color: #999;
  font-size: 13px;
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/globals.css
git commit -m "feat(jmaui): JmPlannerList CSS (.jm-pl-*)"
```

---

## Task 9: 注册到 jmaui 入口

**Files:**
- Modify: `frontend/src/components/jmaui/index.ts`

- [ ] **Step 1: 在 export JmCateMindMap 之后追加 JmPlannerList**

找到：
```ts
export { JmCateMindMap } from './components/content/JmCateMindMap'
export type { JmCateMindMapProps, JmCateMindMapCategory, JmCateMindMapSub } from './components/content/JmCateMindMap/props'
```

之后追加：
```ts
export { JmPlannerList } from './components/content/JmPlannerList'
export type { JmPlannerListProps, PlannerItem } from './components/content/JmPlannerList/props'
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/jmaui/index.ts
git commit -m "feat(jmaui): register JmPlannerList + PlannerItem type"
```

---

## Task 10: 挂到 app/test/coms 展示页

**Files:**
- Modify: `frontend/src/app/test/coms/page.tsx`

- [ ] **Step 1: 在 import 段加 JmPlannerList + PlannerItem**

在 `import {... JmCateMindMap, ...}` 之后追加 `JmPlannerList`，并在 `type` 段加 `PlannerItem`：

```tsx
JmPlannerList,
type PlannerItem,
```

- [ ] **Step 2: 在 `services` Tab 的 case 末尾追加 ShowcaseItem**

找到 `case 'services':` 块的最后一行 `</ShowcaseItem>`（约 333 行），之后在 `</div>` 之前追加：

```tsx
            <ShowcaseItem label="JmPlannerList 策划师列表（自管 fetch, 后端 8009）">
              <JmPlannerList
                themeColor="var(--jm-color-brand-rose, #da2e75)"
                onBookNow={(p) => console.log('[showcase] 预约:', p.name)}
              />
            </ShowcaseItem>
```

- [ ] **Step 3: 验证编译**

Run: 前端 dev server 应在 3007 跑，刷新 `/test/coms` → 切到"服务" Tab → 看到 JmPlannerList 区域
Expected: HTTP 200，3 个策划师卡片渲染

- [ ] **Step 4: browser_evaluate 验证 DOM**

通过 playwright 或类似：
```js
() => {
  const cards = document.querySelectorAll('.jm-pl__card')
  const names = Array.from(cards).map(c => c.querySelector('.jm-pl__name')?.textContent)
  const prices = Array.from(cards).map(c => c.querySelector('.jm-pl__price-num')?.textContent)
  return { count: cards.length, names, prices }
}
```

Expected: `{ count: 3, names: ['张三', '李四', '王五'], prices: ['¥500', '¥800', '¥300'] }`（前两个 single_price）

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/test/coms/page.tsx
git commit -m "feat(test): 挂 JmPlannerList 到 coms 展示页 services Tab"
```

---

## Task 11: 错误场景 + 头像失效 + 主题色端到端验证

**Files:** (无文件修改，仅验证)

- [ ] **Step 1: 验证 onBookNow 行为**

在浏览器点击任一卡片的「立即预约」按钮。
Expected: 弹窗显示"即将为「张三」开启预约（演示）"，控制台 log `[showcase] 预约: 张三`

- [ ] **Step 2: 验证头像占位 (故意触发)**

手动临时把 `planner.avatar_url` 改成 `https://invalid.example.com/x.jpg` 测一次（或在 PGlite dev 模式手动 UPDATE）。
Expected: 头像区域切到 `.jm-pl__placeholder` 显示首字

- [ ] **Step 3: 验证主题色**

修改 `themeColor="var(--jm-color-brand-cyan, #2f748a)"` 重启，看价格强调色是否变青。
Expected: `getComputedStyle(priceNum).color === 'rgb(47, 116, 138)'`（cyan）

- [ ] **Step 4: 验证空态**

临时清空 `jx_apk_planner` 表（`DELETE FROM jx_apk_planner WHERE status=1;`），刷新页面。
Expected: 显示"暂无策划师"

- [ ] **Step 5: 验证错误态**

临时停后端（`kill <pid>`），刷新页面。
Expected: 显示"策划师加载失败：..." + "重试"按钮

---

## Task 12: Final Commit + 文档同步

**Files:** (无文件修改，整理 commit)

- [ ] **Step 1: 确认所有文件已 commit**

Run: `git -C /home/masterdododo/jxmapk status`
Expected: clean working tree

- [ ] **Step 2: 总览 commit 列表**

Run: `git -C /home/masterdododo/jxmapk log --oneline -15`
Expected: 应包含
- `docs(spec): JmPlannerList 策划师展示组件设计`
- `docs(spec): 改页面入口为 app/test/coms 展示页`
- `feat(backend): Planner SQLAlchemy model + register`
- `feat(backend): Planner Pydantic schemas`
- `feat(backend): GET /api/v1/mobile/planner router`
- `chore(seed): jx_apk_planner 表 + 3 条样例数据`
- `feat(frontend): plannerAPI client`
- `feat(jmaui): JmPlannerList props`
- `feat(jmaui): JmPlannerList 组件`
- `feat(jmaui): JmPlannerList CSS`
- `feat(jmaui): register JmPlannerList + PlannerItem type`
- `feat(test): 挂 JmPlannerList 到 coms 展示页 services Tab`

- [ ] **Step 3: 输出最终交付总结**

向用户报告：
- 新增 jmaui 组件 `JmPlannerList`（数据自管 fetch）
- 新增后端 `jx_apk_planner` 表 + `GET /api/v1/mobile/planner` 接口
- 已挂载到 `app/test/coms` 展示页 services Tab
- 验证：3 条样例数据 + loading/error/empty 三态 + 头像占位 + 主题色贯通 + onBookNow 触发
- 下一步：等用户决定是否反哺到 `~/jiuxin/mobile/`

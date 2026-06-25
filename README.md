# jxmh5 (九信的H5)

九信人文策划服务平台 — H5 移动端 + FastAPI 后端 + 管理后台一体化项目。

## 技术栈

| 层 | 选型 |
|---|------|
| 前端 | Next.js 16 + React 19 + TypeScript + TailwindCSS 4 + shadcn/ui |
| 后端 | FastAPI + SQLAlchemy 2.0 (async) + asyncpg + Pydantic 2 |
| 数据库 | PostgreSQL 17 |
| AI 接入 | MiniMax API |
| 进程管理 | systemd (开发/部署) |

## 快速开始

```bash
# 后端
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
cp .env.example .env       # 编辑 DATABASE_URL / JWT_SECRET_KEY
python -m uvicorn main:app --port 8009

# 前端
pnpm install
pnpm dev                   # 默认端口 3007
```

## 端口对照

| 端口 | 服务 |
|------|------|
| 3007 | Next.js dev server |
| 8009 | FastAPI 后端 |
| 5434 | PostgreSQL |

## 目录结构

```
jxmh5/
├── backend/                  # FastAPI 后端
│   ├── app/                  # 主应用 (models / routers / services / schemas)
│   ├── .env.example          # 环境变量模板(可入仓)
│   ├── config.py             # 配置(密码强制从 env 读,不硬编码)
│   ├── database.py           # asyncpg + SQLAlchemy
│   ├── main.py               # FastAPI 入口
│   └── requirements.txt
├── src/                      # Next.js 前端
│   ├── app/                  # App Router pages
│   ├── components/jmaui/     # 自研 UI 组件库
│   └── lib/
├── components.json           # shadcn/ui 配置
├── public/                   # 静态资源
├── database/                 # 数据库迁移 + dump 脚本
├── con.md                    # 项目进展 + 待办 (AI 备忘)
├── next.config.ts
├── package.json
├── tsconfig.json
└── CLAUDE.md                 # AI/Agent 每次对话前必读
```

## 安全 / 敏感信息约定

- `backend/.env` **不入仓** (.gitignore 覆盖)
- `backend/config.py` 中的密码字段**强制从环境变量读**, 无 fallback 默认值
- `database/*.sql` (dump) **不入仓** (.gitignore 覆盖) — 含业务数据
- 详见 [[CLAUDE.md]] 已知坑 #6 / #7 / #8

## License

MIT — 见 [LICENSE](./LICENSE)

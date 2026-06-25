#!/usr/bin/env bash
# ============================================================
# deploy-jxmh5.sh — 本机 jxmh5 → txj (101.33.215.39) 增量同步
#
# 设计原则：
#   - 默认 --dry-run：不真传任何文件，只列出会传什么
#   - --apply 才真同步；--restart 才在 txj 上重启 systemd 服务
#   - 严格排除：本地 dev 制品 (.next / node_modules / .venv / *.log)
#     千万不能覆盖 txj 的 backend/.env（生产密码已配）
#
# 服务管理（2026-06-26 改造）：
#   - txj 上 jxmh5-fastapi.service / jxmh5-nextjs.service 已 enabled
#   - FastAPI unit 配 EnvironmentFile=/home/jxmh5/backend/.env,自动加载 DATABASE_URL/JWT
#   - --restart 走 systemctl restart,不再用 nohup + /tmp/jxmh5-deploy.env
#     (避免孤儿进程 + 避免密码残留 /tmp)
#   - reboot 后两个服务自动起 (After=network.target)
#
# .env 策略：
#   - 本地 backend/.env 是 gitignore,含开发密码/连接串
#   - rsync 排除,不会覆盖 txj 的 backend/.env（生产密码已配）
#   - txj 的 backend/.env 必须自己配 DATABASE_URL/JWT_SECRET_KEY
#     本脚本只解析本地 .env 作 sanity check + 日志显示,不写到 txj
#
# 用法：
#   bin/deploy-jxmh5.sh                 # 干跑：列出会传什么
#   bin/deploy-jxmh5.sh --apply        # 真同步文件（HMR 自动热加载,不动服务）
#   bin/deploy-jxmh5.sh --apply --restart
#                                      # 真同步 + 清 turbopack cache + 重启 next+fastapi
#   bin/deploy-jxmh5.sh --help
# ============================================================

set -euo pipefail

# ---- 配置 ----
REMOTE_HOST="101.33.215.39"
REMOTE_USER="root"
REMOTE_DIR="/home/jxmh5"
SSH_PASS="A555555A."
SSH_OPTS="-o StrictHostKeyChecking=accept-new -o UserKnownHostsFile=/dev/null -o LogLevel=ERROR"

# 同步排除清单（务必不要删 backend/.env！）
RSYNC_EXCLUDES=(
    "--exclude=.next/"
    "--exclude=node_modules/"
    "--exclude=backend/.venv/"
    "--exclude=__pycache__/"
    "--exclude=*.pyc"
    "--exclude=*.bak"
    "--exclude=*.bak.*"
    "--exclude=.dev-logs/"
    "--exclude=*.log"
    "--exclude=.DS_Store"
    "--exclude=con.md"                # 用户: 不需要 con.md
    "--exclude=backend/.env"          # 关键：本地 dev .env，绝不覆盖 txj 生产
    "--exclude=.env.local"
    "--exclude=.env.*.local"
)

# ---- 解析参数 ----
MODE="dry"
RESTART="no"

usage() {
    sed -n '3,18p' "$0" | sed 's/^# \{0,1\}//'
    exit 0
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        --apply)   MODE="apply"; shift ;;
        --dry-run) MODE="dry"; shift ;;
        --restart) RESTART="yes"; shift ;;
        --help|-h) usage ;;
        *)
            echo "未知参数: $1 (试试 --help)" >&2
            exit 2
            ;;
    esac
done

# ---- 预检 ----
cd "$(dirname "$0")/.."
LOCAL_DIR="$(pwd)"
echo "[deploy] local : $LOCAL_DIR"
echo "[deploy] remote: ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}"
echo "[deploy] mode  : $MODE (restart=$RESTART)"
echo

command -v rsync  >/dev/null || { echo "❌ rsync 未装"; exit 1; }
command -v sshpass>/dev/null || { echo "❌ sshpass 未装"; exit 1; }

# ---- 干跑 / 真同步 ----
if [[ "$MODE" == "dry" ]]; then
    echo "[dry-run] 列出将要传输的文件（不真传）："
    echo
    rsync -avn --delete \
        "${RSYNC_EXCLUDES[@]}" \
        "./" "sshpass -p $SSH_PASS ssh $SSH_OPTS ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/"
    echo
    echo "[dry-run] 完成。要真同步加 --apply。"
    exit 0
fi

# 真同步模式
echo "[apply] 开始同步..."
rsync -av --delete \
    "${RSYNC_EXCLUDES[@]}" \
    -e "sshpass -p $SSH_PASS ssh $SSH_OPTS" \
    "./" "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_DIR}/"
echo
echo "[apply] 同步完成。"

# ---- 清 turbopack dev cache（部署后由 next dev 重建）----
# 理由: SST 单文件可达 260MB+,无清理会无限增长到占满磁盘
# 清理时机: deploy 后立即清 → next dev 会重建 cache（重建需要 1-2 分钟）
# 只在 --restart 时清,否则下次 dev 会重建浪费时间
if [[ "$RESTART" == "yes" ]]; then
    echo "[cache] 清理 txj .next/dev/cache（避免 turbopack SST 单文件 260MB 无限增长）..."
    sshpass -p "$SSH_PASS" ssh $SSH_OPTS "${REMOTE_USER}@${REMOTE_HOST}" \
        "rm -rf /home/jxmh5/.next/dev/cache 2>/dev/null; echo '  cache 已清理'"
fi

# ---- 解析本地 backend/.env 关键变量 (排除空行/注释) ----
# 用于在 txj 启动 uvicorn 时 inline 注入 env,
# 这样不依赖 txj 上的 backend/.env 是否完整（生产 .env 我们不覆盖）
INLINE_ENV=""
LOCAL_ENV_FILE="$LOCAL_DIR/backend/.env"
if [ -f "$LOCAL_ENV_FILE" ]; then
    while IFS= read -r line || [ -n "$line" ]; do
        # 跳过空行、纯注释行、行内注释
        case "$line" in
            ""|\#*) continue ;;
        esac
        # 保留 KEY=VALUE，过滤行内 # 之后的内容
        kv="${line%%#*}"
        # 只保留合法 env 名 (字母数字下划线, 字母开头)
        key="${kv%%=*}"
        if [[ "$key" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]]; then
            INLINE_ENV+="env_line $kv"$'\n'
        fi
    done < "$LOCAL_ENV_FILE"
fi
INLINE_ENV_COUNT=$(printf '%s' "$INLINE_ENV" | grep -c '^env_line ' || true)
echo "[env] 从本地 backend/.env 解析到 $INLINE_ENV_COUNT 个变量"
echo "[env] 注入列表: $(printf '%s\n' "$INLINE_ENV" | sed 's/^env_line //' | sed 's/=.*/=<redacted>/' | paste -sd ' ' -)"

# ---- 可选：重启 txj 服务 ----
# 2026-06-26 改造: 由 systemd 接管,不再用 nohup + /tmp/jxmh5-deploy.env
# - FastAPI: jxmh5-fastapi.service 读 /home/jxmh5/backend/.env (EnvironmentFile=)
# - Next.js: jxmh5-nextjs.service, 清 cache 后必须 restart 清内存 SST 指针
# - 老的 /tmp/jxmh5-deploy.env 模式废弃(密码残留 + 孤儿进程风险)
if [[ "$RESTART" == "yes" ]]; then
    echo
    echo "[restart] 在 txj 上重启 next + fastapi (systemd 接管)..."

    sshpass -p "$SSH_PASS" ssh $SSH_OPTS "${REMOTE_USER}@${REMOTE_HOST}" << 'REMOTE'
        set -e

        # 1) 确保日志目录存在 (rsync 排除了, 首次部署/磁盘重建时会缺)
        mkdir -p /home/jxmh5/.dev-logs

        # 2) 杀孤儿 uvicorn（如果 systemd 之外还有跑着的）
        if pgrep -f "uvicorn main:app" >/dev/null; then
            echo "  发现孤儿 uvicorn,先 kill"
            pkill -TERM -f "uvicorn main:app" 2>/dev/null || true
            sleep 3
            pkill -KILL -f "uvicorn main:app" 2>/dev/null || true
            sleep 1
        fi

        # 3) 重启 systemd 服务（自动拉起 fresh process + MemoryMax/CPUQuota 保护）
        systemctl restart jxmh5-nextjs
        systemctl restart jxmh5-fastapi

        # 4) 等服务起来
        sleep 5

        # 5) 健康检查
        echo "  [health] Next.js:"
        if curl -sS -o /dev/null -w "    HTTP %{http_code}  time=%{time_total}s\n" http://127.0.0.1:3007/; then
            :
        fi

        echo "  [health] FastAPI:"
        if HEALTH=$(curl -sS http://127.0.0.1:8009/health 2>&1); then
            echo "    ✓ $HEALTH"
        else
            echo "    ❌ $HEALTH"
            echo "    [restart] 最近 15 行 journal:"
            journalctl -u jxmh5-fastapi -n 15 --no-pager | sed 's/^/      /'
        fi

        # 6) 确认服务状态
        echo "  [status] jxmh5-nextjs:  $(systemctl is-active jxmh5-nextjs)"
        echo "  [status] jxmh5-fastapi: $(systemctl is-active jxmh5-fastapi)"
REMOTE

    echo
    echo "[restart] 完成。两个服务都受 systemd + MemoryMax/CPUQuota 保护。"
    echo "       reboot 后会自动起来（enabled + After=network.target）。"
else
    echo
    echo "[skip] 未加 --restart，跳过后端重启。"
    echo "       前端 next dev 会自动 HMR（无需操作）。"
    echo "       后端 uvicorn 没开 --reload，改了 backend/ 需要手动重启："
    echo "         ssh root@$REMOTE_HOST 'pkill -TERM -f uvicorn; cd /home/jxmh5/backend && env \$(grep -v \"^#\" /home/jxmh5/backend/.env | xargs) nohup .venv/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8009 > /home/jxmh5/.dev-logs/backend.log 2>&1 &'"
fi

echo
echo "[done] ✅ 部署完成"

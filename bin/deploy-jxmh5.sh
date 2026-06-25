#!/usr/bin/env bash
# ============================================================
# deploy-jxmh5.sh — 本机 jxmh5 → txj (101.33.215.39) 增量同步
#
# 设计原则：
#   - 默认 --dry-run：不真传任何文件，只列出会传什么
#   - --apply 才真同步；--restart 才在 txj 上重启 uvicorn/next dev
#   - 严格排除：本地 dev 制品 (.next / node_modules / .venv / .env / *.log)
#     千万不能覆盖 txj 的 .env（生产密码已配）
#   - 前端走 next dev HMR（自动热加载），不需要重启
#   - 后端 uvicorn 没开 --reload，所以后端代码改动需要 --restart
#
# 重启后端时的 env 注入：
#   - 不会覆盖 txj 的 backend/.env（rsync 排除）
#   - 但 uvicorn 进程需要 DATABASE_URL 等关键变量才能启动
#   - 本脚本从本地 backend/.env 解析关键变量（排除注释行），
#     scp 到 txj 的 /tmp/jxmh5-deploy.env，远端 `set -a; . 那个文件; set +a` 自动 export
#   - 走文件而不是 `env K=V K=V ...` 是为了: 值含空格/特殊字符不会断 + 排错时可看
#   - 本地 .env 是 gitignore 的，所以密码/连接串不会进 git
#
# 用法：
#   bin/deploy-jxmh5.sh                 # 干跑：列出会传什么
#   bin/deploy-jxmh5.sh --apply        # 真同步文件（不动服务）
#   bin/deploy-jxmh5.sh --apply --restart
#                                      # 真同步 + txj 重启后端
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

# ---- 可选：重启 txj 后端 ----
if [[ "$RESTART" == "yes" ]]; then
    echo
    echo "[restart] 在 txj 上重启后端 uvicorn..."

    # 1) 把解析出的 env 写到本地临时文件, scp 到 txj
    #    走文件而不是 inline `env K=V K=V ...` 是为了:
    #    - 安全: 值含空格/特殊字符不会断
    #    - 可观察: 重启后 /tmp/jxmh5-deploy.env 留在那便于排错
    TMP_ENV=$(mktemp)
    trap 'rm -f "$TMP_ENV"' EXIT
    if [ -n "$INLINE_ENV" ]; then
        printf '%s\n' "$INLINE_ENV" | sed 's/^env_line //' > "$TMP_ENV"
    else
        : > "$TMP_ENV"
    fi
    sshpass -p "$SSH_PASS" scp $SSH_OPTS \
        "$TMP_ENV" "${REMOTE_USER}@${REMOTE_HOST}:/tmp/jxmh5-deploy.env"

    # 2) 在 txj 上 restart
    sshpass -p "$SSH_PASS" ssh $SSH_OPTS "${REMOTE_USER}@${REMOTE_HOST}" << 'REMOTE'
        set -e
        # 1) 确保日志目录存在 (rsync 排除了, 首次部署/磁盘重建时会缺)
        mkdir -p /home/jxmh5/.dev-logs

        # 2) 优雅杀掉旧 uvicorn
        pkill -TERM -f "uvicorn main:app" 2>/dev/null || true
        sleep 2
        pkill -KILL -f "uvicorn main:app" 2>/dev/null || true
        sleep 1

        # 3) 用 deploy env 启动新 uvicorn
        #    `set -a` 让 source 进来的 KEY=VAL 自动 export
        cd /home/jxmh5/backend
        set -a
        . /tmp/jxmh5-deploy.env
        set +a
        nohup .venv/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8009 \
            > /home/jxmh5/.dev-logs/backend.log 2>&1 &
        echo $! > /home/jxmh5/.dev-logs/backend.pid
        echo "[restart] 新后端 PID: $(cat /home/jxmh5/.dev-logs/backend.pid)"
        sleep 3
        echo "[restart] 健康检查:"
        if HEALTH=$(curl -sS http://127.0.0.1:8009/health 2>&1); then
            echo "  ✓ $HEALTH"
        else
            echo "  ❌ $HEALTH"
            echo "  [restart] 最近 15 行日志:"
            tail -15 /home/jxmh5/.dev-logs/backend.log | sed 's/^/    /'
        fi
REMOTE
    echo
    echo "[restart] 完成。前端 next dev 自动 HMR，无需重启。"
    echo "[note] /tmp/jxmh5-deploy.env 留在 txj 便于排错, 下次 restart 会覆盖"
else
    echo
    echo "[skip] 未加 --restart，跳过后端重启。"
    echo "       前端 next dev 会自动 HMR（无需操作）。"
    echo "       后端 uvicorn 没开 --reload，改了 backend/ 需要手动重启："
    echo "         ssh root@$REMOTE_HOST 'pkill -TERM -f uvicorn; cd /home/jxmh5/backend && env \$(grep -v \"^#\" /home/jxmh5/backend/.env | xargs) nohup .venv/bin/python -m uvicorn main:app --host 0.0.0.0 --port 8009 > /home/jxmh5/.dev-logs/backend.log 2>&1 &'"
fi

echo
echo "[done] ✅ 部署完成"

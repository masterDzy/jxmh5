#!/usr/bin/env bash
# ============================================================
# jxmh5-healthcheck.sh — 每分钟健康检查
#
# 检查项:
#   1. FastAPI /health  (8009)
#   2. Next.js 首页     (3007)
#   3. Postgres 容器状态 (docker ps)
#   4. 磁盘剩余空间     (df /)
#
# 失败处理:
#   - 写 .dev-logs/healthcheck.log
#   - 触发 systemd 重启对应服务(下次迭代)
#   - 这里只告警,不修复(防止反复重启打爆日志)
#
# 由 jxmh5-healthcheck.timer 触发 (每分钟)
# ============================================================

set -uo pipefail

LOG="/home/jxmh5/.dev-logs/healthcheck.log"
TS=$(date '+%Y-%m-%d %H:%M:%S')
FAIL=0

check_http() {
    local name="$1" url="$2" expect_code="${3:-200}"
    local code
    code=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 5 "$url" 2>/dev/null || echo "000")
    if [ "$code" = "$expect_code" ]; then
        echo "  ✓ $name ($code)"
    else
        echo "  ✗ $name 期望 $expect_code 实际 $code (URL: $url)"
        FAIL=$((FAIL + 1))
    fi
}

check_docker() {
    local container="$1"
    if docker ps --format '{{.Names}}' 2>/dev/null | grep -q "^${container}$"; then
        echo "  ✓ docker $container (running)"
    else
        echo "  ✗ docker $container (NOT running)"
        FAIL=$((FAIL + 1))
    fi
}

check_disk() {
    local avail
    avail=$(df -BG / | awk 'NR==2 {print $4}' | tr -d 'G')
    if [ "$avail" -ge 5 ]; then
        echo "  ✓ disk / (${avail}G available)"
    else
        echo "  ✗ disk / 只剩 ${avail}G (< 5G)"
        FAIL=$((FAIL + 1))
    fi
}

{
    echo "=== $TS ==="
    check_http "FastAPI /health" "http://127.0.0.1:8009/health"
    check_http "Next.js  /"       "http://127.0.0.1:3007/"
    check_docker "jx_m_apk_postgres"
    check_disk
    if [ "$FAIL" -gt 0 ]; then
        echo "  ❌ $FAIL 项异常"
    else
        echo "  ✅ 全部正常"
    fi
} >> "$LOG" 2>&1

# 保留最近 1000 行(避免日志无限增长)
if [ -f "$LOG" ]; then
    tail -n 1000 "$LOG" > "$LOG.tmp" && mv "$LOG.tmp" "$LOG"
fi

exit 0
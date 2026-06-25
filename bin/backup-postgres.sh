#!/usr/bin/env bash
# ============================================================
# backup-postgres.sh — 备份 jx_m_apk_postgres 容器数据库
#
# 跑在 txj 上 (root), 通过 docker exec pg_dump 全库导出
#
# 策略:
#   - 每天 03:00 跑(由 jxmh5-postgres-backup.timer 触发)
#   - 输出: /home/jxmh5/.backups/postgres-YYYYMMDD-HHMMSS.sql.gz
#   - 保留 7 天, 旧文件自动删
#   - 备份完跑 pg_restore --list 验证归档完整(不真恢复)
#
# 注意:
#   - pg_dump -Fc (custom format) 比 -Fp (plain) 压缩率高 3-5x
#   - 用 docker exec 跑, 不需要进入容器
#   - 备份期间会持锁, 但 -Fc 不阻塞读写(只阻塞 DDL)
#
# 用法:
#   bin/backup-postgres.sh                 # 备份一次
#   bin/backup-postgres.sh --restore <file> # 还原指定备份(谨慎!)
# ============================================================

set -euo pipefail

CONTAINER="jx_m_apk_postgres"
DB_USER="jx_m_apk_adu"
DB_NAME="jx_m_apk"
BACKUP_DIR="/home/jxmh5/.backups"
KEEP_DAYS=7

mkdir -p "$BACKUP_DIR"

do_backup() {
    local ts
    ts=$(date +%Y%m%d-%H%M%S)
    local out="$BACKUP_DIR/postgres-${ts}.sql.gz"

    echo "[backup] 导出 $DB_NAME from $CONTAINER → $out"
    if docker exec "$CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" -Fc --no-owner --no-acl \
        | gzip -9 > "$out"; then
        local size
        size=$(du -h "$out" | cut -f1)
        echo "[backup] ✓ 完成 ($size)"

        # 验证归档(不真恢复,只列内容)
        if gunzip -c "$out" | docker exec -i "$CONTAINER" pg_restore --list >/dev/null 2>&1; then
            echo "[verify]  ✓ 归档可解析"
        else
            echo "[verify]  ❌ 归档损坏!"
            return 1
        fi

        # 清 7 天前的旧备份
        find "$BACKUP_DIR" -name "postgres-*.sql.gz" -mtime +$KEEP_DAYS -delete -print \
            | sed 's/^/[rotate] 删除: /'

        echo "[done]   备份保留 $KEEP_DAYS 天"
    else
        echo "[backup] ❌ pg_dump 失败"
        rm -f "$out"
        return 1
    fi
}

do_restore() {
    local file="$1"
    if [ ! -f "$file" ]; then
        echo "❌ 备份文件不存在: $file" >&2
        exit 1
    fi
    echo "⚠️  即将从 $file 还原到 $DB_NAME, 这会覆盖现有数据!"
    read -p "确认输入 YES 继续: " confirm
    if [ "$confirm" != "YES" ]; then
        echo "取消"
        exit 0
    fi
    echo "[restore] gunzip + pg_restore..."
    gunzip -c "$file" | docker exec -i "$CONTAINER" pg_restore -U "$DB_USER" -d "$DB_NAME" --clean --if-exists
    echo "[restore] ✓ 完成"
}

case "${1:-backup}" in
    backup|"") do_backup ;;
    --restore) shift; do_restore "${1:?需要指定备份文件}" ;;
    --list) ls -la "$BACKUP_DIR"/postgres-*.sql.gz 2>/dev/null || echo "(无备份)" ;;
    *) echo "用法: $0 [backup|--restore <file>|--list]" >&2; exit 1 ;;
esac
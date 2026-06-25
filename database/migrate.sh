#!/bin/bash
# 数据库迁移脚本：从 jiuxin 迁移到 jx_m_apk
#
# 凭证: 必须从环境变量传入, 不要在源码硬编码
#       例: set -a; source backend/.env; set +a; bash database/migrate.sh

set -e

# 连接信息 (凭证部分从 env 读)
SRC_HOST="172.17.0.1"
SRC_PORT="5433"
SRC_DB="jiuxin_admin"
SRC_USER="postgres"
SRC_PASSWORD="${SRC_PASSWORD:-}"

DST_HOST="127.0.0.1"
DST_PORT="5434"
DST_DB="jx_m_apk"
DST_USER="jx_m_apk_adu"
DST_PASSWORD="${DST_PASSWORD:-}"

if [ -z "$SRC_PASSWORD" ]; then
  echo "⚠️  警告: SRC_PASSWORD 未设置, 假设源库 trust 认证 (本地 docker bridge)"
fi

if [ -z "$DST_PASSWORD" ]; then
  echo "❌ 错误: 必须设置环境变量 DST_PASSWORD"
  echo "   例: set -a; source backend/.env; set +a; bash database/migrate.sh"
  exit 1
fi

export PGPASSWORD="$DST_PASSWORD"

echo "=== 开始数据库迁移 ==="

# 表映射关系
declare -A TABLE_MAP=(
    ["jiuxin_m_services"]="jx_apk_m_services"
    ["jiuxin_m_categories"]="jx_apk_m_categories"
    ["knowledge_articles"]="jx_apk_knowledge_articles"
    ["knowledge_categories"]="jx_apk_knowledge_categories"
    ["style_showcase_categories"]="jx_apk_showcase_categories"
    ["style_showcases"]="jx_apk_style_showcases"
    ["shop_addresses"]="jx_apk_shop_addresses"
    ["shop_cart_items"]="jx_apk_shop_cart_items"
    ["shop_categories"]="jx_apk_shop_categories"
    ["shop_order_items"]="jx_apk_shop_order_items"
    ["shop_orders"]="jx_apk_shop_orders"
    ["shop_products"]="jx_apk_shop_products"
    ["fortune_readings"]="jx_apk_fortune_readings"
)

# 迁移每个表
for src_table in "${!TABLE_MAP[@]}"; do
    dst_table="${TABLE_MAP[$src_table]}"
    echo "迁移 $src_table -> $dst_table ..."

    # 获取源表结构（只复制结构，不复制数据）
    pg_dump -h "$SRC_HOST" -p "$SRC_PORT" -U "$SRC_USER" -d "$SRC_DB" \
        -t "$src_table" --schema-only | \
        sed "s/$src_table/$dst_table/g" | \
        psql -h "$DST_HOST" -p "$DST_PORT" -U "$DST_USER" -d "$DST_DB"

    # 复制数据
    pg_dump -h "$SRC_HOST" -p "$SRC_PORT" -U "$SRC_USER" -d "$SRC_DB" \
        -t "$src_table" -a --no-owner | \
        sed "s/$src_table/$dst_table/g" | \
        psql -h "$DST_HOST" -p "$DST_PORT" -U "$DST_USER" -d "$DST_DB"

    echo "  $dst_table 完成"
done

echo ""
echo "=== 迁移 auth_users -> jx_apk_users ==="
# auth_users 迁移为 C 端用户表
pg_dump -h "$SRC_HOST" -p "$SRC_PORT" -U "$SRC_USER" -d "$SRC_DB" \
    -t "auth_users" --schema-only | \
    sed 's/auth_users/jx_apk_users/g' | \
    psql -h "$DST_HOST" -p "$DST_PORT" -U "$DST_USER" -d "$DST_DB"

pg_dump -h "$SRC_HOST" -p "$SRC_PORT" -U "$SRC_USER" -d "$SRC_DB" \
    -t "auth_users" -a --no-owner | \
    sed 's/auth_users/jx_apk_users/g' | \
    psql -h "$DST_HOST" -p "$DST_PORT" -U "$DST_USER" -d "$DST_DB"

echo "=== 创建 jx_apk_admin_users 表 ==="
# 运维用户表（简单结构）
psql -h "$DST_HOST" -p "$DST_PORT" -U "$DST_USER" -d "$DST_DB" << 'EOF'
CREATE TABLE IF NOT EXISTS jx_apk_admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'operator',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
EOF

echo ""
echo "=== 创建 published_pages 表 ==="
pg_dump -h "$SRC_HOST" -p "$SRC_PORT" -U "$SRC_USER" -d "$SRC_DB" \
    -t "published_pages" --schema-only 2>/dev/null | \
    sed 's/published_pages/jx_apk_published_pages/g' | \
    psql -h "$DST_HOST" -p "$DST_PORT" -U "$DST_USER" -d "$DST_DB" || echo "published_pages 可能不存在，跳过"

echo ""
echo "=== 验证表 ==="
psql -h "$DST_HOST" -p "$DST_PORT" -U "$DST_USER" -d "$DST_DB" -c "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename;"

echo ""
echo "=== 迁移完成 ==="

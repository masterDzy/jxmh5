-- 2026-06-14: booking 流程升级 — appointment 表加 3 列
-- 背景：booking 第一屏从"选交付方式"改为"选策划师 + 空间 + 形式"三件套
-- 字段值约束（硬编码 enum，DB schema 层不约束 enum）：
--   delivery_space: 'online' | 'onsite' | 'home'    (后端 DeliverySpace / 前端 DELIVERY_SPACES)
--   delivery_form:  'document' | 'conversation'      (后端 DeliveryForm  / 前端 DELIVERY_FORMS)
-- planner_id 可空，保留"跳过选人"业务扩展性
-- 本脚本幂等（IF NOT EXISTS），可重跑

ALTER TABLE jx_apk_appointments
  ADD COLUMN IF NOT EXISTS planner_id        INTEGER         NULL,
  ADD COLUMN IF NOT EXISTS delivery_space    VARCHAR(20)     NULL,
  ADD COLUMN IF NOT EXISTS delivery_form     VARCHAR(20)     NULL;

CREATE INDEX IF NOT EXISTS idx_jx_apk_appointments_planner_id
  ON jx_apk_appointments(planner_id);

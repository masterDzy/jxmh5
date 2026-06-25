/**
 * JmBookingSuccessCard —预约提交成功后的完整反馈卡片
 *
 * 用途:替代 booking/page.tsx 中硬编码的 success视图(原 lines290-368),
 * 集中管理「成功图标 +标题 +描述 +预约信息卡片 + 返回首页按钮」
 * 的视觉与交互,消除 page层的 Tailwind工具类与 hex硬编码
 *
 * 职责边界(遵守7 条核心原则):
 *  - 自管(Self-Contained Interaction):自身视觉 +内部按钮反馈(动效/按下态)
 *  - 上传(Data Ownership):预约详情均为已格式化好的字符串,组件不感知业务类型
 *  - 不管(Cross-Component Coordination):点击「返回首页」由 page 的 onReset 处理实际跳转/状态重置
 *  -样式(Style & Props Spec):全部在 globals.css BEM `.jm-booking-success-card__*`
 */
export interface JmBookingSuccessCardProps {
  /**预约的服务项目名称 */
  serviceName: string
  /**策划师姓名（如「李四」），2026-06-14 booking 首屏改造后新增 */
  plannerName?: string
  /**策划师头像 URL */
  plannerAvatar?: string
  /**策划师专长标签（如「资深策划师」） */
  plannerSpecialty?: string
  /**策划师一句话简介 */
  plannerDescription?: string
  /**交付方式中文标签（如「线上 · 文档」），由 page 提前从 deliverySpace + deliveryForm 派生 */
  deliveryModeLabel?: string
  /**交付空间 + 形式合并显示（如「线上 · 文档」），2026-06-14 双维字段改造后新增，与 deliveryModeLabel 二选一 */
  deliveryLabel?: string
  /**预约人姓名 */
  bookerName: string
  /**预约人联系电话 */
  bookerPhone: string
  /**预约时间(已格式化,如「6月15日 周一10:00」) */
  appointmentTime: string
  /**预约编号（从 API 返回捕获） */
  bookingId?: string
  /**用户备注 */
  note?: string
  /**线下交付地址（仅线下时由父组件传入） */
  address?: string

  /**返回按钮文字,默认「返回首页」；JmBookingFlow 场景改为「返回」 */
  resetLabel?: string

  /**主题色(用于成功图标底色 + 返回按钮),默认走页面品牌色 */
  themeColor?: string

  /** 点击「返回首页」按钮回调 — 由 page 处理实际跳转或表单状态重置 */
  onReset?: () => void
}

'use client'

import type { JmLockedMenuItemProps } from './props'

/**
 * JmLockedMenuItem — 锁定菜单项
 *
 * 注册后可解锁的功能展示项，灰色显示 + 小锁图标 + 描述文字。
 *
 * @example
 * <LockedMenuItem
 *   icon={<svg>...</svg>}
 *   label="预约记录"
 *   description="注册后可查看、管理所有预约"
 * />
 */
export function JmLockedMenuItem({
  icon,
  label,
  description,
}: JmLockedMenuItemProps) {
  return (
    <div className="flex items-center gap-3 px-4 h-[56px] opacity-50">
      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-[#171717] text-sm block leading-tight">{label}</span>
        <span className="text-xs text-[#bbb]">{description}</span>
      </div>
      {/* 小锁图标 */}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="#ccc">
        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10z"/>
      </svg>
    </div>
  )
}

export default JmLockedMenuItem

'use client'

import type { JmTextareaProps } from './props'

export function JmTextarea({
  value,
  onChange,
  placeholder,
  label,
  rows = 3,
  className = '',
}: JmTextareaProps) {
  return (
    <div className={`jm-textarea ${className}`}>
      {label && <label className="jm-textarea__label">{label}</label>}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="jm-textarea__field"
      />
    </div>
  )
}

export default JmTextarea

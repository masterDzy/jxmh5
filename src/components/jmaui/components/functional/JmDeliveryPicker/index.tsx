'use client'

import type { JmDeliveryPickerProps, JmDeliveryMode } from './props'

/**
 * JmDeliveryPicker — 交付方式选择器（受控 chip 形态）
 *
 * 用法：父级持有 deliveryMode state → 传入 value/onChange；
 * modes 由父级从 service.delivery_modes 派生传入。
 */
export function JmDeliveryPicker({
  value,
  onChange,
  modes,
  label = '请选择交付方式',
  required = false,
  error,
  className = '',
}: JmDeliveryPickerProps) {
  if (modes.length === 0) {
    return (
      <div className={`jm-delivery-picker ${className}`}>
        <div className="jm-delivery-picker__label">{label}</div>
        <div className="jm-delivery-picker__empty">暂无可选交付方式</div>
        {error && <div className="jm-delivery-picker__error">{error}</div>}
      </div>
    )
  }

  return (
    <div className={`jm-delivery-picker ${className}`}>
      <div className="jm-delivery-picker__label">
        <span>{label}</span>
        {required && <span className="jm-delivery-picker__required">*</span>}
      </div>
      <div className="jm-delivery-picker__options" role="radiogroup" aria-label={label}>
        {modes.map((opt) => {
          const isActive = value === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              className={`jm-delivery-picker__option ${
                isActive ? 'jm-delivery-picker__option--active' : ''
              }`}
              onClick={() => onChange(opt.value as JmDeliveryMode)}
            >
              <span className="jm-delivery-picker__option-title">{opt.label}</span>
              {opt.desc && (
                <span className="jm-delivery-picker__option-desc">{opt.desc}</span>
              )}
            </button>
          )
        })}
      </div>
      {error && <div className="jm-delivery-picker__error">{error}</div>}
    </div>
  )
}

export default JmDeliveryPicker

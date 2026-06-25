'use client'

import type { JmContactFieldProps } from './props'

export function JmContactField({
  type = 'text',
  value,
  onChange,
  placeholder,
  label,
  required,
  error,
  autoFocus,
  disabled,
  className = '',
}: JmContactFieldProps) {
  return (
    <div className={`jm-contact-field ${className}`}>
      {label && (
        <label className="jm-contact-field__label">
          {label}
          {required && <span className="jm-contact-field__required">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className={`jm-contact-field__field ${error ? 'jm-contact-field__field--error' : ''}`}
      />
      {error && <p className="jm-contact-field__error">{error}</p>}
    </div>
  )
}

export default JmContactField

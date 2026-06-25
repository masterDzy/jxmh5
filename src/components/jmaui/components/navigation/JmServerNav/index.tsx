import React from 'react'
import { JmServerNavProps } from './props'

export const JmServerNav: React.FC<JmServerNavProps> = ({
  className,
  style,
  categories,
  activeIndex,
  onChange,
  icons,
}) => {
  const hasIcons = icons && icons.length > 0

  return (
    <div
      className={`jm-server-nav ${hasIcons ? 'jm-server-nav--with-icons' : ''} ${className || ''}`}
      style={style}
    >
      {categories.map((category, index) => (
        <button
          key={category}
          className={`jm-server-nav__tab ${
            index === activeIndex ? 'jm-server-nav__tab--active' : ''
          }`}
          onClick={() => onChange(index)}
        >
          {hasIcons && icons[index] && (
            <span className="jm-server-nav__icon">
              {icons[index]}
            </span>
          )}
          <span className="jm-server-nav__text">{category}</span>
        </button>
      ))}
    </div>
  )
}

export default JmServerNav

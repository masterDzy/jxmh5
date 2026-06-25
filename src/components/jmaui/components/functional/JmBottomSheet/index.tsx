'use client'

import { useEffect, useRef, useCallback } from 'react'
import type { JmBottomSheetProps } from './props'

export function JmBottomSheet({
  visible,
  onClose,
  title,
  children,
  footer,
  className = '',
  themeColor = 'var(--jm-color-brand-vermilion, #D94E3D)',
  closeOnOverlay = true,
}: JmBottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)
  const dragStartY = useRef<number | null>(null)
  const currentTranslateY = useRef(0)

  const handleOverlayClick = useCallback(() => {
    if (closeOnOverlay) onClose()
  }, [closeOnOverlay, onClose])

  useEffect(() => {
    if (!visible) {
      currentTranslateY.current = 0
      return
    }
    const sheet = sheetRef.current
    if (!sheet) return
    sheet.style.transform = 'translateY(0)'
    currentTranslateY.current = 0
  }, [visible])

  useEffect(() => {
    if (!visible) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [visible])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const sheet = sheetRef.current
    if (!sheet) return
    if (sheet.scrollTop > 0) return
    dragStartY.current = e.touches[0].clientY
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (dragStartY.current === null) return
    const deltaY = e.touches[0].clientY - dragStartY.current
    if (deltaY <= 0) return
    currentTranslateY.current = deltaY
    const sheet = sheetRef.current
    if (sheet) {
      sheet.style.transition = 'none'
      sheet.style.transform = `translateY(${deltaY}px)`
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    dragStartY.current = null
    const sheet = sheetRef.current
    if (!sheet) return
    sheet.style.transition = ''
    if (currentTranslateY.current > 80) {
      onClose()
    } else {
      sheet.style.transform = 'translateY(0)'
    }
    currentTranslateY.current = 0
  }, [onClose])

  if (!visible) return null

  return (
    <div className={`jm-bottom-sheet-overlay ${className}`} onClick={handleOverlayClick}>
      <div
        className="jm-bottom-sheet"
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
        style={{ '--bs-color': themeColor } as React.CSSProperties}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="jm-bottom-sheet__handle" aria-hidden />
        {title && (
          <div className="jm-bottom-sheet__header">
            <h3 className="jm-bottom-sheet__title">{title}</h3>
          </div>
        )}
        <div className="jm-bottom-sheet__body">{children}</div>
        {footer && <div className="jm-bottom-sheet__footer">{footer}</div>}
      </div>
    </div>
  )
}

export default JmBottomSheet
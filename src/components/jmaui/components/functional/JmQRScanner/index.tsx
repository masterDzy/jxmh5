'use client'

import { useRef, useCallback } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { JmModal } from '@/components/jmaui/components/functional/JmModal'
import { JmButton } from '@/components/jmaui/components/functional/JmButton'
import { JmQRScannerProps } from './props'

export function JmQRScanner({ visible, onClose, onResult, onError }: JmQRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null)

  const startScanner = useCallback(async () => {
    try {
      const scanner = new Html5Qrcode('jm-qr-reader')
      scannerRef.current = scanner
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          onResult?.(decodedText)
          scanner.stop().catch(() => {})
          onClose()
        },
        () => {}
      )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '无法访问相机，请检查权限设置'
      onError?.(msg)
    }
  }, [onResult, onClose, onError])

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop() } catch {}
      scannerRef.current = null
    }
    onClose()
  }, [onClose])

  return (
    <JmModal visible={visible} onClose={stopScanner} title="扫描二维码">
      <div className="jm-qr-scanner">
        <div id="jm-qr-reader" className="jm-qr-scanner__reader" />
        <JmButton variant="primary" size="md" onClick={startScanner} className="jm-qr-scanner__retry">
          重新扫描
        </JmButton>
      </div>
    </JmModal>
  )
}

export default JmQRScanner

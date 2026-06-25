export interface JmQRScannerProps {
  visible: boolean
  onClose: () => void
  /** 扫描结果回调 */
  onResult?: (text: string) => void
  /** 错误回调 */
  onError?: (msg: string) => void
}

import { useEffect } from 'react'

type ToastProps = {
  message: string
  isVisible: boolean
  onClose: () => void
  durationMs?: number
}

function Toast({
  message,
  isVisible,
  onClose,
  durationMs = 3500,
}: ToastProps) {
  useEffect(() => {
    if (!isVisible) {
      return
    }

    const timer = window.setTimeout(() => {
      onClose()
    }, durationMs)

    return () => {
      window.clearTimeout(timer)
    }
  }, [durationMs, isVisible, onClose])

  if (!isVisible) {
    return null
  }

  return (
    <div className="toast" role="status" aria-live="polite">
      <span>{message}</span>
      <button type="button" className="toast-close" onClick={onClose}>
        x
      </button>
    </div>
  )
}

export default Toast


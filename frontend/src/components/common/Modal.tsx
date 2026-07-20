import { useEffect, useRef, type ReactNode } from 'react'
import styles from './Modal.module.css'

interface Props {
  title:          string
  onClose:        () => void
  children:       ReactNode
  footer?:        ReactNode
  maxWidth?:      number
  /** When true, clicking backdrop closes the dialog */
  backdropClose?: boolean
}

/**
 * Accessible modal dialog.
 * - Focus trap
 * - Escape to close (when backdropClose or unconditionally)
 * - aria-modal + role="dialog"
 * - Focus restored to trigger on unmount
 */
export function Modal({
  title, onClose, children, footer, maxWidth = 520, backdropClose = true,
}: Props) {
  const dialogRef   = useRef<HTMLDivElement>(null)
  const previousRef = useRef<Element | null>(null)

  useEffect(() => {
    previousRef.current = document.activeElement

    // Focus first focusable element
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    focusable?.[0]?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose() }
      if (e.key === 'Tab' && focusable && focusable.length > 0) {
        const first = focusable[0]
        const last  = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus()
        }
      }
    }

    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      ;(previousRef.current as HTMLElement | null)?.focus()
    }
  }, [onClose])

  return (
    <div
      className={styles.backdrop}
      onClick={backdropClose ? (e) => { if (e.target === e.currentTarget) onClose() } : undefined}
      aria-hidden={false}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={styles.dialog}
        style={{ maxWidth }}
      >
        {/* Header */}
        <div className={styles.header}>
          <h2 id="modal-title" className={styles.title}>{title}</h2>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className={styles.footer}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

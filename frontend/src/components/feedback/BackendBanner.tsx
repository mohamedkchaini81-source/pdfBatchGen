import { useEffect, useState } from 'react'
import { checkBackendHealth } from '@/services/healthService'
import styles from './BackendBanner.module.css'

/**
 * Dismissible warning banner shown when the FastAPI backend is unreachable.
 * On GitHub Pages: backend may be sleeping (Render free tier cold start ~30s).
 */
export function BackendBanner() {
  const [show,      setShow]      = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    checkBackendHealth().then((ok) => {
      if (!ok) setShow(true)
    })
  }, [])

  if (!show || dismissed) return null

  return (
    <div className={styles.banner} role="alert" aria-live="polite">
      <span className={styles.icon}>⚠️</span>
      <span className={styles.text}>
        <strong>Backend is starting up.</strong>{' '}
        The PDF generation server may be waking from sleep — this can take up to 30 seconds on the free tier.
        You can explore the full UI now. Try generating again in a moment.{' '}
        <a
          href="https://github.com/mohamedkchaini81-source/pdfBatchGen#quick-start-development"
          target="_blank"
          rel="noopener noreferrer"
        >
          Run locally for instant response →
        </a>
      </span>
      <button
        className={styles.dismiss}
        onClick={() => setDismissed(true)}
        aria-label="Dismiss backend warning"
      >
        Got it
      </button>
    </div>
  )
}

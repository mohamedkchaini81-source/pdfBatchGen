import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CheckCircle, XCircle, FileText } from 'lucide-react'
import { Modal } from '@/components/common/Modal'
import { Button } from '@/components/common/Button'
import { useAppStore } from '@/state/appStore'
import { startExport, pollExport, cancelExport } from '@/services/exportService'
import styles from './ProgressDialog.module.css'

interface Props { onClose: () => void }

type Phase = 'running' | 'done' | 'cancelled' | 'failed'

export function ProgressDialog({ onClose }: Props) {
  const { t }        = useTranslation()
  const state        = useAppStore()
  const resetJob     = useAppStore((s) => s.resetExportJob)

  const [phase,       setPhase]       = useState<Phase>('running')
  const [current,     setCurrent]     = useState(0)
  const [total,       setTotal]       = useState(0)
  const [currentName, setCurrentName] = useState('')
  const [message,     setMessage]     = useState('')
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const jobIdRef      = useRef<string | null>(null)
  const cancelledRef  = useRef(false)
  const pollRef       = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    run()
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function run() {
    try {
      const job = await startExport(state)
      jobIdRef.current = job.jobId
      setTotal(state.records.length)

      // Poll every 800ms
      pollRef.current = setInterval(async () => {
        if (!jobIdRef.current || cancelledRef.current) return
        const status = await pollExport(jobIdRef.current)
        setCurrent(status.completedRecords)
        setCurrentName(status.currentName ?? '')

        if (status.status === 'completed') {
          clearInterval(pollRef.current!)
          setDownloadUrl(`/api/exports/${jobIdRef.current}/download`)
          setPhase('done')
          setMessage(t('exportSuccess', { count: status.completedRecords }))
        } else if (status.status === 'cancelled') {
          clearInterval(pollRef.current!)
          setPhase('cancelled')
          setMessage(t('cancelled'))
        } else if (status.status === 'failed') {
          clearInterval(pollRef.current!)
          setPhase('failed')
          setMessage(status.error ?? t('exportFailed'))
        }
      }, 800)
    } catch (e) {
      setPhase('failed')
      setMessage(String(e))
    }
  }

  async function handleCancel() {
    cancelledRef.current = true
    if (pollRef.current) clearInterval(pollRef.current)
    if (jobIdRef.current) await cancelExport(jobIdRef.current)
    setPhase('cancelled')
    setMessage(t('cancelled'))
  }

  function handleClose() {
    resetJob()
    onClose()
  }

  function triggerDownload() {
    if (!downloadUrl) return
    const a = document.createElement('a')
    a.href = downloadUrl
    a.click()
  }

  const pct   = total > 0 ? Math.round((current / total) * 100) : 0
  const isDone = phase !== 'running'

  const iconEl = isDone
    ? (phase === 'done'
        ? <CheckCircle size={32} color="var(--color-success)" aria-hidden />
        : <XCircle    size={32} color="var(--color-danger)"  aria-hidden />)
    : <FileText size={32} color="var(--color-primary)" aria-hidden />

  const iconBg = isDone
    ? (phase === 'done' ? 'var(--color-success-bg)' : 'var(--color-danger-bg)')
    : 'var(--color-primary-light)'

  return (
    <Modal
      title=""
      onClose={isDone ? handleClose : () => {}}
      maxWidth={470}
      backdropClose={false}
      footer={
        isDone ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            {downloadUrl && (
              <Button variant="outline" onClick={triggerDownload}>
                ↓ Download
              </Button>
            )}
            <Button variant="primary" onClick={handleClose}>{t('done')}</Button>
          </div>
        ) : (
          <Button variant="danger" onClick={handleCancel}>{t('cancel')}</Button>
        )
      }
    >
      <div className={styles.body}>
        {/* Icon ring */}
        <div className={styles.iconRing} style={{ background: iconBg }}>
          {iconEl}
        </div>

        {/* Title */}
        <p className={styles.title} aria-live="assertive">
          {isDone ? message : t('generating')}
        </p>

        {/* Subtitle */}
        <p className={styles.sub} aria-live="polite">
          {!isDone && (
            currentName
              ? t('currentName', { current, total, name: currentName })
              : t('preparing')
          )}
        </p>

        {/* Progress bar */}
        <div
          className={styles.barTrack}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${pct}%`}
        >
          <div
            className={[styles.barFill, phase === 'failed' || phase === 'cancelled' ? styles.barError : ''].join(' ')}
            style={{ width: `${total > 0 ? (current / total) * 100 : 0}%`, transition: 'width 0.4s ease' }}
          />
        </div>

        <div className={styles.counts}>
          <span>{current} / {total}</span>
          <span>{pct}%</span>
        </div>
      </div>
    </Modal>
  )
}

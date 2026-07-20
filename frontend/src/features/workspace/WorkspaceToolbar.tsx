import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'
import { useAppStore } from '@/state/appStore'
import styles from './WorkspaceToolbar.module.css'

/**
 * Toolbar: page nav | zoom controls | record pill
 * Mirrors Flutter _Toolbar + _RecordPill exactly.
 */
export function WorkspaceToolbar() {
  const { t }        = useTranslation()
  const pageIndex    = useAppStore((s) => s.pageIndex)
  const pageCount    = useAppStore((s) => s.pageCount)
  const zoom         = useAppStore((s) => s.zoom)
  const recordIndex  = useAppStore((s) => s.recordIndex)
  const records      = useAppStore((s) => s.records)
  const hasPdf       = useAppStore((s) => s.templateFile !== null)

  const setPageIndex = useAppStore((s) => s.setPageIndex)
  const zoomIn       = useAppStore((s) => s.zoomIn)
  const zoomOut      = useAppStore((s) => s.zoomOut)
  const prevRecord   = useAppStore((s) => s.prevRecord)
  const nextRecord   = useAppStore((s) => s.nextRecord)

  const zoomPct = Math.round(zoom * 100)

  return (
    <div className={styles.bar} role="toolbar" aria-label="Preview controls">
      {/* Page navigation */}
      <button
        className={styles.iconBtn}
        onClick={() => setPageIndex(pageIndex - 1)}
        disabled={!hasPdf || pageIndex === 0}
        aria-label="Previous page"
      >
        <ChevronLeft size={16} aria-hidden />
      </button>

      <span className={styles.label} aria-live="polite">
        {hasPdf
          ? t('pageOf', { page: pageIndex + 1, total: pageCount })
          : t('noDocument')}
      </span>

      <button
        className={styles.iconBtn}
        onClick={() => setPageIndex(pageIndex + 1)}
        disabled={!hasPdf || pageIndex >= pageCount - 1}
        aria-label="Next page"
      >
        <ChevronRight size={16} aria-hidden />
      </button>

      <span className={styles.divider} aria-hidden />

      {/* Zoom */}
      <button
        className={styles.iconBtn}
        onClick={zoomOut}
        aria-label={t('rotation') + ' out'}
        title="Zoom out (Ctrl −)"
      >
        <ZoomOut size={16} aria-hidden />
      </button>

      <span className={styles.label}>{zoomPct}%</span>

      <button
        className={styles.iconBtn}
        onClick={zoomIn}
        aria-label="Zoom in"
        title="Zoom in (Ctrl =)"
      >
        <ZoomIn size={16} aria-hidden />
      </button>

      <span className={styles.spacer} aria-hidden />

      {/* Record pill */}
      <div className={styles.pill} role="group" aria-label="Record navigation">
        <button
          className={styles.pillBtn}
          onClick={prevRecord}
          disabled={records.length < 2}
          aria-label="Previous record"
        >
          <ChevronLeft size={14} aria-hidden />
        </button>

        <span className={styles.pillLabel} aria-live="polite">
          {records.length > 0
            ? t('recordOf', { record: recordIndex + 1, total: records.length })
            : t('noRecords')}
        </span>

        <button
          className={styles.pillBtn}
          onClick={nextRecord}
          disabled={records.length < 2}
          aria-label="Next record"
        >
          <ChevronRight size={14} aria-hidden />
        </button>
      </div>
    </div>
  )
}

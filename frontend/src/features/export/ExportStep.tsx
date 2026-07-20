import { useTranslation } from 'react-i18next'
import { useAppStore } from '@/state/appStore'
import type { ExportMethod } from '@/types'
import styles from './ExportStep.module.css'

const OPTIONS: { value: ExportMethod; labelKey: string }[] = [
  { value: 'individual', labelKey: 'individualOption' },
  { value: 'zip',        labelKey: 'zipOption'        },
  { value: 'merged',     labelKey: 'mergedOption'     },
]

export function ExportStep() {
  const { t }           = useTranslation()
  const exportMethod    = useAppStore((s) => s.exportMethod)
  const setExportMethod = useAppStore((s) => s.setExportMethod)

  return (
    <div className={styles.wrap}>
      <p className={styles.hint}>{t('folderOrZip')}</p>
      <div role="radiogroup" aria-label={t('exportMethod')} className={styles.options}>
        {OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className={[styles.opt, exportMethod === opt.value ? styles.optActive : ''].join(' ')}
          >
            <input
              type="radio"
              name="exportMethod"
              value={opt.value}
              checked={exportMethod === opt.value}
              onChange={() => setExportMethod(opt.value)}
              className="sr-only"
            />
            <span className={styles.radio} aria-hidden>
              {exportMethod === opt.value ? '●' : '○'}
            </span>
            <span className={styles.label}>{t(opt.labelKey)}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

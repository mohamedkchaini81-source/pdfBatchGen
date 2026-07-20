import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Table2, Download } from 'lucide-react'
import { useAppStore } from '@/state/appStore'
import { UploadZone } from '@/components/forms/UploadZone'
import { parseCsvBytes, readFileAsBytes, generateSampleCsv } from '@/utils/csv'
import styles from './CsvImportStep.module.css'

export function CsvImportStep() {
  const { t }      = useTranslation()
  const setRecords = useAppStore((s) => s.setRecords)
  const clearRecords = useAppStore((s) => s.clearRecords)
  const records    = useAppStore((s) => s.records)
  const inputRef   = useRef<HTMLInputElement>(null)
  // Track csv file name separately in local state via a ref trick
  const csvFileRef = useRef<string>('')

  useEffect(() => {
    const handler = () => inputRef.current?.click()
    window.addEventListener('shortcut:openCsv', handler)
    return () => window.removeEventListener('shortcut:openCsv', handler)
  }, [])

  async function loadFile(file: File) {
    csvFileRef.current = file.name
    const bytes  = await readFileAsBytes(file)
    const result = parseCsvBytes(bytes)
    if (!result.success) {
      if (result.missingField) {
        alert(t('csvMissing', { fields: result.foundFields?.join(', ') ?? '' }))
      } else {
        alert(t('csvError', { message: result.error ?? '' }))
      }
      return
    }
    setRecords(result.records, result.hasRoleColumn)
  }

  function downloadSample() {
    const blob = generateSampleCsv()
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'names-sample.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={styles.wrap}>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="sr-only"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) loadFile(f); e.target.value = '' }}
        aria-label={t('chooseCsv')}
      />

      <UploadZone
        label={t('chooseCsv')}
        subtitle={t('nameHeader')}
        icon={Table2}
        accept=".csv"
        onFileSelected={loadFile}
        onBrowse={() => inputRef.current?.click()}
      />

      {records.length > 0 && (
        <div className={styles.loaded} aria-live="polite">
          <Table2 size={14} aria-hidden />
          <span className="truncate">
            {t('csvLoaded', { file: csvFileRef.current || 'CSV', count: records.length })}
          </span>
          <button
            className={styles.clearBtn}
            onClick={clearRecords}
            aria-label="Remove CSV"
          >✕</button>
        </div>
      )}

      <p className={styles.hint}>{t('mixedSupported')}</p>

      <button className={styles.sampleBtn} onClick={downloadSample} type="button">
        <Download size={13} aria-hidden />
        {t('sampleCsv')}
      </button>
    </div>
  )
}

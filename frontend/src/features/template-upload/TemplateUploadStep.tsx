import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { FileText } from 'lucide-react'
import * as pdfjs from 'pdfjs-dist'
import { useAppStore } from '@/state/appStore'
import { UploadZone } from '@/components/forms/UploadZone'
import styles from './TemplateUploadStep.module.css'

// Worker is configured once globally — never re-set it per component mount
if (!pdfjs.GlobalWorkerOptions.workerSrc) {
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString()
}

export function TemplateUploadStep() {
  const { t }         = useTranslation()
  const setTemplate   = useAppStore((s) => s.setTemplate)
  const clearTemplate = useAppStore((s) => s.clearTemplate)
  const pdfFileName   = useAppStore((s) => s.pdfFileName)
  const pageCount     = useAppStore((s) => s.pageCount)
  const pageIndex     = useAppStore((s) => s.pageIndex)
  const setPageIndex  = useAppStore((s) => s.setPageIndex)
  const inputRef      = useRef<HTMLInputElement>(null)

  // Keyboard shortcut Ctrl+O
  useEffect(() => {
    const handler = () => inputRef.current?.click()
    window.addEventListener('shortcut:openPdf', handler)
    return () => window.removeEventListener('shortcut:openPdf', handler)
  }, [])

  async function loadFile(file: File) {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert(t('pdfError', { message: 'Only .pdf files are supported.' }))
      return
    }
    try {
      // Use a fresh ArrayBuffer each time — do NOT reuse across calls
      const buf  = await file.arrayBuffer()
      // Open with a copy so this parse doesn't interfere with the canvas renderer
      const doc  = await pdfjs.getDocument({ data: new Uint8Array(buf) }).promise
      const page = await doc.getPage(1)
      const vp   = page.getViewport({ scale: 1 })
      const count = doc.numPages
      await doc.destroy()   // release immediately — canvas will open its own instance

      const objectUrl = URL.createObjectURL(file)
      setTemplate(file, objectUrl, count, vp.width, vp.height)
    } catch (e) {
      alert(t('pdfError', { message: String(e) }))
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) loadFile(file)
    e.target.value = ''
  }

  return (
    <div className={styles.wrap}>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="sr-only"
        onChange={handleInput}
        aria-label={t('choosePdf')}
      />

      <UploadZone
        label={t('choosePdf')}
        subtitle={t('pdfHelp')}
        icon={FileText}
        accept=".pdf"
        onFileSelected={loadFile}
        onBrowse={() => inputRef.current?.click()}
      />

      {pdfFileName && (
        <div className={styles.loaded}>
          <FileText size={14} aria-hidden />
          <span className="truncate">
            {t('pdfLoaded', { file: pdfFileName, pages: pageCount })}
          </span>
          <button
            className={styles.clearBtn}
            onClick={clearTemplate}
            aria-label="Remove PDF"
          >✕</button>
        </div>
      )}

      {pageCount > 1 && (
        <div className={styles.pageRow}>
          <label className={styles.label}>{t('targetPage')}</label>
          <div className={styles.pageNav}>
            <button
              disabled={pageIndex === 0}
              onClick={() => setPageIndex(pageIndex - 1)}
              aria-label="Previous page"
            >‹</button>
            <span>{t('pageOf', { page: pageIndex + 1, total: pageCount })}</span>
            <button
              disabled={pageIndex === pageCount - 1}
              onClick={() => setPageIndex(pageIndex + 1)}
              aria-label="Next page"
            >›</button>
          </div>
        </div>
      )}
    </div>
  )
}

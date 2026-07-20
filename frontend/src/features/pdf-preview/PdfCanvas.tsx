import { useEffect, useRef, useState } from 'react'
import * as pdfjs from 'pdfjs-dist'
import type { RenderTask, PDFDocumentProxy } from 'pdfjs-dist'
import { useAppStore } from '@/state/appStore'
import { RulerOverlay } from '@/features/rulers/RulerOverlay'
import { TextPreviewLayer } from './TextPreviewLayer'
import styles from './PdfCanvas.module.css'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

/**
 * PDF canvas with layered overlays.
 *
 * Race-condition fix:
 *   - A single PDFDocumentProxy is cached per File object (avoids re-parsing
 *     the PDF on every zoom/page change).
 *   - Any in-progress render task is cancelled before starting a new one.
 *   - Stale async results are discarded via a `cancelled` flag.
 */
export function PdfCanvas() {
  const templateFile = useAppStore((s) => s.templateFile)
  const pageIndex    = useAppStore((s) => s.pageIndex)
  const zoom         = useAppStore((s) => s.zoom)

  const canvasRef      = useRef<HTMLCanvasElement>(null)
  const renderTaskRef  = useRef<RenderTask | null>(null)
  const pdfCacheRef    = useRef<{ file: File; doc: PDFDocumentProxy } | null>(null)

  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  useEffect(() => {
    if (!templateFile || !canvasRef.current) return

    let cancelled = false

    async function render() {
      // Cancel any in-progress render task first
      if (renderTaskRef.current) {
        try { renderTaskRef.current.cancel() } catch (_) {}
        renderTaskRef.current = null
      }

      setLoading(true)
      setError(null)

      try {
        // Reuse cached PDF document if same file, otherwise parse fresh
        let doc: PDFDocumentProxy
        if (pdfCacheRef.current && pdfCacheRef.current.file === templateFile) {
          doc = pdfCacheRef.current.doc
        } else {
          const buf = await (templateFile as File).arrayBuffer()
          if (cancelled) return
          doc = await pdfjs.getDocument({ data: buf }).promise
          if (cancelled) { doc.destroy(); return }
          pdfCacheRef.current?.doc.destroy()
          pdfCacheRef.current = { file: templateFile as File, doc }
        }

        const page = await doc.getPage(pageIndex + 1)
        if (cancelled) return

        const vp     = page.getViewport({ scale: zoom })
        const canvas = canvasRef.current!
        const ctx    = canvas.getContext('2d')!

        // Resize canvas — this also clears it
        canvas.width  = vp.width
        canvas.height = vp.height

        if (!cancelled) {
          setContainerSize({ w: vp.width, h: vp.height })
        }

        const task = page.render({ canvasContext: ctx, viewport: vp })
        renderTaskRef.current = task

        await task.promise
        renderTaskRef.current = null

      } catch (e: unknown) {
        // Ignore cancellation errors — they are expected and not user-visible
        const msg = String(e)
        if (
          cancelled ||
          msg.includes('Rendering cancelled') ||
          msg.includes('render task was cancelled') ||
          msg.includes('Cannot use the same canvas')
        ) return
        if (!cancelled) setError(msg)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    render()

    return () => {
      cancelled = true
      if (renderTaskRef.current) {
        try { renderTaskRef.current.cancel() } catch (_) {}
        renderTaskRef.current = null
      }
    }
  }, [templateFile, pageIndex, zoom])

  // Destroy cached PDF document when component unmounts
  useEffect(() => {
    return () => {
      pdfCacheRef.current?.doc.destroy()
      pdfCacheRef.current = null
    }
  }, [])

  return (
    <div className={styles.viewport}>
      {loading && (
        <div className={styles.loading} aria-live="polite" aria-label="Loading PDF">
          Loading…
        </div>
      )}
      {error && (
        <div className={styles.error} aria-live="assertive">
          {error}
        </div>
      )}

      <div
        className={styles.pageContainer}
        style={{ width: containerSize.w || undefined, height: containerSize.h || undefined }}
        aria-label="PDF preview"
      >
        {/* Layer 1 — PDF raster */}
        <canvas ref={canvasRef} className={styles.layer} aria-hidden />

        {/* Layer 2 — Text preview */}
        {containerSize.w > 0 && (
          <TextPreviewLayer containerW={containerSize.w} containerH={containerSize.h} />
        )}

        {/* Layers 3 & 4 — Rulers */}
        {containerSize.w > 0 && (
          <>
            <RulerOverlay type="name" containerW={containerSize.w} containerH={containerSize.h} />
            <RulerOverlay type="role" containerW={containerSize.w} containerH={containerSize.h} />
          </>
        )}
      </div>
    </div>
  )
}

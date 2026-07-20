import { useState, useEffect } from 'react'
import * as pdfjs from 'pdfjs-dist'

interface PdfDimensions {
  width:  number
  height: number
  pages:  number
}

/**
 * Extract page dimensions from a PDF File object.
 * Returns null while loading or on error.
 */
export function usePdfDimensions(file: File | null): PdfDimensions | null {
  const [dims, setDims] = useState<PdfDimensions | null>(null)

  useEffect(() => {
    if (!file) { setDims(null); return }

    let cancelled = false

    file.arrayBuffer().then((buf) =>
      pdfjs.getDocument({ data: buf }).promise
    ).then(async (pdf) => {
      const page = await pdf.getPage(1)
      const vp   = page.getViewport({ scale: 1 })
      if (!cancelled) {
        setDims({ width: vp.width, height: vp.height, pages: pdf.numPages })
      }
    }).catch(() => {
      if (!cancelled) setDims(null)
    })

    return () => { cancelled = true }
  }, [file])

  return dims
}

/**
 * Binary-search font fitting — browser equivalent of Flutter's
 * computeFittedSize() and stamp_pdf.py fit_size().
 *
 * Uses a canvas 2D context for measurement (no DOM required).
 * Rotation is accounted for the same way as the Python backend.
 */
export function computeFittedSize(params: {
  text:        string
  fontFamily:  string
  fontWeight:  number
  fontStyle:   'normal' | 'italic'
  boxW:        number   // PDF points (or px — same proportion)
  boxH:        number
  maxFontSize: number
  rotation:    number   // degrees
}): number {
  const { text, fontFamily, fontWeight, fontStyle, boxW, boxH, maxFontSize, rotation } = params

  if (!text || boxW <= 0 || boxH <= 0) return 2

  const pad = Math.min(8, Math.max(2, Math.min(boxW, boxH) * 0.05))
  const aw  = Math.max(1, boxW - pad * 2)
  const ah  = Math.max(1, boxH - pad * 2)
  const rot = (rotation * Math.PI) / 180

  const canvas  = document.createElement('canvas')
  const ctx     = canvas.getContext('2d')!

  let lo = 2, hi = maxFontSize

  for (let i = 0; i < 20; i++) {
    const mid  = (lo + hi) / 2
    ctx.font   = `${fontStyle} ${fontWeight} ${mid}px ${fontFamily}`
    const tw   = ctx.measureText(text).width
    const th   = mid * 1.2
    const rw   = Math.abs(tw * Math.cos(rot)) + Math.abs(th * Math.sin(rot))
    const rh   = Math.abs(tw * Math.sin(rot)) + Math.abs(th * Math.cos(rot))
    if (rw <= aw && rh <= ah) { lo = mid } else { hi = mid }
  }

  return Math.max(2, lo)
}

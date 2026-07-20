import type { RulerBox } from '@/types'

const MIN_SPAN = 0.02 // minimum 2% of page dimension

/**
 * Clamp a ruler so left < right and top < bottom,
 * with a minimum gap of MIN_SPAN on each axis.
 */
export function clampRuler(r: RulerBox): RulerBox {
  const left   = Math.max(0, Math.min(r.left,   r.right  - MIN_SPAN))
  const right  = Math.min(1, Math.max(r.right,  r.left   + MIN_SPAN))
  const top    = Math.max(0, Math.min(r.top,    r.bottom - MIN_SPAN))
  const bottom = Math.min(1, Math.max(r.bottom, r.top    + MIN_SPAN))
  return { left, right, top, bottom }
}

/**
 * Move an edge of a ruler by a delta in normalized units.
 * Preserves the min-span invariant.
 */
export function moveEdge(
  ruler: RulerBox,
  edge: 'left' | 'right' | 'top' | 'bottom',
  newNorm: number
): RulerBox {
  const r = { ...ruler }
  switch (edge) {
    case 'left':   r.left   = Math.max(0,   Math.min(newNorm, r.right  - MIN_SPAN)); break
    case 'right':  r.right  = Math.min(1,   Math.max(newNorm, r.left   + MIN_SPAN)); break
    case 'top':    r.top    = Math.max(0,   Math.min(newNorm, r.bottom - MIN_SPAN)); break
    case 'bottom': r.bottom = Math.min(1,   Math.max(newNorm, r.top    + MIN_SPAN)); break
  }
  return r
}

/**
 * Translate an entire ruler box by (dx, dy) in normalized units.
 * Keeps the box fully within [0, 1].
 */
export function translateRuler(ruler: RulerBox, dx: number, dy: number): RulerBox {
  const w = ruler.right  - ruler.left
  const h = ruler.bottom - ruler.top
  let left = ruler.left + dx
  let top  = ruler.top  + dy
  // Clamp translation so box stays inside page
  left = Math.max(0, Math.min(left, 1 - w))
  top  = Math.max(0, Math.min(top,  1 - h))
  return { left, right: left + w, top, bottom: top + h }
}

/**
 * When role is empty and a role column exists, expand the name box
 * to cover both name and role areas. Mirrors Flutter combinedNameRuler().
 */
export function combinedRuler(nameRuler: RulerBox, roleRuler: RulerBox): RulerBox {
  return {
    left:   Math.min(nameRuler.left,   roleRuler.left),
    right:  Math.max(nameRuler.right,  roleRuler.right),
    top:    Math.min(nameRuler.top,    roleRuler.top),
    bottom: Math.max(nameRuler.bottom, roleRuler.bottom),
  }
}

/**
 * Convert a normalized ruler to absolute CSS pixels given a
 * rendered container size.
 */
export function rulerToPx(
  ruler: RulerBox,
  containerW: number,
  containerH: number
): { x: number; y: number; width: number; height: number } {
  return {
    x:      ruler.left  * containerW,
    y:      ruler.top   * containerH,
    width:  (ruler.right  - ruler.left) * containerW,
    height: (ruler.bottom - ruler.top)  * containerH,
  }
}

/**
 * Convert absolute CSS pixel delta to normalized ruler delta.
 */
export function pxToNorm(px: number, containerSize: number): number {
  return px / containerSize
}

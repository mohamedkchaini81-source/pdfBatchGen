import { describe, it, expect } from 'vitest'
import { clampRuler, moveEdge, translateRuler, combinedRuler, rulerToPx } from '@/utils/ruler'
import type { RulerBox } from '@/types'

const base: RulerBox = { left: 0.2, right: 0.8, top: 0.3, bottom: 0.7 }

describe('clampRuler', () => {
  it('preserves valid ruler unchanged', () => {
    expect(clampRuler(base)).toEqual(base)
  })

  it('enforces left < right', () => {
    const r = clampRuler({ left: 0.8, right: 0.2, top: 0.3, bottom: 0.7 })
    expect(r.left).toBeLessThan(r.right)
  })

  it('enforces top < bottom', () => {
    const r = clampRuler({ left: 0.2, right: 0.8, top: 0.9, bottom: 0.1 })
    expect(r.top).toBeLessThan(r.bottom)
  })
})

describe('moveEdge', () => {
  it('moves left edge', () => {
    const r = moveEdge(base, 'left', 0.1)
    expect(r.left).toBe(0.1)
    expect(r.right).toBe(0.8) // unchanged
  })

  it('does not let left cross right', () => {
    const r = moveEdge(base, 'left', 0.9)
    expect(r.left).toBeLessThan(r.right)
  })

  it('moves bottom edge', () => {
    const r = moveEdge(base, 'bottom', 0.9)
    expect(r.bottom).toBe(0.9)
  })
})

describe('translateRuler', () => {
  it('moves box by delta', () => {
    const r = translateRuler(base, 0.1, 0.05)
    expect(r.left).toBeCloseTo(0.3)
    expect(r.top).toBeCloseTo(0.35)
    expect(r.right - r.left).toBeCloseTo(base.right - base.left)
    expect(r.bottom - r.top).toBeCloseTo(base.bottom - base.top)
  })

  it('keeps box inside page boundaries', () => {
    const r = translateRuler(base, 10, 10)
    expect(r.right).toBeLessThanOrEqual(1)
    expect(r.bottom).toBeLessThanOrEqual(1)
  })
})

describe('combinedRuler', () => {
  const name: RulerBox = { left: 0.18, right: 0.82, top: 0.43, bottom: 0.58 }
  const role: RulerBox = { left: 0.18, right: 0.82, top: 0.60, bottom: 0.70 }

  it('expands to cover both boxes', () => {
    const c = combinedRuler(name, role)
    expect(c.top).toBe(Math.min(name.top, role.top))
    expect(c.bottom).toBe(Math.max(name.bottom, role.bottom))
    expect(c.left).toBe(Math.min(name.left, role.left))
    expect(c.right).toBe(Math.max(name.right, role.right))
  })
})

describe('rulerToPx', () => {
  it('converts normalized to pixels correctly', () => {
    const px = rulerToPx({ left: 0.1, right: 0.9, top: 0.2, bottom: 0.8 }, 1000, 500)
    expect(px.x).toBe(100)
    expect(px.y).toBe(100)
    expect(px.width).toBe(800)
    expect(px.height).toBeCloseTo(300)
  })
})

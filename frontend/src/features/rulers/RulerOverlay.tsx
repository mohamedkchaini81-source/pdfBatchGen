import { useCallback, useEffect, useRef } from 'react'
import { useAppStore } from '@/state/appStore'
import { rulerToPx, moveEdge, translateRuler, pxToNorm, clampRuler } from '@/utils/ruler'
import type { RulerBox } from '@/types'
import styles from './RulerOverlay.module.css'

type RulerType = 'name' | 'role'

interface Props {
  type:       RulerType
  containerW: number
  containerH: number
}

type Handle = 'move' | 'left' | 'right' | 'top' | 'bottom' |
              'tl' | 'tr' | 'bl' | 'br'

const KB_STEP      = 0.01
const KB_STEP_FAST = 0.05

/**
 * Ruler overlay — draggable + resizable text placement box.
 *
 * Rules of Hooks fix: ALL hooks are called unconditionally at the top.
 * The early return for "no role column" is moved AFTER all hook calls.
 */
export function RulerOverlay({ type, containerW, containerH }: Props) {
  // ── All hooks called unconditionally ─────────────────────────────────────
  const ruler    = useAppStore((s) => type === 'name' ? s.nameField.ruler : s.roleField.ruler)
  const setRuler = useAppStore((s) => type === 'name' ? s.setNameRuler    : s.setRoleRuler)
  const hasRole  = useAppStore((s) => s.hasRoleColumn)

  const dragRef = useRef<{
    handle:      Handle
    startX:      number
    startY:      number
    startRuler:  RulerBox
  } | null>(null)

  const boxRef = useRef<HTMLDivElement>(null)

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!dragRef.current) return
    const { handle, startX, startY, startRuler } = dragRef.current
    const dx = pxToNorm(e.clientX - startX, containerW)
    const dy = pxToNorm(e.clientY - startY, containerH)

    let next = { ...startRuler }

    if (handle === 'move') {
      next = translateRuler(startRuler, dx, dy)
    } else {
      if (handle === 'left'   || handle === 'tl' || handle === 'bl')
        next = moveEdge(next, 'left',   startRuler.left   + dx)
      if (handle === 'right'  || handle === 'tr' || handle === 'br')
        next = moveEdge(next, 'right',  startRuler.right  + dx)
      if (handle === 'top'    || handle === 'tl' || handle === 'tr')
        next = moveEdge(next, 'top',    startRuler.top    + dy)
      if (handle === 'bottom' || handle === 'bl' || handle === 'br')
        next = moveEdge(next, 'bottom', startRuler.bottom + dy)
    }
    setRuler(clampRuler(next))
  }, [containerW, containerH, setRuler])

  const onPointerUp = useCallback(() => { dragRef.current = null }, [])

  useEffect(() => {
    window.addEventListener('pointermove',   onPointerMove)
    window.addEventListener('pointerup',     onPointerUp)
    window.addEventListener('pointercancel', onPointerUp)
    return () => {
      window.removeEventListener('pointermove',   onPointerMove)
      window.removeEventListener('pointerup',     onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
    }
  }, [onPointerMove, onPointerUp])

  const onPointerDown = useCallback((e: React.PointerEvent, handle: Handle) => {
    e.stopPropagation()
    e.preventDefault()
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    dragRef.current = { handle, startX: e.clientX, startY: e.clientY, startRuler: { ...ruler } }
  }, [ruler])

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    const step = e.shiftKey ? KB_STEP_FAST : KB_STEP
    let next = { ...ruler }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); next = translateRuler(ruler, -step,  0)    }
    if (e.key === 'ArrowRight') { e.preventDefault(); next = translateRuler(ruler,  step,  0)    }
    if (e.key === 'ArrowUp')    { e.preventDefault(); next = translateRuler(ruler,  0,    -step) }
    if (e.key === 'ArrowDown')  { e.preventDefault(); next = translateRuler(ruler,  0,     step) }
    if (next !== ruler) setRuler(clampRuler(next))
  }, [ruler, setRuler])

  // ── Early return AFTER all hooks ─────────────────────────────────────────
  if (type === 'role' && !hasRole) return null

  // ── Derived values ────────────────────────────────────────────────────────
  const rect  = rulerToPx(ruler, containerW, containerH)
  const color = type === 'name' ? 'var(--color-ruler-name)' : 'var(--color-ruler-role)'
  const label = type === 'name' ? 'Name' : 'Role'

  return (
    <div className={styles.layer} aria-hidden={false}>
      <div
        ref={boxRef}
        className={styles.box}
        style={{
          left:        rect.x,
          top:         rect.y,
          width:       rect.width,
          height:      rect.height,
          borderColor: color,
        }}
        onPointerDown={(e) => onPointerDown(e, 'move')}
        onKeyDown={onKeyDown}
        tabIndex={0}
        role="slider"
        aria-label={`${label} text placement ruler`}
        aria-valuetext={`Left ${Math.round(ruler.left * 100)}% Right ${Math.round(ruler.right * 100)}% Top ${Math.round(ruler.top * 100)}% Bottom ${Math.round(ruler.bottom * 100)}%`}
      >
        {/* Label badge */}
        <span className={styles.badge} style={{ background: color }}>
          {label}
        </span>

        {/* Edge handles */}
        {(['left', 'right', 'top', 'bottom'] as const).map((h) => (
          <div
            key={h}
            className={[styles.handle, styles[`handle-${h}`]].join(' ')}
            style={{ background: color }}
            onPointerDown={(e) => onPointerDown(e, h)}
            aria-label={`Resize ${label} ruler ${h} edge`}
          />
        ))}

        {/* Corner handles */}
        {(['tl', 'tr', 'bl', 'br'] as const).map((h) => (
          <div
            key={h}
            className={[styles.corner, styles[`corner-${h}`]].join(' ')}
            style={{ background: color, borderColor: color }}
            onPointerDown={(e) => onPointerDown(e, h)}
            aria-label={`Resize ${label} ruler ${h} corner`}
          />
        ))}
      </div>
    </div>
  )
}

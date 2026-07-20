import { useCallback } from 'react'
import { translateRuler, clampRuler } from '@/utils/ruler'
import type { RulerBox } from '@/types'

const STEP      = 0.01
const STEP_FAST = 0.05

/**
 * Returns a keydown handler that moves a ruler with arrow keys.
 * Shift+arrow moves 5× faster.
 */
export function useKeyboardRuler(
  ruler: RulerBox,
  setRuler: (r: RulerBox) => void
) {
  return useCallback((e: React.KeyboardEvent) => {
    const step = e.shiftKey ? STEP_FAST : STEP
    let next = ruler
    if (e.key === 'ArrowLeft')  { e.preventDefault(); next = translateRuler(ruler, -step, 0)    }
    if (e.key === 'ArrowRight') { e.preventDefault(); next = translateRuler(ruler,  step, 0)    }
    if (e.key === 'ArrowUp')    { e.preventDefault(); next = translateRuler(ruler,  0,   -step) }
    if (e.key === 'ArrowDown')  { e.preventDefault(); next = translateRuler(ruler,  0,    step) }
    if (next !== ruler) setRuler(clampRuler(next))
  }, [ruler, setRuler])
}

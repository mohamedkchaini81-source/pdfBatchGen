/**
 * Validate and normalise a hex color string.
 * Accepts #RGB and #RRGGBB. Returns '#RRGGBB' or null.
 */
export function normaliseHex(raw: string): string | null {
  let v = raw.trim().replace(/^#/, '')
  if (v.length === 3 && /^[0-9a-fA-F]{3}$/.test(v)) {
    v = v[0] + v[0] + v[1] + v[1] + v[2] + v[2]
  }
  if (v.length === 6 && /^[0-9a-fA-F]{6}$/.test(v)) {
    return '#' + v.toUpperCase()
  }
  return null
}

/**
 * Convert hex color to 'r, g, b' string for CSS rgba().
 */
export function hexToRgb(hex: string): string {
  const norm = normaliseHex(hex) ?? '#111111'
  const r = parseInt(norm.slice(1, 3), 16)
  const g = parseInt(norm.slice(3, 5), 16)
  const b = parseInt(norm.slice(5, 7), 16)
  return `${r}, ${g}, ${b}`
}

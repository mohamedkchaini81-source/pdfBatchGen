/**
 * Sanitize a string into a safe filename segment.
 * Matches Flutter's sanitizeFilename() behavior exactly.
 * Removes: < > : " / \ | ? * and control chars 0x00–0x1F
 * Trims whitespace, replaces runs of spaces, caps at 120 chars.
 */
export function sanitizeFilename(s: string): string {
  const cleaned = s
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
  if (!cleaned) return 'certificate'
  return cleaned.length > 120 ? cleaned.slice(0, 120) : cleaned
}

/**
 * Build an output filename from index + name, with duplicate tracking.
 * Returns e.g. "001-Ahmed Feki.pdf" or "001-Ahmed Feki-2.pdf".
 */
export function buildFilename(
  index: number,
  name: string,
  used: Map<string, number>
): string {
  const base   = sanitizeFilename(name)
  const count  = (used.get(base) ?? 0) + 1
  used.set(base, count)
  const suffix = count > 1 ? `-${count}` : ''
  const num    = String(index + 1).padStart(3, '0')
  return `${num}-${base}${suffix}.pdf`
}

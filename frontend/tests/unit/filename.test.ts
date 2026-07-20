import { describe, it, expect } from 'vitest'
import { sanitizeFilename, buildFilename } from '@/utils/filename'

describe('sanitizeFilename', () => {
  it('passes clean names through', () => {
    expect(sanitizeFilename('Ahmed Feki')).toBe('Ahmed Feki')
  })

  it('removes forbidden characters', () => {
    const r = sanitizeFilename('file<name>:bad/path')
    expect(r).not.toContain('<')
    expect(r).not.toContain('>')
    expect(r).not.toContain(':')
    expect(r).not.toContain('/')
  })

  it('returns fallback for empty input', () => {
    expect(sanitizeFilename('')).toBe('certificate')
    expect(sanitizeFilename('   ')).toBe('certificate')
  })

  it('truncates at 120 characters', () => {
    expect(sanitizeFilename('A'.repeat(200)).length).toBe(120)
  })

  it('preserves Arabic characters', () => {
    const r = sanitizeFilename('أحمد الفقي')
    expect(r).toContain('أحمد')
  })
})

describe('buildFilename', () => {
  it('formats with padded index', () => {
    const used = new Map<string, number>()
    expect(buildFilename(0, 'Ahmed', used)).toBe('001-Ahmed.pdf')
    expect(buildFilename(9, 'Sara',  used)).toBe('010-Sara.pdf')
  })

  it('adds suffix for duplicates', () => {
    const used = new Map<string, number>()
    buildFilename(0, 'Ahmed', used)
    expect(buildFilename(1, 'Ahmed', used)).toBe('002-Ahmed-2.pdf')
    expect(buildFilename(2, 'Ahmed', used)).toBe('003-Ahmed-3.pdf')
  })

  it('tracks duplicates independently per name', () => {
    const used = new Map<string, number>()
    expect(buildFilename(0, 'Ahmed', used)).toBe('001-Ahmed.pdf')
    expect(buildFilename(1, 'Sara',  used)).toBe('002-Sara.pdf')
    expect(buildFilename(2, 'Ahmed', used)).toBe('003-Ahmed-2.pdf')
  })
})

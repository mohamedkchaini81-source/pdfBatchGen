import { describe, it, expect } from 'vitest'
import { parseCsvBytes } from '@/utils/csv'

function toBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str)
}

describe('parseCsvBytes', () => {
  it('parses basic CSV', () => {
    const result = parseCsvBytes(toBytes('name\nAhmed\nSara'))
    expect(result.success).toBe(true)
    expect(result.records).toHaveLength(2)
    expect(result.records[0].name).toBe('Ahmed')
  })

  it('strips UTF-8 BOM', () => {
    const bom  = new Uint8Array([0xEF, 0xBB, 0xBF])
    const rest = toBytes('name\nAhmed')
    const combined = new Uint8Array(bom.length + rest.length)
    combined.set(bom, 0)
    combined.set(rest, bom.length)
    const result = parseCsvBytes(combined)
    expect(result.success).toBe(true)
    expect(result.records[0].name).toBe('Ahmed')
  })

  it('detects optional role column', () => {
    const result = parseCsvBytes(toBytes('name,role\nAhmed,Manager\nSara,'))
    expect(result.hasRoleColumn).toBe(true)
    expect(result.records[0].role).toBe('Manager')
    expect(result.records[1].role).toBe('')
  })

  it('reports missing name column', () => {
    const result = parseCsvBytes(toBytes('fullname\nAhmed'))
    expect(result.success).toBe(false)
    expect(result.missingField).toBe('name')
  })

  it('ignores blank rows', () => {
    const result = parseCsvBytes(toBytes('name\nAhmed\n\n\nSara'))
    expect(result.records).toHaveLength(2)
  })

  it('preserves Arabic names', () => {
    const result = parseCsvBytes(toBytes('name\nأحمد الفقي'))
    expect(result.success).toBe(true)
    expect(result.records[0].name).toBe('أحمد الفقي')
  })

  it('returns error for empty file', () => {
    const result = parseCsvBytes(toBytes('name\n'))
    expect(result.success).toBe(false)
  })

  it('is case-insensitive for headers', () => {
    const result = parseCsvBytes(toBytes('Name,Role\nAhmed,Manager'))
    expect(result.success).toBe(true)
    expect(result.records[0].name).toBe('Ahmed')
  })
})

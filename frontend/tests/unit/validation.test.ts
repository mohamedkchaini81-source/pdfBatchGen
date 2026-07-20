import { describe, it, expect } from 'vitest'
import { validate } from '@/utils/validation'
import type { AppState } from '@/types'
import { RULER_NAME_INITIAL, RULER_ROLE_INITIAL } from '@/types'

const baseState: AppState = {
  templateFile:      null,
  templateObjectUrl: null,
  pdfFileName:       '',
  pageCount:         0,
  pageIndex:         0,
  pageWidth:         595,
  pageHeight:        842,
  zoom:              1,
  records:           [],
  recordIndex:       0,
  hasRoleColumn:     false,
  textMode:          'auto',
  locale:            'en',
  nameField: {
    ruler:       RULER_NAME_INITIAL,
    arabicFont:  null,
    englishFont: null,
    maxFontSize: 48,
    colorHex:    '#111111',
    rotation:    0,
    fontWeight:  400,
    fontStyle:   'normal',
  },
  roleField: {
    ruler:       RULER_ROLE_INITIAL,
    arabicFont:  null,
    englishFont: null,
    maxFontSize: 32,
    colorHex:    '#444444',
    rotation:    0,
    fontWeight:  400,
    fontStyle:   'normal',
  },
  exportMethod: 'individual',
  exportJob: {
    jobId: null, status: 'idle',
    completedRecords: 0, totalRecords: 0, percentage: 0, error: null,
  },
}

describe('validate', () => {
  it('reports needsPdf when no template', () => {
    const v = validate(baseState)
    expect(v.errors.some((e) => e.key === 'needsPdf')).toBe(true)
    expect(v.isReady).toBe(false)
  })

  it('reports needsCsv when no records', () => {
    const s = { ...baseState, templateFile: new File([], 't.pdf'), pageWidth: 595 }
    const v = validate(s)
    expect(v.errors.some((e) => e.key === 'needsCsv')).toBe(true)
  })

  it('reports needsArabic when Arabic names and no Arabic font', () => {
    const s = {
      ...baseState,
      templateFile: new File([], 't.pdf'),
      pageWidth: 595,
      records: [{ id: '1', name: 'أحمد', role: '' }],
      textMode: 'auto' as const,
    }
    const v = validate(s)
    expect(v.errors.some((e) => e.key === 'needsArabic')).toBe(true)
  })

  it('reports needsEnglish when English names and no English font', () => {
    const s = {
      ...baseState,
      templateFile: new File([], 't.pdf'),
      pageWidth: 595,
      records: [{ id: '1', name: 'Ahmed', role: '' }],
      textMode: 'auto' as const,
    }
    const v = validate(s)
    expect(v.errors.some((e) => e.key === 'needsEnglish')).toBe(true)
  })

  it('is ready when all conditions met (latin, en font loaded)', () => {
    const mockFont = { id: '1', file: new File([], 'f.ttf'), fileName: 'f.ttf', objectUrl: '' }
    const s = {
      ...baseState,
      templateFile: new File([], 't.pdf'),
      pageWidth: 595,
      records: [{ id: '1', name: 'Ahmed', role: '' }],
      textMode: 'en' as const,
      nameField: { ...baseState.nameField, englishFont: mockFont },
    }
    const v = validate(s)
    expect(v.isReady).toBe(true)
  })
})

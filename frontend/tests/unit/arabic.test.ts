import { describe, it, expect } from 'vitest'
import { containsArabic, textLanguage, requiredLanguages } from '@/utils/arabic'

describe('containsArabic', () => {
  it('detects Arabic script', () => {
    expect(containsArabic('أحمد الفقي')).toBe(true)
    expect(containsArabic('سارة')).toBe(true)
  })

  it('returns false for Latin', () => {
    expect(containsArabic('Ahmed Feki')).toBe(false)
    expect(containsArabic('Sara Ayadi')).toBe(false)
  })

  it('detects mixed strings as Arabic', () => {
    expect(containsArabic('Ahmed أحمد')).toBe(true)
  })

  it('returns false for empty string', () => {
    expect(containsArabic('')).toBe(false)
  })
})

describe('textLanguage', () => {
  it('respects forced ar mode', () => {
    expect(textLanguage('Hello', 'ar')).toBe('ar')
  })

  it('respects forced en mode', () => {
    expect(textLanguage('أحمد', 'en')).toBe('en')
  })

  it('auto-detects Arabic', () => {
    expect(textLanguage('أحمد', 'auto')).toBe('ar')
  })

  it('auto-detects Latin', () => {
    expect(textLanguage('Ahmed', 'auto')).toBe('en')
  })
})

describe('requiredLanguages', () => {
  it('returns both for mixed list in auto mode', () => {
    const langs = requiredLanguages(['Ahmed', 'أحمد'], 'auto')
    expect(langs.has('en')).toBe(true)
    expect(langs.has('ar')).toBe(true)
  })

  it('returns only ar in forced ar mode', () => {
    const langs = requiredLanguages(['Ahmed', 'أحمد'], 'ar')
    expect(langs.has('ar')).toBe(true)
    expect(langs.has('en')).toBe(false)
  })

  it('returns only en in forced en mode', () => {
    const langs = requiredLanguages(['Ahmed', 'أحمد'], 'en')
    expect(langs.has('en')).toBe(true)
    expect(langs.has('ar')).toBe(false)
  })
})

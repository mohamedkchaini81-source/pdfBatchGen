import type { AppState, ValidationResult, ValidationIssue } from '@/types'
import { requiredLanguages } from './arabic'

const MIN_BOX_W_PT = 12
const MIN_BOX_H_PT = 8

function boxIsValid(
  left: number, right: number, top: number, bottom: number,
  pageWidth: number, pageHeight: number
): boolean {
  const w = (right - left) * pageWidth
  const h = (bottom - top) * pageHeight
  return w >= MIN_BOX_W_PT && h >= MIN_BOX_H_PT
}

/**
 * Reproduce all Flutter validation rules.
 * Returns typed errors and warnings, never throws.
 */
export function validate(s: AppState): ValidationResult {
  const errors: ValidationIssue[]   = []
  const warnings: ValidationIssue[] = []

  const hasPdf = s.templateFile !== null && s.pageWidth > 0

  if (!hasPdf) {
    errors.push({ key: 'needsPdf', isWarning: false })
  }

  if (s.records.length === 0) {
    errors.push({ key: 'needsCsv', isWarning: false })
  }

  // Font requirements based on names + mode
  const names = s.records.map((r) => r.name)
  const req = requiredLanguages(names, s.textMode)

  if (req.has('ar') && s.nameField.arabicFont === null) {
    errors.push({ key: 'needsArabic', isWarning: false })
  }
  if (req.has('en') && s.nameField.englishFont === null) {
    errors.push({ key: 'needsEnglish', isWarning: false })
  }

  // Name ruler validity
  if (hasPdf) {
    const { left, right, top, bottom } = s.nameField.ruler
    if (!boxIsValid(left, right, top, bottom, s.pageWidth, s.pageHeight)) {
      errors.push({ key: 'invalidBox', isWarning: false })
    }
  }

  // Role ruler validity (only if role column exists)
  if (hasPdf && s.hasRoleColumn) {
    const { left, right, top, bottom } = s.roleField.ruler
    if (!boxIsValid(left, right, top, bottom, s.pageWidth, s.pageHeight)) {
      errors.push({ key: 'invalidRoleBox', isWarning: false })
    }
  }

  return {
    errors,
    warnings,
    isReady: errors.length === 0,
  }
}

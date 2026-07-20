import type { AppState, ParticipantRecord, ValidationResult } from '@/types'
import { validate } from '@/utils/validation'

// ── Memoized selectors for Zustand ────────────────────────────────────────

export const selectCurrentRecord = (s: AppState): ParticipantRecord | null =>
  s.records.length > 0 ? s.records[s.recordIndex] : null

export const selectHasPdf = (s: AppState): boolean =>
  s.templateFile !== null && s.pageWidth > 0

export const selectHasRecords = (s: AppState): boolean =>
  s.records.length > 0

export const selectValidation = (s: AppState): ValidationResult =>
  validate(s)

export const selectIsExporting = (s: AppState): boolean =>
  s.exportJob.status === 'processing' || s.exportJob.status === 'uploading'

export const selectZoomPct = (s: AppState): number =>
  Math.round(s.zoom * 100)

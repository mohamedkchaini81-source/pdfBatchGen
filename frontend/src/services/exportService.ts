import { api } from './apiClient'
import type { AppState } from '@/types'

export interface JobCreatedResponse {
  jobId:  string
  status: string
}

export interface JobStatusResponse {
  jobId:            string
  status:           string
  completedRecords: number
  totalRecords:     number
  percentage:       number
  currentName?:     string
  error:            string | null
}

/**
 * Start an export job.
 * Sends: PDF template, fonts, records JSON, and configuration.
 */
export async function startExport(state: AppState): Promise<JobCreatedResponse> {
  if (!state.templateFile) throw new Error('No PDF template')

  const form = new FormData()

  // PDF template
  form.append('template', state.templateFile)

  // Fonts (optional)
  if (state.nameField.arabicFont?.file)  form.append('name_ar_font', state.nameField.arabicFont.file)
  if (state.nameField.englishFont?.file) form.append('name_en_font', state.nameField.englishFont.file)
  if (state.roleField.arabicFont?.file)  form.append('role_ar_font', state.roleField.arabicFont.file)
  if (state.roleField.englishFont?.file) form.append('role_en_font', state.roleField.englishFont.file)

  // Records
  form.append('records_json', JSON.stringify(state.records))

  // Name field config
  form.append('name_config', JSON.stringify({
    ruler:        state.nameField.ruler,
    maxFontSize:  state.nameField.maxFontSize,
    colorHex:     state.nameField.colorHex,
    rotation:     state.nameField.rotation,
    fontWeight:   state.nameField.fontWeight,
    fontStyle:    'normal',
  }))

  // Role field config
  form.append('role_config', JSON.stringify({
    ruler:        state.roleField.ruler,
    maxFontSize:  state.roleField.maxFontSize,
    colorHex:     state.roleField.colorHex,
    rotation:     state.roleField.rotation,
    fontWeight:   state.roleField.fontWeight,
    fontStyle:    state.roleField.fontStyle,
  }))

  // Global settings
  form.append('settings', JSON.stringify({
    textMode:      state.textMode,
    exportMethod:  state.exportMethod,
    pageIndex:     state.pageIndex,
    pageWidth:     state.pageWidth,
    pageHeight:    state.pageHeight,
    hasRoleColumn: state.hasRoleColumn,
    pdfFileName:   state.pdfFileName,
  }))

  return api.post<JobCreatedResponse>('/exports', form)
}

/**
 * Poll the status of a running export job.
 */
export async function pollExport(jobId: string): Promise<JobStatusResponse> {
  return api.get<JobStatusResponse>(`/exports/${jobId}`)
}

/**
 * Request cancellation of a running export job.
 */
export async function cancelExport(jobId: string): Promise<void> {
  await api.delete(`/exports/${jobId}`)
}

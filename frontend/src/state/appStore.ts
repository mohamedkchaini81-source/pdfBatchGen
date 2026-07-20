import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type {
  AppState, ExportMethod, ExportJobState, ExportStatus,
  Locale, ParticipantRecord, RulerBox, TextFieldConfig,
  TextMode, UploadedFont,
} from '@/types'
import {
  RULER_NAME_INITIAL, RULER_ROLE_INITIAL,
} from '@/types'

// ── Default field configs ─────────────────────────────────────────────────

const defaultNameField: TextFieldConfig = {
  ruler:       RULER_NAME_INITIAL,
  arabicFont:  null,
  englishFont: null,
  maxFontSize: 48,
  colorHex:    '#111111',
  rotation:    0,
  fontWeight:  400,
  fontStyle:   'normal',
}

const defaultRoleField: TextFieldConfig = {
  ruler:       RULER_ROLE_INITIAL,
  arabicFont:  null,
  englishFont: null,
  maxFontSize: 32,
  colorHex:    '#444444',
  rotation:    0,
  fontWeight:  400,
  fontStyle:   'normal',
}

const defaultExportJob: ExportJobState = {
  jobId:            null,
  status:           'idle',
  completedRecords: 0,
  totalRecords:     0,
  percentage:       0,
  error:            null,
}

// ── Store actions interface ───────────────────────────────────────────────

interface AppActions {
  // Locale
  setLocale: (locale: Locale) => void

  // PDF template
  setTemplate: (file: File, objectUrl: string, pageCount: number, pageWidth: number, pageHeight: number) => void
  clearTemplate: () => void
  setPageIndex: (index: number) => void
  zoomIn: () => void
  zoomOut: () => void
  resetZoom: () => void

  // Records
  setRecords: (records: ParticipantRecord[], hasRoleColumn: boolean) => void
  clearRecords: () => void
  prevRecord: () => void
  nextRecord: () => void
  setRecordIndex: (index: number) => void

  // Text mode
  setTextMode: (mode: TextMode) => void

  // Name field
  setNameRuler: (ruler: RulerBox) => void
  setNameFont: (lang: 'ar' | 'en', font: UploadedFont | null) => void
  setNameMaxFontSize: (size: number) => void
  setNameColor: (hex: string) => void
  setNameRotation: (deg: number) => void
  setNameFontWeight: (weight: number) => void

  // Role field
  setRoleRuler: (ruler: RulerBox) => void
  setRoleFont: (lang: 'ar' | 'en', font: UploadedFont | null) => void
  setRoleMaxFontSize: (size: number) => void
  setRoleColor: (hex: string) => void
  setRoleRotation: (deg: number) => void
  setRoleFontWeight: (weight: number) => void
  setRoleFontStyle: (style: 'normal' | 'italic') => void

  // Export
  setExportMethod: (method: ExportMethod) => void
  setExportJob: (job: Partial<ExportJobState>) => void
  setExportStatus: (status: ExportStatus) => void
  resetExportJob: () => void
}

// ── Persistent preferences (safe to serialize) ────────────────────────────
// NOTE: File objects and objectUrls are NOT persisted — only styling prefs.

interface PersistedPrefs {
  locale:              Locale
  textMode:            TextMode
  exportMethod:        ExportMethod
  nameMaxFontSize:     number
  nameColorHex:        string
  nameRotation:        number
  nameFontWeight:      number
  roleMaxFontSize:     number
  roleColorHex:        string
  roleRotation:        number
  roleFontWeight:      number
  roleFontStyle:       'normal' | 'italic'
}

// ── Full store type ───────────────────────────────────────────────────────

type Store = AppState & AppActions

// ── Create store ──────────────────────────────────────────────────────────

export const useAppStore = create<Store>()(
  persist(
    (set, get) => ({
      // ── Initial state ────────────────────────────────────────────────────
      templateFile:      null,
      templateObjectUrl: null,
      pdfFileName:       '',
      pageCount:         0,
      pageIndex:         0,
      pageWidth:         0,
      pageHeight:        0,
      zoom:              1.0,
      records:           [],
      recordIndex:       0,
      hasRoleColumn:     false,
      textMode:          'auto',
      locale:            'en',
      nameField:         defaultNameField,
      roleField:         defaultRoleField,
      exportMethod:      'individual',
      exportJob:         defaultExportJob,

      // ── Locale ───────────────────────────────────────────────────────────
      setLocale: (locale) => set({ locale }),

      // ── PDF template ─────────────────────────────────────────────────────
      setTemplate: (file, objectUrl, pageCount, pageWidth, pageHeight) => {
        // Revoke previous URL
        const prev = get().templateObjectUrl
        if (prev) URL.revokeObjectURL(prev)
        set({
          templateFile:      file,
          templateObjectUrl: objectUrl,
          pdfFileName:       file.name,
          pageCount,
          pageIndex:         0,
          pageWidth,
          pageHeight,
          // Reset rulers to initial when loading a new template
          nameField: { ...get().nameField, ruler: RULER_NAME_INITIAL },
          roleField: { ...get().roleField, ruler: RULER_ROLE_INITIAL },
        })
      },
      clearTemplate: () => {
        const prev = get().templateObjectUrl
        if (prev) URL.revokeObjectURL(prev)
        set({ templateFile: null, templateObjectUrl: null, pdfFileName: '', pageCount: 0, pageIndex: 0, pageWidth: 0, pageHeight: 0 })
      },
      setPageIndex: (index) => {
        const { pageCount } = get()
        if (pageCount === 0) return
        set({ pageIndex: Math.max(0, Math.min(index, pageCount - 1)) })
      },
      zoomIn:    () => set((s) => ({ zoom: Math.min(+(s.zoom + 0.1).toFixed(1), 2.5) })),
      zoomOut:   () => set((s) => ({ zoom: Math.max(+(s.zoom - 0.1).toFixed(1), 0.4) })),
      resetZoom: () => set({ zoom: 1.0 }),

      // ── Records ───────────────────────────────────────────────────────────
      setRecords: (records, hasRoleColumn) => set({ records, hasRoleColumn, recordIndex: 0 }),
      clearRecords: () => set({ records: [], hasRoleColumn: false, recordIndex: 0 }),
      prevRecord: () => {
        const { records, recordIndex } = get()
        if (records.length === 0) return
        set({ recordIndex: (recordIndex - 1 + records.length) % records.length })
      },
      nextRecord: () => {
        const { records, recordIndex } = get()
        if (records.length === 0) return
        set({ recordIndex: (recordIndex + 1) % records.length })
      },
      setRecordIndex: (index) => {
        const { records } = get()
        set({ recordIndex: Math.max(0, Math.min(index, records.length - 1)) })
      },

      // ── Text mode ─────────────────────────────────────────────────────────
      setTextMode: (textMode) => set({ textMode }),

      // ── Name field ────────────────────────────────────────────────────────
      setNameRuler: (ruler) => set((s) => ({ nameField: { ...s.nameField, ruler } })),
      setNameFont: (lang, font) => set((s) => ({
        nameField: lang === 'ar'
          ? { ...s.nameField, arabicFont: font }
          : { ...s.nameField, englishFont: font },
      })),
      setNameMaxFontSize: (size) => set((s) => ({ nameField: { ...s.nameField, maxFontSize: Math.max(8, Math.min(size, 500)) } })),
      setNameColor: (hex) => set((s) => ({ nameField: { ...s.nameField, colorHex: hex } })),
      setNameRotation: (deg) => set((s) => ({ nameField: { ...s.nameField, rotation: Math.max(-180, Math.min(deg, 180)) } })),
      setNameFontWeight: (weight) => set((s) => ({ nameField: { ...s.nameField, fontWeight: weight } })),

      // ── Role field ────────────────────────────────────────────────────────
      setRoleRuler: (ruler) => set((s) => ({ roleField: { ...s.roleField, ruler } })),
      setRoleFont: (lang, font) => set((s) => ({
        roleField: lang === 'ar'
          ? { ...s.roleField, arabicFont: font }
          : { ...s.roleField, englishFont: font },
      })),
      setRoleMaxFontSize: (size) => set((s) => ({ roleField: { ...s.roleField, maxFontSize: Math.max(8, Math.min(size, 500)) } })),
      setRoleColor: (hex) => set((s) => ({ roleField: { ...s.roleField, colorHex: hex } })),
      setRoleRotation: (deg) => set((s) => ({ roleField: { ...s.roleField, rotation: Math.max(-180, Math.min(deg, 180)) } })),
      setRoleFontWeight: (weight) => set((s) => ({ roleField: { ...s.roleField, fontWeight: weight } })),
      setRoleFontStyle: (style) => set((s) => ({ roleField: { ...s.roleField, fontStyle: style } })),

      // ── Export ────────────────────────────────────────────────────────────
      setExportMethod: (exportMethod) => set({ exportMethod }),
      setExportJob: (job) => set((s) => ({ exportJob: { ...s.exportJob, ...job } })),
      setExportStatus: (status) => set((s) => ({ exportJob: { ...s.exportJob, status } })),
      resetExportJob: () => set({ exportJob: defaultExportJob }),
    }),
    {
      name: 'pdf-batch-gen-prefs',
      storage: createJSONStorage(() => localStorage),
      // Only persist safe UI preferences — never File objects or object URLs
      partialize: (state): PersistedPrefs => ({
        locale:          state.locale,
        textMode:        state.textMode,
        exportMethod:    state.exportMethod,
        nameMaxFontSize: state.nameField.maxFontSize,
        nameColorHex:    state.nameField.colorHex,
        nameRotation:    state.nameField.rotation,
        nameFontWeight:  state.nameField.fontWeight,
        roleMaxFontSize: state.roleField.maxFontSize,
        roleColorHex:    state.roleField.colorHex,
        roleRotation:    state.roleField.rotation,
        roleFontWeight:  state.roleField.fontWeight,
        roleFontStyle:   state.roleField.fontStyle,
      }),
      merge: (persisted, current) => {
        const p = persisted as PersistedPrefs
        return {
          ...current,
          locale:     p.locale     ?? current.locale,
          textMode:   p.textMode   ?? current.textMode,
          exportMethod: p.exportMethod ?? current.exportMethod,
          nameField: {
            ...current.nameField,
            maxFontSize: p.nameMaxFontSize ?? current.nameField.maxFontSize,
            colorHex:    p.nameColorHex   ?? current.nameField.colorHex,
            rotation:    p.nameRotation   ?? current.nameField.rotation,
            fontWeight:  p.nameFontWeight ?? current.nameField.fontWeight,
          },
          roleField: {
            ...current.roleField,
            maxFontSize: p.roleMaxFontSize ?? current.roleField.maxFontSize,
            colorHex:    p.roleColorHex   ?? current.roleField.colorHex,
            rotation:    p.roleRotation   ?? current.roleField.rotation,
            fontWeight:  p.roleFontWeight ?? current.roleField.fontWeight,
            fontStyle:   p.roleFontStyle  ?? current.roleField.fontStyle,
          },
        }
      },
    }
  )
)

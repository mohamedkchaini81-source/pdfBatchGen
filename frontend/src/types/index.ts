// ============================================================
// Core domain types — mirror of Flutter AppState
// ============================================================

export type TextMode     = 'auto' | 'ar' | 'en';
export type ExportMethod = 'individual' | 'zip' | 'merged';
export type Locale       = 'en' | 'ar';
export type FontStyle    = 'normal' | 'italic';

export type ExportStatus =
  | 'idle'
  | 'validating'
  | 'uploading'
  | 'processing'
  | 'completed'
  | 'cancelled'
  | 'failed';

// ── Ruler (normalized 0–1 relative to PDF page dimensions) ──────────────
export interface RulerBox {
  left:   number; // 0–1
  right:  number; // 0–1, > left
  top:    number; // 0–1
  bottom: number; // 0–1, > top
}

export const RULER_NAME_INITIAL: RulerBox = {
  left: 0.18, right: 0.82, top: 0.43, bottom: 0.58,
};
export const RULER_ROLE_INITIAL: RulerBox = {
  left: 0.18, right: 0.82, top: 0.60, bottom: 0.70,
};

// ── Font ──────────────────────────────────────────────────────────────────
export interface UploadedFont {
  id:        string;
  file:      File;
  fileName:  string;
  objectUrl: string; // CSS FontFace src
}

// ── Text field configuration ──────────────────────────────────────────────
export interface TextFieldConfig {
  ruler:       RulerBox;
  arabicFont:  UploadedFont | null;
  englishFont: UploadedFont | null;
  maxFontSize: number;   // pt, 8–500
  colorHex:    string;   // '#RRGGBB'
  rotation:    number;   // degrees -180..180
  fontWeight:  number;   // CSS font-weight: 100|300|400|500|600|700|800
  fontStyle:   FontStyle;
}

// ── Participant record ────────────────────────────────────────────────────
export interface ParticipantRecord {
  id:   string;
  name: string;
  role: string; // '' when absent
}

// ── Export job ────────────────────────────────────────────────────────────
export interface ExportJobState {
  jobId:            string | null;
  status:           ExportStatus;
  completedRecords: number;
  totalRecords:     number;
  percentage:       number;
  error:            string | null;
}

// ── Validation ────────────────────────────────────────────────────────────
export type ValidationIssueKey =
  | 'needsPdf'
  | 'needsCsv'
  | 'needsArabic'
  | 'needsEnglish'
  | 'invalidBox'
  | 'invalidRoleBox'
  | 'warningLong'
  | 'allValid';

export interface ValidationIssue {
  key:       ValidationIssueKey;
  isWarning: boolean;
}

export interface ValidationResult {
  errors:   ValidationIssue[];
  warnings: ValidationIssue[];
  isReady:  boolean;
}

// ── Main app state ────────────────────────────────────────────────────────
export interface AppState {
  // PDF template
  templateFile:      File | null;
  templateObjectUrl: string | null;
  pdfFileName:       string;
  pageCount:         number;
  pageIndex:         number;
  pageWidth:         number; // PDF points
  pageHeight:        number; // PDF points
  zoom:              number; // 0.4–2.5

  // Participants
  records:       ParticipantRecord[];
  recordIndex:   number;
  hasRoleColumn: boolean;

  // Text mode
  textMode: TextMode;

  // UI locale
  locale: Locale;

  // Fields
  nameField: TextFieldConfig;
  roleField: TextFieldConfig;

  // Export
  exportMethod: ExportMethod;
  exportJob:    ExportJobState;
}

// ── CSV parse result ──────────────────────────────────────────────────────
export interface CsvParseResult {
  success:      boolean;
  records:      ParticipantRecord[];
  hasRoleColumn: boolean;
  error?:       string;
  missingField?: string;
  foundFields?: string[];
}

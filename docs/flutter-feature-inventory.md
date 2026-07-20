# Flutter Feature Inventory

## Screens
| Screen | Flutter file | React equivalent |
|---|---|---|
| Home | `lib/app/app.dart` + `lib/ui/workspace/workspace.dart` | `HomeLayout.tsx` + `WorkspaceArea.tsx` |

## Widgets
| Widget | Flutter file | React equivalent |
|---|---|---|
| TopBar | `lib/ui/widgets/top_bar.dart` | `components/navigation/TopBar.tsx` |
| Sidebar | `lib/ui/sidebar/sidebar.dart` | `features/sidebar/Sidebar.tsx` |
| ConfigStep | `lib/ui/sidebar/config_step.dart` | `features/sidebar/ConfigStep.tsx` |
| UploadZone | `lib/ui/widgets/upload_zone.dart` | `components/forms/UploadZone.tsx` |
| StatusBadge | `lib/ui/widgets/status_badge.dart` | inline in ConfigStep |
| IconToolButton | `lib/ui/widgets/icon_tool_button.dart` | inline in WorkspaceToolbar |

## Dialogs
| Dialog | Flutter file | React equivalent |
|---|---|---|
| ValidationDialog | `lib/ui/dialogs/validation_dialog.dart` | `features/validation/ValidationDialog.tsx` |
| ProgressDialog | `lib/ui/dialogs/progress_dialog.dart` | `features/export/ProgressDialog.tsx` |
| HelpDialog | `lib/ui/dialogs/help_dialogs.dart` | `components/common/HelpDialog.tsx` |
| ShortcutsDialog | `lib/ui/dialogs/help_dialogs.dart` | `components/common/ShortcutsDialog.tsx` |
| PrivacyDialog | `lib/ui/dialogs/help_dialogs.dart` | `components/common/PrivacyDialog.tsx` |

## State fields (AppState → Zustand)
| Flutter field | Zustand field | Notes |
|---|---|---|
| templateBytes | templateFile | File object (not bytes) |
| pdfFileName | pdfFileName | same |
| pageCount/Index/Width/Height | same | same |
| zoom | zoom | 0.4–2.5, step 0.1 |
| names/roles | records[].name/role | unified ParticipantRecord |
| hasRoleColumn | hasRoleColumn | same |
| recordIndex | recordIndex | same |
| textMode | textMode | auto/ar/en |
| arFont/enFont | nameField.arabicFont/englishFont | UploadedFont with objectUrl |
| ruler | nameField.ruler | RulerBox normalized 0–1 |
| maxFontSize/colorHex/rotation | nameField.maxFontSize/colorHex/rotation | same |
| roleRuler | roleField.ruler | same |
| roleArFont/roleEnFont | roleField.arabicFont/englishFont | same |
| roleFontWeight/roleFontStyle | roleField.fontWeight/fontStyle | int weight (100–800) |
| exportMethod | exportMethod | individual/zip/merged |
| mergeIntoPdf | exportMethod === 'merged' | merged into exportMethod |
| exporting/cancelRequested | exportJob.status | unified ExportJobState |
| uiLocale | locale | en/ar |

## Services
| Flutter service | Python/TS equivalent |
|---|---|
| PdfGenerator | `backend/app/services/pdf_generation_service.py` |
| ExportService (runExport) | `backend/app/services/export_job_service.py` |
| CSV parser | `frontend/src/utils/csv.ts` |

## Utilities
| Flutter util | TS/Python equivalent |
|---|---|
| containsArabic | `utils/arabic.ts` + `utils/arabic_text.py` |
| textLanguage | `utils/arabic.ts::textLanguage` |
| sanitizeFilename | `utils/filename.ts` + `utils/filenames.py` |
| normaliseHex | `utils/color.ts` |
| combinedNameRuler | `utils/ruler.ts::combinedRuler` |
| validate() | `utils/validation.ts` + `utils/validation.py` |

## All validation rules
1. No PDF template → error: needsPdf
2. No CSV names → error: needsCsv
3. Arabic names present, no Arabic font → error: needsArabic
4. English names present, no English font → error: needsEnglish
5. Name ruler too small (< 12×8 pt) → error: invalidBox
6. Role ruler too small when role column exists → error: invalidRoleBox

## All keyboard shortcuts
| Key | Action |
|---|---|
| Ctrl+Enter | Validation/export dialog |
| Ctrl+O | Open PDF |
| Ctrl+Shift+O | Open CSV |
| Ctrl+= | Zoom in |
| Ctrl+- | Zoom out |
| Shift+? | Help dialog |
| Escape | Close dialog |
| Arrow keys | Move selected ruler |
| Shift+Arrows | Move ruler faster |

## Export modes
| Mode | Flutter | Web |
|---|---|---|
| Folder | FilePicker.getDirectoryPath | File System Access API or ZIP fallback |
| ZIP | ZipEncoder | JSZip / server-side zipfile |
| Merged PDF | pypdf.PdfWriter | pypdf.PdfWriter (server-side) |

## All loading / error / empty states
- Initial empty workspace (no PDF)
- PDF loading spinner
- PDF parse error
- CSV loading
- CSV validation error (missing column, empty)
- Font loading
- Font error
- No records loaded
- Export validating
- Export processing (with progress)
- Export cancellation requested
- Export cancelled
- Export success
- Download ready
- Download expired
- Backend unavailable

## Design tokens extracted
See `frontend/src/styles/tokens.css` — all values extracted from Flutter AppColors + AppTheme.

## Arabic / RTL logic
- Script detection: Unicode ranges U+0600–U+06FF, U+0750–U+077F, U+08A0–U+08FF, U+FB50–U+FDFF, U+FE70–U+FEFF
- Browser preview: CSS `direction: rtl`, `text-align: center`
- Export: arabic_reshaper + python-bidi (server-side only)
- UI direction: html[dir] toggled on locale change
- Combined ruler: name+role merged when role is empty

## Desktop-specific features requiring web alternatives
See `docs/browser-limitations.md`

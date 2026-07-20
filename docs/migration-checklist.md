# Migration Checklist

## Phase 0 — Audit
- [x] All Flutter source files read and analyzed
- [x] Feature inventory created (`flutter-feature-inventory.md`)
- [x] Design tokens extracted (all colors, spacing, typography)
- [x] Browser limitations documented (`browser-limitations.md`)
- [x] Flutter-to-React mapping documented

## Phase 1 — Workspace setup
- [x] React + Vite + TypeScript project created
- [x] FastAPI backend created
- [x] Docker Compose configuration
- [x] ESLint configured
- [x] Vitest configured
- [x] Playwright configured
- [x] `.env.example` created

## Phase 2 — Design system and shell
- [x] CSS design tokens (all Flutter AppColors values)
- [x] Global CSS with font-face declarations
- [x] TopBar (brand, nav, EN/AR switcher, privacy icon, avatar)
- [x] Sidebar (7-step accordion)
- [x] ConfigStep component (active/complete/default states)
- [x] SidebarFooter (status + generate button)
- [x] WorkspaceToolbar (page nav, zoom, record pill)
- [x] WorkspaceFooter (status message + generate button)
- [x] LTR/RTL via html[dir] on locale change

## Phase 3 — PDF loading and preview
- [x] PDF.js integration
- [x] TemplateUploadStep (drag-drop + click-to-browse)
- [x] Page dimensions extracted from PDF
- [x] Multi-page navigation
- [x] Zoom in/out (0.4–2.5, step 0.1)
- [x] Empty state
- [x] Error state

## Phase 4 — CSV and participant navigation
- [x] CsvImportStep (drag-drop + click-to-browse)
- [x] UTF-8 BOM stripping
- [x] Required `name` column validation
- [x] Optional `role` column
- [x] Blank row skipping
- [x] Arabic name preservation
- [x] Sample CSV download
- [x] Record navigation (prev/next)

## Phase 5 — Fonts and text preview
- [x] FontSlot component (load, loaded state, replace, remove)
- [x] FontFace API registration for browser preview
- [x] Script detection per name
- [x] TextPreviewLayer (name + role overlaid on PDF)
- [x] Binary-search font fitting (textFit.ts)
- [x] Empty-role ruler expansion in preview
- [x] CSS direction per language

## Phase 6 — Rulers
- [x] RulerOverlay for name (blue)
- [x] RulerOverlay for role (amber)
- [x] Drag entire box (move)
- [x] Resize all 4 edges
- [x] Resize all 4 corners
- [x] Pointer Events API (unified mouse + touch)
- [x] Keyboard arrow keys (normal + Shift-fast)
- [x] Normalized coordinate storage (0–1)
- [x] Zoom-independent (never drifts)
- [x] Role ruler hidden when no role column

## Phase 7 — Styling controls
- [x] StylingControls: max font size, color, rotation, font weight
- [x] Font style (italic) for role
- [x] Color picker + hex text input
- [x] Font weight select (Thin → ExtraBold, matching Flutter AppFontWeight)

## Phase 8 — Validation
- [x] Pure validation engine (validation.ts)
- [x] All 6 Flutter validation rules ported
- [x] ValidationDialog (checklist with ok/warning/error rows)
- [x] Generate button disabled when errors exist
- [x] SidebarFooter status indicator
- [x] WorkspaceFooter status message

## Phase 9 — Backend PDF generation
- [x] pdf_generation_service.py (direct port of stamp_pdf.py)
- [x] Arabic reshape + BiDi (prepare_text)
- [x] Font registration (ReportLab TTFont)
- [x] Binary-search fit_size (20 iterations)
- [x] Vector overlay via ReportLab canvas
- [x] pypdf merge_page (no rasterization)
- [x] Combined ruler for empty role
- [x] archive_service.py (ZIP + merged PDF)

## Phase 10 — Export jobs
- [x] export_job_service.py (in-process thread manager)
- [x] POST /api/exports (start)
- [x] GET /api/exports/{id} (poll)
- [x] DELETE /api/exports/{id} (cancel — real cancellation via threading.Event)
- [x] GET /api/exports/{id}/download
- [x] ProgressDialog (real-time progress, cancel, success, failure)
- [x] exportService.ts (frontend API client)

## Phase 11 — Responsive and accessibility
- [ ] Tablet sidebar drawer (collapsible)
- [ ] Mobile full-screen step view
- [ ] Touch ruler handles ≥ 44×44 px
- [ ] ARIA labels on all interactive elements ✓ (implemented)
- [ ] Focus trap in modals ✓
- [ ] aria-live for export progress ✓
- [ ] Keyboard ruler movement ✓
- [ ] Reduced-motion CSS ✓
- [ ] Sufficient color contrast (audit pending)

## Phase 12 — Testing
- [x] Unit: arabic detection
- [x] Unit: ruler math
- [x] Unit: CSV parsing
- [x] Unit: filename sanitization
- [x] Unit: validation engine
- [x] Backend: Arabic utilities
- [x] Backend: filename utilities
- [x] Backend: health endpoint
- [x] Backend: PDF generation
- [x] E2E: Playwright basic workflows

## Phase 13 — Docs
- [x] README.md
- [x] docs/architecture.md
- [x] docs/flutter-feature-inventory.md
- [x] docs/browser-limitations.md
- [x] docs/migration-checklist.md (this file)
- [x] docs/api.md
- [ ] docs/deployment.md (see README)
- [ ] docs/accessibility.md

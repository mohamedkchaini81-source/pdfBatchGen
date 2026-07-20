# Architecture

## Overview

```
Browser (React + Vite)
        ↕  HTTP / multipart form
Local FastAPI server (Python 3.12)
        ↕
ReportLab + pypdf + arabic_reshaper
        ↕
Temp directory (job output files)
```

All processing is local. No data leaves the machine.

---

## Frontend

| Concern | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| State | Zustand 4 (with localStorage persist for prefs) |
| i18n | react-i18next (EN + AR, runtime switch) |
| PDF preview | PDF.js (pdfjs-dist) — PDFium quality |
| Unit tests | Vitest + Testing Library |
| E2E tests | Playwright |
| Icons | Lucide React |
| CSS | CSS Modules + CSS custom properties (design tokens) |

### Layered workspace

```
WorkspaceArea
├── WorkspaceToolbar   (page nav, zoom, record pill)
├── PdfCanvas
│   ├── canvas         (PDF.js render — Layer 1)
│   ├── TextPreviewLayer (name + role text — Layer 2)
│   ├── RulerOverlay name  (blue — Layer 3)
│   └── RulerOverlay role  (amber — Layer 4)
└── WorkspaceFooter    (status + generate)
```

### State flow

```
User action
    ↓
Zustand action (setNameRuler, setRecords, etc.)
    ↓
Zustand store update (immutable copyWith pattern)
    ↓
React re-render (selective via selectors)
```

### Coordinate system

Rulers are stored as normalized values (0.0–1.0) relative to the PDF page dimensions.

```
Normalized ruler  ──(× pageWidth/Height)──►  PDF points
PDF points        ──(× zoom × scale)──────►  CSS pixels
CSS pixels        ──(÷ containerSize)────►  back to normalized
```

Zoom changes only the CSS pixels layer — normalized values never change.

---

## Backend

| Concern | Technology |
|---|---|
| Framework | FastAPI 0.111 |
| Server | Uvicorn |
| Validation | Pydantic v2 |
| PDF reading/writing | pypdf 4 |
| PDF overlay | ReportLab 4 |
| Arabic shaping | arabic-reshaper + python-bidi |
| Job management | In-process threads (threading.Event for cancellation) |
| Archive | Python stdlib zipfile |
| Tests | pytest + httpx |

### Export job lifecycle

```
POST /exports
    ↓ validate input
    ↓ create ExportJob (uuid, status=queued)
    ↓ save fonts to job temp dir
    ↓ launch background thread
    → return {jobId, status: "queued"}

Background thread:
    for each participant:
        ↓ check is_cancelled()
        ↓ detect language (Arabic/Latin)
        ↓ select correct font
        ↓ stamp_pdf() → vector PDF bytes
        ↓ update job.completed_records
    ↓ assemble ZIP / merged PDF
    ↓ write output file
    ↓ job.status = "completed"

GET /exports/{id}    → poll status
DELETE /exports/{id} → set cancel_event
GET /exports/{id}/download → FileResponse
```

### PDF generation pipeline

```
Template bytes
    ↓ pypdf.PdfReader
    ↓ choose font path (ar/en)
    ↓ register_font() → ReportLab TTFont
    ↓ prepare_text() → arabic_reshaper + python-bidi
    ↓ fit_size() → binary search 20 iterations
    ↓ rl_canvas.Canvas (pagesize from template)
    ↓ draw_block() → vector text overlay
    ↓ canvas.save()
    ↓ pypdf merge_page(overlay)
    ↓ pypdf.PdfWriter.write()
    → output PDF bytes (100% vector)
```

---

## Design tokens

All CSS variables are in `frontend/src/styles/tokens.css`.  
Values extracted exactly from Flutter `AppColors` and `AppTheme`.

---

## Directory structure summary

```
pdf-batch-gen-web/
├── frontend/               React app
│   ├── src/
│   │   ├── app/            App root, keyboard shortcuts
│   │   ├── components/     Shared UI (Modal, Button, TopBar, UploadZone...)
│   │   ├── features/       Feature slices (pdf-preview, rulers, export...)
│   │   ├── hooks/          Custom React hooks
│   │   ├── i18n/           EN + AR translation files
│   │   ├── layouts/        HomeLayout
│   │   ├── services/       API client, exportService
│   │   ├── state/          Zustand store + selectors
│   │   ├── styles/         tokens.css, global.css, utilities.css
│   │   ├── types/          Shared TypeScript types
│   │   └── utils/          arabic, csv, ruler, filename, validation, color, textFit
│   └── tests/
│       ├── unit/           Vitest unit tests
│       ├── integration/    Component tests
│       └── e2e/            Playwright scenarios
└── backend/                FastAPI app
    ├── app/
    │   ├── api/            Route handlers
    │   ├── core/           Config, settings
    │   ├── models/         Pydantic models
    │   ├── services/       pdf_generation, export_job, archive
    │   └── utils/          arabic_text, filenames, validation, file_cleanup
    └── tests/              pytest tests
```

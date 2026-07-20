# PDF Batch Gen — Web

> Migrate from Flutter desktop to a production React + FastAPI website.  
> Generate personalized PDF certificates from a template and CSV list.

---

## Requirements

| Tool | Version |
|---|---|
| Node.js | 20+ |
| npm | 10+ |
| Python | 3.12+ |
| pip | 24+ |

**Python packages for export:** `pypdf`, `reportlab`, `arabic-reshaper`, `python-bidi`

---

## Quick Start (Development)

### 1. Backend

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Backend runs at: `http://localhost:8000`  
Interactive API docs: `http://localhost:8000/api/docs`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Production Build

```bash
# Frontend
cd frontend
npm run build          # outputs to frontend/dist/

# Backend
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Serve `frontend/dist/` with any static file server (Nginx, Caddy, etc.) and proxy `/api` to the FastAPI server.

---

## Docker

```bash
docker-compose up --build
```

- Frontend: `http://localhost:5173`
- Backend:  `http://localhost:8000`

---

## Environment Variables

Copy `.env.example` to `.env` and adjust:

```
# Backend
HOST=0.0.0.0
PORT=8000
DEBUG=false
CORS_ORIGINS=["http://localhost:5173"]
TEMP_DIR=./temp
JOB_EXPIRY_SECONDS=3600
MAX_RECORDS=2000
MAX_PDF_SIZE=52428800
```

---

## Fonts Setup

Copy the font files from the Flutter project into `frontend/public/fonts/`:

```
frontend/public/fonts/
├── Inter-Regular.ttf
├── Inter-Medium.ttf
├── Inter-SemiBold.ttf
├── Inter-Bold.ttf
├── IBMPlexSansArabic-Regular.ttf
├── IBMPlexSansArabic-Medium.ttf
├── IBMPlexSansArabic-SemiBold.ttf
└── IBMPlexSansArabic-Bold.ttf
```

Source: `../pdf_batch_gen/assets/fonts/`

---

## Testing

### Frontend unit tests
```bash
cd frontend
npm run test
```

### TypeScript check
```bash
cd frontend
npm run typecheck
```

### Lint
```bash
cd frontend
npm run lint
```

### Backend tests
```bash
cd backend
pytest -v
```

### End-to-end tests
```bash
# Start both servers first, then:
cd frontend
npm run test:e2e
```

---

## Browser Support

| Browser | Support |
|---|---|
| Chrome 111+ | Full (including folder save) |
| Edge 111+ | Full |
| Firefox | Full (ZIP download instead of folder save) |
| Safari 16+ | Full (ZIP download instead of folder save) |

The File System Access API (folder saving) requires Chromium. All other browsers fall back to ZIP download automatically.

---

## User Workflow

1. **PDF Template** — Upload or drag-and-drop a PDF certificate template
2. **Language** — Auto-detect, force Arabic, or force English per name
3. **Fonts** — Load TTF/OTF fonts for Arabic and English names (and roles)
4. **CSV Names** — Import a CSV with `name` column (optional `role` column)
5. **Name Style** — Set font, color, rotation, placement via draggable ruler
6. **Role Style** — (Optional) Configure role text style and placement
7. **Export** — Choose Individual / ZIP / Merged PDF and generate

---

## Key Technical Details

- **PDF quality:** Text is rendered as real vector PDF content using ReportLab. The template is never rasterized.
- **Arabic support:** Browser preview uses CSS `direction: rtl`. Export uses `arabic_reshaper` + `python-bidi` for correct ReportLab rendering.
- **Rulers:** Stored as normalized 0–1 coordinates relative to page dimensions. Zoom-independent.
- **Empty role:** When a participant has no role but a role column exists, the name ruler automatically expands to cover both areas.
- **Privacy:** All files are processed by the local backend server. No data is sent externally.

---

## Known Limitations

See `docs/browser-limitations.md` for a full comparison with the Flutter desktop version.

| Limitation | Details |
|---|---|
| Folder save | Chromium only; others get a ZIP |
| Font preview accuracy | Browser rendering may differ slightly from ReportLab export |
| Large batches | 500+ records may take time; use merged or ZIP mode |

---

## Project Structure

```
pdf-batch-gen-web/
├── frontend/          React 18 + TypeScript + Vite
├── backend/           FastAPI + Python 3.12
├── docs/              Architecture, API, migration docs
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## License

Private project — not for public distribution.

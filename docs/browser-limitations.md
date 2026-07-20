# Browser Limitations vs Flutter Desktop

## 1. Folder export
**Flutter:** `FilePicker.getDirectoryPath()` — writes individual PDFs directly to any Windows folder.

**Web:** The File System Access API (`showDirectoryPicker`) is only available in Chromium-based browsers (Chrome, Edge). Firefox and Safari do not support it.

**Web fallback strategy (implemented):**
1. Detect `window.showDirectoryPicker` support.
2. If supported: use it to write files directly.
3. If not: download a ZIP file containing all PDFs.
4. Inform the user with a clear message when falling back.

---

## 2. Subprocess Python execution
**Flutter:** Runs Python as a child process via `Process.run()`.

**Web:** Browsers cannot spawn processes. Python logic is moved entirely to the FastAPI backend server, which runs locally. The browser sends a multipart form request; the server runs the same pipeline and returns a download URL.

---

## 3. Font registration (live preview)
**Flutter:** Loads TTF bytes and passes the file path to ReportLab.

**Web:** Uses the `FontFace` API to register fonts with the browser for CSS rendering (preview only). For export, the actual font file is uploaded to the backend and registered with ReportLab there.

---

## 4. Arabic reshaping (live preview)
**Flutter:** arabic_reshaper + python-bidi in the same process.

**Web:** The browser renders Arabic text using its own shaping engine (HarfBuzz) when `direction: rtl` is set. This is accurate for preview. The Python reshaper is used only on the export path (server-side) to ensure correct ReportLab rendering.

---

## 5. Window sizing
**Flutter:** `window_manager` sets exact window size (1440×900).

**Web:** The page is fully responsive. The design targets a minimum of 1024px wide. Below that, the sidebar collapses into a drawer on tablet and a full-screen step view on mobile.

---

## 6. File size limits
**Flutter:** No upload size limit (local disk access).

**Web:** PDF max 50 MB, font max 10 MB. Browser `fetch` also has practical limits. Large batches (> 500 records) should use the merged or ZIP mode to reduce round trips.

---

## 7. Privacy note
**Flutter:** "Files stay on this device" — strictly local, no network.

**Web:** Files are sent to a **locally running** FastAPI server (`localhost:8000`). No data is sent to any external server. The privacy dialog has been updated to reflect this accurately.

---

## 8. SharedPreferences
**Flutter:** `SharedPreferences` persists UI settings across sessions.

**Web:** `localStorage` via Zustand `persist` middleware. Only safe serializable preferences are persisted (never File objects or object URLs).

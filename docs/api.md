# API Reference

Base URL: `http://localhost:8000/api`

Interactive docs: `http://localhost:8000/api/docs`

---

## GET /health

Health check.

**Response 200**
```json
{ "status": "ok", "service": "pdf-batch-gen" }
```

---

## POST /exports

Start an export job. Returns immediately with a job ID.

**Content-Type:** `multipart/form-data`

| Field | Type | Required | Description |
|---|---|---|---|
| `template` | File (.pdf) | Yes | PDF template (max 50 MB) |
| `records_json` | JSON string | Yes | Array of `{id, name, role}` |
| `name_config` | JSON string | Yes | `TextFieldConfig` for name |
| `role_config` | JSON string | Yes | `TextFieldConfig` for role |
| `settings` | JSON string | Yes | `ExportSettings` |
| `name_ar_font` | File (.ttf/.otf) | No | Arabic font for name |
| `name_en_font` | File (.ttf/.otf) | No | English font for name |
| `role_ar_font` | File (.ttf/.otf) | No | Arabic font for role |
| `role_en_font` | File (.ttf/.otf) | No | English font for role |

**TextFieldConfig schema**
```json
{
  "ruler":       { "left": 0.18, "right": 0.82, "top": 0.43, "bottom": 0.58 },
  "maxFontSize": 48,
  "colorHex":    "#111111",
  "rotation":    0,
  "fontWeight":  400,
  "fontStyle":   "normal"
}
```

**ExportSettings schema**
```json
{
  "textMode":      "auto",
  "exportMethod":  "individual",
  "pageIndex":     0,
  "pageWidth":     595,
  "pageHeight":    842,
  "hasRoleColumn": false,
  "pdfFileName":   "template.pdf"
}
```

**Response 202**
```json
{ "jobId": "uuid-string", "status": "queued" }
```

---

## GET /exports/{jobId}

Poll export status.

**Response 200**
```json
{
  "jobId":            "uuid-string",
  "status":           "processing",
  "completedRecords": 12,
  "totalRecords":     57,
  "percentage":       21,
  "currentName":      "Ahmed Feki",
  "error":            null
}
```

**Status values:** `queued` | `processing` | `completed` | `cancelled` | `failed`

---

## DELETE /exports/{jobId}

Cancel a running export. Sets a threading.Event — processing stops at the next safe checkpoint.

**Response 202**
```json
{ "jobId": "uuid-string", "cancelled": true }
```

---

## GET /exports/{jobId}/download

Download the completed export file.

- Returns `application/pdf` for merged PDF
- Returns `application/zip` for individual or ZIP exports
- Returns `410 Gone` if the file has been cleaned up

**Headers**
```
Content-Disposition: attachment; filename="export.zip"
```

---

## Error responses

All errors use standard HTTP status codes with a JSON body:

```json
{ "detail": "Error message here" }
```

| Code | Meaning |
|---|---|
| 400 | Bad request (validation error, empty file, too many records) |
| 404 | Job not found |
| 410 | Download expired or cleaned up |
| 500 | Internal server error |

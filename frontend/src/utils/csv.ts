import type { CsvParseResult, ParticipantRecord } from '@/types'

/**
 * Parse CSV bytes from a File.
 * - Strips UTF-8 BOM (EF BB BF)
 * - Requires a 'name' column (case-insensitive)
 * - Supports an optional 'role' column
 * - Ignores blank rows
 * - Preserves Arabic text and spaces
 */
export function parseCsvBytes(bytes: Uint8Array): CsvParseResult {
  try {
    // Strip BOM
    let raw: Uint8Array = bytes
    if (bytes.length >= 3 && bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) {
      raw = bytes.slice(3)
    }

    const text  = new TextDecoder('utf-8', { fatal: false }).decode(raw)
    const lines = text.split(/\r?\n/)

    if (lines.length === 0) {
      return { success: false, records: [], hasRoleColumn: false, error: 'csvEmpty' }
    }

    // Parse headers
    const headers = splitCsvLine(lines[0]).map((h) => h.trim())
    const nameIdx = headers.findIndex((h) => h.toLowerCase() === 'name')

    if (nameIdx === -1) {
      return {
        success:      false,
        records:      [],
        hasRoleColumn: false,
        missingField: 'name',
        foundFields:  headers,
      }
    }

    const roleIdx  = headers.findIndex((h) => h.toLowerCase() === 'role')
    const hasRole  = roleIdx !== -1
    const records: ParticipantRecord[] = []

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue
      const cols = splitCsvLine(line)
      const name = nameIdx < cols.length ? cols[nameIdx].trim() : ''
      if (!name) continue
      const role = hasRole && roleIdx < cols.length ? cols[roleIdx].trim() : ''
      records.push({ id: `${i}`, name, role })
    }

    if (records.length === 0) {
      return { success: false, records: [], hasRoleColumn: false, error: 'csvEmpty' }
    }

    return { success: true, records, hasRoleColumn: hasRole }
  } catch (e) {
    return {
      success:      false,
      records:      [],
      hasRoleColumn: false,
      error:        String(e),
    }
  }
}

/**
 * Read a File as Uint8Array.
 */
export async function readFileAsBytes(file: File): Promise<Uint8Array> {
  const buf = await file.arrayBuffer()
  return new Uint8Array(buf)
}

/**
 * Minimal CSV line splitter supporting quoted fields and escaped quotes.
 */
function splitCsvLine(line: string): string[] {
  const fields: string[] = []
  let buf      = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        buf += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      fields.push(buf)
      buf = ''
    } else {
      buf += ch
    }
  }
  fields.push(buf)
  return fields
}

/**
 * Generate a UTF-8 BOM sample CSV as a Blob for download.
 */
export function generateSampleCsv(): Blob {
  const content = '\uFEFFname,role\nأحمد الفقي,مدير\nAhmed Feki,Manager\nسارة العيادي,\nSara Ayadi,\n'
  return new Blob([content], { type: 'text/csv;charset=utf-8;' })
}

import { API_BASE } from '@/config/api'

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: FormData | object
): Promise<T> {
  const init: RequestInit = { method }

  if (body instanceof FormData) {
    init.body = body
  } else if (body) {
    init.headers = { 'Content-Type': 'application/json' }
    init.body    = JSON.stringify(body)
  }

  const res = await fetch(`${API_BASE}${path}`, init)

  if (!res.ok) {
    let msg = res.statusText
    try { const j = await res.json(); msg = j.detail ?? j.message ?? msg } catch (_) {}
    throw new ApiError(res.status, msg)
  }

  const ct = res.headers.get('content-type') ?? ''
  if (ct.includes('application/json')) return res.json() as Promise<T>
  return res as unknown as T
}

export const api = {
  get:    <T>(path: string)                          => request<T>('GET',    path),
  post:   <T>(path: string, body: FormData | object) => request<T>('POST',   path, body),
  delete: <T>(path: string)                          => request<T>('DELETE', path),
}

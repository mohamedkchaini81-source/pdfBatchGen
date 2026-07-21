import { API_BASE } from '@/config/api'

/**
 * Check if the FastAPI backend is reachable.
 * Uses the centralized API_BASE so the URL is never hardcoded here.
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeout    = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(`${API_BASE}/health`, { signal: controller.signal })
    clearTimeout(timeout)
    return res.ok
  } catch {
    return false
  }
}

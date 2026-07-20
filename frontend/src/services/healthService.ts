/**
 * Check if the FastAPI backend is reachable.
 * Returns true if the health endpoint responds, false otherwise.
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const isProd     = import.meta.env.PROD
    const PROD_BACKEND = 'https://pdf-batch-gen-backend.onrender.com'
    const url = isProd
      ? `${import.meta.env.VITE_API_URL ?? PROD_BACKEND}/api/health`
      : '/api/health'

    const controller = new AbortController()
    const timeout    = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)
    return res.ok
  } catch {
    return false
  }
}

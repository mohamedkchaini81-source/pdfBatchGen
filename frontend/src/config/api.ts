/**
 * Centralized API configuration.
 *
 * All API base URLs must come from here — never hardcode Render/localhost
 * URLs directly inside components or other service files.
 *
 * Environment variables:
 *   VITE_API_URL  — set in Render Static Site environment variables
 *                   e.g. https://pdf-batch-gen-backend.onrender.com
 *
 * Local dev:
 *   Vite proxies /api → http://localhost:8000 automatically (vite.config.ts)
 *   So API_BASE stays '/api' in dev mode.
 *
 * Production (Render):
 *   VITE_API_URL is set to the Render backend URL.
 *   API_BASE becomes https://pdf-batch-gen-backend.onrender.com/api
 */

const VITE_API_URL = import.meta.env.VITE_API_URL as string | undefined

export const API_BASE: string = import.meta.env.PROD
  ? `${VITE_API_URL ?? ''}/api`
  : '/api'

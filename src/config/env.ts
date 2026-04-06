type EnvInput = string | undefined

const parseBoolean = (value: EnvInput, fallback: boolean): boolean => {
  if (!value) return fallback
  return value === 'true' || value === '1'
}

const parsePositiveNumber = (value: EnvInput, fallback: number): number => {
  if (!value) return fallback

  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

const normalizeUrl = (value: string): string => value.replace(/\/+$/, '')

export const env = Object.freeze({
  mode: import.meta.env.MODE,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  appName: import.meta.env.VITE_APP_NAME?.trim() || 'SpendSmart',
  apiBaseUrl: normalizeUrl(
    import.meta.env.VITE_API_BASE_URL?.trim() || 'http://localhost:8080',
  ),
  apiTimeoutMs: parsePositiveNumber(import.meta.env.VITE_API_TIMEOUT_MS, 15000),
  enableDevtools: parseBoolean(
    import.meta.env.VITE_ENABLE_DEVTOOLS,
    import.meta.env.DEV,
  ),
})

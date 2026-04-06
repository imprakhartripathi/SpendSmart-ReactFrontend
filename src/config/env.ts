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

const gatewayBaseUrl = normalizeUrl(
  import.meta.env.VITE_API_BASE_URL?.trim() || 'http://localhost:8080',
)

export const env = Object.freeze({
  mode: import.meta.env.MODE,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  appName: import.meta.env.VITE_APP_NAME?.trim() || 'SpendSmart',
  apiBaseUrl: gatewayBaseUrl,
  authApiUrl: normalizeUrl(
    import.meta.env.VITE_AUTH_API_URL?.trim() || `${gatewayBaseUrl}/api/auth`,
  ),
  expenseApiUrl: normalizeUrl(
    import.meta.env.VITE_EXPENSE_API_URL?.trim() || `${gatewayBaseUrl}/api/expenses`,
  ),
  incomeApiUrl: normalizeUrl(
    import.meta.env.VITE_INCOME_API_URL?.trim() || `${gatewayBaseUrl}/api/incomes`,
  ),
  categoryApiUrl: normalizeUrl(
    import.meta.env.VITE_CATEGORY_API_URL?.trim() || `${gatewayBaseUrl}/api/categories`,
  ),
  budgetApiUrl: normalizeUrl(
    import.meta.env.VITE_BUDGET_API_URL?.trim() || `${gatewayBaseUrl}/api/budgets`,
  ),
  analyticsApiUrl: normalizeUrl(
    import.meta.env.VITE_ANALYTICS_API_URL?.trim() || `${gatewayBaseUrl}/api/analytics`,
  ),
  recurringApiUrl: normalizeUrl(
    import.meta.env.VITE_RECURRING_API_URL?.trim() || `${gatewayBaseUrl}/api/recurring`,
  ),
  notificationApiUrl: normalizeUrl(
    import.meta.env.VITE_NOTIFICATION_API_URL?.trim() || `${gatewayBaseUrl}/api/notifications`,
  ),
  apiTimeoutMs: parsePositiveNumber(import.meta.env.VITE_API_TIMEOUT_MS, 15000),
  enableDevtools: parseBoolean(
    import.meta.env.VITE_ENABLE_DEVTOOLS,
    import.meta.env.DEV,
  ),
})

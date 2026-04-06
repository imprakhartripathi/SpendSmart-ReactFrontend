/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME?: string
  readonly VITE_API_BASE_URL?: string
  readonly VITE_AUTH_API_URL?: string
  readonly VITE_EXPENSE_API_URL?: string
  readonly VITE_INCOME_API_URL?: string
  readonly VITE_CATEGORY_API_URL?: string
  readonly VITE_BUDGET_API_URL?: string
  readonly VITE_ANALYTICS_API_URL?: string
  readonly VITE_RECURRING_API_URL?: string
  readonly VITE_NOTIFICATION_API_URL?: string
  readonly VITE_API_TIMEOUT_MS?: string
  readonly VITE_ENABLE_DEVTOOLS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

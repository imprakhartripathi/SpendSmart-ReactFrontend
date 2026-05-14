import { env } from '@/config/env'

export const config = Object.freeze({
  app: {
    name: env.appName,
    mode: env.mode,
  },
  api: {
    baseUrl: env.apiBaseUrl,
    timeoutMs: env.apiTimeoutMs,
    services: {
      auth: env.authApiUrl,
      expense: env.expenseApiUrl,
      income: env.incomeApiUrl,
      category: env.categoryApiUrl,
      budget: env.budgetApiUrl,
      analytics: env.analyticsApiUrl,
      recurring: env.recurringApiUrl,
      notification: env.notificationApiUrl,
    },
  },
  features: {
    enableDevtools: env.enableDevtools,
  },
  routes: {
    home: '/',
  },
})

export type AppConfig = typeof config

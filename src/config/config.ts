import { env } from '@/config/env'

export const config = Object.freeze({
  app: {
    name: env.appName,
    mode: env.mode,
  },
  api: {
    baseUrl: env.apiBaseUrl,
    timeoutMs: env.apiTimeoutMs,
  },
  features: {
    enableDevtools: env.enableDevtools,
  },
  routes: {
    home: '/',
  },
})

export type AppConfig = typeof config

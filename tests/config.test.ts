import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.resetModules()
})

describe('env config', () => {
  it('normalizes URLs, trims values, and parses booleans and numbers', async () => {
    vi.stubEnv('VITE_APP_NAME', '  SpendSmart Pro  ')
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.com///')
    vi.stubEnv('VITE_AUTH_API_URL', 'https://auth.example.com////')
    vi.stubEnv('VITE_API_TIMEOUT_MS', '25000')
    vi.stubEnv('VITE_ENABLE_DEVTOOLS', '0')

    const { env } = await import('@/config/env')

    expect(env.appName).toBe('SpendSmart Pro')
    expect(env.apiBaseUrl).toBe('https://api.example.com')
    expect(env.authApiUrl).toBe('https://auth.example.com')
    expect(env.expenseApiUrl).toBe('https://api.example.com/api')
    expect(env.apiTimeoutMs).toBe(25000)
    expect(env.enableDevtools).toBe(false)
  })

  it('falls back to the gateway api and defaults when env values are missing', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost:8080/')
    vi.stubEnv('VITE_API_TIMEOUT_MS', '-1')

    const { config } = await import('@/config/config')

    expect(config.api.baseUrl).toBe('http://localhost:8080')
    expect(config.api.services.auth).toBe('http://localhost:8080/api')
    expect(config.api.services.notification).toBe('http://localhost:8080/api')
    expect(config.api.timeoutMs).toBe(15000)
    expect(config.features.enableDevtools).toBe(true)
  })
})

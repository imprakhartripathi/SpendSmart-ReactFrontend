import { beforeEach, describe, expect, it, vi } from 'vitest'
import { config } from '@/config/config'
import { requestApi } from '@/services/api'

const { requestMock } = vi.hoisted(() => ({
  requestMock: vi.fn(),
}))

vi.mock('axios', () => ({
  default: {
    request: requestMock,
  },
}))

describe('requestApi', () => {
  beforeEach(() => {
    requestMock.mockReset()
  })

  it('forwards requests to the configured service without auth headers', async () => {
    requestMock.mockResolvedValue({ data: { ok: true } })

    const result = await requestApi<{ ok: boolean }>({
      service: 'expense',
      method: 'GET',
      path: '/expenses/user/42',
    })

    expect(result).toEqual({ ok: true })
    expect(requestMock).toHaveBeenCalledWith({
      baseURL: config.api.services.expense,
      url: '/expenses/user/42',
      method: 'GET',
      timeout: config.api.timeoutMs,
      params: undefined,
      data: undefined,
      headers: {},
    })
  })

  it('adds a bearer token and forwards params and payload', async () => {
    requestMock.mockResolvedValue({ data: { saved: true } })

    const result = await requestApi<{ saved: boolean }>({
      service: 'auth',
      method: 'POST',
      path: '/auth/profile/42',
      token: 'session-token',
      params: { userId: 42, active: true },
      data: { fullName: 'Ada Lovelace' },
    })

    expect(result).toEqual({ saved: true })
    expect(requestMock).toHaveBeenCalledWith({
      baseURL: config.api.services.auth,
      url: '/auth/profile/42',
      method: 'POST',
      timeout: config.api.timeoutMs,
      params: { userId: 42, active: true },
      data: { fullName: 'Ada Lovelace' },
      headers: {
        Authorization: 'Bearer session-token',
      },
    })
  })
})

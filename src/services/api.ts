import axios, { type Method } from 'axios'
import { config } from '@/config/config'
import type { ServiceKey } from '@/app/types'

type ApiRequestParams = Record<string, string | number | boolean>

export type ApiRequestOptions = {
  service: ServiceKey
  method: Method
  path: string
  params?: ApiRequestParams
  data?: unknown
  token?: string | null
}

export async function requestApi<T>({
  service,
  method,
  path,
  params,
  data,
  token,
}: ApiRequestOptions): Promise<T> {
  const headers: Record<string, string> = {}

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await axios.request<T>({
    baseURL: config.api.services[service],
    url: path,
    method,
    timeout: config.api.timeoutMs,
    params,
    data,
    headers,
  })

  return response.data
}

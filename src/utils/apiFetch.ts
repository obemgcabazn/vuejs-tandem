import { useAuthStore } from '@/stores/auth'

const REFRESH_MARGIN_MS = 30_000

function buildHeaders(options: RequestInit, token: string | null): HeadersInit {
  return {
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const authStore = useAuthStore()

  const expiresAt = Number(localStorage.getItem('token-expires-at') ?? 0)
  if (expiresAt && Date.now() > expiresAt - REFRESH_MARGIN_MS) {
    const ok = await authStore.refreshTokens()
    if (!ok) {
      authStore.logout()
      return new Response(null, { status: 401 })
    }
  }

  const token = localStorage.getItem('access-token')
  const response = await fetch(url, { ...options, headers: buildHeaders(options, token) })

  if (response.status !== 401) {
    return response
  }

  const refreshed = await authStore.refreshTokens()
  if (!refreshed) {
    authStore.logout()
    return response
  }

  const newToken = localStorage.getItem('access-token')
  return fetch(url, { ...options, headers: buildHeaders(options, newToken) })
}

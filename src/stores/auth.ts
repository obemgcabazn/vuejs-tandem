import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '@/types/types.ts'

type TokenResp = {
  data: {
    accessToken: string
    refreshToken: string
    expiresIn: number
  }
  timestamp: string
}

export const useAuthStore = defineStore('auth', () => {
  const userString = localStorage.getItem('user')
  const user = ref<User | null>(userString ? JSON.parse(userString) : null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => Boolean(user.value))

  async function login(email: string, password: string) {
    loading.value = true
    error.value = null

    const userData: User = { email, password }
    const url: string = import.meta.env.VITE_API_URL + '/auth/login'

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      if (response.status === 401) {
        const data = await response.json()
        error.value = data.message ?? 'Invalid credentials'
        return
      }

      if (!response.ok) {
        error.value = 'Неизвестная ошибка сервера'
        return
      }

      const respObj = await response.json()
      console.log(respObj)
      setToken(respObj)
      user.value = userData
      localStorage.setItem('user', JSON.stringify(userData))
    } catch (e) {
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  async function register(email: string, name: string, password: string) {
    loading.value = true
    error.value = null

    const userData: User = { email, name, password }
    const url: string = import.meta.env.VITE_API_URL + '/auth/register'

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      if (response.status === 409) {
        error.value = 'Email уже зарегистрирован'
        return
      }

      if (response.status === 400) {
        const data = await response.json()
        error.value = data.message ?? 'Ошибка валидации'
        return
      }

      if (!response.ok) {
        error.value = 'Неизвестная ошибка сервера'
        return
      }

      const respObj = await response.json()
      setToken(respObj)
      user.value = userData
      localStorage.setItem('user', JSON.stringify(userData))
    } catch (e) {
      console.error(e)
    } finally {
      loading.value = false
    }
  }

  async function refreshTokens(): Promise<boolean> {
    const refreshToken = localStorage.getItem('refresh-token')
    if (!refreshToken) return false

    const url: string = import.meta.env.VITE_API_URL + '/auth/refresh'

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })

      if (!response.ok) return false

      const respObj: TokenResp = await response.json()
      setToken(respObj)
      return true
    } catch {
      return false
    }
  }

  function logout() {
    localStorage.removeItem('user')
    localStorage.removeItem('access-token')
    localStorage.removeItem('refresh-token')
    localStorage.removeItem('token-expires-at')
    user.value = null
  }

  return { user, loading, error, isAuthenticated, login, logout, register, refreshTokens }
})

function setToken(tokenObj: TokenResp) {
  const { accessToken, refreshToken, expiresIn } = tokenObj.data
  localStorage.setItem('access-token', accessToken)
  localStorage.setItem('refresh-token', refreshToken)
  localStorage.setItem('token-expires-at', String(Date.now() + expiresIn * 1000))
}

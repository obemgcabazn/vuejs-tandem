import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))

  const isAuthenticated = computed(() => Boolean(token.value))

  function login() {
    localStorage.setItem('token', '123')
  }

  function logout() {
    localStorage.removeItem('token')
  }

  return { isAuthenticated, login, logout }
})

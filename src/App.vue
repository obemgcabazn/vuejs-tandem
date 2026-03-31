<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

async function logout() {
  await auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <header class="nav-header">
    <div class="nav-inner">
      <RouterLink to="/" class="nav-brand">БелАЗ Танdem</RouterLink>
      <nav class="nav-links">
        <RouterLink to="/" class="nav-link">Игра</RouterLink>
        <RouterLink to="/online-mini-game" class="nav-link">Онлайн мини-игра</RouterLink>
        <RouterLink to="/about" class="nav-link">О проекте</RouterLink>
        <RouterLink v-if="auth.isAuthenticated" to="/profile" class="nav-link">Профиль</RouterLink>
        <button v-if="auth.isAuthenticated" class="nav-logout" @click="logout">Выйти</button>
        <RouterLink v-else to="/login" class="nav-login">Войти</RouterLink>
      </nav>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
.nav-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 200;
  background: rgba(26, 22, 18, 0.92);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(107, 83, 68, 0.4);
}

.nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.nav-brand {
  font-size: 16px;
  font-weight: 700;
  color: #f0e8dc;
  text-decoration: none;
  letter-spacing: 0.04em;
  white-space: nowrap;
  flex-shrink: 0;
}

.nav-brand:hover {
  color: #fff;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-link {
  padding: 6px 14px;
  font-size: 14px;
  font-weight: 500;
  color: #b8a898;
  text-decoration: none;
  border-radius: 4px;
  transition:
    color 0.15s,
    background 0.15s;
}

.nav-link:hover {
  color: #f0e8dc;
  background: rgba(107, 83, 68, 0.3);
}

.nav-link.router-link-exact-active {
  color: #f0e8dc;
  background: rgba(107, 83, 68, 0.45);
}

.nav-logout,
.nav-login {
  margin-left: 8px;
  padding: 6px 16px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 4px;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
  text-decoration: none;
}

.nav-logout {
  background: transparent;
  border: 1px solid rgba(107, 83, 68, 0.6);
  color: #b8a898;
}

.nav-logout:hover {
  background: rgba(107, 83, 68, 0.3);
  color: #f0e8dc;
  border-color: rgba(107, 83, 68, 0.9);
}

.nav-login {
  background: #6b5344;
  border: 1px solid transparent;
  color: #f0e8dc;
}

.nav-login:hover {
  background: #8b7355;
}
</style>

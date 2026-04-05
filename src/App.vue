<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'

const auth = useAuthStore()
const router = useRouter()
const theme = useThemeStore()

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
        <button
          class="nav-theme-toggle"
          @click="theme.toggle"
          :title="theme.isDark ? 'Светлая тема' : 'Тёмная тема'"
        >
          {{ theme.isDark ? '☀️' : '🌙' }}
        </button>
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
  background: var(--nav-bg);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--nav-border);
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
  color: var(--nav-text);
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
  color: var(--nav-text-muted);
  text-decoration: none;
  border-radius: 4px;
  transition:
    color 0.15s,
    background 0.15s;
}

.nav-link:hover {
  color: var(--nav-text);
  background: var(--nav-hover-bg);
}

.nav-link.router-link-exact-active {
  color: var(--nav-text);
  background: var(--nav-active-bg);
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
  border: 1px solid var(--nav-border);
  color: var(--nav-text-muted);
}

.nav-logout:hover {
  background: var(--nav-hover-bg);
  color: var(--nav-text);
  border-color: var(--nav-login-bg);
}

.nav-login {
  background: var(--nav-login-bg);
  border: 1px solid transparent;
  color: var(--nav-text);
}

.nav-login:hover {
  background: var(--nav-login-hover);
}

.nav-theme-toggle {
  margin-left: 8px;
  padding: 4px 8px;
  font-size: 16px;
  line-height: 1;
  background: transparent;
  border: 1px solid var(--nav-border);
  border-radius: 4px;
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s;
}

.nav-theme-toggle:hover {
  background: var(--nav-hover-bg);
  border-color: var(--nav-login-bg);
}
</style>

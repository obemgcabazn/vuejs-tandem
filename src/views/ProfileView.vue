<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { User } from '@/types'
import { apiFetch } from '@/utils'

type UserStats = Record<string, string | number>

type UserProgress = Record<string, string | number>

const profile = ref<User | null>(null)
const stats = ref<UserStats | null>(null)
const progress = ref<UserProgress | null>(null)

const loading = ref(false)
const error = ref<string | null>(null)

async function fetchJson(path: string) {
  const response = await apiFetch(import.meta.env.VITE_API_URL + path)
  if (!response.ok) throw new Error(`${path} — ${response.status}`)
  const json = await response.json()
  return json.data ?? json
}

onMounted(async () => {
  loading.value = true
  error.value = null

  try {
    const [profileData, statsData, progressData] = await Promise.all([
      fetchJson('/auth/me'),
      fetchJson('/users/me/stats'),
      fetchJson('/users/me/progress'),
    ])

    profile.value = profileData
    stats.value = statsData
    progress.value = progressData
  } catch {
    error.value = 'Не удалось загрузить данные профиля'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <main class="profile">
    <h1 class="profile__title">Profile</h1>

    <p v-if="loading" class="profile__loading">Загрузка...</p>

    <p v-else-if="error" class="profile__error">{{ error }}</p>

    <div v-else class="profile__columns">
      <!-- Info -->
      <section class="profile__section">
        <h2 class="profile__section-title">Info</h2>
        <template v-if="profile">
          <div v-if="profile.name" class="profile__field">
            <span class="profile__label">Username</span>
            <span class="profile__value">{{ profile.name }}</span>
          </div>
          <div class="profile__field">
            <span class="profile__label">Email</span>
            <span class="profile__value">{{ profile.email }}</span>
          </div>
          <div v-if="profile.role" class="profile__field">
            <span class="profile__label">Role</span>
            <span class="profile__value">{{ profile.role }}</span>
          </div>
          <div v-if="profile.id" class="profile__field">
            <span class="profile__label">ID</span>
            <span class="profile__value">{{ profile.id }}</span>
          </div>
          <div v-if="profile.createdAt" class="profile__field">
            <span class="profile__label">Registration Date</span>
            <span class="profile__value">{{
              new Date(profile.createdAt).toLocaleDateString('ru-RU')
            }}</span>
          </div>
        </template>
      </section>

      <!-- Stats -->
      <section class="profile__section">
        <h2 class="profile__section-title">Statistics</h2>
        <template v-if="stats">
          <div v-for="(value, key) in stats" :key="key" class="profile__field">
            <span class="profile__label">{{ key }}</span>
            <span class="profile__value">{{ value }}</span>
          </div>
        </template>
      </section>

      <!-- Progress -->
      <section class="profile__section">
        <h2 class="profile__section-title">Progress</h2>
        <template v-if="progress">
          <div v-for="(value, key) in progress" :key="key" class="profile__field">
            <span class="profile__label">{{ key }}</span>
            <span class="profile__value">{{ value }}</span>
          </div>
        </template>
      </section>
    </div>
  </main>
</template>

<style scoped>
.profile {
  max-width: 1100px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.profile__title {
  margin-bottom: 1.5rem;
}

.profile__loading {
  opacity: 0.7;
}

.profile__error {
  color: red;
}

.profile__columns {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

@media (max-width: 768px) {
  .profile__columns {
    grid-template-columns: 1fr;
  }
}

.profile__section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border: 1px solid rgba(107, 83, 68, 0.35);
  border-radius: 8px;
  padding: 1.5rem;
}

.profile__section-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.profile__field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.profile__label {
  font-size: 0.75rem;
  opacity: 0.6;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.profile__value {
  font-size: 1rem;
}
</style>

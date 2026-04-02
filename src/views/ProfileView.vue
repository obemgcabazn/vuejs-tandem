<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { User } from '@/types'
import { apiFetch } from '@/utils'
import { patchUserName, patchUserAvatar } from '@/api/requests'

type UserStats = Record<string, string | number>

type UserProgress = string[]

const profile = ref<User | null>(null)
const stats = ref<UserStats | null>(null)
const progress = ref<UserProgress | null>(null)

const loading = ref(false)
const error = ref<string | null>(null)

const isEditingName = ref(false)
const editedName = ref('')
const savingName = ref(false)
const nameError = ref<string | null>(null)

const isEditingAvatar = ref(false)
const editedAvatarUrl = ref('')
const savingAvatar = ref(false)
const avatarError = ref<string | null>(null)
const avatarImgError = ref(false)

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
    editedName.value = profileData.name ?? ''
    editedAvatarUrl.value = profileData.avatarUrl ?? ''
    stats.value = statsData
    progress.value = progressData
  } catch {
    error.value = 'Не удалось загрузить данные профиля'
  } finally {
    loading.value = false
  }
})

function startEdit() {
  editedName.value = profile.value?.name ?? ''
  nameError.value = null
  isEditingName.value = true
}

function startEditAvatar() {
  editedAvatarUrl.value = profile.value?.avatarUrl ?? ''
  avatarError.value = null
  avatarImgError.value = false
  isEditingAvatar.value = true
}

function cancelEditAvatar() {
  isEditingAvatar.value = false
  avatarError.value = null
}

async function removeAvatar() {
  savingAvatar.value = true
  avatarError.value = null
  try {
    const updated = await patchUserAvatar(null)
    if (profile.value) profile.value = { ...profile.value, ...updated, avatarUrl: undefined }
    avatarImgError.value = false
  } catch {
    avatarError.value = 'Не удалось удалить аватар'
  } finally {
    savingAvatar.value = false
  }
}

async function confirmEditAvatar() {
  const trimmed = editedAvatarUrl.value.trim()
  const current = profile.value?.avatarUrl ?? ''
  if (trimmed === current) {
    isEditingAvatar.value = false
    return
  }
  savingAvatar.value = true
  avatarError.value = null
  try {
    const updated = await patchUserAvatar(trimmed || null)
    if (profile.value) profile.value = { ...profile.value, ...updated }
    avatarImgError.value = false
    isEditingAvatar.value = false
  } catch {
    avatarError.value = 'Не удалось сохранить аватар'
  } finally {
    savingAvatar.value = false
  }
}

async function confirmEdit() {
  const trimmed = editedName.value.trim()
  if (!trimmed || trimmed === profile.value?.name) {
    isEditingName.value = false
    return
  }
  savingName.value = true
  nameError.value = null
  try {
    const updated = await patchUserName(trimmed)
    if (profile.value) profile.value = { ...profile.value, ...updated }
    isEditingName.value = false
  } catch {
    nameError.value = 'Не удалось сохранить имя'
  } finally {
    savingName.value = false
  }
}
</script>

<template>
  <main class="profile">
    <h1 class="profile__title">Profile</h1>

    <p v-if="loading" class="profile__loading">Loading...</p>

    <p v-else-if="error" class="profile__error">{{ error }}</p>

    <div v-else class="profile__columns">
      <!-- Info -->
      <section class="profile__section">
        <h2 class="profile__section-title">Info</h2>
        <template v-if="profile">
          <!-- Avatar -->
          <div class="profile__avatar-wrap">
            <div class="profile__avatar">
              <img
                v-if="profile.avatarUrl && !avatarImgError"
                :src="profile.avatarUrl"
                :alt="profile.name ?? 'Avatar'"
                class="profile__avatar-img"
                @error="avatarImgError = true"
              />
              <span v-else class="profile__avatar-initials">
                {{ (profile.name ?? profile.email).charAt(0).toUpperCase() }}
              </span>
              <button
                class="profile__avatar-edit-btn profile__avatar-edit-btn--edit"
                :disabled="savingAvatar"
                title="Change avatar"
                @click="startEditAvatar"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button
                v-if="profile.avatarUrl && !isEditingAvatar"
                class="profile__avatar-edit-btn profile__avatar-edit-btn--delete"
                :disabled="savingAvatar"
                title="Remove avatar"
                @click="removeAvatar"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </button>
            </div>

            <div v-if="isEditingAvatar" class="profile__avatar-editor">
              <input
                v-model="editedAvatarUrl"
                class="profile__input"
                placeholder="https://..."
                :disabled="savingAvatar"
                @keyup.enter="confirmEditAvatar"
                @keyup.esc="cancelEditAvatar"
              />
              <div class="profile__avatar-actions">
                <button
                  class="profile__icon-btn"
                  :disabled="savingAvatar"
                  title="Save"
                  @click="confirmEditAvatar"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </button>
                <button
                  class="profile__icon-btn"
                  :disabled="savingAvatar"
                  title="Cancel"
                  @click="cancelEditAvatar"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <p v-if="avatarError" class="profile__field-error">{{ avatarError }}</p>
            </div>
          </div>

          <!-- Editable name field -->
          <div v-if="profile.name !== undefined" class="profile__field">
            <span class="profile__label">Username</span>
            <div class="profile__editable">
              <input
                v-model="editedName"
                class="profile__input"
                :disabled="!isEditingName || savingName"
                @keyup.enter="confirmEdit"
                @keyup.esc="isEditingName = false"
              />
              <button
                class="profile__icon-btn"
                :disabled="savingName"
                :title="isEditingName ? 'Save' : 'Edit'"
                @click="isEditingName ? confirmEdit() : startEdit()"
              >
                <!-- Checkmark -->
                <svg
                  v-if="isEditingName"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <!-- Pencil -->
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            </div>
            <p v-if="nameError" class="profile__field-error">{{ nameError }}</p>
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
        <span class="profile__value">{{ progress != null ? progress.length / 4 : 0 }} %</span>
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

.profile__editable {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.profile__input {
  flex: 1;
  font-size: 1rem;
  background: transparent;
  border: none;
  border-bottom: 1px solid transparent;
  padding: 0.1rem 0;
  color: inherit;
  outline: none;
  transition: border-color 0.2s;
}

.profile__input:not(:disabled) {
  border-bottom-color: rgba(107, 83, 68, 0.5);
}

.profile__input:disabled {
  cursor: default;
  opacity: 1;
}

.profile__icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.2rem;
  color: inherit;
  opacity: 0.5;
  transition: opacity 0.2s;
  flex-shrink: 0;
}

.profile__icon-btn:hover:not(:disabled) {
  opacity: 1;
}

.profile__icon-btn:disabled {
  cursor: default;
}

.profile__field-error {
  font-size: 0.75rem;
  color: red;
  margin: 0;
}

.profile__avatar-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.profile__avatar {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: visible;
  flex-shrink: 0;
}

.profile__avatar-img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
  border: 2px solid rgba(107, 83, 68, 0.35);
}

.profile__avatar-initials {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(107, 83, 68, 0.15);
  border: 2px solid rgba(107, 83, 68, 0.35);
  font-size: 2rem;
  font-weight: 600;
  text-transform: uppercase;
}

.profile__avatar-edit-btn {
  position: absolute;
  bottom: 0;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(107, 83, 68, 0.7);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  opacity: 0.7;
  transition: opacity 0.2s;
  padding: 0;
}

.profile__avatar-edit-btn--edit {
  right: 0;
}

.profile__avatar-edit-btn--delete {
  left: 0;
  background: rgba(180, 50, 50, 0.7);
}

.profile__avatar-edit-btn:hover:not(:disabled) {
  opacity: 1;
}

.profile__avatar-editor {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.profile__avatar-actions {
  display: flex;
  gap: 0.25rem;
}
</style>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppInput from '@/components/AppInput/AppInput.vue'
import AppButton from '@/components/AppButton/AppButton.vue'

const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const mode = ref<'login' | 'register'>('login')

async function submit() {
  if (mode.value === 'login') {
    await auth.login(email.value, password.value)
  } else {
    await auth.register(email.value, password.value)
  }
  if (auth.isAuthenticated) {
    router.push('/')
  }
}
</script>

<template>
  <div class="container">
    <div class="login-layout">
      <h1>{{ mode === 'login' ? 'Вход' : 'Регистрация' }}</h1>
      <AppInput v-model="email" label="Email" type="email" id="email" />
      <AppInput v-model="password" label="Пароль" type="password" id="password" />
      <p v-if="auth.error" class="error-text">{{ auth.error }}</p>
      <AppButton variant="start" :disabled="auth.loading" @click="submit">
        {{ mode === 'login' ? 'Войти' : 'Зарегистрироваться' }}
      </AppButton>
      <AppButton variant="neutral" @click="mode = mode === 'login' ? 'register' : 'login'">
        {{ mode === 'login' ? 'Создать аккаунт' : 'Уже есть аккаунт' }}
      </AppButton>
    </div>
  </div>
</template>

<style scoped></style>

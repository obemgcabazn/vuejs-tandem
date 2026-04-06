<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { validateName, validatePassword } from '@/utils/loginValidator'
import AppInput from '@/components/AppInput/AppInput.vue'
import AppButton from '@/components/AppButton/AppButton.vue'
import { useLocaleStore } from '@/stores/locale'

const locale = useLocaleStore()

const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const name = ref('')
const mode = ref<'login' | 'register'>('login')
const touched = ref({ email: false, password: false, name: false })

const emailError = computed(() => {
  if (!touched.value.email) return ''
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value) ? '' : 'Введите корректный email'
})

const passwordError = computed(() => {
  if (!touched.value.password) return ''
  return validatePassword(password.value).error
})

const nameError = computed(() => {
  if (mode.value !== 'register' || !touched.value.name) return ''
  return validateName(name.value).error
})

const isFormValid = computed(() => {
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)
  const passwordOk = validatePassword(password.value).isValid
  const nameOk = mode.value !== 'register' || validateName(name.value).isValid
  return emailOk && passwordOk && nameOk
})

function touchAll() {
  touched.value.email = true
  touched.value.password = true
  touched.value.name = true
}

async function submit() {
  touchAll()
  if (!isFormValid.value) return

  if (mode.value === 'login') {
    await auth.login(email.value, password.value)
  } else {
    await auth.register(email.value, name.value, password.value)
  }
  if (auth.isAuthenticated) {
    router.push('/')
  }
}

function switchMode() {
  mode.value = mode.value === 'login' ? 'register' : 'login'
  touched.value = { email: false, password: false, name: false }
}
</script>

<template>
  <div class="container">
    <div class="login-layout">
      <h1>{{ mode === 'login' ? locale.t.login.titleLogin : locale.t.login.titleRegister }}</h1>
      <AppInput
        v-if="mode === 'register'"
        v-model="name"
        :label="locale.t.login.labelName"
        type="text"
        id="name"
        :error="nameError"
        @blur="touched.name = true"
      />
      <AppInput
        v-model="email"
        :label="locale.t.login.labelEmail"
        type="email"
        id="email"
        :error="emailError"
        @blur="touched.email = true"
      />
      <AppInput
        v-model="password"
        :label="locale.t.login.labelPassword"
        type="password"
        id="password"
        :error="passwordError"
        @blur="touched.password = true"
      />
      <p v-if="auth.error" class="error-text">{{ auth.error }}</p>
      <AppButton variant="start" :disabled="auth.loading" @click="submit">
        {{ mode === 'login' ? locale.t.login.submitLogin : locale.t.login.submitRegister }}
      </AppButton>
      <AppButton variant="neutral" @click="switchMode">
        {{ mode === 'login' ? locale.t.login.switchToRegister : locale.t.login.switchToLogin }}
      </AppButton>
    </div>
  </div>
</template>

<style scoped></style>

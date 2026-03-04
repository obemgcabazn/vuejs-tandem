import '@/styles/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/stores/auth'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)

const auth = useAuthStore()
await auth.init()

app.use(router)
app.mount('#app')

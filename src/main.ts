import '@/styles/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { InstallCodeMirror } from 'codemirror-editor-vue3'
import VueQuillEditor from 'vue-quill-editor'
import App from './App.vue'
import router from './router'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(InstallCodeMirror)
app.use(VueQuillEditor)
app.use(router)
app.mount('#app')

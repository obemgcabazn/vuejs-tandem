import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ru } from '@/locales/ru'
import { en } from '@/locales/en'

export type Lang = 'ru' | 'en'

const locales = { ru, en }

function getSavedLang(): Lang {
  const saved = localStorage.getItem('lang')
  return saved === 'ru' || saved === 'en' ? saved : 'ru'
}

export const useLocaleStore = defineStore('locale', () => {
  const lang = ref<Lang>(getSavedLang())

  const t = computed(() => locales[lang.value])

  function toggle() {
    lang.value = lang.value === 'ru' ? 'en' : 'ru'
    localStorage.setItem('lang', lang.value)
  }

  return { lang, t, toggle }
})

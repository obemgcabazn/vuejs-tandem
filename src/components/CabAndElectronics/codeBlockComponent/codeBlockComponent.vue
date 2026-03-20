<template>
  <div class="code-block-container">
    <h2 class="code-block-text">Напишите код для установки кабины и получите 1 василёк</h2>
    <div class="code-block-task">
      Даны запчасти для установки кабины:<br />
      <span class="code-block-task-parts"> {{ taskForCode }} </span> <br />
      Ваша задача — написать функцию с именем <code>filterAndSort(array)</code>, которая примет
      массив, отфильтрует и оставит элементы с количеством букв больше 5 и вернёт новый массив,
      отсортированный в алфавитном порядке (по первой букве слова).
    </div>
    <div class="code-block-input">
      <Codemirror
        v-model:value="code"
        :options="codeMirrorOptions"
        border
        placeholder="Ваш код..."
        :height="200"
      />
      <!-- <textarea
        class="code-block-input-textarea"
        v-model="code"
        placeholder="Ваш код..."
      /> -->
      <p v-if="codeCheckMessage" :class="codeCheckSuccess ? 'code-check-ok' : 'code-check-error'">
        {{ codeCheckMessage }}
      </p>
      <button v-if="!codeCheckSuccess" class="code-block-button" @click="checkCode">
        Проверить
      </button>
      <button v-if="codeCheckSuccess" class="code-block-button" @click="nextTask">
        Следующее задание
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { taskForCode } from '@/questions/questions'
import { useGameStore } from '@/stores/game'
defineOptions({
  name: 'CodeBlockComponent',
})
const code = ref<string>('function filterAndSort(array) {\n  \n}')
const codeCheckMessage = ref('')
const codeCheckSuccess = ref(false)
const gameStore = useGameStore()
const codeMirrorOptions = ref({
  mode: 'javascript',
  theme: 'dracula',
  lineNumbers: true,
  lineWrapping: true,
  indentUnit: 2,
  tabSize: 2,
  autofocus: true,
})
const emit = defineEmits<{
  (e: 'nextTask'): void
}>()

/** Эталон: длина > 5, сортировка по первой букве */
function getExpectedResult(array: string[]): string[] {
  return [...array]
    .filter((word) => word.length > 5)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
}

function nextTask() {
  emit('nextTask')
}
function checkCode() {
  codeCheckMessage.value = ''
  codeCheckSuccess.value = false
  if (!code.value.trim()) {
    codeCheckMessage.value = 'Введите код функции.'
    return
  }
  try {
    const fn = new Function(
      code.value + '; return typeof filterAndSort === "function" ? filterAndSort : null;',
    )()
    if (typeof fn !== 'function') {
      codeCheckMessage.value = 'В коде должна быть объявлена функция с именем filterAndSort(arr).'
      return
    }
    const result = fn([...taskForCode])
    const expected = getExpectedResult(taskForCode)
    if (!Array.isArray(result)) {
      codeCheckMessage.value = 'Функция должна возвращать массив.'
      return
    }
    const expectedStr = JSON.stringify(expected)
    const resultStr = JSON.stringify(result)
    if (resultStr !== expectedStr) {
      codeCheckMessage.value = `Ожидалось: [${expected.join(', ')}]. Получено: [${result.join(', ')}].`
      return
    }
    codeCheckSuccess.value = true
    codeCheckMessage.value = 'Верно! Функция работает правильно.'
    gameStore.addVasilki()
  } catch (e) {
    codeCheckMessage.value = `Ошибка: ${e instanceof Error ? e.message : String(e)}`
  }
}
</script>

<style lang="css" scoped>
@import './codeBlockComponent.css';
</style>

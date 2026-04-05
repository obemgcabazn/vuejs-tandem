<template>
  <div class="code-block-container">
    <h2 class="code-block-text">Напишите код для установки кабины и получите 1 василёк</h2>
    <div class="code-block-task">
      Даны запчасти для установки кабины:<br />
      <span class="code-block-task-parts"> {{ codeTask?.title }} </span> <br />
      {{ codeTask?.description }}
    </div>
    <div class="code-block-input">
      <Codemirror
        v-model:value="code"
        :options="codeMirrorOptions"
        border
        placeholder="Ваш код..."
        :height="200"
      />
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
import { ref, onMounted } from 'vue'
import { randomQuestions } from '@/helpers/randomQuestions'
import { useGameStore } from '@/stores/game'
import type { ITask } from '@/types/types'
import { getAllTopics, getTasksByTopicId } from '@/api/requests'
import { postToJudgeUsersAnswer } from '@/api/requests'
import { postToJudgeForHint } from '@/api/requests'
defineOptions({
  name: 'CodeBlockComponent',
})
const isLoading = ref<boolean>(false)

const code = ref<string>('function ... (...) {\n  \n}')
const codeCheckMessage = ref('')
const codeCheckSuccess = ref(false)
const gameStore = useGameStore()
const codeTask = ref<ITask | null>(null)
const isCorrect = ref<boolean | null>(null)
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
  (e: 'incorrectAnswer'): void
}>()

onMounted(async () => {
  isLoading.value = true
  const topics = await getAllTopics()
  const JSTopic = topics.data.data.find((topic) => topic.title === 'JavaScript Fundamentals')
  if (JSTopic) {
    const tasksResponse = await getTasksByTopicId(JSTopic.id)
    const codeTasks = tasksResponse.data.filter((task) => task.type === 'code')
    codeTask.value = randomQuestions(1, codeTasks)[0] ?? null
  }
  isLoading.value = false
})

function nextTask() {
  emit('nextTask')
}
async function checkCode() {
  codeCheckMessage.value = ''
  codeCheckSuccess.value = false
  if (!code.value.trim()) {
    codeCheckMessage.value = 'Введите код функции.'
    return
  }
  isLoading.value = true
  codeCheckMessage.value = ''

  try {
    const response = await postToJudgeUsersAnswer({
      taskId: codeTask.value?.id ?? '',
      answer: code.value,
    })

    if (!response.ok) {
      let errorMessage = 'Не удалось проверить ответ'

      try {
        const errorData = await response.json()
        if (errorData?.message) {
          errorMessage = errorData.message
        }
      } catch {
        errorMessage = 'Некорректный формат ответа сервера'
      }

      isCorrect.value = false
      codeCheckSuccess.value = false
      codeCheckMessage.value = errorMessage
      return
    }

    const data = await response.json()
    const result = data?.data

    if (!result) {
      throw new Error('Некорректный формат ответа сервера')
    }

    const score = Number(result.score ?? 0)
    const feedback = result.feedback ?? 'Ответ проверен'

    if (score > 50) {
      isCorrect.value = true
      codeCheckSuccess.value = true
      codeCheckMessage.value = feedback
      gameStore.addVasilki()
    } else {
      isCorrect.value = false
      codeCheckSuccess.value = false

      const hintResponse = await postToJudgeForHint({
        taskId: codeTask.value?.id ?? '',
        currentAnswer: code.value,
      })
      const hintData = await hintResponse.json()
      const hint = hintData.data.hint
      codeCheckMessage.value = `Ответ неверный! Подсказка: ${hint}`

      if (!hintResponse.ok) {
        console.error('Не удалось получить подсказку')
        return
      }

      incorrectAnswer()
    }
  } catch (error) {
    console.error('Ошибка при проверке ответа:', error)
    isCorrect.value = false
    codeCheckSuccess.value = false
    codeCheckMessage.value = 'Ошибка сети или сервера. Попробуйте ещё раз.'
  } finally {
    isLoading.value = false
  }
}

function incorrectAnswer() {
  emit('incorrectAnswer')
}
</script>

<style lang="css" scoped>
@import './codeBlockComponent.css';
</style>

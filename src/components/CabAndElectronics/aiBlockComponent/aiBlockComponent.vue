<template>
  <div class="ai-block-container">
    <GearSpinner v-if="isLoadingTask" :size="56" :isLabel="true" />
    <template v-else-if="currentTask">
      <h2 class="ai-block-text">
        Работа цеха почти налажена, осталось только ответить на вопрос, и искусственный интеллект
        проверит ваш ответ
      </h2>
      <p class="ai-block-question">{{ currentTask.description }}</p>
      <p class="ai-block-question">{{ currentTask.title }}</p>
      <div ref="editorRef" class="ai-block-answer-input ai-block-quill-root" />
      <p v-if="answerCheckMessage" :class="answerCheckSuccess ? 'ai-check-ok' : 'ai-check-error'">
        {{ answerCheckMessage }}
      </p>
      <button
        v-if="!isLoading && !answerCheckSuccess"
        type="button"
        class="ai-block-answer-button"
        @click="checkAnswer"
      >
        Ответить
      </button>
      <button v-if="isLoading" type="button" disabled class="ai-block-answer-button">
        <GearSpinner :size="22" :isLabel="false" />
      </button>
      <button
        v-if="answerCheckSuccess"
        type="button"
        class="ai-block-answer-button"
        @click="emit('correctAnswer')"
      >
        Завершить
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import type { ITask } from '@/types/types'
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import { useGameStore } from '@/stores/game'
import GearSpinner from '@/components/Spinner/GearSpinner.vue'
import {
  getAllTopics,
  getTasksByTopicId,
  postToJudgeUsersAnswer,
  postToJudgeForHint,
} from '@/api/requests'

defineOptions({
  name: 'AiBlockComponent',
})

const emit = defineEmits<{
  (e: 'correctAnswer'): void
  (e: 'incorrectAnswer'): void
}>()

const gameStore = useGameStore()

const isLoadingTask = ref(false)
const isLoading = ref(false)
const currentTask = ref<ITask | null>(null)
const answer = ref('')
const answerCheckMessage = ref('')
const answerCheckSuccess = ref(false)

const editorRef = ref<HTMLElement | null>(null)
let quillInstance: Quill | null = null
let onTextChange: (() => void) | null = null

function getAnswerPlain(): string {
  if (quillInstance) {
    return quillInstance.getText().replace(/\n+$/, '').trim()
  }
  return answer.value
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function destroyQuill() {
  if (quillInstance && onTextChange) {
    quillInstance.off('text-change', onTextChange)
  }
  onTextChange = null
  quillInstance = null
  if (editorRef.value) {
    editorRef.value.innerHTML = ''
  }
}

function initQuill() {
  const el = editorRef.value
  if (!el) return

  destroyQuill()

  const quill = new Quill(el, {
    theme: 'snow',
    placeholder: 'Ваш ответ',
  })

  onTextChange = () => {
    answer.value = quill.root.innerHTML
  }
  quill.on('text-change', onTextChange)
  quillInstance = quill
}

watch(
  () => [isLoadingTask.value, currentTask.value] as const,
  async ([loading, task]) => {
    if (loading || !task) {
      destroyQuill()
      return
    }
    await nextTick()
    initQuill()
  },
  { flush: 'post' },
)

onMounted(async () => {
  isLoadingTask.value = true
  const topics = await getAllTopics()
  const JSTopic = topics.data.data.find((topic) => topic.title === 'JavaScript Fundamentals')
  if (JSTopic) {
    const tasksResponse = await getTasksByTopicId(JSTopic.id)
    const randomTask = tasksResponse.data[Math.floor(Math.random() * tasksResponse.data.length)]
    if (randomTask) {
      currentTask.value = randomTask
    }
  }
  isLoadingTask.value = false
})

onBeforeUnmount(() => {
  destroyQuill()
})

async function checkAnswer() {
  const plain = getAnswerPlain()
  if (!plain) {
    answerCheckSuccess.value = false
    answerCheckMessage.value = 'Введите ответ'
    return
  }

  if (!currentTask.value) return

  isLoading.value = true
  answerCheckMessage.value = ''

  try {
    const response = await postToJudgeUsersAnswer({
      taskId: currentTask.value.id,
      answer: plain,
    })

    if (!response.ok) {
      let errorMessage = 'Не удалось проверить ответ'
      try {
        const errorData = await response.json()
        if (errorData?.message) errorMessage = errorData.message
      } catch {
        errorMessage = 'Некорректный формат ответа сервера'
      }
      answerCheckSuccess.value = false
      answerCheckMessage.value = errorMessage
      return
    }

    const data = await response.json()
    const result = data?.data

    if (!result) {
      throw new Error('Некорректный формат ответа сервера')
    }

    const score = Number(result.score ?? 0)
    const feedback = result.feedback ?? 'Ответ проверен'
    const vasilkiCount = result.zoneProgress?.vasilkiCount
    const errorCount = result.zoneProgress?.errorCount
    if (score > 50) {
      answerCheckSuccess.value = true
      answerCheckMessage.value = feedback
      if (typeof vasilkiCount === 'number') {
        gameStore.setVasilki(vasilkiCount)
      }
    } else {
      answerCheckSuccess.value = false

      const hintResponse = await postToJudgeForHint({
        taskId: currentTask.value.id,
        currentAnswer: plain,
      })
      const hintData = await hintResponse.json()

      if (hintResponse.ok && hintData?.data?.hint) {
        answerCheckMessage.value = `Ответ неверный! Подсказка: ${hintData.data.hint}`
      } else {
        answerCheckMessage.value = feedback
      }

      if (typeof errorCount === 'number') {
        gameStore.setError(errorCount)
      }
      emit('incorrectAnswer')
    }
  } catch (error) {
    console.error('Ошибка при проверке ответа:', error)
    answerCheckSuccess.value = false
    answerCheckMessage.value = 'Ошибка сети или сервера. Попробуйте ещё раз.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style lang="css" scoped>
@import './aiBlockComponent.css';
</style>

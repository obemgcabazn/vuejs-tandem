<template>
  <h2 class="cab-and-electronics-title" style="margin-bottom: 20px">
    Цех монтажа кабины и электроники
  </h2>
  <GearSpinner v-if="isLoading" :size="56" :isLabel="true" />
  <QuestionTestComponent
    v-if="testBlock && currentQuestionData"
    :questionProperty="currentQuestionData"
    @nextQuestion="nextQuestion"
  />
  <CodeBlockComponent v-if="codeBlock" @nextTask="nextTask" />
  <AiBlockComponent v-if="aiBlock" @correctAnswer="finishGame" @incorrectAnswer="addError" />
  <div v-if="!isGameFinished && !isLoading" class="mini-game-container">
    <button @click="finishGame" style="width: 230px; background: rgb(236, 193, 51)">
      Завершить зону(для разработки)
    </button>
    <button @click="startMiniGame">Начать мини-игру</button>
  </div>
  <div v-if="isGameFinished">
    <h2 class="cab-and-electronics-title">
      Цех монтажа кабины и электроники заработал! Поздравляем!
    </h2>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import { computed, onMounted, ref } from 'vue'
import type { ITaskResponse } from '@/types/types'
import GearSpinner from '@/components/Spinner/GearSpinner.vue'
import QuestionTestComponent from './questionTestComponent/questionTestComponent.vue'
import CodeBlockComponent from './codeBlockComponent/codeBlockComponent.vue'
import AiBlockComponent from './aiBlockComponent/aiBlockComponent.vue'

import { apiEndpoints } from '@/api/endpoints'
import { apiFetch } from '@/utils'

import { randomQuestions } from '@/helpers/randomQuestions'

defineOptions({
  name: 'CabAndElectronics',
})
const testBlock = ref<boolean>(false)
const codeBlock = ref<boolean>(false)
const aiBlock = ref<boolean>(false)
const gameStore = useGameStore()
const isLoading = ref<boolean>(false)
const tasks = ref<ITaskResponse[]>([])
const questionsForUser = ref<ITaskResponse[]>([])
const currentQuestion = ref(0)
const currentQuestionData = computed(() => questionsForUser.value[currentQuestion.value])
const isGameFinished = ref<boolean>(false)
const emit = defineEmits<{
  (e: 'CabAndElectronicsFinished'): void
}>()
onMounted(async () => {
  // testBlock.value = true
  isLoading.value = true
  const response = await apiFetch(
    import.meta.env.VITE_API_URL +
      apiEndpoints.topics.getTasksByTopicId('813f9901-ed98-4729-83b4-65270f8d8dd9'),
  )
  if (response.ok) {
    const data: { data?: ITaskResponse[] } = await response.json()
    tasks.value = Array.isArray(data.data) ? data.data : []
    console.log(data)
    questionsForUser.value = await randomQuestions(3, tasks.value)
    testBlock.value = true
  } else {
    console.error('Failed to fetch tasks')
  }
  isLoading.value = false
})

function nextTask() {
  codeBlock.value = false
  aiBlock.value = true
}

function startMiniGame() {
  isGameFinished.value = false
  testBlock.value = true
  codeBlock.value = false
  aiBlock.value = false
  currentQuestion.value = 0
}

function nextQuestion() {
  if (currentQuestion.value < questionsForUser.value.length - 1) {
    currentQuestion.value = currentQuestion.value + 1
  } else {
    testBlock.value = false
    codeBlock.value = true
  }
}

// function addVasilki() {
//   gameStore.addVasilki()
//   nextQuestion()
// }

function addError() {
  gameStore.addError()
}

function finishGame() {
  gameStore.addVasilki()
  testBlock.value = false
  codeBlock.value = false
  aiBlock.value = false
  isGameFinished.value = true
  setTimeout(() => {
    gameStore.setZoneCompleted(3)
    emit('CabAndElectronicsFinished')
  }, 2000)
}
</script>

<style lang="scss" scoped>
@import './CabAndElectronics.css';
</style>

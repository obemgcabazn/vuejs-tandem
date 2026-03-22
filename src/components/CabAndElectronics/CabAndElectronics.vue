<template>
  <h2 class="cab-and-electronics-title" style="margin-bottom: 20px">
    Цех монтажа кабины и электроники
  </h2>
  <GearSpinner v-if="isLoading" :size="56" :isLabel="true" />
  <MiniGameSnake v-if="miniGameSnake" @close="miniGameSnake = false" />
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
    <button @click="startMiniGame">
      {{ miniGameSnake ? 'Закрыть мини-игру' : 'Начать мини-игру' }}
    </button>
  </div>
  <div v-if="isGameFinished">
    <h2 class="cab-and-electronics-title">
      Цех монтажа кабины и электроники заработал! Поздравляем!
    </h2>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'CabAndElectronics',
})
import { useGameStore } from '@/stores/game'
import { computed, onMounted, ref } from 'vue'
import GearSpinner from '@/components/Spinner/GearSpinner.vue'
import QuestionTestComponent from './questionTestComponent/questionTestComponent.vue'
import CodeBlockComponent from './codeBlockComponent/codeBlockComponent.vue'
import AiBlockComponent from './aiBlockComponent/aiBlockComponent.vue'
import MiniGameSnake from '../MiniGameSnake/MiniGameSnake.vue'
import type { ITask } from '@/types/types'
import { getAllTopics, getTasksByTopicId } from '@/api/requests'
import { randomQuestions } from '@/helpers/randomQuestions'
import quietEngineStartUrl from '@/sounds/quiet-engine-start.mp3'

type TCurrentBlock = 'test' | 'code' | 'ai'
const testBlock = ref<boolean>(false)
const codeBlock = ref<boolean>(false)
const aiBlock = ref<boolean>(false)
const codeTask = ref<ITask | null>(null)
const gameStore = useGameStore()
const isLoading = ref<boolean>(false)
const tasks = ref<ITask[]>([])
const questionsForUser = ref<ITask[]>([])
const currentQuestion = ref(0)
const currentQuestionData = computed(() => questionsForUser.value[currentQuestion.value])
const isGameFinished = ref<boolean>(false)
const miniGameSnake = ref<boolean>(false)
const currentBlock = ref<TCurrentBlock>('test')
const emit = defineEmits<{
  (e: 'CabAndElectronicsFinished'): void
}>()
onMounted(async () => {
  isLoading.value = true
  const topics = await getAllTopics()
  const JSTopic = topics.data.data.find((topic) => topic.title === 'JavaScript Fundamentals')
  if (JSTopic) {
    const tasksResponse = await getTasksByTopicId(JSTopic.id)
    const testTasks = tasksResponse.data.filter((task) => task.type === 'multiple_choice')
    const codeTasks = tasksResponse.data.filter((task) => task.type === 'code')
    tasks.value = testTasks ?? []
    questionsForUser.value = randomQuestions(3, tasks.value)
    codeTask.value = randomQuestions(1, codeTasks)[0] || null
    testBlock.value = true
  }
  isLoading.value = false
})

function nextTask() {
  codeBlock.value = false
  aiBlock.value = true
  currentBlock.value = 'ai'
}

function startMiniGame() {
  if (miniGameSnake.value) {
    miniGameSnake.value = false
    isGameFinished.value = false
    switch (currentBlock.value) {
      case 'test':
        testBlock.value = true
        break
      case 'code':
        codeBlock.value = true
        break
      case 'ai':
        aiBlock.value = true
        break

      default:
        break
    }
  } else {
    isGameFinished.value = false
    testBlock.value = false
    codeBlock.value = false
    aiBlock.value = false
    miniGameSnake.value = true
  }
}

function nextQuestion() {
  if (currentQuestion.value < questionsForUser.value.length - 1) {
    currentQuestion.value = currentQuestion.value + 1
  } else {
    testBlock.value = false
    codeBlock.value = true
    currentBlock.value = 'code'
  }
}

function addError() {
  gameStore.addError()
}

function finishGame() {
  const finishSound = new Audio(quietEngineStartUrl)
  finishSound.play().catch(() => {})

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

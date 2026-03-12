<template>
  <h2 class="cab-and-electronics-title">Цех монтажа кабины и электроники</h2>

  <QuestionTestComponent
    v-if="testBlock && currentQuestionData"
    :questionProperty="currentQuestionData"
    @correctAnswer="addVasilki"
    @incorrectAnswer="addError"
  />
  <CodeBlockComponent v-if="codeBlock" @nextTask="nextTask" />
  <AiBlockComponent v-if="aiBlock" @correctAnswer="finishGame" @incorrectAnswer="addError" />
  <div v-if="isGameFinished">
    <h2 class="cab-and-electronics-title">
      Цех монтажа кабины и электроники заработал! Поздравляем!
    </h2>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import { computed, onMounted, ref } from 'vue'
import QuestionTestComponent from './questionTestComponent/questionTestComponent.vue'
import CodeBlockComponent from './codeBlockComponent/codeBlockComponent.vue'
import AiBlockComponent from './aiBlockComponent/aiBlockComponent.vue'
import { questions } from '@/questions/questions'

import { randomQuestions } from '@/helpers/randomQuestions'

defineOptions({
  name: 'CabAndElectronics',
})
const testBlock = ref<boolean>(false)
const codeBlock = ref<boolean>(false)
const aiBlock = ref<boolean>(false)
const gameStore = useGameStore()
const questionsForUser = randomQuestions(3, questions)
const currentQuestion = ref(0)
const currentQuestionData = computed(() => questionsForUser[currentQuestion.value])
const isGameFinished = ref<boolean>(false)
const emit = defineEmits<{
  (e: 'CabAndElectronicsFinished'): void
}>()
onMounted(async () => {
  testBlock.value = true
})

function nextTask() {
  codeBlock.value = false
  aiBlock.value = true
}

function nextQuestion() {
  if (currentQuestion.value < questionsForUser.length - 1) {
    currentQuestion.value = currentQuestion.value + 1
  } else {
    testBlock.value = false
    codeBlock.value = true
  }
}

function addVasilki() {
  gameStore.addVasilki()
  nextQuestion()
}

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

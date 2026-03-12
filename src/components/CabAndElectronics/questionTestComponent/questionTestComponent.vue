<template>
  <div class="test-block-text">
    Пройдите тест для получения доступа к цеху (за каждый правильный ответ вы получаете 1 василёк)
    <div>
      <p class="question-text">{{ questionProperty.question }}</p>
      <div
        v-for="variant in questionProperty.variants"
        :key="variant"
        class="variant-text"
        :class="{ active: selectedVariant === variant }"
        @click="selectVariant(variant)"
      >
        <p>{{ variant }}</p>
      </div>
      <p v-if="codeCheckMessage" :class="codeCheckSuccess ? 'code-check-ok' : 'code-check-error'">
        {{ codeCheckMessage }}
      </p>
      <button @click="checkAnswer">Ответить</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Question } from '@/types/types'
import { ref } from 'vue'
const selectedVariant = ref<string | null>(null)
const isCorrect = ref<boolean | null>(null)
const codeCheckMessage = ref('')
const codeCheckSuccess = ref(false)

defineOptions({
  name: 'QuestionTestComponent',
})

function selectVariant(variant: string) {
  selectedVariant.value = variant
}

function checkAnswer() {
  if (selectedVariant.value === props.questionProperty.correct) {
    isCorrect.value = true
    codeCheckSuccess.value = true
    codeCheckMessage.value = 'Верно!'
    setTimeout(() => {
      emit('correctAnswer')
      codeCheckMessage.value = ''
      codeCheckSuccess.value = false
    }, 1000)
  } else {
    isCorrect.value = false
    codeCheckSuccess.value = false
    codeCheckMessage.value = 'Неверно!'
    emit('incorrectAnswer')
  }
}

const emit = defineEmits<{
  (e: 'correctAnswer'): void
  (e: 'incorrectAnswer'): void
}>()
const props = defineProps<{
  questionProperty: Question
}>()
</script>

<style lang="scss" scoped>
@import './questionTestComponent.css';
</style>

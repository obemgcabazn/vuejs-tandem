<template>
  <div class="test-block-text">
    Пройдите тест для получения доступа к цеху (за каждый правильный ответ вы получаете 1 василёк)
    <div>
      <p class="question-description">{{ questionProperty.description }}</p>
      <p class="question-text">{{ questionProperty.title }}</p>
      <div
        v-for="variant in questionProperty.options"
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
      <button v-if="!isLoading && !codeCheckSuccess" @click="checkAnswer">Ответить</button>
      <button v-if="isLoading" disabled><GearSpinner :size="22" :isLabel="false" /></button>
      <button v-if="codeCheckSuccess" @click="nextQuestion">Следующий вопрос</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import { ref } from 'vue'
import GearSpinner from '@/components/Spinner/GearSpinner.vue'
import type { ITask } from '@/types/types'
import { postToJudgeUsersAnswer, postToJudgeForHint } from '@/api/requests'
const isLoading = ref<boolean>(false)
const selectedVariant = ref<string | null>(null)
const isCorrect = ref<boolean | null>(null)
const codeCheckMessage = ref('')
const codeCheckSuccess = ref(false)
const gameStore = useGameStore()

defineOptions({
  name: 'QuestionTestComponent',
})
const props = defineProps<{
  questionProperty: ITask
}>()

function selectVariant(variant: string) {
  selectedVariant.value = variant
}

async function checkAnswer() {
  if (!selectedVariant.value) {
    isCorrect.value = false
    codeCheckSuccess.value = false
    codeCheckMessage.value = 'Выберите вариант ответа'
    return
  }

  isLoading.value = true
  codeCheckMessage.value = ''

  try {
    const response = await postToJudgeUsersAnswer({
      taskId: props.questionProperty.id,
      answer: selectedVariant.value,
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
    // const vasilkiCount = result.zoneProgress?.vasilkiCount
    const errorCount = result.zoneProgress?.errorCount

    if (score > 50) {
      isCorrect.value = true
      codeCheckSuccess.value = true
      codeCheckMessage.value = feedback

      // if (typeof vasilkiCount === 'number') {
      //   gameStore.setVasilki(vasilkiCount)
      // }
      gameStore.addVasilki()
    } else {
      isCorrect.value = false
      codeCheckSuccess.value = false

      const hintResponse = await postToJudgeForHint({
        taskId: props.questionProperty.id,
        currentAnswer: selectedVariant.value,
      })
      const hintData = await hintResponse.json()
      const hint = hintData.data.hint
      codeCheckMessage.value = `Ответ неверный! Подсказка: ${hint}`

      if (!hintResponse.ok) {
        console.error('Не удалось получить подсказку')
        return
      }

      if (typeof errorCount === 'number') {
        gameStore.setError(errorCount)
      }
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

function nextQuestion() {
  emit('nextQuestion')
  codeCheckMessage.value = ''
  codeCheckSuccess.value = false
}
const emit = defineEmits<{
  (e: 'correctAnswer'): void
  (e: 'incorrectAnswer'): void
  (e: 'nextQuestion'): void
}>()
</script>

<style lang="scss" scoped>
@import './questionTestComponent.css';
</style>

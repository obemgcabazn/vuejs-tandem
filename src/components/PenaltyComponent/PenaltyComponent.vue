<template>
  <GearSpinner v-if="isLoadingTask" :size="56" :isLabel="true" />
  <div v-else class="penalty-component">
    <h1>Завод стоп-кран!!!</h1>
    <p>
      Главный инженер: «Ты сделал 2 ошибки, значит не понимаешь, как работает этот механизм. Напиши
      документацию к нему своими словами, иначе уволю».
    </p>
    <p class="penalty-component-question">{{ currentTask?.description }}</p>
    <p class="penalty-component-question">{{ currentTask?.title }}</p>
    <textarea class="penalty-component-answer-input" v-model="answer" />
    <p
      v-if="answerCheckMessage"
      :class="answerCheckSuccess ? 'penalty-component-check-ok' : 'penalty-component-check-error'"
    >
      {{ answerCheckMessage }}
    </p>
    <button v-if="!isLoading" class="penalty-component-button" @click="checkAnswer">
      Ответить
    </button>
    <button v-if="isLoading" type="button" disabled class="penalty-component-button">
      <GearSpinner :size="22" :isLabel="false" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGameStore } from '@/stores/game'
import GearSpinner from '@/components/Spinner/GearSpinner.vue'
import type { ITask } from '@/types/types'
import {
  getAllTopics,
  getTasksByTopicId,
  postToJudgeUsersAnswer,
  postToJudgeForHint,
} from '@/api/requests'

const gameStore = useGameStore()
defineOptions({
  name: 'PenaltyComponent',
})
const emit = defineEmits<{
  (e: 'finishPenaltyRound'): void
}>()
const answer = ref('')
const isLoadingTask = ref(false)
const currentTask = ref<ITask | null>(null)
const answerCheckMessage = ref('')
const answerCheckSuccess = ref(false)
const isLoading = ref(false)

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

async function checkAnswer() {
  if (!answer.value.trim()) {
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
      answer: answer.value,
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
    if (score > 50) {
      answerCheckSuccess.value = true
      answerCheckMessage.value = feedback
      gameStore.resetError()
      gameStore.resetVasilki()
      emit('finishPenaltyRound')
    } else {
      answerCheckSuccess.value = false
      const hintResponse = await postToJudgeForHint({
        taskId: currentTask.value.id,
        currentAnswer: answer.value,
      })
      const hintData = await hintResponse.json()

      if (hintResponse.ok && hintData?.data?.hint) {
        answerCheckMessage.value = `Ответ неверный! Подсказка: ${hintData.data.hint}`
      } else {
        answerCheckMessage.value = feedback
      }
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
<style scoped src="./PenaltyComponent.css"></style>

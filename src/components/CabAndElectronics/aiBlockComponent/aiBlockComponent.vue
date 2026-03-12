<template>
  <div class="ai-block-container">
    <h2 class="ai-block-text">
      Работа цеха почти налажена, осталось только ответить на вопрос, и исскуственный интеллект
      проверит ваш ответ
    </h2>
    <h3 class="ai-block-question">
      {{ question }}
    </h3>
    <textarea type="text" class="ai-block-answer-input" v-model="answer" placeholder="Ваш ответ" />
    <p
      v-if="answerCheckMessage"
      :class="answerCheckSuccess ? 'answer-check-ok' : 'answer-check-error'"
    >
      {{ answerCheckMessage }}
    </p>
    <p v-if="AiAnswer">
      {{ AiAnswer }}
    </p>
    <button class="ai-block-answer-button" @click="checkAnswer">Ответить</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { openrouterRequest } from '@/open AI Requests/openrouter.request'
import { textRequest } from '@/open AI Requests/openrouter.request'
defineOptions({
  name: 'AiBlockComponent',
})
const question = ref(
  'Чем отличаются var, let и const при объявлении переменных в JavaScript? Приведи простой пример, когда использование const вызовет ошибку.',
)
const answer = ref('')
const answerCheckMessage = ref('')
const answerCheckSuccess = ref(false)
const answerCheckError = ref(false)
const AiAnswer = ref('')

async function checkAnswer() {
  if (!answer.value.trim()) {
    answerCheckMessage.value = 'Введите ответ'
    answerCheckSuccess.value = false
    answerCheckError.value = true
    return
  }
  const aiRequest = textRequest(question.value, answer.value)
  const AI_Answer = await openrouterRequest(aiRequest)

  AiAnswer.value = AI_Answer
  console.log(AiAnswer.value)
  if (AI_Answer.split(' ')[AI_Answer.split(' ').length - 1].toLowerCase() === 'true') {
    answerCheckSuccess.value = true
    answerCheckMessage.value = 'Верно!'
    setTimeout(() => {
      emit('correctAnswer')
    }, 2000)
    emit('correctAnswer')
  } else {
    answerCheckSuccess.value = false
    answerCheckMessage.value = 'Неверно!'
    emit('incorrectAnswer')
  }
}
const emit = defineEmits<{
  (e: 'correctAnswer'): void
  (e: 'incorrectAnswer'): void
}>()
</script>

<style lang="css" scoped>
@import './aiBlockComponent.css';
</style>

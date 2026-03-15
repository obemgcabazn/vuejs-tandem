<script setup lang="ts">
import { ref, watch } from 'vue'
import AppButton from '@/components/AppButton/AppButton.vue'

const level = ref(0)
const availableAnswers = ref<string[]>([])
const finalAnswer = ref<string[]>([])

const dataCode = [
  `
  setTimeout(function timeout() {
   console.log('Таймаут');
  }, 0);

  let p = new Promise(function(resolve, reject) {
    console.log('Создание промиса');
    resolve();
  });

  p.then(function(){
    console.log('Обработка промиса');
  });

  console.log('Конец скрипта');`,
  `
  console.log(1); 
  setTimeout(() => console.log(2));
  Promise.resolve().then(() => console.log(3));
  Promise.resolve().then(() => setTimeout(() => console.log(4)));
  Promise.resolve().then(() => console.log(5));
  setTimeout(() => console.log(6));
  console.log(7);`,
  `
  console.log(1); 
  setTimeout(() => console.log(2));
  Promise.reject(3).catch(console.log);
  new Promise(resolve => setTimeout(resolve)).then(() => console.log(4));
  Promise.resolve(5).then(console.log);
  console.log(6);
  setTimeout(() => console.log(7),0);`,
]
const dataAnswers = [
  ['Создание промиса', 'Конец скрипта', 'Обработка промиса', 'Таймаут'],
  ['1', '7', '3', '5', '2', '6', '4'],
  ['1', '6', '3', '5', '2', '4', '7'],
]

function shuffleArray(array: string[]): string[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = shuffled[i]!
    shuffled[i] = shuffled[j]!
    shuffled[j] = temp
  }
  return shuffled
}

const initLevel = () => {
  const answers = dataAnswers[level.value] ?? []
  availableAnswers.value = shuffleArray(answers)
  finalAnswer.value = []
}

initLevel()
watch(level, () => initLevel())

const dragItem = ref<{
  value: string
  source: 'available' | 'final'
  index: number
} | null>(null)

function onDragStart(
  event: DragEvent,
  value: string,
  source: 'available' | 'final',
  index: number,
) {
  dragItem.value = { value, source, index }
  event.dataTransfer?.setData('text/plain', '')
}

const onDrop = (event: DragEvent, targetIndex: number, targetZone: 'available' | 'final') => {
  event.preventDefault()
  if (!dragItem.value) return

  const { source, index: sourceIndex } = dragItem.value

  if (source === targetZone && sourceIndex === targetIndex) {
    return
  }

  const sourceArray = source === 'available' ? availableAnswers.value : finalAnswer.value
  const [removed] = sourceArray.splice(sourceIndex, 1)

  if (!removed) return

  const targetArray = targetZone === 'available' ? availableAnswers.value : finalAnswer.value
  let insertIndex = targetIndex + 1

  if (source === targetZone && sourceIndex < targetIndex) {
    insertIndex--
  }

  targetArray.splice(insertIndex, 0, removed)

  availableAnswers.value = [...availableAnswers.value]
  finalAnswer.value = [...finalAnswer.value]
}

const onDropToEmptyFinal = (event: DragEvent) => {
  event.preventDefault()
  if (!dragItem.value) return

  const { source, index: sourceIndex } = dragItem.value
  const sourceArray = source === 'available' ? availableAnswers.value : finalAnswer.value
  const [removed] = sourceArray.splice(sourceIndex, 1)

  if (removed) {
    finalAnswer.value.push(removed)
    availableAnswers.value = [...availableAnswers.value]
    finalAnswer.value = [...finalAnswer.value]
  }
}

function checkAnswer() {
  const correctAnswer = dataAnswers[level.value]
  const userAnswer = finalAnswer.value
  if (JSON.stringify(correctAnswer) === JSON.stringify(userAnswer)) {
    if (level.value < dataCode.length - 1) {
      level.value += 1
    } else {
    }
  }
}
</script>

<template>
  <div class="engine-shop">
    <div class="engine-shop__container">
      <div class="engine-shop__task task">
        <h3>Task</h3>
        <div class="task__container">
          <pre class="task__code">{{ dataCode[level] }}</pre>
        </div>
      </div>

      <div class="engine-shop__answers answers">
        <h3>Расставь в <br />правильном <br />порядке то, что <br />выведет код</h3>
        <div class="answers__container">
          <div
            v-for="(answer, index) in availableAnswers"
            :key="`avail-${answer}-${index}`"
            :data-index="index"
            class="answer-item"
            draggable="true"
            @dragover.prevent
            @dragstart="onDragStart($event, answer, 'available', index)"
            @dragend="dragItem = null"
          >
            {{ answer }}
          </div>
        </div>

        <div class="final-answer" @dragover.prevent @drop="onDropToEmptyFinal($event)">
          <div
            v-for="(answer, index) in finalAnswer"
            :key="`final-${answer}-${index}`"
            :data-index="index"
            class="answer-item"
            draggable="true"
            @dragstart="onDragStart($event, answer, 'final', index)"
            @dragover.prevent
            @drop="onDrop($event, index, 'final')"
            @dragend="dragItem = null"
          >
            {{ answer }}
          </div>
        </div>
        <AppButton
          variant="start"
          :disabled="finalAnswer.length !== dataAnswers[level]?.length"
          @click="checkAnswer"
          >Проверить</AppButton
        >
      </div>
    </div>
  </div>
</template>
<style scoped src="./EngineShopView.scss"></style>

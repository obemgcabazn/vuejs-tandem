<script setup lang="ts">
import { computed } from 'vue'

const level = 1

const dataCode = {
  '1': `
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
  '2': `
  console.log(1); 
  setTimeout(() => console.log(2));
  Promise.resolve().then(() => console.log(3));
  Promise.resolve().then(() => setTimeout(() => console.log(4)));
  Promise.resolve().then(() => console.log(5));
  setTimeout(() => console.log(6));
  console.log(7);
  console.log(1)`,
  '3': `
  console.log(1); 
  setTimeout(() => console.log(2));
  Promise.reject(3).catch(console.log);
  new Promise(resolve => setTimeout(resolve)).then(() => console.log(4));
  Promise.resolve(5).then(console.log);
  console.log(6);
  setTimeout(() => console.log(7),0);`,
}
const dataAnswers = {
  '1': ['Создание промиса', 'Конец скрипта', 'Обработка промиса', 'Таймаут'],
  '2': ['1', '7', '3', '5', '2', '6', '4'],
  '3': ['1', '6', '3', '5', '2', '4', '7'],
}

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

const shuffledAnswers = computed(() => {
  const answers = dataAnswers[level]
  return shuffleArray(answers)
})
</script>

<template>
  <div class="engine-shop">
    <div class="engine-shop__container">
      <div class="engine-shop__task task">
        <h3>Task</h3>
        <div class="task__container">
          <pre class="task__code">{{ dataCode[level] }}</pre>
        </div>
        <button>Проветрить</button>
      </div>

      <div class="engine-shop__answers answers">
        <h3>Answers</h3>
        <div class="answers__container">
          <div v-for="(answer, index) in shuffledAnswers" :key="index" class="answer-item">
            {{ answer }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
$base-color: #f5f0e6;
$box-shadow-panel:
  inset 0 0 0 1px rgba(107, 83, 68, 0.3),
  4px 4px 0 rgba(0, 0, 0, 0.08);

%full-height {
  height: 100%;
  min-height: 100vh;
}

%task-container {
  padding: 20px;
  @extend %full-height;
  background: $base-color;
  border: 3px solid #6b5344;
  border-radius: 2px;
  box-shadow: $box-shadow-panel;
}

#app {
  background-color: $base-color;
}

.engine-shop {
  width: 100%;
  @extend %full-height;
  background: url('../../public/engine-shop.png');
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}

.engine-shop__header {
  border: 1px solid $base-color;
  padding: 30px;
  text-align: center;
  color: $base-color;
  font-size: 30px;
}

.engine-shop__container {
  display: flex;
  justify-content: space-between;
  padding: 40px;
}

.engine-shop__task {
  @extend %task-container;
}

.engine-shop__answers {
  @extend %task-container;
}
</style>

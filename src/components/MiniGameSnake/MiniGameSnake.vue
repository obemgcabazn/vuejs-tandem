<template>
  <div class="mini-game-snake-container">
    <h2 class="mini-game-snake-title">Мини-игра змейка</h2>
    <div class="mini-game-snake-score">Счёт: {{ score }}</div>
    <div class="mini-game-snake-wrapper">
      <canvas
        ref="canvasRef"
        class="mini-game-snake-canvas"
        :width="canvasSize"
        :height="canvasSize"
      ></canvas>
      <div v-if="!isPlaying" class="mini-game-snake-overlay">
        <p v-if="!gameOver" class="mini-game-snake-instruction">Нажмите пробел для начала игры</p>
        <p v-else class="mini-game-snake-gameover">Игра окончена! Счёт: {{ score }}</p>
      </div>
    </div>
    <p class="mini-game-snake-controls">Управление: стрелки</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

defineOptions({
  name: 'MiniGameSnake',
})

const emit = defineEmits<{
  (e: 'gameFinished', score: number): void
}>()

const CELL_SIZE = 20
const GRID_SIZE = 20
const canvasSize = GRID_SIZE * CELL_SIZE

const canvasRef = ref<HTMLCanvasElement | null>(null)
const score = ref(0)
const isPlaying = ref(false)
const gameOver = ref(false)

type Direction = 'up' | 'down' | 'left' | 'right'

let snake: { x: number; y: number }[] = []
let food: { x: number; y: number } = { x: 0, y: 0 }
let currentDirection: Direction = 'right'
let nextDirection: Direction = 'right'
let gameLoopIntervalId: ReturnType<typeof setInterval> | null = null

const COLORS = {
  background: '#e8e0d5',
  snake: '#5a8c4a',
  snakeHead: '#2d5016',
  food: '#b71c1c',
  grid: '#8b7355',
  border: '#3d3229',
}

function getRandomFoodPosition(): { x: number; y: number } {
  let x: number
  let y: number
  do {
    x = Math.floor(Math.random() * GRID_SIZE)
    y = Math.floor(Math.random() * GRID_SIZE)
  } while (snake.some((segment) => segment.x === x && segment.y === y))
  return { x, y }
}

function initGame() {
  const startX = Math.floor(GRID_SIZE / 2)
  const startY = Math.floor(GRID_SIZE / 2)
  snake = [
    { x: startX - 2, y: startY },
    { x: startX - 1, y: startY },
    { x: startX, y: startY },
  ]
  food = getRandomFoodPosition()
  currentDirection = 'right'
  nextDirection = 'right'
  score.value = 0
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.fillStyle = COLORS.background
  ctx.fillRect(0, 0, canvasSize, canvasSize)

  for (let i = 0; i < GRID_SIZE; i++) {
    for (let j = 0; j < GRID_SIZE; j++) {
      ctx.strokeStyle = COLORS.grid
      ctx.strokeRect(i * CELL_SIZE, j * CELL_SIZE, CELL_SIZE, CELL_SIZE)
    }
  }

  snake.forEach((segment, index) => {
    ctx.fillStyle = index === snake.length - 1 ? COLORS.snakeHead : COLORS.snake
    ctx.fillRect(segment.x * CELL_SIZE + 1, segment.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2)
  })

  ctx.fillStyle = COLORS.food
  ctx.beginPath()
  ctx.arc(
    food.x * CELL_SIZE + CELL_SIZE / 2,
    food.y * CELL_SIZE + CELL_SIZE / 2,
    CELL_SIZE / 2 - 2,
    0,
    Math.PI * 2,
  )
  ctx.fill()
}

function update() {
  if (!isPlaying.value) return

  currentDirection = nextDirection

  const lastSegment = snake[snake.length - 1]
  if (!lastSegment) return
  const head: { x: number; y: number } = { x: lastSegment.x, y: lastSegment.y }

  switch (currentDirection) {
    case 'up':
      head.y -= 1
      break
    case 'down':
      head.y += 1
      break
    case 'left':
      head.x -= 1
      break
    case 'right':
      head.x += 1
      break
  }

  if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
    endGame()
    return
  }

  if (snake.some((s) => s.x === head.x && s.y === head.y)) {
    endGame()
    return
  }

  snake.push(head)

  if (head.x === food.x && head.y === food.y) {
    score.value += 10
    food = getRandomFoodPosition()
  } else {
    snake.shift()
  }

  draw()
}

function startGame() {
  gameOver.value = false
  isPlaying.value = true
  initGame()
  draw()
  if (gameLoopIntervalId) {
    clearInterval(gameLoopIntervalId)
    gameLoopIntervalId = null
  }
  gameLoopIntervalId = setInterval(() => {
    update()
    if (!isPlaying.value && gameLoopIntervalId) {
      clearInterval(gameLoopIntervalId)
      gameLoopIntervalId = null
    }
  }, 120)
}

function endGame() {
  isPlaying.value = false
  gameOver.value = true
  if (gameLoopIntervalId) {
    clearInterval(gameLoopIntervalId)
    gameLoopIntervalId = null
  }
  emit('gameFinished', score.value)
}

function handleKeydown(e: KeyboardEvent) {
  switch (e.key) {
    case 'ArrowUp':
      if (currentDirection !== 'down') nextDirection = 'up'
      break
    case 'ArrowDown':
      if (currentDirection !== 'up') nextDirection = 'down'
      break
    case 'ArrowLeft':
      if (currentDirection !== 'right') nextDirection = 'left'
      break
    case 'ArrowRight':
      if (currentDirection !== 'left') nextDirection = 'right'
      break
    case ' ':
      e.preventDefault()
      if (!isPlaying.value) startGame()
      break
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  initGame()
  draw()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (gameLoopIntervalId) {
    clearInterval(gameLoopIntervalId)
  }
})
</script>

<style scoped lang="scss">
@import './MiniGameSnake.css';
</style>

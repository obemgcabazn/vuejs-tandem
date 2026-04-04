<template>
  <div class="room-view">
    <h2 class="room-view-title">ID комнаты: {{ props.room?.roomId }}</h2>
    <div class="room-view-content">
      <h3>Участники:</h3>
      <ul class="room-view-members">
        <li class="room-view-member" v-for="member in members" :key="member.userId">
          <div class="room-view-member-rank">
            Место: <span>{{ member.rank ? member.rank : '-' }}</span>
          </div>
          <div class="room-view-member-name">{{ member.name }}</div>

          <div class="room-view-member-score">
            Очки: <span>{{ member.score }}</span>
          </div>
          <div class="room-view-member-status">
            Статус:
            <span :class="getMemberStatusClass(member.ready ? true : false)">{{
              member.ready ? 'Готов' : 'В ожидании'
            }}</span>
          </div>

          <button
            class="room-view-member-button"
            v-if="!member.ready && member.name === user"
            @click="setReady"
          >
            Готов
          </button>
        </li>
      </ul>
    </div>
    <div v-if="isGameStarted" class="room-view-game-container">
      <div class="room-view-game-task">
        <h3>Задание {{ (gameTask?.taskIndex ?? 0) + 1 }} из {{ gameTask?.totalTasks ?? '—' }}</h3>
        <p>{{ gameTask?.task.title }}</p>
        <p>{{ gameTask?.task.description }}</p>
        <textarea
          placeholder="Введите ответ"
          class="room-view-game-task-input"
          rows="4"
          v-model="answer"
        />
        <button class="room-view-game-task-button" @click="submitAnswer">Ответить</button>

        <p v-if="isGameWaiting" class="room-view-game-task-waiting">
          Ожидание ответа остальных игроков
        </p>
      </div>
    </div>
    <p v-if="isGameFinished" class="room-view-game-winner">
      Победитель: {{ winnerName }} ({{ winnerScore }} очков)!
    </p>
    <button v-if="isGameFinished" class="room-view-game-back" @click="goBack">Назад</button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import type {
  IRoomResponse,
  IGameTask,
  ITaskCompleted,
  IRoomMember,
  ITaskCompletedScore,
  ITaskFinishedScore,
  PostToLeaderboard,
} from '@/types/types'
import { postToLeaderboard } from '@/api/requests'
import type { Socket } from 'socket.io-client'

const isGameStarted = ref<boolean>(false)
const isGameFinished = ref<boolean>(false)
const isGameWaiting = ref<boolean>(false)
const gameTask = ref<IGameTask | null>(null)
const answer = ref<string>('')

const authStore = useAuthStore()
const user = authStore.user?.email

const winnerName = ref<string>('')
const winnerScore = ref<number>(0)
const props = defineProps<{
  room: IRoomResponse | null
  socket: Socket
}>()
const members = ref<IRoomMember[]>(props.room?.members ?? [])
const emit = defineEmits(['goBack', 'updateLeaderboard'])
watch(
  () => props.room?.members,
  (newMembers) => {
    members.value = newMembers ? [...newMembers] : []
  },
  { deep: true, immediate: true },
)

onMounted(() => {
  props.socket.on('game:task', (payload: IGameTask) => {
    isGameStarted.value = true
    gameTask.value = payload
  })

  props.socket.on('game:task-complete', (payload: ITaskCompleted) => {
    isGameWaiting.value = false
    members.value = payload.scores.map((score: ITaskCompletedScore) => ({
      userId: score.userId,
      name: score.name,
      score: score.totalScore,
      ready: true,
      rank: 0,
    }))
  })

  props.socket.on('game:finished', async (payload) => {
    isGameWaiting.value = false
    members.value = payload.results.map((score: ITaskFinishedScore) => ({
      userId: score.userId,
      name: score.name,
      score: score.totalScore,
      ready: true,
      rank: score.rank,
    }))
    winnerName.value = members.value.find((member) => member.rank === 1)?.name ?? ''
    winnerScore.value = members.value.find((member) => member.rank === 1)?.score ?? 0
    const winner: PostToLeaderboard = {
      userId: members.value.find((member) => member.rank === 1)?.userId ?? '',
      userEmail: winnerName.value,
      points: winnerScore.value,
      date: new Date().toISOString(),
    }
    try {
      const response = await postToLeaderboard(winner)
      if (response.ok) {
        emit('updateLeaderboard')
      }
    } catch (error) {
      console.error('Ошибка! Не удалось добавить победителя в таблицу рекордов', error)
    } finally {
      isGameStarted.value = false
      isGameFinished.value = true
      gameTask.value = null
      answer.value = ''
    }
  })
})

function goBack() {
  isGameFinished.value = false
  isGameWaiting.value = false
  isGameStarted.value = false
  gameTask.value = null
  answer.value = ''
  emit('goBack')
}

function setReady() {
  props.socket.emit('room:ready')
}

function getMemberStatusClass(status: boolean): string {
  if (status) return 'member-status-ready'
  return 'member-status-waiting'
}

function submitAnswer() {
  props.socket.emit('game:answer', { answer: answer.value })
  answer.value = ''
  isGameWaiting.value = true
}
</script>

<style scoped>
@import './RoomView.css';
</style>

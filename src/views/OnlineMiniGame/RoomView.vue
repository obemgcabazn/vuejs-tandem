<template>
  <div class="room-view">
    <h2 class="room-view-title">Комната: {{ props.room?.roomId }}</h2>
    <div class="room-view-content">
      <h3>Участники</h3>
      <ul class="room-view-members">
        <li class="room-view-member" v-for="member in members" :key="member.userId">
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
          <div class="room-view-member-rank">
            Место: <span>{{ member.rank }}</span>
          </div>
        </li>
      </ul>
    </div>
    <div v-if="isGameStarted" class="room-view-game-container">
      <div class="room-view-game-task">
        <h3>Задание {{ gameTask?.taskIndex }} из {{ gameTask?.totalTasks }}</h3>
        <p>{{ gameTask?.task.title }}</p>
        <p>{{ gameTask?.task.description }}</p>
        <textarea
          placeholder="Введите ответ"
          class="room-view-game-task-input"
          rows="4"
          v-model="answer"
        />
        <button class="room-view-game-task-button" @click="submitAnswer">Ответить</button>
      </div>
    </div>
    <button class="room-view-game-back" @click="goBack">Назад</button>
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
} from '@/types/types'
import type { Socket } from 'socket.io-client'

const isGameStarted = ref<boolean>(false)
const gameTask = ref<IGameTask | null>(null)
const answer = ref<string>('')

const authStore = useAuthStore()
const user = authStore.user?.email
console.log(user)
const props = defineProps<{
  room: IRoomResponse | null
  socket: Socket
}>()
const members = ref<IRoomMember[]>(props.room?.members ?? [])
const emit = defineEmits(['goBack'])
watch(
  () => props.room?.members,
  (newMembers) => {
    members.value = newMembers ? [...newMembers] : []
  },
  { deep: true, immediate: true },
)

onMounted(() => {
  console.log('RoomView mounted', props.room)
  props.socket.on('game:task', (payload: IGameTask) => {
    console.log('game:task', payload)
    isGameStarted.value = true
    gameTask.value = payload
  })
  props.socket.on('game:ready', (payload) => {
    console.log('game:ready', payload)
  })
  props.socket.on('game:task-complete', (payload: ITaskCompleted) => {
    console.log('game:task-complete', payload)
    members.value = payload.scores.map((score: ITaskCompletedScore) => ({
      userId: score.userId,
      name: score.name,
      score: score.totalScore,
      ready: true,
      rank: 0,
    }))
  })

  props.socket.on('game:finished', (payload) => {
    console.log('game:finished', payload)
    members.value = payload.results.map((score: ITaskFinishedScore) => ({
      userId: score.userId,
      name: score.name,
      score: score.totalScore,
      ready: true,
      rank: score.rank,
    }))
    isGameStarted.value = false
    gameTask.value = null
    answer.value = ''
  })
})

function goBack() {
  console.log('goBack')
  emit('goBack')
}

function setReady() {
  console.log('setReady')
  props.socket.emit('room:ready')
}

function getMemberStatusClass(status: boolean): string {
  if (status) return 'member-status-ready'
  return 'member-status-waiting'
}

function submitAnswer() {
  console.log('submitAnswer', answer.value)
  props.socket.emit('game:answer', { answer: answer.value })
  answer.value = ''
}
</script>

<style scoped>
@import './RoomView.css';
</style>

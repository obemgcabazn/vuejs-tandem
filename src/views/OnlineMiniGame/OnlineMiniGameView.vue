<template>
  <div class="page-layout-online-mini-game">
    <div class="online-mini-game-wrapper">
      <h2 class="online-mini-game-title">Онлайн мини-игра по изучению JavaScript</h2>
      <GearSpinner v-if="isLoading" :size="56" :isLabel="true" />

      <h3>Комнаты</h3>
      <div v-if="rooms.length === 0 && !isLoading">
        <p>Нет активных комнат</p>
      </div>

      <template v-if="rooms.length > 0">
        <div v-for="room in rooms" :key="room.id" class="online-mini-game-room">
          <!-- <h3>ID комнаты: {{ room.id }}</h3> -->
          <p>
            Хост: <span> {{ room.hostName }}</span>
          </p>
          <p>
            Тема: <span> {{ getTopicTitle(room?.topicId ?? '') }}</span>
          </p>
          <p>
            Участников: <span> {{ room.memberCount }}</span>
          </p>
          <p>
            Макс. кол-во участников: <span> {{ room.maxMembers }}</span>
          </p>
          <p>
            Статус: <span :class="getRoomStatusClass(room.status)"> {{ room.status }}</span>
          </p>
          <button @click="joinRoom(room.id)">Присоединиться</button>
        </div>
      </template>

      <template v-if="!isLoading">
        <p class="online-mini-game-description">Выберите тему и создайте комнату для игры</p>
        <div v-if="!isLoading" ref="topicsListEl" class="online-mini-game-content">
          <div
            v-for="topic in topics"
            :key="topic.id"
            class="online-mini-game-content-item"
            @click="(e) => chooseTopic(e, topic.id)"
          >
            {{ topic.title }}
          </div>
        </div>
        <button
          :disabled="selectedTopicId === null || isSubmittingTopic"
          class="online-mini-game-content-button"
          @click="selectTopic"
        >
          Выбрать тему и создать комнату
        </button>
      </template>
      <!-- <h2 v-if="selectedTopicTitle" class="online-mini-game-subtitle">
        Вы выбрали тему: {{ selectedTopicTitle }}
      </h2> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, onUnmounted } from 'vue'
import { getAllTopics } from '@/api/requests'
import GearSpinner from '@/components/Spinner/GearSpinner.vue'
import type { ITopicData } from '@/types/types'
import { io } from 'socket.io-client'
import { getAllPublickRooms } from '@/api/requests'
import type { IPublicRoomDto } from '@/types/types'

const topics = ref<Array<ITopicData>>([])
const isLoading = ref<boolean>(false)
const selectedTopicId = ref<string | null>(null)
const selectedTopicTitle = ref<string | null>(null)
const topicsListEl = ref<HTMLElement | null>(null)
// const isTopicSelected = ref<boolean>(false)
const isSubmittingTopic = ref<boolean>(false)
const rooms = ref<IPublicRoomDto[]>([])
const accessToken = localStorage.getItem('access-token') ?? ''
const socket = io('http://localhost:3000/game', {
  transports: ['websocket'],
  auth: accessToken ? { token: `Bearer ${accessToken}` } : undefined,
})

defineOptions({
  name: 'OnlineMiniGame',
})

onMounted(async () => {
  console.log('OnlineMiniGame mounted')
  socket.connect()
  isLoading.value = true

  try {
    const topicsResponse = await getAllTopics()
    topics.value = topicsResponse.data.data
    const roomsResponse = await getAllPublickRooms()
    console.log(roomsResponse)
    rooms.value = roomsResponse.data
  } finally {
    isLoading.value = false
  }
  socket.on('connect', () => {
    console.log('connected', socket.id)
  })
  socket.on('disconnect', () => {
    console.log('disconnected')
  })
  socket.on('message', (payload) => {
    console.log('message from server:', payload)
  })

  socket.on('room:state', (payload) => {
    console.log('room:state:', payload)
  })
  socket.on('room:create', (payload) => {
    console.log('room:create:', payload)
  })

  socket.on('connect_error', (err) => {
    console.error('connect_error', err.message)
  })
})

function removeActiveFromTopics() {
  const root = topicsListEl.value
  if (!root) return

  root
    .querySelectorAll<HTMLElement>('.online-mini-game-content-item.active')
    .forEach((el) => el.classList.remove('active'))
}

function chooseTopic(e: Event, topicId: string) {
  const el = e.currentTarget
  if (!(el instanceof HTMLElement)) return
  removeActiveFromTopics()
  selectedTopicId.value = topicId
  selectedTopicTitle.value = el.textContent
  el.classList.add('active')
}

function joinRoom(roomId: string) {
  socket.emit('room:join', { roomId })
}
function getTopicTitle(topicId: string): string {
  return topics.value.find((topic) => topic.id === topicId)?.title ?? ''
}

function getRoomStatusClass(status: string): string {
  if (status === 'waiting') return 'room-status-waiting'
  if (status === 'in_progress') return 'room-status-in-progress'
  if (status === 'finished') return 'room-status-finished'
  return ''
}

async function selectTopic() {
  if (selectedTopicId.value === null || isSubmittingTopic.value) return

  isSubmittingTopic.value = true
  try {
    socket.emit('room:create', { topicId: selectedTopicId.value })
    const roomsResponse = await getAllPublickRooms()

    rooms.value = roomsResponse.data
  } catch (error) {
    console.error('Failed to select topic for online game:', error)
  } finally {
    isSubmittingTopic.value = false
    removeActiveFromTopics()
  }
}
onUnmounted(() => {
  // socket.off('connect')
  // socket.off('disconnect')
  // socket.off('message')
  // socket.off('room:state')
  // socket.disconnect()
})
</script>

<style scoped>
@import './OnlineMiniGameView.css';
</style>

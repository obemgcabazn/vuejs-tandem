<template>
  <div class="page-layout-online-mini-game">
    <div class="online-mini-game-wrapper">
      <h2 class="online-mini-game-title">Онлайн мини-игра по изучению JavaScript</h2>
      <GearSpinner v-if="isLoading" :size="56" :isLabel="true" />
      <div v-if="!isLoading && !isJoinedToRoom">
        <h3>Комнаты:</h3>
        <div v-if="rooms.length === 0 && !isLoading">
          <p>Нет активных комнат</p>
        </div>

        <template v-if="rooms.length > 0">
          <div v-for="room in rooms" :key="room.roomId" class="online-mini-game-room">
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
            <button @click="joinRoom(room.roomId)">Присоединиться</button>
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
            Cоздать комнату и войти
          </button>
        </template>
      </div>
      <RoomView v-if="isJoinedToRoom" :room="currentRoom" :socket="socket" @goBack="backToRooms" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, onUnmounted } from 'vue'
import RoomView from './RoomView.vue'
import { getAllTopics } from '@/api/requests'
import GearSpinner from '@/components/Spinner/GearSpinner.vue'
import type { ITopicData } from '@/types/types'
import { io } from 'socket.io-client'
import { getAllPublicRooms } from '@/api/requests'
import type { IPublicRoomDto, IRoomResponse, RoomCreatedEvent, IRoom } from '@/types/types'

defineOptions({
  name: 'OnlineMiniGame',
})

const topics = ref<Array<ITopicData>>([])
const isLoading = ref<boolean>(false)
const selectedTopicId = ref<string | null>(null)
const selectedTopicTitle = ref<string | null>(null)
const topicsListEl = ref<HTMLElement | null>(null)
const isJoinedToRoom = ref<boolean>(false)
const isSubmittingTopic = ref<boolean>(false)
const rooms = ref<IRoom[]>([])
const accessToken = localStorage.getItem('access-token') ?? ''
console.log('accessToken', accessToken)
//IRoomResponse
const currentRoom = ref<IRoomResponse | null>(null)
const ROOM_ID_KEY = 'current-room-id'
const currentRoomId = ref<string | null>(sessionStorage.getItem(ROOM_ID_KEY))

const socket = io('http://localhost:3000/game', {
  autoConnect: false,
  forceNew: true,
  transports: ['websocket', 'polling'],
  auth: { token: `Bearer ${accessToken}` },
})

function setCurrentRoomId(roomId: string | null) {
  currentRoomId.value = roomId
  if (roomId) {
    sessionStorage.setItem(ROOM_ID_KEY, roomId)
  } else {
    sessionStorage.removeItem(ROOM_ID_KEY)
  }
}

onMounted(async () => {
  console.log('OnlineMiniGame mounted')
  isLoading.value = true

  try {
    const topicsResponse = await getAllTopics()
    topics.value = topicsResponse.data.data
    const roomsResponse = await getAllPublicRooms()
    console.log(roomsResponse)
    rooms.value = roomsResponse.data.map(
      (room: IPublicRoomDto): IRoom => ({
        roomId: room.id,
        hostName: room.hostName,
        topicId: room.topicId ?? null,
        memberCount: room.memberCount,
        maxMembers: 6,
        status: room.status,
      }),
    )
  } finally {
    isLoading.value = false
  }
  socket.on('connect', () => {
    console.log('connected', socket.id)
  })
  socket.on('disconnect', (payload) => {
    console.log('disconnected', payload)
    isJoinedToRoom.value = false
    currentRoom.value = null
    setCurrentRoomId(null)
    rooms.value = []
    selectedTopicId.value = null
    selectedTopicTitle.value = null
    topicsListEl.value = null
    isSubmittingTopic.value = false
  })
  socket.on('message', (payload) => {
    console.log('message from server:', payload)
  })
  socket.on('session', (payload) => {
    console.log('session:', payload)
  })

  socket.on('room:state', (payload) => {
    console.log('room:state:', payload)
    if (payload) {
      currentRoom.value = payload
    }
  })
  socket.on('room:create', (payload) => {
    console.log('room:create:', payload)
    if (payload?.roomId) {
      setCurrentRoomId(payload.roomId)
    }
  })
  socket.on('room:created', (payload: RoomCreatedEvent) => {
    console.log('room:created:', payload)
    if (payload) {
      const newRoom: IRoom = {
        roomId: payload.roomId,
        hostName: payload.hostName,
        topicId: payload.topicId,
        memberCount: payload.membersCount,
        maxMembers: 6,
        status: 'waiting',
      }
      rooms.value.push(newRoom)
    }
  })

  socket.on('connect_error', (err: Error & { description?: unknown; data?: unknown }) => {
    console.error('connect_error', {
      message: err.message,
      description: err.description,
      data: err.data,
    })
  })
  socket.on('error', (err) => {
    console.error('socket_error', err)
  })
  socket.connect()
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
  selectedTopicTitle.value = getTopicTitle(topicId)
  el.classList.add('active')
}

function joinRoom(roomId: string) {
  isJoinedToRoom.value = true
  console.log('joinRoom', roomId)
  socket.emit('room:join', { roomId })
}
function getTopicTitle(topicId: string): string {
  return topics.value.find((topic) => topic.id === topicId)?.title ?? ''
}
async function backToRooms() {
  isJoinedToRoom.value = false
  isLoading.value = true

  try {
    const topicsResponse = await getAllTopics()
    topics.value = topicsResponse.data.data
    const roomsResponse = await getAllPublicRooms()
    console.log(roomsResponse)
    rooms.value = roomsResponse.data.map(
      (room: IPublicRoomDto): IRoom => ({
        roomId: room.id,
        hostName: room.hostName,
        topicId: room.topicId ?? null,
        memberCount: room.memberCount,
        maxMembers: 6,
        status: room.status,
      }),
    )
  } finally {
    isLoading.value = false
  }
}
function getRoomStatusClass(status: string): string {
  if (status === 'waiting') return 'room-status-waiting'
  if (status === 'in_progress') return 'room-status-in-progress'
  if (status === 'finished') return 'room-status-finished'
  return ''
}

async function selectTopic() {
  if (selectedTopicId.value === null) return

  console.log('selectTopic', selectedTopicId.value)
  try {
    socket.emit('room:create', { topicId: selectedTopicId.value })
    isJoinedToRoom.value = true
    // const roomsResponse = await getAllPublicRooms()

    // rooms.value = roomsResponse.data
  } catch (error) {
    console.error('Failed to select topic for online game:', error)
  } finally {
    isSubmittingTopic.value = false
    removeActiveFromTopics()
  }
}
onUnmounted(() => {
  socket.removeAllListeners()
  socket.disconnect()
})
</script>

<style scoped>
@import './OnlineMiniGameView.css';
</style>

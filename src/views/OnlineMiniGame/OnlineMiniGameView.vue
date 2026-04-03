<template>
  <div class="page-layout-online-mini-game">
    <div class="online-mini-game-wrapper">
      <h2 class="online-mini-game-title">Онлайн мини-игра по изучению JavaScript</h2>
      <GearSpinner v-if="isLoading" :size="56" :isLabel="true" />
      <div class="online-mini-game-container">
        <div class="online-mini-game-interface" v-if="!isLoading && !isJoinedToRoom">
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
        <RoomView
          v-if="isJoinedToRoom"
          :room="currentRoom"
          :socket="socket"
          @goBack="backToRooms"
          @updateLeaderboard="updateLeaderboard"
        />
        <div class="online-mini-game-leaderboard" v-if="!isLoading">
          <h3>Таблица рекордов</h3>
          <ul class="online-mini-game-leaderboard-list">
            <li
              class="online-mini-game-leaderboard-item"
              v-for="leader in leaderboard"
              :key="leader.id"
            >
              <span class="online-mini-game-leaderboard-item-name">{{ leader.userEmail }}</span>
              <span class="online-mini-game-leaderboard-item-points">{{ leader.points }}</span>
              <span class="online-mini-game-leaderboard-item-date">{{ leader.gameDate }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import RoomView from './RoomView.vue'
import { getAllTopics, getLeaderboard, getAllPublicRooms } from '@/api/requests'
import GearSpinner from '@/components/Spinner/GearSpinner.vue'
import type { ITopicData } from '@/types/types'
import { io } from 'socket.io-client'

import type {
  IPublicRoomDto,
  IRoomResponse,
  RoomCreatedEvent,
  IRoom,
  LeaderboardPayload,
} from '@/types/types'

defineOptions({
  name: 'OnlineMiniGame',
})

const router = useRouter()
const topics = ref<Array<ITopicData>>([])
const isLoading = ref<boolean>(false)
const selectedTopicId = ref<string | null>(null)
const selectedTopicTitle = ref<string | null>(null)
const topicsListEl = ref<HTMLElement | null>(null)
const isJoinedToRoom = ref<boolean>(false)
const isSubmittingTopic = ref<boolean>(false)
const rooms = ref<IRoom[]>([])
const accessToken = localStorage.getItem('access-token') ?? ''
//IRoomResponse
const currentRoom = ref<IRoomResponse | null>(null)
const ROOM_ID_KEY = 'current-room-id'
const currentRoomId = ref<string | null>(sessionStorage.getItem(ROOM_ID_KEY))
const leaderboard = ref<LeaderboardPayload[]>([])
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

async function updateLeaderboard() {
  try {
    const leadersResponse = await getLeaderboard()
    leaderboard.value = leadersResponse
  } catch (error) {
    console.error('Ошибка! Не удалось обновить таблицу рекордов', error)
  }
}

onMounted(async () => {
  isLoading.value = true

  try {
    const topicsResponse = await getAllTopics()
    topics.value = topicsResponse.data.data
    const roomsResponse = await getAllPublicRooms()
    const leadersResponse = await getLeaderboard()
    console.log(leadersResponse)
    leaderboard.value = leadersResponse

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
    console.log('Socket connected, id: ', socket.id)
  })
  socket.on('disconnect', (payload) => {
    console.log('Socket disconnected, need to autorize again', payload)
    isJoinedToRoom.value = false
    currentRoom.value = null
    setCurrentRoomId(null)
    rooms.value = []
    selectedTopicId.value = null
    selectedTopicTitle.value = null
    topicsListEl.value = null
    isSubmittingTopic.value = false
    router.replace({ name: 'login' })
  })

  socket.on('room:state', (payload) => {
    if (payload) {
      currentRoom.value = payload
    }
  })
  socket.on('room:create', (payload) => {
    if (payload?.roomId) {
      setCurrentRoomId(payload.roomId)
    }
  })
  socket.on('room:created', (payload: RoomCreatedEvent) => {
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

<template>
  <div class="room-view">
    <h2>Комната: {{ props.room }}</h2>
    <div class="room-view-content">
      <div class="room-view-content-item">
        <h3>Участники</h3>
        <ul>
          <!-- <li v-for="member in room.members" :key="member.id">{{ member.name }}</li> -->
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import type { IRoomResponse } from '@/types/types'

const props = defineProps<{
  room: IRoomResponse | null
}>()

onMounted(() => {
  console.log('RoomView mounted', props.room)
})
</script>

<style scoped>
@import './RoomView.css';
</style>

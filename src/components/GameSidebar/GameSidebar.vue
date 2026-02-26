<script setup lang="ts">
import { computed } from 'vue'
import type { ZonesMap } from '@/types'
import { TOTAL_ZONES } from '@/types'
import { progressPercent } from '@/utils'
import AppButton from '@/components/AppButton/AppButton.vue'
import { MAX_VASILKI, MAX_ERRORS } from '@/types'

const props = defineProps<{
  zones: ZonesMap
  vasilkiCount: number
  errorCount: number
  texts: { title: string; vasilki: string; errors: string; errorsTooltip: string; progress: string }
  buttonStart: string
  buttonReset: string
}>()

const emit = defineEmits<{
  start: []
  reset: []
}>()

const progress = computed(() => progressPercent(props.zones))

const zoneList = computed(() => {
  const list: { id: number; name: string; status: string }[] = []
  for (let id = 1; id <= TOTAL_ZONES; id++) {
    const z = props.zones[id]
    if (z) list.push({ id: z.id, name: z.name, status: z.status })
  }
  return list
})

function onStart() {
  emit('start')
}

function onReset() {
  emit('reset')
}
</script>

<template>
  <div class="sidebar">
    <h2>{{ texts.title }}</h2>
    <div class="stats-row">
      <div class="stat vasilki">
        <span class="stat-label-row">{{ texts.vasilki }}</span>
        <div class="vasilki-icons">
          <img
            v-for="i in MAX_VASILKI"
            :key="i"
            class="vasilek-icon"
            :class="{ active: i <= vasilkiCount }"
            src="/vasilek.png"
            alt=""
          />
        </div>
      </div>
      <div class="stat errors" :title="texts.errorsTooltip">
        <span class="stat-label-row">{{ texts.errors }}</span>
        <div class="error-icons">
          <span
            v-for="j in MAX_ERRORS"
            :key="j"
            class="error-icon"
            :class="{ active: j <= errorCount }"
          >
            ⚠
          </span>
        </div>
      </div>
    </div>
    <div v-for="item in zoneList" :key="item.id" class="zone-item" :class="item.status">
      <span class="zone-status" />
      <span>{{ item.name }}</span>
    </div>
    <div class="progress-bar-wrap">
      <span class="progress-label">{{ texts.progress }}</span>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progress + '%' }">{{ progress }}%</div>
      </div>
    </div>
    <AppButton variant="start" @click="onStart">{{ buttonStart }}</AppButton>
    <AppButton variant="reset" @click="onReset">{{ buttonReset }}</AppButton>
  </div>
</template>

<style scoped src="./GameSidebar.css"></style>

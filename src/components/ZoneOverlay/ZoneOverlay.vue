<script setup lang="ts">
import { computed } from 'vue'
import type { ZonesMap } from '@/types'
import { ZONE_PATHS } from '@/types'
import { zoneCanBeClicked } from '@/utils'

const props = defineProps<{
  zones: ZonesMap
  overlayHidden: boolean
}>()

const emit = defineEmits<{
  zoneClick: [zoneId: number]
}>()

const overlayClass = computed(() => ({
  'zone-overlay': true,
  'overlay-hidden': props.overlayHidden,
}))

function handleZoneClick(zoneId: number) {
  const zone = props.zones[zoneId]
  if (zone && zoneCanBeClicked(zone)) {
    emit('zoneClick', zoneId)
  }
}
</script>

<template>
  <svg
    :class="overlayClass"
    viewBox="0 0 800 516"
    preserveAspectRatio="xMidYMid meet"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g
      v-for="path in ZONE_PATHS"
      :key="path.zoneId"
      class="zone"
      :class="zones[path.zoneId]?.status ?? 'closed'"
      @click="handleZoneClick(path.zoneId)"
    >
      <path class="zone-shape" :d="path.pathD" />
      <text class="zone-label" text-anchor="middle" :x="path.labelX" :y="path.labelY">
        {{ zones[path.zoneId]?.name ?? '' }}
      </text>
    </g>
  </svg>
</template>

<style scoped src="./ZoneOverlay.css"></style>

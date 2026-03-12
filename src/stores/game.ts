import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ZonesMap } from '@/types'
import { TOTAL_ZONES, MAX_VASILKI, MAX_ERRORS } from '@/types'
import { ru } from '@/locales'

const t = ru

const newZones: ZonesMap = {
  1: {
    id: 1,
    name: t.zones[1],
    status: 'closed',
  },
  2: {
    id: 2,
    name: t.zones[2],
    status: 'closed',
  },
  3: {
    id: 3,
    name: t.zones[3],
    status: 'closed',
  },
  4: {
    id: 4,
    name: t.zones[4],
    status: 'closed',
  },
}
// for (let id = 1; id <= TOTAL_ZONES; id++) {
//   newZones[id] = {
//     id,
//     name: t.zones[id],
//     status: 'closed',
//   }
// }

export const useGameStore = defineStore('game', () => {
  const zones = ref<ZonesMap>(newZones)
  const currentZoneId = ref<number | null>(null)
  const conveyorModalShown = ref(false)
  const vasilkiCount = ref(0)
  const errorCount = ref(0)
  const overlayHidden = ref(false)
  const isInitialized = ref(false)

  function startAssembly() {
    const z1 = zones.value[1]
    if (z1) {
      zones.value = { ...zones.value, 1: { ...z1, status: 'available' } }
    }
  }

  function setZoneInProgress(zoneId: number): boolean {
    const zone = zones.value[zoneId]
    if (!zone || zone.status !== 'available') return false
    zones.value = { ...zones.value, [zoneId]: { ...zone, status: 'in-progress' } }
    currentZoneId.value = zoneId
    return true
  }

  function setZoneCompleted(zoneId: number) {
    const zone = zones.value[zoneId]
    if (!zone) return
    zones.value = { ...zones.value, [zoneId]: { ...zone, status: 'completed' } }
    if (zoneId < TOTAL_ZONES) {
      const nextZone = zones.value[zoneId + 1]
      if (nextZone) {
        zones.value = {
          ...zones.value,
          [zoneId + 1]: { ...nextZone, status: 'available' },
        }
      }
    }
    currentZoneId.value = null
    for (let id = 1; id <= TOTAL_ZONES; id++) {
      const z = zones.value[id]
      if (!z || z.status !== 'completed') return
    }
    conveyorModalShown.value = true
  }

  function reset(zoneNames: Record<number, string>) {
    const newZones: ZonesMap = {}
    for (let id = 1; id <= TOTAL_ZONES; id++) {
      newZones[id] = {
        id,
        name: zoneNames[id] ?? '',
        status: 'closed',
      }
    }
    zones.value = newZones
    currentZoneId.value = null
    conveyorModalShown.value = false
    vasilkiCount.value = 0
    errorCount.value = 0
    overlayHidden.value = false
  }

  function closeConveyor() {
    conveyorModalShown.value = false
  }

  function hideOverlay() {
    overlayHidden.value = true
  }

  function addVasilki() {
    vasilkiCount.value = Math.min(vasilkiCount.value + 1, MAX_VASILKI)
  }

  function addError() {
    errorCount.value = Math.min(errorCount.value + 1, MAX_ERRORS)
  }

  function resetVasilki() {
    vasilkiCount.value = 0
  }

  function resetError() {
    errorCount.value = 0
  }

  const conveyorModalOpen = computed(() => conveyorModalShown.value)

  return {
    zones,
    currentZoneId,
    conveyorModalShown,
    vasilkiCount,
    errorCount,
    overlayHidden,
    isInitialized,
    conveyorModalOpen,
    // init,
    startAssembly,
    setZoneInProgress,
    setZoneCompleted,
    reset,
    closeConveyor,
    hideOverlay,
    addVasilki,
    addError,
    resetVasilki,
    resetError,
  }
})

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { GameState, ZonesMap } from '@/types'
import { createInitialGameState } from '@/utils/gameState'
import {
  applyStart,
  applyZoneInProgress,
  applyZoneCompleted,
  applyReset,
  applyCloseConveyor,
  applyHideOverlay,
  applyAddVasilki,
  applyAddError,
} from '@/utils/gameActions'

export const useGameStore = defineStore('game', () => {
  const zones = ref<ZonesMap>({})
  const currentZoneId = ref<number | null>(null)
  const conveyorModalShown = ref(false)
  const vasilkiCount = ref(2)
  const errorCount = ref(1)
  const overlayHidden = ref(false)

  const isInitialized = ref(false)

  function getState(): GameState {
    return {
      zones: zones.value,
      currentZoneId: currentZoneId.value,
      conveyorModalShown: conveyorModalShown.value,
      vasilkiCount: vasilkiCount.value,
      errorCount: errorCount.value,
      overlayHidden: overlayHidden.value,
    }
  }

  function setState(state: GameState) {
    zones.value = state.zones
    currentZoneId.value = state.currentZoneId
    conveyorModalShown.value = state.conveyorModalShown
    vasilkiCount.value = state.vasilkiCount
    errorCount.value = state.errorCount
    overlayHidden.value = state.overlayHidden
  }

  function init(zoneNames: Record<number, string>) {
    setState(createInitialGameState(zoneNames))
    isInitialized.value = true
  }

  function startAssembly() {
    setState(applyStart(getState()))
  }

  function setZoneInProgress(zoneId: number): boolean {
    const next = applyZoneInProgress(getState(), zoneId)
    if (!next) return false
    setState(next)
    return true
  }

  function setZoneCompleted(zoneId: number) {
    setState(applyZoneCompleted(getState(), zoneId))
  }

  function reset(zoneNames: Record<number, string>) {
    setState(applyReset(zoneNames))
  }

  function closeConveyor() {
    setState(applyCloseConveyor(getState()))
  }

  function hideOverlay() {
    setState(applyHideOverlay(getState()))
  }

  function addVasilki() {
    setState(applyAddVasilki(getState()))
  }

  function addError() {
    setState(applyAddError(getState()))
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
    init,
    startAssembly,
    setZoneInProgress,
    setZoneCompleted,
    reset,
    closeConveyor,
    hideOverlay,
    addVasilki,
    addError,
  }
})

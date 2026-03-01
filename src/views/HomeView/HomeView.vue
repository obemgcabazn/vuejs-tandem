<script setup lang="ts">
import { ref, computed } from 'vue'
import { ru } from '@/locales'
import { createInitialGameState } from '@/utils'
import {
  applyStart,
  applyZoneInProgress,
  applyZoneCompleted,
  applyReset,
  applyCloseConveyor,
  applyHideOverlay,
} from '@/utils'
import Header from '@/components/Header/Header.vue'
import Footer from '@/components/Footer/Footer.vue'
import ZoneOverlay from '@/components/ZoneOverlay/ZoneOverlay.vue'
import GameSidebar from '@/components/GameSidebar/GameSidebar.vue'
import FirstMessageModal from '@/components/FirstMessageModal/FirstMessageModal.vue'
import ConveyorModal from '@/components/ConveyorModal/ConveyorModal.vue'

const t = ru
const gameState = ref(createInitialGameState(t.zones))
const showFirstMessage = ref(true)

const conveyorModalOpen = computed(() => gameState.value.conveyorModalShown)

function startAssembly() {
  gameState.value = applyStart(gameState.value)
}

function onZoneClick(zoneId: number) {
  const next = applyZoneInProgress(gameState.value, zoneId)
  if (!next) return
  gameState.value = next
  setTimeout(() => {
    gameState.value = applyZoneCompleted(gameState.value, zoneId)
  }, 2000)
}

function closeFirstMessage() {
  showFirstMessage.value = false
}

function closeConveyor() {
  gameState.value = applyCloseConveyor(gameState.value)
}

function launchConveyor() {
  closeConveyor()
  setTimeout(() => {
    gameState.value = applyHideOverlay(gameState.value)
  }, 400)
}

function reset() {
  gameState.value = applyReset(t.zones)
  showFirstMessage.value = true
}
</script>

<template>
  <div class="page-layout">
    <Header :title="t.header.title" :version="t.header.version" />
    <main class="game-wrapper">
      <div class="svg-container">
        <div class="photo-wrapper">
          <img class="belaz-photo" src="/IMG_0572_min_800x800-equal.jpg" :alt="t.belazPhotoAlt" />
          <ZoneOverlay
            :zones="gameState.zones"
            :overlay-hidden="gameState.overlayHidden"
            @zone-click="onZoneClick"
          />
        </div>
      </div>
      <GameSidebar
        :zones="gameState.zones"
        :vasilki-count="gameState.vasilkiCount"
        :error-count="gameState.errorCount"
        :texts="t.sidebar"
        :button-start="t.buttons.start"
        :button-reset="t.buttons.reset"
        @start="startAssembly"
        @reset="reset"
      />
    </main>
    <Footer :text="t.footer.text" />
    <Teleport to="body">
      <FirstMessageModal
        :open="showFirstMessage"
        :texts="t.firstMessage"
        @close="closeFirstMessage"
      />
      <ConveyorModal
        :open="conveyorModalOpen"
        :texts="t.conveyorModal"
        @close="closeConveyor"
        @launch-conveyor="launchConveyor"
      />
    </Teleport>
  </div>
</template>

<style scoped src="./HomeView.css"></style>

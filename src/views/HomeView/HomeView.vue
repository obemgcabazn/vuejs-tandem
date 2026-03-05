<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ru } from '@/locales'
import { useGameStore } from '@/stores/game'
import Header from '@/components/Header/Header.vue'
import Footer from '@/components/Footer/Footer.vue'
import ZoneOverlay from '@/components/ZoneOverlay/ZoneOverlay.vue'
import GameSidebar from '@/components/GameSidebar/GameSidebar.vue'
import FirstMessageModal from '@/components/FirstMessageModal/FirstMessageModal.vue'
import ConveyorModal from '@/components/ConveyorModal/ConveyorModal.vue'
import GameContainer from '@/components/GameContainer/GameContainer.vue'
import CabAndElectronics from '@/components/CabAndElectronics/CabAndElectronics.vue'

const t = ru
const gameStore = useGameStore()
const showFirstMessage = ref(true)
const isGameStarted = ref(false)
const isCabElectroniksZone = ref(false)

onMounted(() => {
  if (!gameStore.isInitialized) {
    gameStore.init(t.zones)
  }
})

function startAssembly() {
  gameStore.startAssembly()
}

function onZoneClick(zoneId: number) {
  if (zoneId === 3) {
    gameStore.setZoneInProgress(zoneId)
    isGameStarted.value = true
    isCabElectroniksZone.value = true
    return
  } else {
    if (!gameStore.setZoneInProgress(zoneId)) return
    setTimeout(() => {
      gameStore.setZoneCompleted(zoneId)
    }, 2000)
  }
}

function closeFirstMessage() {
  showFirstMessage.value = false
}

function closeConveyor() {
  gameStore.closeConveyor()
}

function launchConveyor() {
  gameStore.closeConveyor()
  setTimeout(() => {
    gameStore.hideOverlay()
  }, 400)
}

function reset() {
  gameStore.reset(t.zones)
  showFirstMessage.value = true
}
</script>

<template>
  <div class="page-layout">
    <Header :title="t.header.title" :version="t.header.version" />
    <main class="game-wrapper">
      <div class="svg-container" v-if="!isGameStarted">
        <div class="photo-wrapper">
          <img class="belaz-photo" src="/IMG_0572_min_800x800-equal.jpg" :alt="t.belazPhotoAlt" />
          <ZoneOverlay
            :zones="gameStore.zones"
            :overlay-hidden="gameStore.overlayHidden"
            @zone-click="onZoneClick"
          />
        </div>
      </div>
      <GameContainer v-else>
        <CabAndElectronics v-if="isCabElectroniksZone" />
      </GameContainer>
      <GameSidebar
        :zones="gameStore.zones"
        :vasilki-count="gameStore.vasilkiCount"
        :error-count="gameStore.errorCount"
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
        :open="gameStore.conveyorModalOpen"
        :texts="t.conveyorModal"
        @close="closeConveyor"
        @launch-conveyor="launchConveyor"
      />
    </Teleport>
  </div>
</template>

<style scoped src="./HomeView.css"></style>

<script setup lang="ts">
import AppButton from '@/components/AppButton/AppButton.vue'
import type { RuLocale } from '@/locales'

defineProps<{
  open: boolean
  texts?: RuLocale['conveyorModal']
}>()
const emit = defineEmits<{
  close: []
  launchConveyor: []
}>()

function onOverlayClick(event: MouseEvent) {
  const target = event.target
  if (target instanceof HTMLElement && target.classList.contains('modal-overlay')) {
    emit('close')
  }
}
</script>

<template>
  <div
    class="modal-overlay"
    :class="{ 'modal-open': open }"
    :aria-hidden="!open"
    @click="onOverlayClick"
  >
    <div class="modal">
      <button
        type="button"
        class="modal-close"
        :aria-label="texts?.closeAria ?? 'Закрыть'"
        @click="emit('close')"
      >
        &times;
      </button>
      <h2 class="modal-title">{{ texts?.title ?? '' }}</h2>
      <p class="modal-message">{{ texts?.message ?? '' }}</p>
      <AppButton variant="conveyor" @click="emit('launchConveyor')">
        {{ texts?.button ?? '' }}
      </AppButton>
    </div>
  </div>
</template>

<style scoped src="./ConveyorModal.css"></style>

<script setup lang="ts">
import type { RuLocale } from '@/locales'

defineProps<{
  open: boolean
  texts?: RuLocale['firstMessage']
}>()
defineEmits<{
  close: []
}>()
</script>

<template>
  <div
    class="modal-overlay first-message-overlay"
    :class="{ 'modal-open': open }"
    :aria-hidden="!open"
    @click="$emit('close')"
  >
    <div class="first-message-modal">
      <div class="first-message-text">
        <p>{{ texts?.p1 ?? '' }}</p>
        <p>
          {{ texts?.p2Before ?? '' }}
          <strong>{{ texts?.vasilek ?? 'василёк' }}</strong>
          {{ texts?.p2After ?? '' }}
        </p>
        <p>{{ texts?.p3 ?? '' }}</p>
        <p class="first-message-hint">{{ texts?.hint ?? '' }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped src="./FirstMessageModal.css"></style>

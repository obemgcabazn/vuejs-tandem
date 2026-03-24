<script setup lang="ts">
type ButtonVariant = 'start' | 'reset' | 'conveyor' | 'neutral'

withDefaults(
  defineProps<{
    variant?: ButtonVariant
    type?: 'button' | 'submit'
    disabled?: boolean
    ariaLabel?: string
  }>(),
  {
    variant: 'neutral',
    type: 'button',
    disabled: false,
  },
)
</script>

<template>
  <button
    :type="type"
    class="app-btn"
    :class="[`app-btn--${variant}`, { 'app-btn--conveyor-blink': variant === 'conveyor' }]"
    :disabled="disabled"
    :aria-label="ariaLabel"
  >
    <slot />
  </button>
</template>

<style scoped src="./AppButton.css"></style>

<script setup lang="ts">
defineProps<{
  modelValue?: string
  label?: string
  type?: 'text' | 'email' | 'password' | 'number'
  placeholder?: string
  disabled?: boolean
  id?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function onInput(event: Event) {
  const target = event.target
  if (target instanceof HTMLInputElement) {
    emit('update:modelValue', target.value)
  }
}
</script>

<template>
  <div class="app-input-wrap">
    <label v-if="label" :for="id" class="app-input-label">{{ label }}</label>
    <input
      :id="id"
      :value="modelValue"
      :type="type ?? 'text'"
      :placeholder="placeholder"
      :disabled="disabled"
      class="app-input"
      @input="onInput"
    />
  </div>
</template>

<style scoped src="./AppInput.css"></style>

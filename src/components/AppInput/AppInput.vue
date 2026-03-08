<script setup lang="ts">
defineProps<{
  modelValue?: string
  label?: string
  type?: 'text' | 'email' | 'password' | 'number'
  placeholder?: string
  disabled?: boolean
  id?: string
  error?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  blur: []
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
      :class="['app-input', { 'app-input--error': error }]"
      @input="onInput"
      @blur="emit('blur')"
    />
    <p v-if="error" class="app-input-error">{{ error }}</p>
  </div>
</template>

<style scoped src="./AppInput.css"></style>

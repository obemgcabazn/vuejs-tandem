<script setup lang="ts">
defineOptions({ name: 'PageHeader' })
defineProps<{
  title?: string
  version?: string
}>()
</script>

<template>
  <header class="page-header">
    <span class="page-header-title">{{ title }}</span>
    <span class="page-header-version">{{ version }}</span>
  </header>
</template>

<style scoped src="./Header.css"></style>

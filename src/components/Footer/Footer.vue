<script setup lang="ts">
defineOptions({ name: 'PageFooter' })
defineProps<{
  text?: string
}>()
</script>

<template>
  <footer class="page-footer">
    <span class="page-footer-text">{{ text }}</span>
  </footer>
</template>

<style scoped src="./Footer.css"></style>

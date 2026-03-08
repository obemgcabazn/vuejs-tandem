<template>
  <div class="game-container">
    <slot />
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'GameContainer',
})
</script>

<style lang="scss" scoped>
@import './GameContainer.css';
</style>

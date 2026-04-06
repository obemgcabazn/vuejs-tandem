<script setup lang="ts">
import { useLocaleStore } from '@/stores/locale'

const locale = useLocaleStore()
</script>

<template>
  <div class="container">
    <h1>{{ locale.t.about.title }}</h1>
    <div class="first-message-text">
      <p>{{ locale.t.about.p1 }}</p>
      <p>
        {{ locale.t.about.p2Before }}<strong>{{ locale.t.about.vasilek }}</strong
        >{{ locale.t.about.p2After }}
      </p>
      <p>{{ locale.t.about.p3 }}</p>
    </div>
  </div>
</template>

<style scoped></style>

<template>
  <span
    class="GearSpinner"
    role="status"
    aria-live="polite"
    :aria-label="label"
    :style="GearSpinnerStyle"
  />
  <span v-if="isLabel" class="GearSpinner-label">{{ label }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
defineOptions({
  name: 'GearSpinner',
})

type Props = {
  size?: number | string
  label?: string
  isLabel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 32,
  label: 'Загрузка…',
  isLabel: true,
})

// В проекте файл называется `spinner.svg`, а не `GearSpinner.svg`.
// Если URL неправильный, mask-image не загрузится и спиннер станет прозрачным.
const GearSpinnerUrl = new URL('./spinner.svg', import.meta.url).href

const GearSpinnerStyle = computed(() => {
  const size = typeof props.size === 'number' ? `${props.size}px` : props.size
  return {
    width: size,
    height: size,
    backgroundColor: '#6b5344',
    maskImage: `url("${GearSpinnerUrl}")`,
    WebkitMaskImage: `url("${GearSpinnerUrl}")`,
  } as const
})
</script>

<style scoped>
.GearSpinner {
  display: block;
  margin: 0 auto 0 auto;
  flex: 0 0 auto;
  mask-repeat: no-repeat;
  mask-position: center;
  mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
  -webkit-mask-size: contain;
  animation: GearSpinner-rotate 1.7s linear infinite;
}

.GearSpinner-label {
  display: block;
  width: 100%;
  text-align: center;
  margin-top: 5px;
  font-size: 16px;
  line-height: 1.5;
  font-weight: 600;
  color: #6b5344;
}
@keyframes GearSpinner-rotate {
  to {
    transform: rotate(360deg);
  }
}
</style>

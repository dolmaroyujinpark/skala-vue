<script setup>
/* ────────────────────────────────────────────────
   PixelIcon — Nothing Weather App Icons (Community) 에서
   내려받은 닷매트릭스 SVG 를 그대로 인라인으로 박아 넣습니다.
   fill 을 currentColor 로 치환해 두었기 때문에
   부모의 color 만 바꾸면 다크/라이트 어디서든 따라옵니다.
   ──────────────────────────────────────────────── */
import { computed } from 'vue'
import sun from '@/assets/icons/sun.svg?raw'
import cloud from '@/assets/icons/cloud.svg?raw'
import rain from '@/assets/icons/rain.svg?raw'
import partly from '@/assets/icons/partly.svg?raw'
import night from '@/assets/icons/night.svg?raw'

const SOURCES = { sun, cloud, rain, partly, night }

const props = defineProps({
  name: { type: String, default: 'sun' },
  size: { type: Number, default: 40 },
})

// 원본 SVG 의 고정 width/height 를 걷어내야 CSS 로 크기를 잡을 수 있습니다.
const markup = computed(() => (SOURCES[props.name] ?? SOURCES.sun).replace(/\s(width|height)="[^"]*"/g, ''))
</script>

<template>
  <span class="pixel-icon" :style="{ width: `${size}px` }" v-html="markup" />
</template>

<style>
.pixel-icon {
  display: inline-block;
  flex: 0 0 auto;
  line-height: 0;
}

.pixel-icon svg {
  display: block;
  width: 100%;
  height: auto;
}
</style>

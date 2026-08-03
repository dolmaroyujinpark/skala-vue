<script setup>
// Nothing Weather App Icons 스타일의 모노 아이콘 세트.
// 외부 아이콘 라이브러리 없이 전부 인라인 SVG 로 그렸다.
// stroke="currentColor" 라서 부모의 color 값을 그대로 따라간다.
defineProps({
  name: { type: String, required: true },
  size: { type: [Number, String], default: 24 },
  // 아이콘이 커질수록 선이 굵어 보이지 않도록 두께를 따로 넘길 수 있다.
  width: { type: [Number, String], default: 1.6 },
})
</script>

<template>
  <svg class="mi" :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor" :stroke-width="width" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <!-- ☀️ 맑음: 작은 원 + 8방향 점선 광선 -->
    <template v-if="name === 'sun'">
      <circle cx="12" cy="12" r="3.4" />
      <path d="M12 3.2v2.2M12 18.6v2.2M3.2 12h2.2M18.6 12h2.2" />
      <path d="M5.8 5.8l1.6 1.6M16.6 16.6l1.6 1.6M18.2 5.8l-1.6 1.6M7.4 16.6l-1.6 1.6" />
    </template>

    <!-- ☁️ 구름 -->
    <template v-else-if="name === 'cloud'">
      <path d="M7.2 18.5a4.2 4.2 0 0 1-.2-8.4 5.4 5.4 0 0 1 10.4-1 3.9 3.9 0 0 1-.4 9.4z" />
    </template>

    <!-- 🌧️ 비: 구름 + 세로 점(dot) 빗줄기 -->
    <template v-else-if="name === 'rain'">
      <path d="M7.4 15.6a4 4 0 0 1-.2-8 5.2 5.2 0 0 1 10 -1 3.7 3.7 0 0 1-.4 9" />
      <path d="M9 17.4v1.6M12 17.4v1.6M15 17.4v1.6" />
      <path d="M10.5 20.4v1.4M13.5 20.4v1.4" />
    </template>

    <!-- 🌅 일출: 점선 반원 태양 + 지평선 + 위 화살표 -->
    <template v-else-if="name === 'sunrise'">
      <path d="M8.4 14.2a3.6 3.6 0 0 1 7.2 0" />
      <path d="M12 4.6v2M5.6 8.2l1.4 1.4M18.4 8.2l-1.4 1.4M3.4 14.2h1.8M18.8 14.2h1.8" />
      <path d="M4 18.4h16" />
      <path d="M12 22.2v-3.6M10.4 20.2 12 18.6l1.6 1.6" />
    </template>

    <!-- 🌇 일몰: 일출과 같은 태양 + 아래 화살표 -->
    <template v-else-if="name === 'sunset'">
      <path d="M8.4 14.2a3.6 3.6 0 0 1 7.2 0" />
      <path d="M12 4.6v2M5.6 8.2l1.4 1.4M18.4 8.2l-1.4 1.4M3.4 14.2h1.8M18.8 14.2h1.8" />
      <path d="M4 18.4h16" />
      <path d="M12 18.6v3.6M10.4 20.6 12 22.2l1.6-1.6" />
    </template>

    <!-- 🗺️ 지도 -->
    <template v-else-if="name === 'map'">
      <path d="M9 4.5 3.5 6.8v12.7L9 17.2l6 2.3 5.5-2.3V4.5L15 6.8z" />
      <path d="M9 4.5v12.7M15 6.8v12.7" />
    </template>

    <!-- ⚙️ 설정 -->
    <template v-else-if="name === 'gear'">
      <circle cx="12" cy="12" r="2.6" />
      <circle cx="12" cy="12" r="6.4" />
      <path d="M12 3.2v2.4M12 18.4v2.4M3.2 12h2.4M18.4 12h2.4" />
      <path d="M6.1 6.1 7.8 7.8M16.2 16.2l1.7 1.7M17.9 6.1l-1.7 1.7M7.8 16.2l-1.7 1.7" />
    </template>

    <!-- ‹ 뒤로 -->
    <template v-else-if="name === 'back'">
      <path d="M14.5 5 8 12l6.5 7" />
    </template>

    <!-- + 추가 -->
    <template v-else-if="name === 'plus'">
      <path d="M12 5v14M5 12h14" />
    </template>

    <!-- ✓ 체크 -->
    <template v-else-if="name === 'check'">
      <path d="M4.5 12.5 9.5 17.5 19.5 6.5" />
    </template>

    <!-- × 삭제 -->
    <template v-else-if="name === 'close'">
      <path d="M6 6l12 12M18 6L6 18" />
    </template>
  </svg>
</template>

<style scoped>
.mi {
  display: block;
  flex: none;
}
</style>

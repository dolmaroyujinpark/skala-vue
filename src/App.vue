<script setup>
// ===== [종합과제] 날씨 앱 =====
// 실습 컴포넌트는 src/components/course/practices/ 아래에 그대로 두고,
// 제출용 화면에서는 종합과제만 렌더링한다.
//
// [4일차 과제] 한 파일이던 MyWeatherMockup.vue 를 기능 변경 없이
// 컴포넌트 6개로 분리했다. → components/mine/weather/
// 분리 전 원본은 components/mine/MyWeatherMockup.vue 에 그대로 남겨 두었다.
import WeatherParent from './components/mine/weather/WeatherParent.vue'
</script>

<template>
  <WeatherParent />
</template>

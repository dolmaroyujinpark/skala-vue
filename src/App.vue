<script setup>
import { ref } from 'vue'

// ===== [종합과제] 날씨 앱 =====
import MyWeatherMockup from './components/exercise/MyWeatherMockup.vue'

// ===== [기존 실습 컴포넌트] =====
import StoreCounter from './components/practices/library/StoreCounter.vue'
import AxiosWeather from './components/practices/library/AxiosWeather.vue'
import AxiosJson from './components/practices/library/AxiosJson.vue'
import ElementPlus from './components/practices/library/ElementPlus.vue'
import EcmaScript from './components/practices/library/EcmaScript.vue'

// true = 날씨 앱 / false = 기존 실습 화면. 우측 하단 버튼으로 전환한다.
const showWeather = ref(true)
</script>

<template>
  <!-- ===== [종합과제] 날씨 앱 (전체 폭을 쓰므로 .practice-container 로 감싸지 않는다) ===== -->
  <MyWeatherMockup v-if="showWeather" />

  <!-- ===== [기존 실습 컴포넌트] ===== -->
  <div v-else class="practice-container">
    <h1>1. Store</h1>
    <hr />
    <StoreCounter />
    <h1>2. Axios</h1>
    <hr />
    <AxiosWeather />
    <AxiosJson />
    <h1>3. Element Plus</h1>
    <hr />
    <ElementPlus />
    <h1>4. Modern JavaScript</h1>
    <hr />
    <EcmaScript />
  </div>

  <!-- 두 화면을 오가는 스위치 -->
  <button class="app-mode-toggle" @click="showWeather = !showWeather">
    {{ showWeather ? '실습 화면 →' : '← 날씨 앱' }}
  </button>
</template>

<style>
/* ⚠️ 외부 스타일 파일(예: 버튼 디자인 뭉치)을 이 방 안으로 쏙 가리켜 가져옵니다 */
@import '@/assets/practice.css';

/* 화면 전환 스위치 — 검은 배경 위에서도 보이도록 반투명 회색으로 고정 배치 */
.app-mode-toggle {
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 100;
  padding: 8px 14px;
  font-size: 12px;
  color: #888;
  background: rgba(128, 128, 128, 0.14);
  border: 1px solid rgba(128, 128, 128, 0.35);
  border-radius: 999px;
  cursor: pointer;
  backdrop-filter: blur(6px);
}

.app-mode-toggle:hover {
  color: #ccc;
  border-color: rgba(160, 160, 160, 0.6);
}
</style>

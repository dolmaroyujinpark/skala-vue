<script setup>
/* ════════════════════════════════════════════════════════════
   [실습 보관용 뷰]
   수업 중 따라 친 실습 컴포넌트들을 모아둔 곳.
   App.vue 는 종합과제(MyWeatherMockup)만 렌더링하므로
   이 뷰는 기본 화면에 절대 나타나지 않는다.
   확인이 필요하면 이 파일을 직접 열거나, App.vue 에서 잠깐 갈아끼운다.
   ════════════════════════════════════════════════════════════ */
import StoreCounter from '@/components/course/practices/library/StoreCounter.vue'
import AxiosWeather from '@/components/course/practices/library/AxiosWeather.vue'
import AxiosJson from '@/components/course/practices/library/AxiosJson.vue'
import ElementPlus from '@/components/course/practices/library/ElementPlus.vue'
import EcmaScript from '@/components/course/practices/library/EcmaScript.vue'
</script>

<template>
  <div class="practice-container">
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
</template>

<style>
@import '@/assets/practice.css';
</style>

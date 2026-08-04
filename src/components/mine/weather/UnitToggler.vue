<script setup>
import { useConfigStore } from '@/stores/configStore'

/* ════════════════════════════════════════════════════════════
   [4일차 과제] UnitToggler.vue — 단위 설정 변경 UI (요구사항 1)

   ── 새로 그리지 않고 앱 바에서 뜯어낸 것입니다 ────────────
   3일차까지 App.vue 앱 바 안에 있던 °C/°F 세그먼트를 그대로 옮겼습니다.
   마크업도 클래스도 같아서 화면상 달라진 것은 없고, 라벨만 ℃/℉ 가 됐습니다.
   (store 의 unitSymbol 이 그 기호를 쓰기 때문입니다)

   ── props / emits 가 없는 이유 ────────────────────────────
   2일차의 SearchBar 는 값을 props 로 받고 변경을 emits 로 올려보냈습니다.
   여기는 그럴 필요가 없습니다. 이 컴포넌트가 쓰는 값이 부모의 것이 아니라
   store 의 것이라, 부모를 거치지 않고 직접 읽고 직접 바꿉니다.

   그래서 이 버튼을 앱 바에 두든 대시보드 안에 두든 사이드바에 두든
   부모가 아무 배선도 해 주지 않아도 동작합니다. 이게 store 를 쓰는 이유입니다.

   ⚠️ configStore 를 컴포넌트 밖(모듈 최상위)에서 호출하면 안 됩니다.
      Pinia 는 main.js 의 app.use(createPinia()) 가 끝난 뒤에야 준비되는데,
      모듈 최상위 코드는 그보다 먼저 실행될 수 있습니다.
      <script setup> 안은 컴포넌트가 만들어지는 시점이라 안전합니다.
   ════════════════════════════════════════════════════════════ */
const configStore = useConfigStore()

/* 이미 켜져 있는 쪽을 눌렀을 때는 아무 일도 없어야 합니다.

   store 가 주는 건 toggleUnit(무조건 뒤집기) 하나뿐이라, 두 버튼에 그냥
   달면 ℃ 인 상태에서 ℃ 를 눌러도 ℉ 로 넘어갑니다. 세그먼트는 "둘 중
   지금 이것" 을 보여주는 UI 라서, 켜진 걸 다시 누르면 꺼지는 건 어색합니다.

   store 에 setUnit(값) 을 추가하는 방법도 있지만 과제 스펙의 actions 는
   toggleUnit 하나입니다. 스펙을 늘리는 대신 "언제 부를지"를 이 컴포넌트가
   판단하게 했습니다 — 어차피 화면 사정은 화면이 제일 잘 압니다. */
const selectUnit = (target) => {
  if (configStore.unit !== target) configStore.toggleUnit()
}
</script>

<template>
  <!-- 3일차 앱 바의 세그먼트와 완전히 같은 구조입니다.
       .wx-segment / .wx-segment-btn 은 테마 토글과 함께 쓰는 공용 유틸이라
       weather-base.css 에 있습니다. -->
  <div class="wx-segment" role="group" aria-label="온도 단위">
    <!-- :aria-pressed 로 보조기기에도 지금 어느 쪽이 켜져 있는지 알립니다.
         색만으로 구분하면 화면을 못 보는 사용자는 알 방법이 없습니다. -->
    <button class="wx-segment-btn" :class="{ 'is-on': configStore.unit === 'celsius' }" :aria-pressed="configStore.unit === 'celsius'" @click="selectUnit('celsius')">℃</button>
    <button class="wx-segment-btn" :class="{ 'is-on': configStore.unit === 'fahrenheit' }" :aria-pressed="configStore.unit === 'fahrenheit'" @click="selectUnit('fahrenheit')">℉</button>
  </div>
</template>

<script setup>
/* ════════════════════════════════════════════════════════════
   [과제 요구사항 2] BaseDashboardCard.vue
     · 검색박스와 리스트박스의 디자인을 공통화한다.
     · <slot> 을 배치해 부모가 도시 검색 / 날씨 현황을 주입하게 한다.

   원본 목업에서 반복되던 .wx-panel("헤어라인 한 줄로만 구분되는 구획")을
   이 컴포넌트 하나로 흡수했다. 지금 이 구획을 쓰는 곳은 다섯 군데다.
     · WeatherHero      — 선택된 도시 히어로
     · SearchBar 를 감싸는 검색 패널 (WeatherParent)
     · WeatherCard      — 도시 카드 하나하나
     · ForecastStrip    — 시간별 / 일별 예보 (2회)
   테두리 두께나 라운드를 바꾸고 싶으면 이 파일 한 곳만 고치면 된다.

   [지시 외 추가 실습] Named Slot
     요구사항에는 <slot> 하나만 있으면 되지만, 실제로는 패널마다
     "제목 줄"이 따로 있다. 이름 없는 기본 슬롯 하나로 처리하면 부모가
     제목과 본문을 구분 없이 쏟아 넣게 되므로 header 슬롯을 따로 열었다.
     header 를 안 넘기면 <slot name="header"> 는 아무것도 렌더링하지 않아
     기존 마크업(제목 없는 패널)과 DOM 이 완전히 동일하다.

   [지시 외 추가] tag prop
     공통화를 한다고 전부 <div> 로 찍어내면 원본에 있던 <section> · <article>
     같은 의미 태그가 사라져 스크린 리더가 문서 구조를 못 읽는다.
     그래서 어떤 태그로 그릴지를 부모가 정할 수 있게 열어 두고,
     <component :is> 로 렌더링한다. (기본값은 div 라 안 넘겨도 그대로 동작)
   ════════════════════════════════════════════════════════════ */

defineProps({
  tag: {
    type: String,
    default: 'div',
    // 커스텀 유효성 검사기 — 아무 태그나 들어와 마크업이 망가지는 걸 막는다.
    validator: (value) => ['div', 'section', 'article', 'aside'].includes(value),
  },
})
</script>

<template>
  <component :is="tag" class="wx-panel">
    <!-- [Named Slot] 패널 제목 자리. 부모가 <template #header> 로 주입한다. -->
    <slot name="header"></slot>

    <!-- [Default Slot] 패널 본문.
         부모가 아무것도 주지 않으면 아래 기본 콘텐츠가 대신 나온다. -->
    <slot>
      <p class="wx-panel-empty">표시할 내용이 없습니다.</p>
    </slot>
  </component>
</template>

<style scoped>
/* [과제 요구사항 6] 이 컴포넌트가 책임지는 디자인만 scoped 로 격리한다.
   패널 = 카드가 아니라 "구획". 그림자 없이 1px 헤어라인 하나로만 나눈다. */
.wx-panel {
  box-sizing: border-box;
  padding: 22px;
  background: transparent;
  border: 1px solid var(--line);
  border-radius: 18px;
}

/* 기본 슬롯 폴백 문구 */
.wx-panel-empty {
  margin: 0;
  color: var(--dimmer);
  font-size: 14px;
  text-align: center;
}
</style>

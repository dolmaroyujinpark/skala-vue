<script setup>
import BaseDashboardCard from './BaseDashboardCard.vue'

/* ════════════════════════════════════════════════════════════
   [지시 외 추가 컴포넌트] ForecastStrip.vue — Scoped Slot 실습

   시간별 예보와 일별 예보는 껍데기(패널 · 가로 스트립 · 셀 격자)가 완전히 같은데
   셀 안에 들어가는 내용만 다르다.
     · 시간별 — 10:00 / 아이콘 / 28°
     · 일별   — AUG 01 / 아이콘 / 32° 23°
   Props 로 처리하려면 `type="hourly"` 같은 플래그를 받아 컴포넌트 안에서
   v-if 로 갈라야 하는데, 예보 종류가 늘어날 때마다 이 파일을 고쳐야 한다.

   그래서 Scoped Slot 을 썼다.
     · 자식(ForecastStrip) — 반복과 레이아웃을 책임지고, 각 칸의 데이터를
                              <slot :item="..." :index="..."> 로 부모에게 올려준다.
     · 부모(WeatherParent) — v-slot="{ item }" 으로 그 데이터를 받아
                              칸 안의 마크업을 직접 결정한다.
   "데이터는 위에서 아래로"의 예외가 아니라, 자식이 자기가 만든 반복 변수를
   부모의 템플릿 조각에 잠깐 빌려주는 구조다.
   ════════════════════════════════════════════════════════════ */

defineProps({
  // 패널 제목 (Named Slot 으로 BaseDashboardCard 에 넘긴다)
  title: {
    type: String,
    required: true,
  },
  // 예보 배열. 배열/객체의 default 는 반드시 함수 형태로 반환해야
  // 이 컴포넌트를 여러 번 써도 같은 배열을 공유하지 않는다.
  items: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <BaseDashboardCard tag="section" class="wx-forecast-panel">
    <template #header>
      <p class="wx-label">{{ title }}</p>
    </template>

    <div class="wx-strip">
      <div v-for="(item, index) in items" :key="item.id" class="wx-cell">
        <!-- [Scoped Slot] 칸 하나에 해당하는 데이터를 부모에게 올려보낸다.
             isFirst 는 시간별 예보에서 "지금" 칸을 밝게 표시할 때 쓴다. -->
        <slot :item="item" :index="index" :is-first="index === 0">
          <!-- 부모가 마크업을 주입하지 않았을 때의 기본 화면 -->
          <span class="wx-cell-fallback">—</span>
        </slot>
      </div>
    </div>
  </BaseDashboardCard>
</template>

<style scoped>
/* [과제 요구사항 6] 예보 스트립의 "껍데기" 디자인만 이 파일이 책임진다.
   칸 안쪽 글자(.wx-cell-key / .wx-cell-val)는 슬롯으로 주입되는 부모의 마크업이라
   부모 스코프에서 컴파일된다. 그래서 그쪽 스타일은 WeatherParent 에 있다. */
.wx-strip {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 1fr);
  gap: 4px;
  overflow-x: auto;
}

.wx-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 12px 4px;
  border-radius: 12px;
  transition: background-color 0.2s;
}

.wx-cell:hover {
  background: var(--hover);
}

/* 닷매트릭스 아이콘은 종류마다 세로 비율이 달라서, 그대로 두면 칸마다
   아래 온도 줄이 다른 높이에서 시작한다. 자리를 고정 높이로 잡아 준다.
   아이콘은 부모가 슬롯으로 넣은 요소라 이 컴포넌트의 스코프가 닿지 않는다.
   :deep() 로 "내 .wx-cell 안쪽의 .pixel-icon" 까지 한 단계 뚫어 준다. */
.wx-cell > :deep(.pixel-icon) {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
}

.wx-cell-fallback {
  color: var(--dimmer);
}

/* 모바일 — 좁아지면 좌우 테두리를 걷어 원본 폰 화면처럼 되돌린다 */
@media (max-width: 560px) {
  .wx-forecast-panel.wx-panel {
    padding: 18px 4px;
    border-right: 0;
    border-left: 0;
    border-radius: 0;
  }
}
</style>

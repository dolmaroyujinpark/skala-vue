<script setup>
import { ref, inject } from 'vue'
import BaseDashboardCard from './BaseDashboardCard.vue'
import MonoIcon from '@/components/mine/icons/MonoIcon.vue'

/* ════════════════════════════════════════════════════════════
   [지시 외 추가 컴포넌트] WeatherHero.vue

   과제가 요구한 4개 파일에는 없다. 원본 목업의 왼쪽 히어로(선택된 도시)는
   마크업 40여 줄에 반응형 분기까지 붙어 있어서, 그대로 두면 WeatherParent 가
   "상태를 관리하는 곳"이 아니라 "마크업 덩어리"가 되어 버린다.
   Props 만 받아 그리는 순수 표시 컴포넌트로 떼어냈다.

   WeatherCard 와의 차이를 일부러 남겨 뒀다.
     · WeatherCard  — 이벤트를 emit 하는 상호작용 컴포넌트
     · WeatherHero  — emit 이 하나도 없는 표시 전용(dumb) 컴포넌트
   ════════════════════════════════════════════════════════════ */

/* ────────────────────────────────────────────────
   [Props · 하행선]
   온도 3종(temp / high / low)을 부모가 이미 환산해서 내려준다.
   자식이 직접 환산하면 같은 계산이 컴포넌트마다 흩어지고,
   부모의 computed 캐싱 이점도 사라진다.
   ──────────────────────────────────────────────── */
defineProps({
  // 선택된 도시 원본 객체 (이름 · 상태 · 아이콘 · 일출/일몰 · 판정용 원본 섭씨)
  city: {
    type: Object,
    required: true,
  },
  // 부모가 tempUnit 에 맞춰 환산해 둔 현재 / 최고 / 최저 기온
  temp: { type: Number, required: true },
  high: { type: Number, required: true },
  low: { type: Number, required: true },
  // 'AUG 03, MON' 같은 오늘 날짜 캡션
  dateLabel: {
    type: String,
    default: '',
  },
  hotTemp: {
    type: Number,
    default: 25,
  },
})

// [Provide / Inject] °C / °F 글자. WeatherCard 와 같은 이유로 props 대신 inject.
const tempUnit = inject('tempUnit', ref('C'))
</script>

<template>
  <BaseDashboardCard tag="section" class="wx-hero">
    <!-- [Named Slot] 패널 제목 자리 -->
    <template #header>
      <header class="wx-hero-head">
        <h2 class="wx-hero-city">{{ city.name }}</h2>
        <p class="wx-label">Current Location · {{ dateLabel }}</p>
      </header>
    </template>

    <!-- 히어로는 원본 목업처럼 큼직한 라인 아이콘.
         닷매트릭스(PixelIcon)는 작게 찍힐 때 제일 예뻐서 카드·예보에만 쓴다. -->
    <MonoIcon :name="city.icon" :size="118" :width="1.1" class="wx-hero-icon" />

    <div class="wx-hero-figures">
      <p class="wx-temp">
        <span class="wx-temp-num">{{ temp }}</span>
        <span class="wx-temp-unit">°{{ tempUnit }}</span>
      </p>
      <p class="wx-condition">{{ city.status }}</p>

      <p class="wx-minmax">
        <span>↓ {{ low }}°</span>
        <span>↑ {{ high }}°</span>
      </p>

      <!-- [1일차 요구사항 2] v-if / v-else.
           25도 기준은 과제 스펙이므로 환산값이 아닌 원본 섭씨로 판정한다. -->
      <p v-if="city.temp >= hotTemp" class="wx-badge is-hot">HOT · {{ hotTemp }}°C AND ABOVE</p>
      <p v-else class="wx-badge is-cool">COOL · BELOW {{ hotTemp }}°C</p>
    </div>

    <div class="wx-suntimes">
      <span class="wx-suntime"> <MonoIcon name="sunrise" :size="18" /> {{ city.sunrise }} </span>
      <span class="wx-suntime"> <MonoIcon name="sunset" :size="18" /> {{ city.sunset }} </span>
    </div>
  </BaseDashboardCard>
</template>

<style scoped>
/* [과제 요구사항 6] 히어로 구획의 디자인만 이 파일이 책임진다.
   반응형 분기까지 여기로 같이 가져와야 "이 구획을 고치려면 이 파일만 열면 된다"가 성립한다. */
.wx-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

/* BaseDashboardCard 의 .wx-panel 패딩(22px)을 덮어쓴다 */
.wx-hero.wx-panel {
  padding: 34px 24px 28px;
}

.wx-hero-city {
  margin: 0;
  font-size: 30px;
  font-weight: 400;
  letter-spacing: 0.02em;
}

.wx-hero-head .wx-label {
  margin: 6px 0 0;
}

.wx-hero-icon {
  margin: 30px 0 26px;
}

.wx-hero-figures {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.wx-temp {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  margin: 0;
  line-height: 1;
}

.wx-temp-num {
  font-size: 84px;
  letter-spacing: -0.03em;
}

.wx-temp-unit {
  margin-top: 10px;
  color: var(--dim);
  font-size: 26px;
}

.wx-condition {
  margin: 14px 0 0;
  font-size: 18px;
}

.wx-minmax {
  display: flex;
  justify-content: center;
  gap: 22px;
  margin: 8px 0 0;
  color: var(--dim);
  font-size: 15px;
}

/* margin-top: auto 로 일출/일몰을 항상 패널 바닥에 붙인다.
   오른쪽 열(검색 + 카드)이 길어져도 히어로 아래쪽이 비지 않는다. */
.wx-suntimes {
  display: flex;
  justify-content: center;
  gap: 28px;
  width: 100%;
  margin-top: auto;
  padding-top: 26px;
  color: var(--dim);
}

.wx-suntime {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

/* 태블릿 (561~860px)
   2단이 접히면서 히어로가 갑자기 넓은 상자가 된다.
   그대로 세로 정렬을 두면 좌우가 텅 비므로, 이 구간에서만 가로로 눕힌다.
     [ 도시명 ............................ ]
     [ 아이콘 | 온도 · 상태 · 최저최고 · 배지 ]
     [ 일출 ............................ 일몰 ] */
@media (max-width: 860px) {
  .wx-hero {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    grid-template-areas:
      'head head'
      'icon figures'
      'sun  sun';
    align-items: center;
    column-gap: 32px;
    text-align: left;
  }

  .wx-hero-head {
    grid-area: head;
  }

  .wx-hero-icon {
    grid-area: icon;
    margin: 26px 0;
  }

  .wx-hero-figures {
    grid-area: figures;
    align-items: flex-start;
  }

  .wx-temp,
  .wx-minmax {
    justify-content: flex-start;
  }

  .wx-suntimes {
    grid-area: sun;
    justify-content: space-between;
    padding-top: 0;
  }
}

/* 모바일 — 원본 목업이 원래 폰 화면이었으므로,
   좁아지면 테두리를 걷어내 그때의 "여백만 있는 검은 화면"으로 되돌아간다. */
@media (max-width: 560px) {
  .wx-hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .wx-hero.wx-panel {
    padding: 26px 4px 22px;
    border: 0;
  }

  .wx-hero-icon {
    margin: 24px 0 20px;
  }

  .wx-hero-figures {
    align-items: center;
  }

  .wx-temp,
  .wx-minmax {
    justify-content: center;
  }

  .wx-temp-num {
    font-size: 72px;
  }

  .wx-suntimes {
    justify-content: center;
    padding-top: 26px;
  }
}
</style>

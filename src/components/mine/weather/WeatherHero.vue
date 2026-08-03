<script setup>
import { ref, inject } from 'vue'
import BaseDashboardCard from './BaseDashboardCard.vue'
import OutfitCard from './OutfitCard.vue'
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
  // [4일차 추가] 옷차림 블록을 펼칠지. 상태 자체는 부모(WeatherParent)가 소유하고
  // 여기는 값을 받아 보여주기만 한다. 자식이 직접 못 바꾸므로 아래 emit 으로 요청한다.
  showOutfit: {
    type: Boolean,
    default: false,
  },
})

/* [4일차 추가] 옷차림 펼치기/접기 요청을 부모로 올려보낸다.
   히어로가 자기 안에서 ref 를 하나 더 만들어 관리할 수도 있지만,
   그러면 상태가 부모와 자식 두 군데로 흩어진다. 과제 요구사항 1
   ("모든 반응형 데이터는 부모가 유지") 대로 상태는 부모에 남기고
   여기서는 신호만 올린다. */
const emit = defineEmits(['toggle-outfit'])

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

    <!-- [4일차 직접 추가] 옷차림 추천 펼치기 버튼.
         :class 로 켜진 상태를, :aria-expanded 로 보조기기에도 상태를 알린다. -->
    <button class="wx-outfit-btn" :class="{ 'is-on': showOutfit }" :aria-expanded="showOutfit" @click="emit('toggle-outfit')">
      <MonoIcon name="shirt" :size="15" :width="1.4" />
      Outfit
      <span class="wx-outfit-caret" aria-hidden="true"></span>
    </button>

    <!-- v-show 라서 접어도 DOM 에는 남고 display:none 만 붙는다.
         버튼으로 자주 껐다 켜는 자리라, 매번 새로 그리는 v-if 보다 이쪽이 싸다.
         :celsius 에 환산값이 아니라 원본 섭씨(city.temp)를 넘기는 것이 핵심 —
         화씨로 바꿔도 옷차림 판정 기준은 그대로여야 한다. -->
    <OutfitCard v-show="showOutfit" :celsius="city.temp" :status="city.status" :city-name="city.name" />

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

/* [4일차 추가] 옷차림 펼치기 버튼.
   처음엔 테두리 알약에 켜지면 반전되는 형태였는데, 히어로 안에서 이것만
   꽉 찬 블록이라 혼자 튀었다. 바로 위 HOT 배지도 알약이라 두 개가 겹쳐 보이기도 했다.
   원본 목업 규칙("채우지 않는다 · 캡션은 작게 대문자 자간 넓게")대로
   테두리도 배경도 없는 조용한 캡션 버튼으로 바꾸고,
   열림 여부는 색(--dim → --fg)과 셰브론 방향으로만 알린다. */
.wx-outfit-btn {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  margin-top: 24px;
  padding: 8px 2px;
  color: var(--dim);
  font: inherit;
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  background: none;
  border: 0;
  cursor: pointer;
  transition: color 0.2s;
}

.wx-outfit-btn:hover,
.wx-outfit-btn.is-on {
  color: var(--fg);
}

/* 셰브론 — 테두리 두 변만 남긴 정사각형을 45° 돌린 것.
   열리면 -135° 로 뒤집혀 위를 가리킨다. */
.wx-outfit-caret {
  width: 6px;
  height: 6px;
  border-right: 1px solid currentColor;
  border-bottom: 1px solid currentColor;
  transform: rotate(45deg) translate(-1px, -2px);
  transition: transform 0.25s;
}

.wx-outfit-btn.is-on .wx-outfit-caret {
  transform: rotate(-135deg) translate(-2px, -1px);
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
      'btn  btn'
      'outfit outfit'
      'sun  sun';
    align-items: center;
    column-gap: 32px;
    text-align: left;
  }

  /* 가로 배치 구간에서는 버튼과 옷차림 블록이 아이콘/숫자 아래 전체 폭을 쓴다.
     (.wx-outfit 은 OutfitCard 의 루트 — 자식 루트에는 이 컴포넌트의
      scope id 도 함께 찍히므로 여기서 바로 잡을 수 있다) */
  .wx-outfit-btn {
    grid-area: btn;
    justify-self: start;
    margin-top: 20px;
    padding-left: 0;
  }

  .wx-outfit {
    grid-area: outfit;
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

  /* 원래 0 이었다. 바로 위에 옷차림 버튼 행이 생기면서 둘이 붙어 버려서
     — 접었을 때 버튼 밑이 곧바로 일출/일몰 줄이다 — 숨 쉴 자리를 만들었다. */
  .wx-suntimes {
    grid-area: sun;
    justify-content: space-between;
    padding-top: 22px;
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

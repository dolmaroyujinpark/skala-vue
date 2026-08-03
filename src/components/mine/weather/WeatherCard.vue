<script setup>
import { ref, inject } from 'vue'
import BaseDashboardCard from './BaseDashboardCard.vue'
import PixelIcon from '@/components/mine/icons/PixelIcon.vue'
import MonoIcon from '@/components/mine/icons/MonoIcon.vue'

/* ════════════════════════════════════════════════════════════
   [과제 요구사항 4] WeatherCard.vue
     · 선택된 도시 객체를 전달받아 표시                      → props
     · 카드 선택(select-card) · 상세보기(click-detail) 를 부모에게 → emits

   [1일차 요구사항 1] 부모가 v-for 로 이 컴포넌트를 반복 렌더링하고,
   [1일차 요구사항 2] 25도 기준 HOT / COOL 판정은 이 안에서 v-if / v-else 로,
   [1일차 요구사항 4] 클릭 이벤트는 전부 emit 으로 부모에 올려보낸다.
   ════════════════════════════════════════════════════════════ */

/* ────────────────────────────────────────────────
   [Props · 하행선] 부모 → 자식
   과제 스펙은 "도시 객체 하나"지만, 유효성 검사를 붙여 두면
   부모가 필드를 빠뜨렸을 때 화면이 조용히 비는 대신 콘솔에 경고가 뜬다.
   ──────────────────────────────────────────────── */
defineProps({
  // 부모의 displayWeatherList 에서 내려오는 도시 하나.
  // shownTemp 는 부모가 tempUnit 에 맞춰 이미 환산해 둔 값이다.
  cityItem: {
    type: Object,
    required: true,
    // [지시 외 추가] 커스텀 validator — 카드가 그리는 데 꼭 필요한 키가 다 있는지 검사.
    // shownTemp 까지 넣어 둔 이유: 부모가 환산을 빼먹고 원본 배열을 그대로 넘기면
    // 온도 자리만 조용히 빈칸이 된다. 화면이 아니라 콘솔에서 먼저 걸리게 한다.
    validator: (value) => ['id', 'name', 'temp', 'status', 'shownTemp'].every((key) => key in value),
  },
  // 지금 히어로에 떠 있는 도시인지. 테두리를 밝혀 상태바 문구와 짝을 맞춘다.
  isSelected: {
    type: Boolean,
    default: false,
  },
  // 더움 / 선선함을 가르는 기준 온도. 과제 스펙은 25도지만 상수를 부모가 쥐고 있으므로
  // 기본값을 두되 props 로 받아 카드가 스스로 판정한다.
  hotTemp: {
    type: Number,
    default: 25,
  },
})

/* ────────────────────────────────────────────────
   [Provide / Inject] 조상이 심어 둔 온도 단위를 직접 꺼내 쓴다.
   °C / °F 글자 한 개 때문에 WeatherParent → WeatherCard 로 props 를
   하나 더 뚫는 건 전형적인 Props Drilling 이라, 조상이 provide 한 값을
   inject 로 바로 집었다. 두 번째 인자는 이 컴포넌트를 단독으로 띄웠을 때의 기본값.
   ──────────────────────────────────────────────── */
const tempUnit = inject('tempUnit', ref('C'))

/* ────────────────────────────────────────────────
   [Emits · 상행선] 자식 → 부모
   자식은 "무슨 일이 있었는지"만 보고하고, 실제 상태 변경은 부모가 한다.
   select-card 에 문구가 아닌 도시 객체를 실어 올리는 이유:
   문장을 자식이 만들면 부모가 선택된 id 를 알 방법이 없어진다.
   ──────────────────────────────────────────────── */
const emit = defineEmits(['select-card', 'click-detail', 'remove-card'])
</script>

<template>
  <!-- BaseDashboardCard 를 그대로 재사용해 패널 테두리 규칙을 공통화한다.
       class / @click 은 컴포넌트에 걸어도 루트 엘리먼트로 그대로 흘러내려간다 (fallthrough) -->
  <BaseDashboardCard tag="article" class="wx-card" :class="{ 'is-active': isSelected }" @click="emit('select-card', cityItem)">
    <!-- :key 를 index 가 아닌 id 로 잡아야 하는 이유를 눈으로 확인하려고 넣은 삭제 버튼 -->
    <button class="wx-icon-btn wx-card-remove" aria-label="Remove" @click.stop="emit('remove-card', cityItem)">
      <MonoIcon name="close" :size="13" />
    </button>

    <PixelIcon :name="cityItem.icon" :size="44" />

    <h3 class="wx-card-city">{{ cityItem.name }}</h3>
    <p class="wx-card-temp">
      {{ cityItem.shownTemp }}<span>°{{ tempUnit }}</span>
    </p>
    <p class="wx-card-status">{{ cityItem.status }}</p>

    <!-- [1일차 요구사항 2] v-if / v-else — 거짓인 쪽은 DOM 에서 아예 사라진다.
         환산된 shownTemp 가 아니라 원본 섭씨(temp)로 판정해야 °F 로 바꿔도 결과가 같다. -->
    <p v-if="cityItem.temp >= hotTemp" class="wx-badge is-hot">HOT</p>
    <p v-else class="wx-badge is-cool">COOL</p>

    <!-- [1일차 요구사항 4] .stop 이 없으면 카드의 @click 까지 함께 실행된다 (이벤트 버블링) -->
    <button class="wx-detail-btn" @click.stop="emit('click-detail', cityItem.name, cityItem.status)">Details</button>
  </BaseDashboardCard>
</template>

<style scoped>
/* [과제 요구사항 6] 카드 한 장의 디자인만 이 파일이 책임진다.
   .wx-panel 은 BaseDashboardCard 가 가진 클래스라 클래스 두 개로 우선순위를 올려
   패딩을 확실히 덮어쓴다. */
.wx-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  cursor: pointer;
  transition:
    border-color 0.2s,
    background-color 0.2s;
}

.wx-card.wx-panel {
  padding: 24px 16px 18px;
}

.wx-card:hover {
  background: var(--hover);
}

/* 선택된 카드는 테두리를 밝혀 상태바 문구와 짝을 맞춘다 */
.wx-card.is-active {
  border-color: var(--fg);
}

/* 닷매트릭스 원본은 아이콘마다 세로 비율이 다르다 (sun 49×49, cloud 58×37, rain 58×48).
   그대로 두면 카드마다 아래 내용이 다른 높이에서 시작해 DETAILS 버튼 줄이 어긋난다.
   아이콘 자리를 고정 높이로 잡고 그 안에서 세로 중앙 정렬한다. */
.wx-card > .pixel-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 46px;
}

.wx-card-city {
  margin: 18px 0 0;
  font-size: 19px;
  font-weight: 400;
}

.wx-card-temp {
  margin: 6px 0 0;
  font-size: 38px;
  line-height: 1;
}

.wx-card-temp span {
  margin-left: 2px;
  color: var(--dim);
  font-size: 15px;
}

/* 한글이 들어가는 자리(맑음·비·구름)라 라틴 캡션보다 한 단계 크게 잡는다.
   한글은 같은 px 에서 라틴보다 작아 보이기 때문. */
.wx-card-status {
  margin: 6px 0 0;
  color: var(--dim);
  font-size: 15px;
}

/* 카드 안 HOT / COOL 배지. 전역 .wx-badge 를 여기서만 한 단계 작게 조정한다.
   10px 은 대문자 + 넓은 자간과 겹쳐 읽기 힘들어 11px 로 올렸다. */
.wx-card .wx-badge {
  margin-top: 12px;
  padding: 5px 12px;
  font-size: 11px;
}

.wx-detail-btn {
  width: 100%;
  margin-top: 16px;
  padding: 9px 0;
  color: var(--dim);
  font: inherit;
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  background: none;
  border: 1px solid var(--line);
  border-radius: 999px;
  cursor: pointer;
  transition: 0.2s;
}

.wx-detail-btn:hover {
  color: var(--fg);
  border-color: var(--fg);
}

/* 삭제 버튼은 평소엔 숨어 있다가 카드에 마우스를 올리면 나타난다.
   키보드 사용자를 위해 포커스 링이 잡혔을 때도 똑같이 드러낸다. */
.wx-card-remove {
  position: absolute;
  top: 10px;
  right: 10px;
  opacity: 0;
  transition: opacity 0.2s;
}

.wx-card:hover .wx-card-remove,
.wx-card-remove:focus-visible {
  opacity: 1;
}

/* 모바일 — 카드가 2열로 좁아지면 안쪽 여백을 줄인다 */
@media (max-width: 560px) {
  .wx-card.wx-panel {
    padding: 20px 10px 16px;
  }
}
</style>

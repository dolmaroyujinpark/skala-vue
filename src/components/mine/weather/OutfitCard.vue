<script setup>
import { computed } from 'vue'
import MonoIcon from '@/components/mine/icons/MonoIcon.vue'
import { findOutfit } from '@/data/outfitTable'

/* ════════════════════════════════════════════════════════════
   [2일차 직접 추가] OutfitCard.vue — 기온별 옷차림 추천

   과제에서 시킨 게 아니라 제가 넣고 싶어서 만든 기능입니다.
   기상청 생활기상지수의 "체감온도별 옷차림" 구간을 그대로 가져왔습니다.

   BaseDashboardCard 로 감싸지 않습니다. 이 블록은 히어로 패널 *안쪽*에
   들어가는데, 거기서 또 테두리를 두르면 패널 안에 패널이 겹쳐 보입니다.
   구획을 나누는 건 위쪽 헤어라인 한 줄이면 충분합니다.

   설계 원칙 하나: 이 컴포넌트는 반응형 상태를 하나도 갖지 않습니다.
   기온을 props 로 받아 computed 로 옷차림을 파생시킬 뿐입니다.
   추천 결과를 ref 에 담고 watch 로 갱신하는 방법도 있지만, 그러면
   "기온이 바뀌었는데 옷차림이 안 바뀌는" 동기화 버그가 생길 수 있습니다.
   입력이 정해지면 출력이 자동으로 정해지는 값은 computed 가 맞습니다.
   ════════════════════════════════════════════════════════════ */

const props = defineProps({
  // 판정 기준은 언제나 원본 섭씨입니다.
  // 부모가 환산해 둔 화씨 값을 받으면 28°C 와 82°F 를 구분할 수 없습니다.
  celsius: {
    type: Number,
    required: true,
  },
  // '맑음' · '비' · '구름' — 우산 안내를 띄울지 판단하는 데 씁니다.
  status: {
    type: String,
    default: '',
  },
  cityName: {
    type: String,
    default: '',
  },
})

/* ────────────────────────────────────────────────
   [정리] 구간표는 data/outfitTable.js 로 옮겼습니다.
   소개 화면(About)도 같은 표를 읽게 되면서 쓰는 곳이 둘이 됐습니다.
   두 곳에 같은 숫자를 적어 두면, 구간을 고칠 때 한쪽만 고쳐도
   아무도 에러를 내지 않고 화면과 설명이 조용히 어긋납니다.
   ──────────────────────────────────────────────── */

// [computed] 기온이 바뀔 때만 다시 계산됩니다. 그 외에는 캐싱된 값을 재사용.
const outfit = computed(() => findOutfit(props.celsius))

/* [computed] 비가 오면 우산을 따로 안내합니다.

   ⚠️ [4일차] 판정 기준을 넓혔습니다.
   전에는 includes('비') 하나였습니다. API 원문이 '비' · '소나기' · '실 비'
   처럼 전부 '비' 를 품고 있어서 그걸로 충분했습니다.

   그런데 상태 문구를 이 앱의 말투로 바꾸면서('빗방울' · '빗줄기')
   정작 '비' 라는 글자가 사라졌습니다. 문구만 예쁘게 바꿨는데 비 오는 날
   우산 안내가 조용히 사라지는 상황이었습니다.

   그래서 글자 하나가 아니라 "젖는 날씨" 를 가리키는 표현들을 모아서 봅니다.
   원문이 표에 없어 그대로 통과한 경우('가끔 비' 같은)에도 여전히 잡힙니다.

   ⚠️ '폭우' 를 따로 넣은 이유 — 가장 비가 많이 오는 날인데 정작 '비' 도
      '빗' 도 안 들어 있습니다. 어휘를 늘릴 때는 이 정규식도 같이 봐야
      합니다. 지금 화면에 쓰는 말은 data/weatherLabels.js 에 모여 있습니다. */
const needsUmbrella = computed(() => /비|빗|우|눈|천둥|소나기/.test(props.status))
</script>

<template>
  <section class="wx-outfit">
    <div class="wx-outfit-head">
      <MonoIcon name="shirt" :size="26" :width="1.3" />
      <div class="wx-outfit-headline">
        <!-- v-bind 축약형(:)으로 기온 구간을 데이터 속성에 실어 보냅니다.
             CSS 가 이 값을 보고 색을 고르므로, 구간이 늘어나도 템플릿은 그대로입니다. -->
        <p class="wx-outfit-label" :data-level="outfit.label">{{ outfit.label }}</p>
        <p class="wx-outfit-sub">{{ cityName }} {{ celsius }}°C 기준</p>
      </div>
    </div>

    <!-- v-for 로 추천 항목을 칩 형태로 펼칩니다 -->
    <ul class="wx-outfit-items">
      <li v-for="item in outfit.items" :key="item" class="wx-outfit-chip">{{ item }}</li>
    </ul>

    <!-- v-if — 비 올 때만 DOM 에 존재하면 되는 안내라 v-show 가 아니라 v-if 다.
         (자주 켜고 끄는 게 아니라, 도시를 바꿀 때 한 번 판정되고 끝납니다) -->
    <p v-if="needsUmbrella" class="wx-outfit-umbrella">
      <MonoIcon name="umbrella" :size="15" />
      우산을 챙기세요
    </p>
  </section>
</template>

<style scoped>
/* [과제 요구사항 6] 옷차림 블록의 디자인만 이 파일이 책임집니다.
   히어로 패널 안에 들어가므로 테두리 대신 위쪽 헤어라인 한 줄로만 구분합니다. */
.wx-outfit {
  width: 100%;
  margin-top: 22px;
  padding-top: 20px;
  text-align: left;
  border-top: 1px solid var(--line);
}

.wx-outfit-head {
  display: flex;
  align-items: center;
  gap: 12px;
}

.wx-outfit-headline {
  min-width: 0;
}

.wx-outfit-label {
  margin: 0;
  font-size: 22px;
  line-height: 1.2;
}

/* 더운 쪽과 추운 쪽만 본문 색으로 끌어올려 눈에 띄게 합니다.
   나머지 구간은 --dim 으로 두어 화면이 시끄러워지지 않게 했습니다. */
.wx-outfit-label[data-level='한여름'],
.wx-outfit-label[data-level='한겨울'] {
  color: var(--fg);
}

.wx-outfit-sub {
  margin: 2px 0 0;
  color: var(--dim);
  font-size: 13px;
}

.wx-outfit-items {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin: 16px 0 0;
  padding: 0;
  list-style: none;
}

/* 원본 목업 규칙대로 채우지 않고 테두리로만 구분합니다 */
.wx-outfit-chip {
  padding: 5px 11px;
  color: var(--dim);
  font-size: 13px;
  border: 1px solid var(--line-hi);
  border-radius: 999px;
  white-space: nowrap;
}

.wx-outfit-umbrella {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 14px 0 0;
  padding-top: 13px;
  color: var(--fg);
  font-size: 13px;
  border-top: 1px solid var(--line);
}
</style>

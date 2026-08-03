<script setup>
import { computed } from 'vue'
import MonoIcon from '@/components/mine/icons/MonoIcon.vue'

/* ════════════════════════════════════════════════════════════
   [4일차 직접 추가] OutfitCard.vue — 기온별 옷차림 추천

   과제에서 시킨 게 아니라 내가 넣고 싶어서 만든 기능이다.
   기상청 생활기상지수의 "체감온도별 옷차림" 구간을 그대로 가져왔다.

   BaseDashboardCard 로 감싸지 않는다. 이 블록은 히어로 패널 *안쪽*에
   들어가는데, 거기서 또 테두리를 두르면 패널 안에 패널이 겹쳐 보인다.
   구획을 나누는 건 위쪽 헤어라인 한 줄이면 충분하다.

   설계 원칙 하나: 이 컴포넌트는 반응형 상태를 하나도 갖지 않는다.
   기온을 props 로 받아 computed 로 옷차림을 파생시킬 뿐이다.
   추천 결과를 ref 에 담고 watch 로 갱신하는 방법도 있지만, 그러면
   "기온이 바뀌었는데 옷차림이 안 바뀌는" 동기화 버그가 생길 수 있다.
   입력이 정해지면 출력이 자동으로 정해지는 값은 computed 가 맞다.
   ════════════════════════════════════════════════════════════ */

const props = defineProps({
  // 판정 기준은 언제나 원본 섭씨다.
  // 부모가 환산해 둔 화씨 값을 받으면 28°C 와 82°F 를 구분할 수 없다.
  celsius: {
    type: Number,
    required: true,
  },
  // '맑음' · '비' · '구름' — 우산 안내를 띄울지 판단하는 데 쓴다.
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
   기상청 생활기상지수 기준 구간표.
   위에서부터 훑어 내려가다 처음 만나는 min 이 정답이므로 내림차순이어야 한다.
   마지막 칸의 min 을 -Infinity 로 둬서 "못 찾는 경우"가 생기지 않게 막았다.
   ──────────────────────────────────────────────── */
const OUTFIT_TABLE = [
  { min: 28, label: '한여름', items: ['민소매', '반팔', '반바지', '원피스'] },
  { min: 23, label: '더움', items: ['반팔', '얇은 셔츠', '반바지', '면바지'] },
  { min: 20, label: '선선함', items: ['긴팔', '얇은 가디건', '면바지', '청바지'] },
  { min: 17, label: '쌀쌀함', items: ['얇은 니트', '맨투맨', '가디건', '청바지'] },
  { min: 12, label: '서늘함', items: ['자켓', '가디건', '야상', '스타킹'] },
  { min: 9, label: '추움', items: ['트렌치코트', '점퍼', '기모바지'] },
  { min: 5, label: '많이 추움', items: ['코트', '가죽자켓', '히트텍', '니트'] },
  { min: -Infinity, label: '한겨울', items: ['패딩', '두꺼운 코트', '목도리', '기모'] },
]

// [computed] 기온이 바뀔 때만 다시 계산된다. 그 외에는 캐싱된 값을 재사용.
const outfit = computed(() => OUTFIT_TABLE.find((row) => props.celsius >= row.min))

// [computed] 비가 오면 우산을 따로 안내한다.
// status 문자열에 '비'가 들어있는지만 보므로 '비'·'소나기'·'가끔 비' 전부 잡힌다.
const needsUmbrella = computed(() => props.status.includes('비'))
</script>

<template>
  <section class="wx-outfit">
    <div class="wx-outfit-head">
      <MonoIcon name="shirt" :size="26" :width="1.3" />
      <div class="wx-outfit-headline">
        <!-- v-bind 축약형(:)으로 기온 구간을 데이터 속성에 실어 보낸다.
             CSS 가 이 값을 보고 색을 고르므로, 구간이 늘어나도 템플릿은 그대로다. -->
        <p class="wx-outfit-label" :data-level="outfit.label">{{ outfit.label }}</p>
        <p class="wx-outfit-sub">{{ cityName }} {{ celsius }}°C 기준</p>
      </div>
    </div>

    <!-- v-for 로 추천 항목을 칩 형태로 펼친다 -->
    <ul class="wx-outfit-items">
      <li v-for="item in outfit.items" :key="item" class="wx-outfit-chip">{{ item }}</li>
    </ul>

    <!-- v-if — 비 올 때만 DOM 에 존재하면 되는 안내라 v-show 가 아니라 v-if 다.
         (자주 켜고 끄는 게 아니라, 도시를 바꿀 때 한 번 판정되고 끝난다) -->
    <p v-if="needsUmbrella" class="wx-outfit-umbrella">
      <MonoIcon name="umbrella" :size="15" />
      우산을 챙기세요
    </p>
  </section>
</template>

<style scoped>
/* [과제 요구사항 6] 옷차림 블록의 디자인만 이 파일이 책임진다.
   히어로 패널 안에 들어가므로 테두리 대신 위쪽 헤어라인 한 줄로만 구분한다. */
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

/* 더운 쪽과 추운 쪽만 본문 색으로 끌어올려 눈에 띄게 한다.
   나머지 구간은 --dim 으로 두어 화면이 시끄러워지지 않게 했다. */
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

/* 원본 목업 규칙대로 채우지 않고 테두리로만 구분한다 */
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

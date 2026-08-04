<script setup>
import { RouterLink } from 'vue-router'

import BaseDashboardCard from '@/components/mine/weather/BaseDashboardCard.vue'
import PixelIcon from '@/components/mine/icons/PixelIcon.vue'
import MonoIcon from '@/components/mine/icons/MonoIcon.vue'
import { cities } from '@/data/cities'
import { playlistSummary } from '@/data/weatherPlaylists'
import { OUTFIT_TABLE, toRangeLabel } from '@/data/outfitTable'

/* ════════════════════════════════════════════════════════════
   [3일차 과제] WeatherAboutView.vue — /about (요구사항 5)

   ── 디자인 ────────────────────────────────────────────────
   이 화면도 새 스타일을 만들지 않았습니다. 패널은 BaseDashboardCard,
   캡션은 .wx-label, 버튼은 .wx-action, 아이콘은 PixelIcon —
   전부 대시보드에서 쓰던 것 그대로입니다. 소개 페이지가 대시보드와
   다른 옷을 입고 있으면 같은 앱으로 안 보입니다.

   ── 요구사항 5 ────────────────────────────────────────────
     · 적당한 내용 작성
     · 메인 대시보드로 돌아가기

   ── [추가] 패널이 세 개 늘었습니다 ───────────────────────
   Scope · Weather Radio · Outfit.

   늘린 이유는 요구사항 5 의 "적당한 내용" 을 채우기 위해서만이 아닙니다.
   과제가 시킨 것(v-for · Props/Emits · Router · axios · store)과 제가
   취향으로 붙인 것(옷차림 · 라디오)이 한 화면에 섞여 있어서, 이 소개
   화면마저 뭉뚱그리면 무엇이 과제의 답인지 흐려집니다.
   그래서 Scope 패널에서 둘의 경계를 먼저 밝히고, 그 뒤에 추가 기능
   두 개를 설명합니다. 추가 기능 패널에는 캡션 옆에 '직접 추가' 를
   붙여 두었습니다.

   ⚠️ 요구사항 5 자체는 그대로입니다 — 내용이 늘었을 뿐, 맨 아래
      "메인 대시보드로 돌아가기" 는 원래 자리에 그대로 있습니다.
   ════════════════════════════════════════════════════════════ */

/* 소개에 적을 숫자는 손으로 쓰지 않고 데이터에서 셉니다.
   도시를 하나 더하면 이 문장도 같이 맞춰집니다. */
const cityCount = cities.length

/* 앱을 이루는 조각들 — v-for 로 반복 출력합니다.
   마크업을 여섯 벌 쓰는 대신 배열 하나로 두면 항목을 더할 때 여기만 고칩니다. */
const buildingBlocks = [
  { id: 'hero', icon: 'sun', name: 'WeatherHero', role: '선택된 도시의 큰 기온 · 옷차림 · 일출/일몰' },
  { id: 'card', icon: 'partly', name: 'WeatherCard', role: '도시 한 장 · 즐겨찾기 · 상세보기' },
  { id: 'search', icon: 'cloud', name: 'SearchBar', role: 'Props 로 받고 Emits 로 올려보내는 검색' },
  { id: 'strip', icon: 'rain', name: 'ForecastStrip', role: 'Scoped Slot 으로 칸 내용을 부모가 정하는 예보' },
  { id: 'outfit', icon: 'night', name: 'OutfitCard', role: '기온을 받아 옷차림을 파생시키는 계산 전용 블록' },
  { id: 'radio', icon: 'partly', name: 'WeatherRadio', role: '날씨에 맞는 플레이리스트 · 재생 조작' },
  { id: 'panel', icon: 'night', name: 'BaseDashboardCard', role: '모든 구획이 공유하는 패널 테두리' },
]

/* 플레이리스트와 옷차림 표는 화면이 아니라 데이터에서 가져옵니다.
   여기에 다시 적으면 곡을 한 곡 더하거나 구간을 고칠 때 소개 화면만
   옛말을 하게 됩니다. (위 cityCount 를 세는 것과 같은 이유) */
const playlists = playlistSummary
const outfitTable = OUTFIT_TABLE

/* ────────────────────────────────────────────────
   무엇이 과제이고 무엇이 덤인가

   두 배열로 나눠 둔 것 자체가 설명입니다. 한 배열에 담고 태그로
   구분하면, 화면에서는 결국 같은 목록으로 읽힙니다.
   ──────────────────────────────────────────────── */
const requiredWork = [
  { id: 'render', label: 'Rendering', text: 'v-for 로 도시 카드를 반복 출력하고, 25°C 기준 HOT / COOL 을 v-if · v-else 로 가릅니다.' },
  { id: 'components', label: 'Components', text: '히어로 · 카드 · 검색 · 예보로 나누고 Props 로 내려보내고 Emits 로 올려받습니다. 상태는 부모가 쥡니다.' },
  { id: 'reactive', label: 'Reactivity', text: '검색 · 정렬 결과는 computed 로 파생시키고, 상태 변화는 watch · watchEffect 로 감시합니다.' },
  { id: 'router', label: 'Router', text: '대시보드 · 소개 · 도시 상세 · 404 네 화면. 상세는 /weather/:cityId 동적 경로입니다.' },
  { id: 'axios', label: 'Axios', text: 'OpenWeatherMap 을 axios 로 호출합니다. 통신 코드는 api/weather.js 한 곳에만 있습니다.' },
  { id: 'store', label: 'Pinia', text: '℃ / ℉ 단위를 configStore 에 두어, 화면을 옮겨도 설정이 초기화되지 않습니다.' },
]

const extraWork = [
  { id: 'favorite', label: '즐겨찾기 · 정렬', text: '별을 누르면 목록 맨 앞으로 올라오고, 새로고침해도 남습니다 (localStorage).' },
  { id: 'outfit', label: '옷차림 추천', text: '기상청 생활기상지수 구간을 그대로 옮겨, 기온에서 옷차림을 파생시킵니다.' },
  { id: 'radio', label: '날씨 라디오', text: '하늘 여섯 갈래마다 플레이리스트를 걸어 두고 YouTube 로 재생합니다.' },
  { id: 'shell', label: '스플래시 · 테마', text: '웹폰트가 준비될 때까지 스플래시로 덮고, 다크 / 라이트는 OS 설정을 따라갑니다.' },
]

/* 3일차에 새로 붙은 것들 */
const routerNotes = [
  { id: 'lazy', label: 'Lazy Loading', text: '네 화면 모두 () => import() 로 필요할 때 내려받습니다.' },
  { id: 'dynamic', label: 'Dynamic Route', text: '/weather/:cityId — 도시 코드가 곧 주소가 됩니다.' },
  { id: 'catchall', label: 'Catch-all', text: '정의되지 않은 주소는 전부 안내 화면으로 보냅니다.' },
  { id: 'shell', label: 'App Shell', text: '테마 · 단위 설정은 화면을 옮겨도 초기화되지 않습니다.' },
]
</script>

<template>
  <div class="wx-about">
    <!-- ── 서비스 소개 ── -->
    <BaseDashboardCard tag="section">
      <template #header>
        <header>
          <h2 class="wx-about-title">Dora's Weather</h2>
          <p class="wx-label">About this service</p>
        </header>
      </template>

      <p class="wx-about-lead">
        {{ cityCount }}개 지역의 현재 날씨와 시간별 · 일별 예보를 한 화면에서 보는 대시보드입니다. 기온에 맞는 옷차림을 함께 추천하고, 그날 하늘에 어울리는 플레이리스트를 틀어 줍니다. 자주 보는 도시는 즐겨찾기로 앞에 세울 수 있습니다.
      </p>
      <p class="wx-about-lead">
        날씨는 <strong>OpenWeatherMap</strong> 에서 실시간으로 받아 옵니다. 현재 날씨는 <code>/weather</code>, 예보는 3시간 간격 5일치를 주는 <code>/forecast</code> 를 받아 시간별 · 일별 두 벌로 나눠 담았습니다. 도시는 이름 대신 좌표로 조회합니다 — 영문 표기가 제각각이라(거제는 응답에 'Kŏje' 로 옵니다) 이름으로는 못 찾는 곳이 있었습니다.
      </p>
      <p class="wx-about-lead">
        통신이 실패해도 화면은 비지 않습니다. 저장해 둔 값으로 대신 그려 두고 아래 상태바가 그 사실을 알려 줍니다. 수업 실습으로 만든 화면이라 데이터를 가져오는 부분만큼이나, 그 데이터를 화면에 어떻게 나눠 담는지에 무게를 두었습니다.
      </p>
    </BaseDashboardCard>

    <!-- ── [추가] 과제와 덤의 경계 ──
         화면을 보는 사람이 가장 먼저 궁금해할 것을 먼저 답합니다.
         "어디까지가 과제이고 어디부터가 취향인가" -->
    <BaseDashboardCard tag="section">
      <template #header>
        <p class="wx-label">Scope</p>
      </template>

      <p class="wx-about-lead">
        수업 과제로 만든 화면입니다. 요구사항으로 받은 것과 제가 덧붙인 것을 아래에 나눠 적었습니다. 덧붙인 기능도 과제에서 배운 문법(Props · Emits · computed · store)만으로 만들었고, 요구사항 쪽 코드를 바꿔 끼우지는 않았습니다.
      </p>

      <div class="wx-about-scope">
        <section>
          <p class="wx-label">과제 요구사항</p>
          <dl class="wx-about-scope-list">
            <div v-for="item in requiredWork" :key="item.id" class="wx-about-scope-item">
              <dt class="wx-about-scope-label">{{ item.label }}</dt>
              <dd class="wx-about-scope-text">{{ item.text }}</dd>
            </div>
          </dl>
        </section>

        <section>
          <p class="wx-label">직접 붙인 것</p>
          <dl class="wx-about-scope-list">
            <div v-for="item in extraWork" :key="item.id" class="wx-about-scope-item">
              <dt class="wx-about-scope-label">{{ item.label }}</dt>
              <dd class="wx-about-scope-text">{{ item.text }}</dd>
            </div>
          </dl>
        </section>
      </div>
    </BaseDashboardCard>

    <!-- ── 무엇으로 만들어졌나 ── -->
    <BaseDashboardCard tag="section">
      <template #header>
        <p class="wx-label">Built with</p>
      </template>

      <ul class="wx-about-blocks">
        <li v-for="block in buildingBlocks" :key="block.id" class="wx-about-block">
          <PixelIcon :name="block.icon" :size="26" />
          <div class="wx-about-block-text">
            <p class="wx-about-block-name">{{ block.name }}</p>
            <p class="wx-about-block-role">{{ block.role }}</p>
          </div>
        </li>
      </ul>
    </BaseDashboardCard>

    <!-- ── 날씨 라디오 ── -->
    <BaseDashboardCard tag="section">
      <template #header>
        <header class="wx-about-head">
          <MonoIcon name="play" :size="17" :width="1.4" />
          <p class="wx-label">Weather Radio</p>
          <span class="wx-about-tag">직접 추가</span>
        </header>
      </template>

      <p class="wx-about-lead">날씨에 맞는 노래가 재생되도록 해두었습니다. 도시를 옮기면 플레이 리스트 목록도 같이 바뀌어요!</p>
      <p class="wx-about-lead">
        비 오는 날엔 잔나비, 흐린 날엔 존박 그리고 빈지노 노래를 자주 듣는 <strong>운영자 취향</strong>에 맞춰 플리를 넣어뒀습니다. 맘에 드셨으면 좋겠습니다.
      </p>

      <ul class="wx-about-moods">
        <li v-for="mood in playlists" :key="mood.key" class="wx-about-mood">
          <p class="wx-label wx-about-mood-caption">{{ mood.caption }}</p>
          <p class="wx-about-mood-weather">{{ mood.weather }}</p>
          <p class="wx-about-mood-lead">{{ mood.lead }}<span v-if="mood.count > 1"> 외 {{ mood.count - 1 }}곡</span></p>
        </li>
      </ul>

      <p class="wx-about-foot-note">
        <span class="wx-about-note-tag">Made with</span>
        <span>
          재생은 <strong>YouTube IFrame Player API</strong>, 재생 상태는 <strong>Pinia</strong>(radioStore), 곡 목록은 <code>data/weatherPlaylists.js</code> 에 표로 고정했습니다. 검색 API 를 쓰지 않아 키가 필요 없습니다. 소리를 내는 iframe 은 RouterView 바깥 앱 셸에 숨겨 두었습니다 — 화면을 옮겨도 재생이 끊기지 않습니다.
        </span>
      </p>
    </BaseDashboardCard>

    <!-- ── 옷차림 ── -->
    <BaseDashboardCard tag="section">
      <template #header>
        <header class="wx-about-head">
          <MonoIcon name="shirt" :size="17" :width="1.4" />
          <p class="wx-label">Outfit</p>
          <span class="wx-about-tag">직접 추가</span>
        </header>
      </template>

      <p class="wx-about-lead">
        기상청 생활기상지수의 <strong>체감온도별 옷차림</strong> 구간을 그대로 가져왔습니다. 히어로에서 Outfit 을 펼치면 그 도시 기온이 어느 칸에 걸리는지 보여 줍니다. 판정은 언제나 원본 섭씨로 합니다 — ℉ 로 바꿔 봐도 추천은 흔들리지 않습니다.
      </p>

      <dl class="wx-about-outfits">
        <div v-for="(row, index) in outfitTable" :key="row.label" class="wx-about-outfit">
          <dt class="wx-about-outfit-range">{{ toRangeLabel(index) }}</dt>
          <dd class="wx-about-outfit-body">
            <span class="wx-about-outfit-label">{{ row.label }}</span>
            <span class="wx-about-outfit-items">{{ row.items.join(' · ') }}</span>
          </dd>
        </div>
      </dl>

      <p class="wx-about-foot-note">
        <span class="wx-about-note-tag">Made with</span>
        <span>
          기온을 props 로 받아 <strong>computed</strong> 로 옷차림을 파생시킵니다. 구간표는 <code>data/outfitTable.js</code> 에 있고 소개 화면도 같은 표를 읽습니다. 비 · 눈 · 천둥처럼 젖는 날씨면 "우산을 챙기세요" 한 줄이 더 붙습니다.
        </span>
      </p>
    </BaseDashboardCard>

    <!-- ── 3일차에 붙은 라우팅 ── -->
    <BaseDashboardCard tag="section">
      <template #header>
        <p class="wx-label">Routing</p>
      </template>

      <dl class="wx-about-notes">
        <div v-for="note in routerNotes" :key="note.id" class="wx-about-note">
          <dt class="wx-label">{{ note.label }}</dt>
          <dd class="wx-about-note-text">{{ note.text }}</dd>
        </div>
      </dl>
    </BaseDashboardCard>

    <!-- [요구사항 5] 메인 대시보드로 돌아가기.
         상세 페이지의 버튼과 달리 여기는 RouterLink 를 썼습니다.
         사용자가 직접 누르는 평범한 이동이라 코드가 판단할 것이 없고,
         <a> 로 렌더링되니 새 탭으로 열기 같은 브라우저 기능도 그대로 동작합니다. -->
    <footer class="wx-about-foot">
      <RouterLink to="/" class="wx-action">← Dashboard </RouterLink>
    </footer>
  </div>
</template>

<style scoped>
/* 대시보드와 같은 16px 세로 리듬. 색 · 테두리는 전부 물려받습니다. */
.wx-about {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.wx-about-title {
  margin: 0;
  font-size: 26px;
  font-weight: 400;
}

/* 한글 문장이 들어가는 자리라 15px (상태바 · 옷차림 카드와 같은 기준) */
.wx-about-lead {
  margin: 0 0 12px;
  font-size: 15px;
}

.wx-about-lead:last-child {
  margin-bottom: 0;
}

/* 엔드포인트 · 파일 이름(/weather · data/outfitTable.js).
   브라우저 기본 <code> 는 고정폭 글꼴이라 이 앱의 Ubuntu Condensed 옆에서
   혼자 튑니다. 글꼴은 물려받고 밝기로만 구분합니다. */
.wx-about code {
  color: var(--fg);
  font-family: inherit;
  letter-spacing: 0.02em;
}

/* 구성 요소 목록 */
.wx-about-blocks {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.wx-about-block {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.wx-about-block-text {
  min-width: 0;
}

.wx-about-block-name {
  margin: 0;
  font-size: 15px;
  letter-spacing: 0.04em;
}

.wx-about-block-role {
  margin: 2px 0 0;
  color: var(--dim);
  font-size: 13px;
}

/* 아이콘이 붙은 패널 제목 — .wx-label 은 아래 여백 14px 을 갖고 있는데
   여기서는 아이콘과 가로로 나란히 서므로 그 여백을 지웁니다. */
.wx-about-head {
  display: flex;
  align-items: center;
  gap: 10px;
  /* 아래 여백은 캡션이 아니라 이 줄이 책임집니다.
     .wx-label 은 원래 아래 14px 을 갖고 있는데, 여기서는 아이콘·꼬리표와
     가로로 나란히 서느라 그 여백을 지웠습니다(아래 규칙). 그대로 두면
     본문이 제목에 딱 붙어 버려서, 같은 몫을 이 줄에 다시 줍니다.
     아이콘까지 얹혀 제목이 무거워진 만큼 14 대신 18px 로 잡았습니다. */
  margin-bottom: 18px;
  color: var(--dim);
}

.wx-about-head .wx-label {
  margin: 0;
}

/* 캡션 옆 꼬리표 — '직접 추가'.
   테두리를 두르면 알약이 하나 늘어납니다. 이 앱은 채우지도 두르지도
   않으므로, 한 단계 더 어두운 색과 넓은 자간으로만 구분합니다. */
.wx-about-tag {
  margin-left: 2px;
  color: var(--dimmer);
  font-size: 11px;
  letter-spacing: 0.1em;
}

/* ── 과제 / 덤 두 열 ─────────────────────────────────────
   좁아지면 한 열로 접힙니다. 두 열 사이에는 선을 긋지 않았습니다 —
   제목(.wx-label) 두 개가 이미 경계를 만들고 있어서, 선까지 그으면
   패널 안에 표가 하나 더 생긴 것처럼 보입니다. */
.wx-about-scope {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 26px 32px;
  margin-top: 24px;
}

.wx-about-scope-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: 0;
}

/* 라벨과 설명을 세로로 쌓습니다. 가로로 두면 'Components' 같은 긴 라벨
   때문에 왼쪽 칸이 넓어져 정작 설명이 좁아집니다. */
.wx-about-scope-label {
  font-size: 14px;
  letter-spacing: 0.04em;
}

.wx-about-scope-text {
  margin: 3px 0 0;
  color: var(--dim);
  font-size: 13px;
  line-height: 1.6;
}

/* ── 날씨별 플레이리스트 ─────────────────────────────────
   여섯 갈래를 카드로 만들지 않습니다. 패널 안에서 또 상자를 그리면
   패널 속 패널이 됩니다. 왼쪽 세로선 하나로만 묶었습니다. */
.wx-about-moods {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 18px 20px;
  margin: 22px 0 0;
  padding: 0;
  list-style: none;
}

.wx-about-mood {
  padding-left: 14px;
  border-left: 1px solid var(--line);
}

.wx-about-mood-caption {
  margin-bottom: 6px;
}

.wx-about-mood-weather {
  margin: 0;
  font-size: 15px;
}

.wx-about-mood-lead {
  margin: 3px 0 0;
  color: var(--dim);
  font-size: 13px;
}

/* ── 옷차림 구간표 ───────────────────────────────────── */
.wx-about-outfits {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 14px 20px;
  margin: 22px 0 0;
}

/* 기온 구간과 옷차림을 한 줄로 붙입니다. 8칸이라 각 칸이 두 줄씩
   차지하면 표가 아니라 목록처럼 길어집니다. */
.wx-about-outfit {
  display: grid;
  grid-template-columns: 92px minmax(0, 1fr);
  align-items: baseline;
  gap: 12px;
}

.wx-about-outfit-range {
  color: var(--dim);
  font-size: 12px;
  letter-spacing: 0.06em;
  white-space: nowrap;
}

.wx-about-outfit-body {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 10px;
  margin: 0;
  min-width: 0;
}

.wx-about-outfit-label {
  font-size: 15px;
}

.wx-about-outfit-items {
  color: var(--dim);
  font-size: 13px;
}

/* 'Made with' 꼬리표 — 뒤따르는 문장이 무엇에 대한 설명인지 알리는 이름표.
   앱 전체의 캡션(.wx-label)과 같은 말투를 쓰되, 여기서는 문장 앞에
   나란히 서므로 블록이 아니라 인라인입니다. flex: none 은 문장이 길어져도
   이 이름표가 눌려 줄바꿈되지 않게 합니다. */
.wx-about-note-tag {
  flex: none;
  color: var(--dimmer);
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

/* 패널 맨 아래 덧붙이는 한 줄 — 본문보다 한 단계 조용하게 */
.wx-about-foot-note {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin: 22px 0 0;
  padding-top: 18px;
  color: var(--dim);
  font-size: 13px;
  line-height: 1.6;
  border-top: 1px solid var(--line);
}

/* 라우팅 메모 */
.wx-about-notes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 18px 16px;
  margin: 0;
}

.wx-about-note .wx-label {
  margin-bottom: 4px;
}

.wx-about-note-text {
  margin: 0;
  font-size: 14px;
}

.wx-about-foot {
  display: flex;
  justify-content: center;
}
</style>

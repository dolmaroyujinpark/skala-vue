<script setup>
import { RouterLink } from 'vue-router'

import BaseDashboardCard from '@/components/mine/weather/BaseDashboardCard.vue'
import PixelIcon from '@/components/mine/icons/PixelIcon.vue'
import { cities } from '@/data/cities'

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
  { id: 'panel', icon: 'night', name: 'BaseDashboardCard', role: '모든 구획이 공유하는 패널 테두리' },
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
        {{ cityCount }}개 지역의 현재 날씨와 시간별 · 일별 예보를 한 화면에서 보는 대시보드입니다. 기온에 맞는 옷차림을 함께 추천하고, 자주 보는 도시는 즐겨찾기로 앞에 세울 수 있습니다.
      </p>
      <p class="wx-about-lead">
        실제 기상 API 대신 Mock 데이터를 씁니다. 수업 실습으로 만든 화면이라 데이터를 가져오는 부분보다, 그 데이터를 화면에 어떻게 나눠 담는지에 무게를 두었습니다.
      </p>
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

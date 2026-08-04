<script setup>
import { RouterLink, useRoute, useRouter } from 'vue-router'

import BaseDashboardCard from '@/components/mine/weather/BaseDashboardCard.vue'
import MonoIcon from '@/components/mine/icons/MonoIcon.vue'

/* ════════════════════════════════════════════════════════════
   [3일차 과제] NotFoundView.vue — Catch-all Route (요구사항 1)

   ── 디자인 ────────────────────────────────────────────────
   404 화면이라고 따로 만들지 않았습니다. 대시보드와 같은 패널
   (BaseDashboardCard), 같은 캡션(.wx-label), 같은 버튼(.wx-action),
   같은 아이콘(MonoIcon)을 씁니다.

   길을 잘못 든 화면일수록 "여기가 아직 그 앱 안"이라는 게 보여야 합니다.
   갑자기 다른 색과 다른 글꼴이 나오면 사용자는 앱이 깨졌다고 읽습니다.
   히어로에 쓰던 큰 라인 아이콘을 그대로 쓴 것도 같은 이유입니다.
   ════════════════════════════════════════════════════════════ */

const route = useRoute()
const router = useRouter()

/* name 으로 이동합니다. 경로 문자열('/')을 직접 쓰면 나중에 라우트 경로가
   바뀔 때 이런 곳들을 전부 찾아 고쳐야 합니다. 이름은 잘 안 바뀝니다. */
const goHome = () => {
  router.push({ name: 'WeatherHome' })
}
</script>

<template>
  <div class="wx-notfound">
    <BaseDashboardCard tag="section" class="wx-notfound-panel">
      <template #header>
        <p class="wx-label">404 · Route not found</p>
      </template>

      <!-- 히어로가 쓰는 것과 같은 큰 라인 아이콘.
           비 오는 아이콘을 골랐습니다 — 이 화면의 분위기에 맞습니다. -->
      <MonoIcon name="rain" :size="96" :width="1.1" class="wx-notfound-icon" />

      <h2 class="wx-notfound-title">여긴 관측소가 없습니다</h2>

      <p class="wx-notfound-text">
        요청하신 주소 <strong>{{ route.fullPath }}</strong> 는 이 앱에 정의되어 있지 않습니다.
      </p>

      <!-- 두 갈래 길을 줍니다. 주소를 잘못 친 경우와 없는 화면을 찾는 경우가 다릅니다. -->
      <div class="wx-notfound-actions">
        <button class="wx-action" @click="goHome">Dashboard</button>
        <RouterLink to="/about" class="wx-action">About</RouterLink>
      </div>
    </BaseDashboardCard>
  </div>
</template>

<style scoped>
/* 배치만 정합니다. 패널 · 캡션 · 버튼 · 색은 전부 기존 것을 물려받습니다. */
.wx-notfound {
  display: flex;
  justify-content: center;
}

.wx-notfound-panel {
  width: 100%;
  /* 히어로 폭(340px)보다 넉넉하게, 그러나 셸 전체를 다 쓰지는 않게 */
  max-width: 520px;
  padding: 40px 28px;
  text-align: center;
}

.wx-notfound-icon {
  color: var(--dimmer);
}

.wx-notfound-title {
  margin: 18px 0 0;
  font-size: 24px;
  font-weight: 400;
}

/* 한글 문장이라 15px (상태바 · 소개 화면과 같은 기준) */
.wx-notfound-text {
  margin: 10px 0 26px;
  color: var(--dim);
  font-size: 15px;
  /* 긴 주소가 들어와도 패널 밖으로 넘치지 않게 */
  overflow-wrap: anywhere;
}

.wx-notfound-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}
</style>

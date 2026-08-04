import { createRouter, createWebHistory } from 'vue-router'

/* ════════════════════════════════════════════════════════════
   [3일차 과제] 라우트 규칙 (요구사항 1)
     · 라우터 지연 로딩(Lazy Loading) 적용
     · Catch-all Route 적용

   ── 지연 로딩 ─────────────────────────────────────────────
   component 에 컴포넌트를 직접 넣으면 이 파일이 그 .vue 를 import 하므로,
   앱을 켤 때 네 화면의 코드가 전부 한 덩어리로 내려옵니다. 사용자가
   /about 에 한 번도 안 들어가도 마찬가지입니다.

   () => import(...) 는 "필요해지면 그때 불러올 함수"입니다. Vite 가 이걸
   보고 화면마다 파일을 따로 쪼개 두고, 라우터가 그 경로로 갈 때 처음
   내려받습니다. 첫 화면이 그만큼 빨리 뜹니다.

   홈(/)까지 지연 로딩으로 둔 이유 — 어차피 제일 먼저 필요한 화면이라
   미리 불러도 손해는 없지만, 그러면 "이 파일만 보면 네 화면이 전부
   같은 방식"이라는 게 깨집니다. 예외를 하나 두면 나중에 화면을 더할 때
   어느 쪽을 따라야 할지 매번 판단해야 합니다.

   ── Catch-all ─────────────────────────────────────────────
   맨 아래 /:pathMatch(.*)* 가 위 규칙 어디에도 안 걸린 주소를 전부 받습니다.
   순서가 중요합니다. 이걸 위로 올리면 모든 주소를 먼저 삼켜서
   /about 조차 404 로 갑니다.
   ════════════════════════════════════════════════════════════ */
const routes = [
  {
    // 메인 날씨 대시보드 — 2일차 WeatherParent 를 대체하는 화면
    path: '/',
    name: 'WeatherHome',
    component: () => import('../views/WeatherHomeView.vue'),
  },
  {
    // 서비스 소개
    path: '/about',
    name: 'WeatherAbout',
    component: () => import('../views/WeatherAboutView.vue'),
  },
  {
    /* 동적 경로 매칭 — :cityId 자리에 들어온 값이 route.params.cityId 가 됩니다.
       이 이름(cityId)은 WeatherDetailView 가 그대로 읽으므로, 한쪽만 바꾸면
       조용히 undefined 가 됩니다. */
    path: '/weather/:cityId',
    name: 'WeatherDetail',
    component: () => import('../views/WeatherDetailView.vue'),
  },
  {
    /* [요구사항 1] Catch-all Route.
       pathMatch 는 잡아낸 경로가 담기는 파라미터 이름이고,
       (.*) 는 아무 문자열이나, 끝의 * 는 / 로 나뉜 여러 조각도 함께 받겠다는 뜻입니다.
       * 를 빼면 /aaa 는 잡아도 /aaa/bbb 는 못 잡습니다. */
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue'),
  },
]

const router = createRouter({
  /* createWebHistory — 주소에 # 없이 /about 처럼 보이는 방식(History API).
     실제 서버에 올릴 때는 어느 주소로 들어와도 index.html 을 내주도록
     설정해야 새로고침에서 서버 404 가 나지 않습니다. */
  history: createWebHistory(),
  routes,
})

export default router

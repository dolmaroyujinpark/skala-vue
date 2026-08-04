<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import PixelIcon from '@/components/mine/icons/PixelIcon.vue'
import UnitToggler from '@/components/mine/weather/UnitToggler.vue'

/* ════════════════════════════════════════════════════════════
   [3일차 과제] App.vue — 앱 셸 (요구사항 2)
   2일차 원본: App.vue.assign (WeatherParent 하나만 렌더링하던 시절)

   ── 무엇이 여기로 올라왔나 ────────────────────────────────
   2일차의 WeatherParent.vue 는 "앱 껍데기"와 "대시보드 화면"이 한 덩어리였습니다.
   라우터가 붙으면서 둘의 수명이 갈라졌습니다.

     화면이 바뀌어도 그대로인 것  → 여기(App.vue)
       · 스플래시 (앱을 켤 때 딱 한 번)
       · .wx 테마 래퍼 (다크/라이트 — 모든 페이지가 같은 색을 씁니다)
       · 앱 바 (내비게이션 · °C/°F · Dark/Light)

     주소마다 갈아끼우는 것       → <RouterView />
       · /              WeatherHomeView
       · /about         WeatherAboutView
       · /weather/:id   WeatherDetailView
       · 그 외          NotFoundView

   스플래시를 페이지가 아니라 여기 둔 이유: 페이지에 두면 /about 에 갔다가
   / 로 돌아올 때마다 스플래시가 다시 뜹니다. 앱을 켤 때 한 번 보여 주는
   화면이므로 라우팅과 함께 사라지면 안 되는 자리에 있어야 합니다.

   ── 요구사항 2 ────────────────────────────────────────────
   Navigation Bar(RouterLink)와 메인 콘텐츠 영역(RouterView)을 배치했습니다.
   내비를 앱 바 안에 넣은 것은 디자인 때문만이 아닙니다. 앱 바 밖(위)에 두면
   100vh 짜리 스플래시 위에 내비가 얹혀 첫 화면부터 스크롤이 생기고,
   .wx 바깥이라 테마 CSS 변수(--fg / --bg)도 못 받습니다.
   ════════════════════════════════════════════════════════════ */

/* ────────────────────────────────────────────────
   스플래시 — 앱을 켤 때 한 번
   ──────────────────────────────────────────────── */
const isBooting = ref(true) // 스플래시 표시 여부
const fontsReady = ref(false) // 웹폰트 준비 여부

/* 스플래시를 최소한 이만큼은 보여 줍니다. 폰트가 즉시 준비돼도 화면이
   번쩍 지나가 버리지 않게 하는 하한선입니다. */
const SPLASH_MIN_MS = 1200

/* 폰트가 아무리 늦어도 여기서 끊고 진행합니다. 네트워크가 느리다고
   대시보드를 못 보는 일이 없어야 합니다. */
const FONT_WAIT_MAX_MS = 1500

/* ────────────────────────────────────────────────
   [2일차에서 그대로] 시스템(OS) 다크 모드 연동
   matchMedia 는 "이 조건에 지금 해당하나?" 를 알려주는 브라우저 API 다.
   prefers-color-scheme 는 맥/윈도우 시스템 설정의 라이트·다크 값을 그대로 반영합니다.
   테마 색은 .wx--dark / .wx--light 두 벌로 나뉘어 있고 CSS 변수 상속을 타므로,
   이 최상위 div 의 클래스만 바꿔 주면 자식 컴포넌트 전부가 따라 뒤집힙니다.
   ── 이제 그 "자식 전부"에 RouterView 로 갈아끼워지는 페이지들도 포함됩니다.
   ──────────────────────────────────────────────── */
const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')

// 초깃값을 .matches 로 잡아 두면 첫 렌더부터 OS 설정을 따라갑니다.
const isDark = ref(darkModeQuery.matches)

const onSystemThemeChange = (event) => {
  isDark.value = event.matches
}

/* ────────────────────────────────────────────────
   [4일차 변경] 온도 단위가 이 파일을 떠났습니다.

   3일차까지는 여기서 ref('C') 로 들고 provide 했습니다.
     2일차  WeatherParent 가 소유 + provide
     3일차  앱 바가 올라오면서 App.vue 가 소유 + provide
     4일차  stores/configStore.js 로 이사 — App.vue 는 이제 관여하지 않음

   provide 를 걷어낸 자리를 store 가 대신합니다. 값이 필요한 컴포넌트는
   조상을 거치지 않고 useConfigStore() 로 직접 집어 옵니다.
   그래서 이 파일에는 단위에 대한 코드가 한 줄도 남지 않았습니다 —
   앱 바에 <UnitToggler /> 를 놓아 준 것이 전부입니다.

   테마(isDark)는 왜 안 옮겼나 — 과제 범위가 아니기도 하고, 이 값은
   App.vue 의 :class 하나만 쓰는 "이 파일의 상태"라 밖으로 뺄 이유가
   없습니다. 여러 화면이 공유하는 값만 store 로 갑니다.
   ──────────────────────────────────────────────── */

/* ────────────────────────────────────────────────
   부팅 — 폰트가 준비되면 스플래시를 걷습니다
   ──────────────────────────────────────────────── */
onMounted(() => {
  // 브라우저 이벤트 구독은 화면이 실제로 붙은 뒤(onMounted)에 거는 것이 원칙입니다.
  darkModeQuery.addEventListener('change', onSystemThemeChange)

  const startedAt = Date.now()

  /* document.fonts.ready 는 이 화면에 필요한 웹폰트 로딩이 전부 끝나면
     resolve 되는 Promise 입니다. Promise.race 로 상한선을 함께 걸어,
     둘 중 먼저 끝나는 쪽으로 진행합니다.
     (자세한 배경은 2일차 원본 WeatherParent.vue.day2 주석 참고) */
  Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise((resolve) => setTimeout(resolve, FONT_WAIT_MAX_MS))]).then(() => {
    fontsReady.value = true

    // 이미 흘려보낸 시간을 빼서, 스플래시가 통째로 1.2초 이상 유지되게 합니다.
    const remaining = Math.max(0, SPLASH_MIN_MS - (Date.now() - startedAt))

    setTimeout(() => {
      isBooting.value = false
      /* [3일차 변경] 2일차에는 여기서 nextTick 후 SearchBar 에 포커스를 줬습니다.
         이제 SearchBar 는 RouterView 안쪽(WeatherHomeView)에 있어서 여기서는
         닿지 않습니다. 대신 WeatherHomeView 가 자기 onMounted 에서 스스로
         포커스합니다 — 이 v-else 가 켜지는 순간이 곧 그 화면의 mount 시점입니다. */
    }, remaining)
  })
})

// 컴포넌트가 사라질 때 구독을 풀어 줍니다.
// 안 풀면 이 컴포넌트가 없어져도 리스너가 남아 메모리에 계속 붙어 있습니다. (메모리 누수)
onBeforeUnmount(() => {
  darkModeQuery.removeEventListener('change', onSystemThemeChange)
})
</script>

<template>
  <!-- :class 로 테마를 통째로 갈아끼웁니다. 여기서 정해진 CSS 변수가
       상속을 타고 모든 자식 컴포넌트의 scoped 스타일까지 내려갑니다.
       RouterView 로 들어오는 페이지들도 이 안에 있으므로 같은 색을 씁니다. -->
  <div class="wx" :class="isDark ? 'wx--dark' : 'wx--light'">
    <!-- ══════════ SPLASH ══════════ -->
    <!-- 폰트가 준비되기 전에는 글자를 투명하게 두었다가 페이드인합니다.
         그래야 시스템 폰트 → Ubuntu Condensed 로 바뀌면서 글자 폭이 튀는
         장면(FOUT)이 사용자에게 보이지 않습니다. -->
    <div v-if="isBooting" class="wx-splash" :class="{ 'is-ready': fontsReady }">
      <h1 class="wx-splash-title">Weather</h1>
      <p class="wx-splash-sub">Dora's weather dashboard</p>
    </div>

    <!-- ══════════ APP SHELL ══════════ -->
    <div v-else class="wx-shell">
      <!-- ── 앱 바 ── -->
      <header class="wx-appbar">
        <!-- [요구사항 2] 브랜드도 홈으로 가는 링크입니다.
             로고를 누르면 첫 화면으로 — 웹에서 사용자가 기대하는 동작입니다. -->
        <RouterLink to="/" class="wx-brand">
          <PixelIcon name="sun" :size="22" />
          Weather
        </RouterLink>

        <!-- [요구사항 2] Navigation Bar —
             RouterLink 는 <a> 로 렌더링되지만 클릭을 가로채서 페이지를 새로
             내려받지 않고 주소만 바꿉니다. 그래서 위 테마·단위 상태가
             화면을 옮겨도 초기화되지 않습니다. (<a href> 였다면 전부 날아갑니다)

             현재 주소와 일치하는 링크에는 Vue Router 가 router-link-active /
             router-link-exact-active 클래스를 자동으로 붙여 줍니다.
             아래 CSS 는 그 클래스를 잡아서 지금 있는 위치를 표시합니다. -->
        <!-- 라벨은 영문 — 히어로의 캡션(Current Location · Hourly Forecast)과
             아래 설정줄이 전부 영문이라 맞췄습니다.
             aria-label 은 한글로 남깁니다. 화면에 안 보이고 스크린 리더가
             읽어 주는 설명이라, 사용자 언어로 적는 편이 낫습니다. -->
        <nav class="wx-nav" aria-label="주요 메뉴">
          <RouterLink to="/" class="wx-nav-item">Dashboard</RouterLink>
          <RouterLink to="/about" class="wx-nav-item">About</RouterLink>
        </nav>
      </header>

      <!-- ══════════ [요구사항 2] 메인 콘텐츠 영역 ══════════ -->
      <!-- 주소에 따라 여기만 갈아끼워집니다. 위 앱 바와 아래 테마는 그대로 남습니다.

           v-slot 으로 풀어 쓰면 <KeepAlive> 로 감싸 화면 상태(검색어·선택한 도시)를
           살려 둘 수 있습니다. 다만 지금은 대시보드가 마운트될 때 검색창에
           포커스를 주고 있어서, KeepAlive 를 켜면 돌아왔을 때 onMounted 가
           다시 돌지 않아 그 동작이 사라집니다. 라우터의 기본 동작을 먼저
           눈으로 확인하는 게 이번 과제의 목적이라 켜지 않았습니다. -->
      <main class="wx-main">
        <RouterView />
      </main>

      <!-- ══════════ 설정줄 ══════════ -->
      <!-- [4일차] 단위·테마 토글이 앱 바에서 여기로 내려왔습니다.

           앱 바에 두었을 때는 로고 · 내비 · 알약 두 덩어리가 한 줄에 몰려
           머리가 무거웠습니다. 지금은 위가 "어디로 갈지"(내비)만, 아래가
           "어떻게 볼지"(설정)만 맡습니다.

           셸 안이되 RouterView 밖이라 모든 페이지에 그대로 남습니다.
           상세 페이지에서도 단위를 바꿀 수 있고, 화면을 옮겨도 설정이
           초기화되지 않습니다. (값 자체는 store 와 App.vue 가 들고 있습니다) -->
      <footer class="wx-settings">
        <!-- [4일차 요구사항 2] UnitToggler 배치.
             App.vue 가 이 컴포넌트에 아무것도 넘겨주지 않습니다 —
             값도 핸들러도 store 에서 직접 가져다 씁니다. -->
        <div class="wx-setting">
          <span class="wx-label wx-setting-label">Unit</span>
          <UnitToggler />
        </div>

        <!-- 테마 전환 — 이쪽은 App.vue 가 계속 소유합니다 -->
        <div class="wx-setting">
          <span class="wx-label wx-setting-label">Theme</span>
          <div class="wx-segment" role="group" aria-label="테마">
            <button class="wx-segment-btn" :class="{ 'is-on': isDark }" @click="isDark = true">Dark</button>
            <button class="wx-segment-btn" :class="{ 'is-on': !isDark }" @click="isDark = false">Light</button>
          </div>
        </div>
      </footer>
    </div>
  </div>
</template>

<style>
/* 전역으로 남겨야만 하는 것들 — 폰트 · body 리셋 · 테마 토큰 · 공용 유틸.
   최상위 컴포넌트가 한 번만 불러옵니다. (자세한 이유는 파일 안 주석 참고)
   [3일차] 이 import 가 WeatherParent 에서 App.vue 로 따라 올라왔습니다.
   .wx 래퍼가 여기 있으므로 테마 토큰도 여기서 불러오는 것이 맞습니다. */
@import '@/assets/weather-base.css';
</style>

<style scoped>
/* ════════════════════════════════════════════════════════════
   앱 셸이 책임지는 디자인만 남깁니다.
     · 스플래시 · 셸 · 앱 바 · 내비게이션
   그리드 / 카드 / 예보 / 상태바 는 WeatherHomeView 로 함께 옮겼습니다.
   ════════════════════════════════════════════════════════════ */

/* ── [1] 스플래시 ─────────────────────────────────────────── */
/* 원본 Splash 는 가운데 'Weather' 한 줄 + 화면 맨 아래 부제가 전부입니다.
   원본이 375px 폰 기준이라 제목을 30px 로 고정하면 넓은 웹에서 글자만 점처럼 떠 보입니다.
   화면 폭을 따라가되 최소/최대를 묶어서, 폰에서는 원본 비율 그대로 두고
   웹에서만 커지게 합니다. */
.wx-splash {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  min-height: 100dvh;
  padding: 0 24px;
  box-sizing: border-box;
  animation: wx-in 0.6s ease;
}

/* 폰트 교체(FOUT) 감추기 —
   글자는 처음에 투명하고, fontsReady 가 켜지면 is-ready 가 붙어 나타납니다.
   자리(높이·정렬)는 그대로 차지하므로 레이아웃이 밀리지 않습니다. */
.wx-splash-title,
.wx-splash-sub {
  opacity: 0;
  transition: opacity 0.4s ease;
}

.wx-splash.is-ready .wx-splash-title,
.wx-splash.is-ready .wx-splash-sub {
  opacity: 1;
}

.wx-splash-title {
  margin: 0;
  font-size: clamp(32px, 5.5vw, 64px);
  font-weight: 400;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.wx-splash-sub {
  position: absolute;
  bottom: clamp(28px, 5vh, 48px);
  left: 0;
  right: 0;
  margin: 0;
  color: var(--dimmer);
  font-size: clamp(12px, 1vw, 14px);
  letter-spacing: 0.04em;
  text-align: center;
}

/* ── [2] 셸 ──────────────────────────────────────────────── */
.wx-shell {
  box-sizing: border-box;
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 26px 24px 40px;
  animation: wx-in 0.45s ease;
}

/* ── [3] 앱 바 ────────────────────────────────────────────── */
/* [4일차 변경] 설정 알약들이 아래 설정줄로 내려가면서 앱 바에는
   로고와 내비만 남았습니다. 셋을 벌리던 space-between 을 그대로 두면
   로고와 내비가 양 끝으로 찢어지므로, 내비를 로고 오른쪽에 붙입니다. */
.wx-appbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 28px;
  margin-bottom: 18px;
  padding: 0 4px;
}

/* [3일차 변경] <p> 였던 브랜드가 RouterLink(=<a>)가 됐습니다.
   기본 밑줄과 파란 링크색을 걷어내고 2일차와 같은 모습으로 되돌립니다. */
.wx-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  color: inherit;
  font-size: 20px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  text-decoration: none;
}

/* ── [4] 내비게이션 ───────────────────────────────────────── */
/* 알약이 없어져 좌우 패딩이 사라진 만큼 항목 사이를 벌려 줍니다.
   4px 이면 두 단어가 한 덩어리로 붙어 읽힙니다. */
.wx-nav {
  display: flex;
  align-items: center;
  gap: 20px;
}

/* 세그먼트 버튼(°C/°F)처럼 알약을 꽉 채우는 방식도 써 봤지만, 내비에는
   너무 무거웠습니다. 세그먼트는 "둘 중 지금 이것" 을 고르는 스위치라 채워도
   되지만, 내비는 늘 떠 있는 안내판이라 검은 덩어리가 앱 바를 눌러 버립니다.

   그래서 글씨색과 얇은 밑줄로만 구분합니다. 이 앱이 패널을 그림자 없이
   1px 헤어라인으로만 나누는 것과 같은 규칙입니다.

   밑줄을 border-bottom 이 아니라 투명한 테두리로 미리 깔아 둔 이유 —
   활성일 때만 테두리를 주면 그 순간 요소 높이가 1px 늘어나 글자가 위로
   튑니다. 자리를 미리 잡아 두고 색만 바꾸면 움직이지 않습니다. */
.wx-nav-item {
  padding: 6px 4px;
  color: var(--dim);
  font-size: 13px;
  letter-spacing: 0.06em;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: 0.2s;
}

.wx-nav-item:hover {
  color: var(--fg);
}

/* 지금 보고 있는 화면을 표시합니다.
   ⚠️ router-link-active 가 아니라 exact-active 를 잡은 이유:
   active 는 "이 링크의 경로로 시작하는 주소"에 전부 붙습니다.
   그러면 to="/" 링크가 /about 에서도, /weather/city_01 에서도 켜집니다.
   (모든 경로가 / 로 시작하므로) exact-active 는 주소가 정확히 같을 때만
   붙으므로 Dashboard 는 / 에서만 켜집니다. */
.wx-nav-item.router-link-exact-active {
  color: var(--fg);
  border-bottom-color: var(--fg);
}

/* 상세 페이지(/weather/:id)는 내비에 항목이 없습니다. 그 화면에서는
   어느 것도 켜지지 않는 게 맞습니다 — 목록도 소개도 아니니까요.
   대신 상세 페이지 안에 "목록으로" 버튼이 있습니다. */

/* ── [5] 설정줄 ───────────────────────────────────────────── */
/* [4일차 추가] 페이지 내용 아래, 셸 맨 끝.

   위쪽 헤어라인 하나로만 본문과 나눕니다. 패널(BaseDashboardCard)로
   감싸면 대시보드의 상자들과 같은 무게가 되어 "설정이 하나 더 있는 구획"처럼
   보입니다. 여기는 본문이 아니라 여백에 가까운 자리라 선 하나면 충분합니다. */
.wx-settings {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 14px 24px;
  margin-top: 28px;
  padding: 20px 4px 0;
  border-top: 1px solid var(--line);
}

/* 캡션 + 컨트롤 한 쌍 */
.wx-setting {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* .wx-label 은 원래 제목 위에 놓이는 캡션이라 아래 여백 14px 을 갖고
   있습니다. 여기서는 컨트롤과 가로로 나란히 서므로 그 여백을 지웁니다. */
.wx-setting-label {
  margin: 0;
}

/* [4일차] .wx-segment / .wx-segment-btn 은 weather-base.css 로 옮겼습니다.
   단위 토글이 UnitToggler.vue 로 떨어져 나가면서 쓰는 컴포넌트가 둘이 됐고,
   scoped 스타일은 다른 파일까지 닿지 않기 때문입니다.
   여기 남은 테마 토글도 그 공용 클래스를 그대로 씁니다. */

/* ── [6] 좁은 화면 보정 ───────────────────────────────────── */
@media (max-width: 560px) {
  .wx-shell {
    padding: 18px 16px 32px;
  }

  .wx-brand {
    font-size: 17px;
  }

  /* 폰 폭에서는 브랜드와 내비가 한 줄에 안 들어갑니다.
     내비를 한 줄 통째로 내려서 좌우로 펼칩니다. */
  .wx-nav {
    order: 3;
    flex: 1 0 100%;
    justify-content: center;
  }

  .wx-nav-item {
    flex: 1;
    text-align: center;
  }

  /* [4일차] 설정줄도 폰에서는 두 줄로 쌓습니다.
     한 줄에 밀어 넣으면 알약이 찌그러지고 캡션이 잘립니다.
     각 쌍 안에서는 캡션과 컨트롤을 양 끝으로 밀어, 세로로 쌓여도
     컨트롤의 오른쪽 끝이 나란히 맞습니다. */
  .wx-settings {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .wx-setting {
    justify-content: space-between;
  }
}
</style>

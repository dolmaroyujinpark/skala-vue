<script setup>
/* ⚠️ 2일차 과제 원본입니다. 지금은 아무 곳에서도 import 하지 않습니다.
      3일차에 Vue Router 를 붙이면서, 이 파일이 하던 두 가지 일이
      각각 다른 파일로 갈라졌습니다.

        앱 껍데기(스플래시 · 테마 · 앱 바 · 단위 토글)  →  App.vue
        대시보드 화면(히어로 · 예보 · 검색 · 카드)      →  views/WeatherHomeView.vue

      대체되었지만 지우지 않은 이유 — 과제가 "WeatherParent 를 대체하라"
      였기 때문에, 무엇이 무엇으로 대체되었는지 나란히 볼 수 있어야
      한다고 판단했습니다. 실행에는 관여하지 않으며, import 되지 않으므로
      빌드 산출물에도 포함되지 않습니다. */
import { ref, computed, watch, watchEffect, provide, readonly, nextTick, onMounted, onBeforeUnmount } from 'vue'

// 컴포넌트 파일을 가져올 때는 파스칼 케이스(PascalCase)
import BaseDashboardCard from './BaseDashboardCard.vue'
import SearchBar from './SearchBar.vue'
import WeatherCard from './WeatherCard.vue'
import WeatherHero from './WeatherHero.vue'
import ForecastStrip from './ForecastStrip.vue'
import PixelIcon from '@/components/mine/icons/PixelIcon.vue'

/* ════════════════════════════════════════════════════════════
   [종합과제 2일차] 날씨 Mockup — 컴포넌트 분리판
   원본: components/mine/MyWeatherMockup.vue (분리 전, 한 파일짜리 결과물)

   [과제 요구사항 1] WeatherParent.vue — 모든 반응형 데이터를 여기서 유지합니다.
   기능은 한 줄도 바꾸지 않고 파일만 쪼갰습니다.

   ── 분리 결과 ──────────────────────────────────────────────
     WeatherParent.vue      상태 · computed · watch · 이벤트 핸들러 (이 파일)
     BaseDashboardCard.vue  [요구사항 2] 패널 디자인 공통화 + slot
     SearchBar.vue          [요구사항 3] props: currentQuery / emits: update-query
     WeatherCard.vue        [요구사항 4] props: cityItem / emits: select-card · click-detail
     WeatherHero.vue        (추가) 선택된 도시 히어로 — 표시 전용
     ForecastStrip.vue      (추가) 예보 스트립 — Scoped Slot 실습

   ── 데이터 흐름 ────────────────────────────────────────────
     🔽 Props   부모 → 자식 : searchQuery, cityItem, 환산된 온도 …
     🔼 Emits   자식 → 부모 : update-query, select-card, click-detail, remove-card
     ↘  Provide 조상 → 후손 : tempUnit (Props Drilling 회피)

   상태를 바꾸는 코드는 전부 이 파일 안에만 있습니다. 자식은 "무슨 일이 있었는지"만
   보고하고, 실제로 값을 고치는 건 언제나 부모입니다. 그래서 버그가 나면
   찾아야 할 파일이 하나로 정해집니다.
   ════════════════════════════════════════════════════════════ */

/* ────────────────────────────────────────────────
   [1일차 요구사항 1] 배열 렌더링용 날씨 데이터
   [2일차 요구사항 1] 이 배열이 곧 반응형 상태(weatherList) 다.
   id · name · temp · status 는 과제 스펙 그대로.
   웹 화면을 채우려고 icon / high / low / 예보를 덧붙였습니다.
   ──────────────────────────────────────────────── */
const weatherList = ref([
  {
    id: 'city_01',
    name: '서울',
    temp: 28,
    status: '맑음',
    icon: 'sun',
    high: 31,
    low: 22,
    sunrise: '05:32',
    sunset: '19:48',
    hourly: [
      { id: 'h1', time: '10:00', icon: 'sun', temp: 28 },
      { id: 'h2', time: '11:00', icon: 'sun', temp: 29 },
      { id: 'h3', time: '12:00', icon: 'partly', temp: 30 },
      { id: 'h4', time: '13:00', icon: 'cloud', temp: 31 },
      { id: 'h5', time: '14:00', icon: 'cloud', temp: 30 },
      { id: 'h6', time: '15:00', icon: 'night', temp: 29 },
    ],
    daily: [
      { id: 'd1', date: 'JUL 31', icon: 'sun', high: 31, low: 22 },
      { id: 'd2', date: 'AUG 01', icon: 'sun', high: 32, low: 23 },
      { id: 'd3', date: 'AUG 02', icon: 'partly', high: 29, low: 22 },
      { id: 'd4', date: 'AUG 03', icon: 'rain', high: 26, low: 21 },
      { id: 'd5', date: 'AUG 04', icon: 'rain', high: 25, low: 20 },
      { id: 'd6', date: 'AUG 05', icon: 'sun', high: 30, low: 21 },
    ],
  },
  {
    id: 'city_02',
    name: '수원',
    temp: 24,
    status: '비',
    icon: 'rain',
    high: 26,
    low: 19,
    sunrise: '05:34',
    sunset: '19:47',
    hourly: [
      { id: 'h1', time: '10:00', icon: 'rain', temp: 24 },
      { id: 'h2', time: '11:00', icon: 'rain', temp: 24 },
      { id: 'h3', time: '12:00', icon: 'rain', temp: 25 },
      { id: 'h4', time: '13:00', icon: 'cloud', temp: 26 },
      { id: 'h5', time: '14:00', icon: 'cloud', temp: 25 },
      { id: 'h6', time: '15:00', icon: 'night', temp: 24 },
    ],
    daily: [
      { id: 'd1', date: 'JUL 31', icon: 'rain', high: 26, low: 19 },
      { id: 'd2', date: 'AUG 01', icon: 'rain', high: 25, low: 19 },
      { id: 'd3', date: 'AUG 02', icon: 'cloud', high: 27, low: 20 },
      { id: 'd4', date: 'AUG 03', icon: 'cloud', high: 28, low: 21 },
      { id: 'd5', date: 'AUG 04', icon: 'partly', high: 29, low: 21 },
      { id: 'd6', date: 'AUG 05', icon: 'sun', high: 30, low: 22 },
    ],
  },
  {
    id: 'city_03',
    name: '부산',
    temp: 26,
    status: '구름',
    icon: 'cloud',
    high: 28,
    low: 23,
    sunrise: '05:21',
    sunset: '19:38',
    hourly: [
      { id: 'h1', time: '10:00', icon: 'cloud', temp: 26 },
      { id: 'h2', time: '11:00', icon: 'cloud', temp: 27 },
      { id: 'h3', time: '12:00', icon: 'partly', temp: 28 },
      { id: 'h4', time: '13:00', icon: 'sun', temp: 28 },
      { id: 'h5', time: '14:00', icon: 'cloud', temp: 27 },
      { id: 'h6', time: '15:00', icon: 'night', temp: 26 },
    ],
    daily: [
      { id: 'd1', date: 'JUL 31', icon: 'cloud', high: 28, low: 23 },
      { id: 'd2', date: 'AUG 01', icon: 'sun', high: 30, low: 24 },
      { id: 'd3', date: 'AUG 02', icon: 'sun', high: 31, low: 24 },
      { id: 'd4', date: 'AUG 03', icon: 'partly', high: 29, low: 23 },
      { id: 'd5', date: 'AUG 04', icon: 'rain', high: 27, low: 22 },
      { id: 'd6', date: 'AUG 05', icon: 'cloud', high: 28, low: 23 },
    ],
  },
  {
    id: 'city_04',
    name: '판교',
    temp: 29,
    status: '맑음',
    icon: 'sun',
    high: 32,
    low: 23,
    sunrise: '05:33',
    sunset: '19:47',
    hourly: [
      { id: 'h1', time: '10:00', icon: 'sun', temp: 29 },
      { id: 'h2', time: '11:00', icon: 'sun', temp: 30 },
      { id: 'h3', time: '12:00', icon: 'sun', temp: 31 },
      { id: 'h4', time: '13:00', icon: 'partly', temp: 32 },
      { id: 'h5', time: '14:00', icon: 'cloud', temp: 31 },
      { id: 'h6', time: '15:00', icon: 'night', temp: 29 },
    ],
    daily: [
      { id: 'd1', date: 'JUL 31', icon: 'sun', high: 32, low: 23 },
      { id: 'd2', date: 'AUG 01', icon: 'sun', high: 33, low: 24 },
      { id: 'd3', date: 'AUG 02', icon: 'partly', high: 30, low: 23 },
      { id: 'd4', date: 'AUG 03', icon: 'rain', high: 27, low: 22 },
      { id: 'd5', date: 'AUG 04', icon: 'cloud', high: 28, low: 22 },
      { id: 'd6', date: 'AUG 05', icon: 'sun', high: 31, low: 23 },
    ],
  },
  {
    id: 'city_05',
    name: '강릉',
    temp: 30,
    status: '맑음',
    icon: 'sun',
    high: 33,
    low: 24,
    sunrise: '05:27',
    sunset: '19:44',
    hourly: [
      { id: 'h1', time: '10:00', icon: 'sun', temp: 30 },
      { id: 'h2', time: '11:00', icon: 'sun', temp: 31 },
      { id: 'h3', time: '12:00', icon: 'sun', temp: 33 },
      { id: 'h4', time: '13:00', icon: 'sun', temp: 33 },
      { id: 'h5', time: '14:00', icon: 'partly', temp: 32 },
      { id: 'h6', time: '15:00', icon: 'night', temp: 30 },
    ],
    daily: [
      { id: 'd1', date: 'JUL 31', icon: 'sun', high: 33, low: 24 },
      { id: 'd2', date: 'AUG 01', icon: 'sun', high: 34, low: 25 },
      { id: 'd3', date: 'AUG 02', icon: 'sun', high: 33, low: 25 },
      { id: 'd4', date: 'AUG 03', icon: 'partly', high: 31, low: 24 },
      { id: 'd5', date: 'AUG 04', icon: 'cloud', high: 29, low: 23 },
      { id: 'd6', date: 'AUG 05', icon: 'sun', high: 32, low: 24 },
    ],
  },
  {
    id: 'city_06',
    name: '거제',
    temp: 27,
    status: '구름',
    icon: 'cloud',
    high: 29,
    low: 24,
    sunrise: '05:24',
    sunset: '19:39',
    hourly: [
      { id: 'h1', time: '10:00', icon: 'cloud', temp: 27 },
      { id: 'h2', time: '11:00', icon: 'cloud', temp: 28 },
      { id: 'h3', time: '12:00', icon: 'partly', temp: 29 },
      { id: 'h4', time: '13:00', icon: 'partly', temp: 29 },
      { id: 'h5', time: '14:00', icon: 'cloud', temp: 28 },
      { id: 'h6', time: '15:00', icon: 'night', temp: 27 },
    ],
    daily: [
      { id: 'd1', date: 'JUL 31', icon: 'cloud', high: 29, low: 24 },
      { id: 'd2', date: 'AUG 01', icon: 'partly', high: 30, low: 24 },
      { id: 'd3', date: 'AUG 02', icon: 'sun', high: 31, low: 25 },
      { id: 'd4', date: 'AUG 03', icon: 'rain', high: 28, low: 24 },
      { id: 'd5', date: 'AUG 04', icon: 'rain', high: 27, low: 23 },
      { id: 'd6', date: 'AUG 05', icon: 'cloud', high: 29, low: 24 },
    ],
  },
  {
    id: 'city_07',
    name: '제주',
    temp: 25,
    status: '비',
    icon: 'rain',
    high: 27,
    low: 23,
    sunrise: '05:35',
    sunset: '19:44',
    hourly: [
      { id: 'h1', time: '10:00', icon: 'rain', temp: 25 },
      { id: 'h2', time: '11:00', icon: 'rain', temp: 25 },
      { id: 'h3', time: '12:00', icon: 'rain', temp: 26 },
      { id: 'h4', time: '13:00', icon: 'cloud', temp: 27 },
      { id: 'h5', time: '14:00', icon: 'cloud', temp: 26 },
      { id: 'h6', time: '15:00', icon: 'night', temp: 25 },
    ],
    daily: [
      { id: 'd1', date: 'JUL 31', icon: 'rain', high: 27, low: 23 },
      { id: 'd2', date: 'AUG 01', icon: 'rain', high: 26, low: 23 },
      { id: 'd3', date: 'AUG 02', icon: 'cloud', high: 28, low: 24 },
      { id: 'd4', date: 'AUG 03', icon: 'partly', high: 29, low: 24 },
      { id: 'd5', date: 'AUG 04', icon: 'sun', high: 30, low: 25 },
      { id: 'd6', date: 'AUG 05', icon: 'sun', high: 30, low: 25 },
    ],
  },
])

/* ────────────────────────────────────────────────
   [2일차 요구사항 1] 반응형 상태 관리
   [2일차 컴포넌트 요구사항 1] 분리 후에도 반응형 데이터는 전부 부모가 들고 있습니다.
   ──────────────────────────────────────────────── */
const isBooting = ref(true) // 스플래시 표시 여부
const selectedId = ref('city_01') // 히어로에 띄울 도시

// [2일차 추가] 시스템(OS) 다크 모드 연동
// matchMedia 는 "이 조건에 지금 해당하나?" 를 알려주는 브라우저 API 다.
// prefers-color-scheme 는 맥/윈도우 시스템 설정의 라이트·다크 값을 그대로 반영합니다.
// 테마 색은 .wx--dark / .wx--light 두 벌로 나뉘어 있고 CSS 변수 상속을 타므로,
// 이 최상위 div 의 클래스만 바꿔 주면 자식 컴포넌트 전부가 따라 뒤집힙니다.
const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')

// 다크 / 라이트 테마 — 초깃값을 .matches 로 잡아 두면 첫 렌더부터 OS 설정을 따라갑니다.
const isDark = ref(darkModeQuery.matches)

// 앱이 켜져 있는 동안 사용자가 OS 설정을 바꾸면 change 이벤트가 날아옵니다.
const onSystemThemeChange = (event) => {
  isDark.value = event.matches
}

// [2일차 요구사항 1] 검색어
// [2일차 컴포넌트 요구사항 3] 이 값이 SearchBar 로 내려가고(props), 타이핑은 emit 으로 되돌아옵니다.
const searchQuery = ref('')

// [2일차 요구사항 1] 선택된 도시 안내 문구
// [2일차 컴포넌트 요구사항 4] WeatherCard 의 select-card 이벤트가 이 값을 바꿉니다.
const selectedCityInfo = ref('Select a city card to begin.')

// [2일차 추가] 직접 선언한 반응형 변수 — 온도 단위 (섭씨 / 화씨)
const tempUnit = ref('C')

// [2일차 직접 추가] 반응형 변수 — 옷차림 추천 패널을 켤지 끌지
// 이 값 하나로 화면에서 패널이 사라졌습니다 나타났습니다 합니다.
// 템플릿에서는 v-if 가 아니라 v-show 로 묶었습니다. 사용자가 버튼을 누를 때마다
// 자주 켜고 끄는 자리라, DOM 을 지웠습니다 다시 만드는 v-if 보다
// display 만 바꾸는 v-show 가 쌉니다.
const showOutfit = ref(true)

/* ────────────────────────────────────────────────
   [2일차 추가] 정렬 기준
   'name' 이름 가나다순 / 'temp' 기온 높은순 / 'favorite' 즐겨찾기 먼저
   문자열 하나만 바꾸면 아래 sortedWeatherList 가 알아서 다시 정렬됩니다.
   ──────────────────────────────────────────────── */
const sortBy = ref('name')

/* ────────────────────────────────────────────────
   [2일차 추가] 즐겨찾기 도시 id 목록
   새로고침해도 남아야 하는 값이라 localStorage 에서 초깃값을 읽어 옵니다.
   JSON.parse 는 저장된 문자열이 깨져 있으면 예외를 던지므로 try 로 감쌌습니다.
   (사용자가 개발자도구로 값을 건드렸을 때 앱 전체가 죽는 걸 막습니다)
   ──────────────────────────────────────────────── */
const FAVORITE_STORAGE_KEY = 'wx-favorite-cities'

const loadFavorites = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(FAVORITE_STORAGE_KEY))
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

const favoriteIds = ref(loadFavorites())

// 이 도시가 즐겨찾기인지. computed 가 아니라 함수인 이유:
// computed 는 인자를 못 받습니다. "도시별"로 달라지는 값은 함수로 두는 게 맞습니다.
const isFavorite = (cityId) => favoriteIds.value.includes(cityId)

// 더움 / 선선함을 가르는 기준 온도 (과제 스펙: 25도)
const HOT_TEMP = 25

/* ────────────────────────────────────────────────
   [2일차 지시 외 추가] Provide / Inject
   tempUnit 은 히어로와 카드가 "°C / °F" 글자 하나 찍으려고 씁니다.
   이걸 props 로 내리면 WeatherParent → WeatherCard 로 쓰지도 않을 통로를
   하나 더 뚫는 셈이라(Props Drilling), 조상이 심어 두고 후손이 직접 꺼내 쓰게 했습니다.
   readonly() 로 감싸서 후손이 실수로 값을 바꾸지 못하게 막습니다.
   — 단위를 바꾸는 유일한 통로는 아래 toggleUnit() 하나뿐입니다.
   ──────────────────────────────────────────────── */
provide('tempUnit', readonly(tempUnit))

// SearchBar 가 defineExpose 로 열어 준 메서드를 잡기 위한 템플릿 ref
const searchBar = ref(null)

/* ────────────────────────────────────────────────
   [2일차 추가] 웹폰트 준비 여부

   증상: 스플래시의 'Weather' 글자가 처음 뜰 때 좌우로 흔들려 보였습니다.

   원인: @fontsource 가 넣어 주는 @font-face 는 font-display: swap 입니다.
   글자가 먼저 시스템 기본 폰트로 그려졌다가, Ubuntu Condensed(29KB)가
   도착하면 그 폭 좁은 서체로 교체됩니다. 스플래시 제목은 가운데 정렬이라
   글자 폭이 바뀌는 순간 좌우로 튀고, 마침 wx-in 페이드인 애니메이션도
   같이 돌고 있어서 "흔들린다"로 보였습니다.

   해결: document.fonts.ready 로 폰트 로딩이 끝날 때까지 기다렸다가
   제목을 페이드인합니다. 교체 장면 자체를 사용자에게 보여주지 않는 방식입니다.
   ──────────────────────────────────────────────── */
const fontsReady = ref(false)

// 스플래시를 최소한 이만큼은 보여 줍니다. 폰트가 즉시 준비돼도 화면이
// 번쩍 지나가 버리지 않게 하는 하한선입니다.
const SPLASH_MIN_MS = 1200

// 폰트가 아무리 늦어도 여기서 끊고 진행합니다. 네트워크가 느리다고
// 대시보드를 못 보는 일이 없어야 합니다.
const FONT_WAIT_MAX_MS = 1500

onMounted(() => {
  // 브라우저 이벤트 구독은 화면이 실제로 붙은 뒤(onMounted)에 거는 것이 원칙입니다.
  darkModeQuery.addEventListener('change', onSystemThemeChange)

  const startedAt = Date.now()

  // document.fonts.ready 는 이 화면에 필요한 웹폰트 로딩이 전부 끝나면
  // resolve 되는 Promise 입니다. Promise.race 로 상한선을 함께 걸어,
  // 둘 중 먼저 끝나는 쪽으로 진행합니다.
  Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise((resolve) => setTimeout(resolve, FONT_WAIT_MAX_MS))]).then(() => {
    // 이 시점부터 제목이 페이드인합니다. 폰트 교체 장면은 이미 지나갔습니다.
    fontsReady.value = true

    // 이미 흘려보낸 시간을 빼서, 스플래시가 통째로 1.2초 이상 유지되게 합니다.
    const remaining = Math.max(0, SPLASH_MIN_MS - (Date.now() - startedAt))

    setTimeout(async () => {
      isBooting.value = false
      // v-else 쪽 DOM 이 실제로 붙은 다음에야 SearchBar 가 존재합니다.
      // nextTick 은 "이번 렌더가 끝날 때까지" 기다려 줍니다.
      await nextTick()
      searchBar.value?.focus()
    }, remaining)
  })
})

// 컴포넌트가 사라질 때 구독을 풀어 줍니다.
// 안 풀면 이 컴포넌트가 없어져도 리스너가 남아 메모리에 계속 붙어 있습니다. (메모리 누수)
onBeforeUnmount(() => {
  darkModeQuery.removeEventListener('change', onSystemThemeChange)
})

/* ────────────────────────────────────────────────
   [2일차 요구사항 2] computed 파생 값
   [2일차 컴포넌트 요구사항 1] 핵심 비즈니스 로직의 소유권은 부모가 그대로 쥐고 있습니다.
   ──────────────────────────────────────────────── */
// 선택된 도시. 목록에서 지워졌으면 첫 번째 도시로 되돌아갑니다.
const current = computed(() => weatherList.value.find((c) => c.id === selectedId.value) ?? weatherList.value[0])

// [2일차 요구사항 2] 검색어가 도시 이름에 포함된 것만 담아 두는 computed 배열.
// 의존하는 searchQuery / weatherList 가 바뀔 때만 다시 계산되고, 그 외에는 캐싱된 값을 재사용합니다.
const filteredWeatherList = computed(() => {
  const query = searchQuery.value.trim()
  // [2일차 요구사항 4-a] 검색어가 비어 있으면 원본 데이터를 그대로 내보냅니다.
  if (!query) return weatherList.value
  return weatherList.value.filter((c) => c.name.includes(query))
})

/* ────────────────────────────────────────────────
   [2일차 추가] tempUnit 을 기반으로 파생되는 값들
   자식은 환산된 결과만 props 로 받습니다. 자식이 각자 환산하면
   같은 계산이 카드 개수만큼 중복되고 computed 캐싱 이점도 사라집니다.
   ──────────────────────────────────────────────── */

// 섭씨 값을 현재 단위로 환산합니다. computed 안에서만 호출하는 순수 함수.
const convert = (celsius) => (tempUnit.value === 'C' ? celsius : Math.round((celsius * 9) / 5 + 32))

/* ────────────────────────────────────────────────
   [2일차 추가] 정렬 — 검색 결과 위에 한 겹 더 얹습니다.
   순서: 원본 → 검색 필터 → 정렬 → 단위 환산 → 화면
   각 단계를 computed 로 나눠 두면 한 단계만 바뀌어도 그 아래만 다시 계산됩니다.

   sort() 는 원본 배열을 뒤집어 놓는 파괴적 메서드라 그대로 쓰면
   weatherList 자체가 흐트러집니다. 그래서 [...스프레드] 로 복사본을 만들어 정렬합니다.
   ──────────────────────────────────────────────── */
const sortedWeatherList = computed(() => {
  const list = [...filteredWeatherList.value]

  if (sortBy.value === 'temp') {
    // 기온 높은 순. 같으면 이름순으로 한 번 더 갈라 순서가 들쭉날쭉하지 않게 합니다.
    return list.sort((a, b) => b.temp - a.temp || a.name.localeCompare(b.name, 'ko'))
  }

  if (sortBy.value === 'favorite') {
    // 즐겨찾기를 앞으로. Boolean 을 빼면 true(1) 가 앞서므로 b - a 순서입니다.
    return list.sort((a, b) => isFavorite(b.id) - isFavorite(a.id) || a.name.localeCompare(b.name, 'ko'))
  }

  // 기본값: 이름 가나다순. localeCompare 에 'ko' 를 줘야 한글이 사전 순으로 정렬됩니다.
  return list.sort((a, b) => a.name.localeCompare(b.name, 'ko'))
})

// 화면에 그릴 카드 목록 — 정렬된 목록 위에 단위 환산과 즐겨찾기 여부를 얹은 computed.
// computed 가 computed 를 의존해도 되고, 이때도 캐싱은 그대로 동작합니다.
const displayWeatherList = computed(() =>
  sortedWeatherList.value.map((city) => ({
    ...city,
    shownTemp: convert(city.temp),
    isFavorite: isFavorite(city.id),
  })),
)

// [2일차 추가] 즐겨찾기 개수 — 목록이 바뀔 때만 다시 셉니다.
const favoriteCount = computed(() => favoriteIds.value.length)

// [2일차 추가] 검색 결과 개수. 화면에 "7개 중 3개" 로 보여 줍니다.
const filteredCount = computed(() => filteredWeatherList.value.length)

// 히어로 영역의 큰 숫자들도 같은 방식으로 환산해 둡니다.
const currentTemp = computed(() => convert(current.value.temp))
const currentHigh = computed(() => convert(current.value.high))
const currentLow = computed(() => convert(current.value.low))

// 예보 스트립도 단위를 따라가야 화면 전체가 어긋나지 않습니다.
const currentHourly = computed(() => current.value.hourly.map((h) => ({ ...h, shownTemp: convert(h.temp) })))
const currentDaily = computed(() =>
  current.value.daily.map((d) => ({
    ...d,
    shownHigh: convert(d.high),
    shownLow: convert(d.low),
  })),
)

const today = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', weekday: 'short' }).toUpperCase()

/* ────────────────────────────────────────────────
   [2일차 요구사항 3] 반응형 변수 변화 감시
   ──────────────────────────────────────────────── */

// [2일차 요구사항 3-1] selectedCityInfo 를 watch 로 감시 — 상태바 문구가 바뀔 때마다 콘솔 로그.
// 감시 대상을 콕 집어 지정했으므로 이전 값까지 받아볼 수 있습니다.
watch(selectedCityInfo, (newInfo, oldInfo) => {
  console.log(` [watch] 상태바 문구 변경: "${oldInfo}" -> "${newInfo}"`)
})

// [2일차 요구사항 3-2] searchQuery 를 watchEffect 로 감시 — 타이핑할 때마다 콘솔 로그.
// 감시 대상을 안 적어도 콜백 안에서 읽은 searchQuery 를 자동으로 추적합니다.
// 대신 컴포넌트가 만들어질 때 최초 1회 즉시 실행되고, 이전 값(oldValue)은 주지 않습니다.
watchEffect(() => {
  console.log(`🤖 [watchEffect] 검색어 '${searchQuery.value}' 로 날씨 API 를 다시 조회합니다.`)
})

// [2일차 추가] Multi-Source Watch — tempUnit 과 selectedId 를 배열로 묶어 한 번에 감시합니다.
watch([selectedId, tempUnit], ([newId, newUnit], [oldId, oldUnit]) => {
  console.log(`🌡️ [multi watch] 도시 ${oldId} -> ${newId} / 단위 °${oldUnit} -> °${newUnit} — 조건이 바뀌어 다시 계산합니다.`)
})

// [2일차 추가] 정렬 기준이 바뀔 때 로그.
// 여기서 직접 정렬하지 않는다는 점이 중요합니다. 정렬은 sortedWeatherList(computed)가
// 알아서 다시 하고, watch 는 "바뀌었다"는 사실에 곁들이는 부수효과(로그)만 맡습니다.
const SORT_LABEL = { name: '이름순', temp: '기온 높은순', favorite: '즐겨찾기 먼저' }

watch(sortBy, (newSort, oldSort) => {
  console.log(`🔀 [watch] 정렬 기준 변경: ${SORT_LABEL[oldSort]} -> ${SORT_LABEL[newSort]}`)
})

/* [2일차 추가] 즐겨찾기 목록이 바뀔 때마다 localStorage 에 저장합니다.
   deep: true 가 필요한 이유 — favoriteIds 는 배열이라, push/splice 로 안을 고치면
   ref 가 가리키는 배열 "주소"는 그대로입니다. 얕은 감시로는 변화를 못 잡습니다.
   (아래 toggleFavorite 은 새 배열을 만들어 대입하므로 사실 deep 없이도 잡히지만,
    나중에 push 로 바꿔 쓰더라도 저장이 조용히 멈추지 않도록 켜 두었습니다) */
watch(
  favoriteIds,
  (ids) => {
    localStorage.setItem(FAVORITE_STORAGE_KEY, JSON.stringify(ids))
    console.log(`⭐ [watch] 즐겨찾기 ${ids.length}개 저장됨 →`, ids)
  },
  { deep: true },
)

/* ────────────────────────────────────────────────
   동작 — 자식이 올려보낸 이벤트를 받아 상태를 바꾸는 곳
   ──────────────────────────────────────────────── */

// 받침 유무로 조사를 골라줍니다. ("서울이" / "제주가")
// 지금 데이터는 전부 받침이 있지만, 도시가 늘어나도 문장이 어색해지지 않도록 미리 빼 두었습니다.
const withParticle = (name) => {
  const code = name.charCodeAt(name.length - 1)
  const isHangul = code >= 0xac00 && code <= 0xd7a3
  const hasFinalConsonant = isHangul && (code - 0xac00) % 28 !== 0
  return `${name}${hasFinalConsonant ? '이' : '가'}`
}

// [요구사항 4] WeatherCard 의 select-card 수신.
// 자식은 "이 도시가 눌렸다"는 사실만 알리고, 상태를 고치는 건 부모 몫입니다.
const selectCity = (city) => {
  selectedId.value = city.id
  selectedCityInfo.value = `${withParticle(city.name)} 선택되었습니다.`
}

// [요구사항 4] WeatherCard 의 click-detail 수신. payload 가 두 개인 emit 예시.
const showDetail = (cityName, status) => {
  window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
}

// :key 를 index 가 아닌 id 로 잡아야 하는 이유를 눈으로 확인하려고 넣은 삭제 버튼.
const removeCity = (city) => {
  if (weatherList.value.length === 1) {
    selectedCityInfo.value = 'At least one city must remain.'
    return
  }
  weatherList.value = weatherList.value.filter((c) => c.id !== city.id)

  // 즐겨찾기 목록에서도 같이 지웁니다.
  // 안 지우면 화면에 없는 도시의 id 가 favoriteIds 에 남아, 별이 붙은 카드는
  // 하나도 없는데 "즐겨찾기 1" 로 표시됩니다. 게다가 아래 watch 가 그 상태를
  // localStorage 에 저장해 새로고침해도 숫자가 계속 어긋납니다.
  favoriteIds.value = favoriteIds.value.filter((id) => id !== city.id)

  selectedCityInfo.value = `Removed ${city.name}.`
}

// [요구사항 3] SearchBar 의 update-query 수신.
// 자식은 props(currentQuery)를 직접 못 바꾸므로, 값을 실어 올려보내면 부모가 대신 대입합니다.
// 이것이 v-model 이 내부에서 하는 일과 정확히 같습니다.
const onUpdateQuery = (value) => {
  searchQuery.value = value
}

/* [2일차 추가] WeatherCard 의 toggle-favorite 수신.
   filter / concat 으로 매번 새 배열을 만들어 대입합니다. push/splice 로 원본을
   고치는 것보다 코드가 길지만, "이전 목록"과 "새 목록"이 다른 객체라
   watch 가 확실히 잡고 되돌리기(undo) 같은 걸 붙이기도 쉽습니다. */
const toggleFavorite = (city) => {
  favoriteIds.value = isFavorite(city.id) ? favoriteIds.value.filter((id) => id !== city.id) : [...favoriteIds.value, city.id]

  selectedCityInfo.value = isFavorite(city.id) ? `${withParticle(city.name)} 즐겨찾기에 추가되었습니다.` : `${city.name} 즐겨찾기가 해제되었습니다.`
}

// [2일차 추가] 제가 만든 반응형 변수를 바꾸는 유일한 통로.
// 값이 바뀌는 즉시 위쪽 computed 들과 multi watch, 그리고 provide 로 내려간
// 후손 컴포넌트들이 연쇄로 반응합니다.
const toggleUnit = () => {
  tempUnit.value = tempUnit.value === 'C' ? 'F' : 'C'
}
</script>

<template>
  <!-- :class 로 테마를 통째로 갈아끼웁니다. 여기서 정해진 CSS 변수가
       상속을 타고 모든 자식 컴포넌트의 scoped 스타일까지 내려갑니다. -->
  <div class="wx" :class="isDark ? 'wx--dark' : 'wx--light'">
    <!-- ══════════ SPLASH ══════════ -->
    <!-- 폰트가 준비되기 전에는 글자를 투명하게 두었다가 페이드인합니다.
         그래야 시스템 폰트 → Ubuntu Condensed 로 바뀌면서 글자 폭이 튀는
         장면(FOUT)이 사용자에게 보이지 않습니다. -->
    <div v-if="isBooting" class="wx-splash" :class="{ 'is-ready': fontsReady }">
      <h1 class="wx-splash-title">Weather</h1>
      <p class="wx-splash-sub">Dora's weather dashboard</p>
    </div>

    <!-- ══════════ DASHBOARD ══════════ -->
    <div v-else class="wx-shell">
      <!-- ── 앱 바 ── -->
      <header class="wx-appbar">
        <!-- 로고 옆 작은 닷매트릭스 — 지금 선택된 도시 날씨를 따라 바뀝니다 -->
        <p class="wx-brand">
          <PixelIcon :name="current.icon" :size="22" />
          Weather
        </p>

        <div class="wx-appbar-controls">
          <!-- [2일차 추가] 제가 만든 tempUnit 을 뒤집는 버튼 -->
          <div class="wx-segment" role="group" aria-label="Temperature unit">
            <button class="wx-segment-btn" :class="{ 'is-on': tempUnit === 'C' }" @click="toggleUnit">°C</button>
            <button class="wx-segment-btn" :class="{ 'is-on': tempUnit === 'F' }" @click="toggleUnit">°F</button>
          </div>

          <!-- 테마 전환 -->
          <div class="wx-segment" role="group" aria-label="Theme">
            <button class="wx-segment-btn" :class="{ 'is-on': isDark }" @click="isDark = true">Dark</button>
            <button class="wx-segment-btn" :class="{ 'is-on': !isDark }" @click="isDark = false">Light</button>
          </div>
        </div>
      </header>

      <div class="wx-grid">
        <!-- ══════════ 좌 : 선택된 도시 ══════════ -->
        <!-- 환산된 온도까지 부모가 계산해 내려줍니다 (Props · 하행선).
             [2일차 추가] 옷차림 패널의 on/off 상태(showOutfit)도 부모가 쥐고 내려보내고,
             히어로 안의 버튼이 눌리면 toggle-outfit 이벤트로 되돌려받아 부모가 뒤집습니다. -->
        <WeatherHero
          class="wx-grid-hero"
          :city="current"
          :temp="currentTemp"
          :high="currentHigh"
          :low="currentLow"
          :date-label="today"
          :hot-temp="HOT_TEMP"
          :show-outfit="showOutfit"
          @toggle-outfit="showOutfit = !showOutfit"
        />

        <!-- ══════════ 예보 — Scoped Slot ══════════ -->
        <!-- 껍데기(패널·스트립·칸)는 ForecastStrip 이 만들고, 칸 안에 무엇을 그릴지는
             v-slot 으로 받은 데이터를 써서 부모가 정합니다.
             덕분에 시간별과 일별이 서로 다른 마크업을 쓰면서도 컴포넌트는 하나입니다.

             [2일차 추가] 이 블록을 .wx-grid 안으로 넣은 이유입니다.
             예보는 "선택된 도시"의 정보인데, 예전에는 그리드 바깥에 있어서
             모바일(1단)에서 히어로 → 검색 → 카드 7개를 전부 지나야 나왔습니다.
             지금은 DOM 순서가 히어로 → 예보 → 검색/카드 라서, 좁은 화면에서는
             선택한 도시 정보가 위에 한 덩어리로 모입니다.
             넓은 화면(861px 이상)에서는 아래 CSS 가 자리를 직접 지정해
             예전과 똑같이 "히어로 | 검색·카드" 아래 전체 폭으로 놓입니다. -->
        <div class="wx-forecasts">
          <ForecastStrip :title="`${current.name} · Hourly Forecast`" :items="currentHourly">
            <template #default="{ item, isFirst }">
              <span class="wx-cell-key" :class="{ 'is-now': isFirst }">{{ item.time }}</span>
              <PixelIcon :name="item.icon" :size="30" />
              <span class="wx-cell-val">{{ item.shownTemp }}°</span>
            </template>
          </ForecastStrip>

          <ForecastStrip :title="`${current.name} · Daily Forecast`" :items="currentDaily">
            <template #default="{ item }">
              <span class="wx-cell-key">{{ item.date }}</span>
              <PixelIcon :name="item.icon" :size="30" />
              <span class="wx-cell-val"
                >{{ item.shownHigh }}° <i>{{ item.shownLow }}°</i></span
              >
            </template>
          </ForecastStrip>
        </div>

        <!-- ══════════ 우 : 검색 + 도시 카드 ══════════ -->
        <section class="wx-side">
          <!-- [요구사항 2] 검색박스를 BaseDashboardCard 로 감쌉니다.
               [참고] 슬롯으로 넘어가는 <SearchBar> 는 시각적으로는 BaseDashboardCard
               안에 있지만, 스크립트적으로는 이 부모 스코프에서 컴파일·평가됩니다.
               그래서 여기서 :current-query 바인딩과 @update-query 수신이 그대로 가능합니다. -->
          <BaseDashboardCard class="wx-search-panel">
            <SearchBar ref="searchBar" :current-query="searchQuery" @update-query="onUpdateQuery" />
          </BaseDashboardCard>

          <!-- [1일차 요구사항 1] v-for 로 반복 출력 · :key 에는 고유 id 를 바인딩
               [2일차 요구사항 4-a] 검색어가 비었을 때는 원본 데이터 전체가 나오고,
               [2일차 요구사항 4-b] 일치하는 데이터가 있으면 그 도시만 나옵니다.
               [2일차] 카드 한 장의 마크업은 전부 WeatherCard 안으로 옮겼습니다. -->
          <!-- [2일차 추가] 정렬 + 요약 줄.
               v-model 은 :value 와 @change 를 한 번에 묶어 주는 문법 설탕입니다.
               SearchBar 는 Props/Emits 흐름을 눈으로 보려고 일부러 풀어 썼지만,
               여기는 부모가 자기 상태를 직접 다루는 자리라 v-model 이 맞습니다. -->
          <div class="wx-toolbar">
            <p class="wx-count">
              전체 {{ weatherList.length }}개 중 <strong>{{ filteredCount }}</strong
              >개
              <span v-if="favoriteCount" class="wx-count-fav">· 즐겨찾기 {{ favoriteCount }}</span>
            </p>

            <label class="wx-sort">
              <span class="wx-sort-label">Sort</span>
              <select v-model="sortBy" class="wx-sort-select">
                <option value="name">이름순</option>
                <option value="temp">기온 높은순</option>
                <option value="favorite">즐겨찾기 먼저</option>
              </select>
            </label>
          </div>

          <div class="wx-cards">
            <WeatherCard
              v-for="city in displayWeatherList"
              :key="city.id"
              :city-item="city"
              :is-selected="city.id === selectedId"
              :is-favorite="city.isFavorite"
              :hot-temp="HOT_TEMP"
              @select-card="selectCity"
              @click-detail="showDetail"
              @remove-card="removeCity"
              @toggle-favorite="toggleFavorite"
            />
          </div>

          <!-- [2일차 요구사항 4-c] 일치하는 데이터가 없으면 없다고 안내합니다 -->
          <p v-if="displayWeatherList.length === 0" class="wx-empty">“{{ searchQuery }}” 와(과) 일치하는 도시가 없습니다.</p>
        </section>
      </div>

      <!-- [1일차 요구사항 4] 상태바 — 자식이 올려보낸 이벤트의 최종 결과가 여기 찍힙니다 -->
      <footer class="wx-statusbar">
        <PixelIcon :name="current.icon" :size="18" />
        <p>{{ selectedCityInfo }}</p>
      </footer>
    </div>
  </div>
</template>

<style>
/* 전역으로 남겨야만 하는 것들 — 폰트 · body 리셋 · 테마 토큰 · 공용 유틸.
   최상위 컴포넌트가 한 번만 불러옵니다. (자세한 이유는 파일 안 주석 참고) */
@import '@/assets/weather-base.css';
</style>

<style scoped>
/* ════════════════════════════════════════════════════════════
   [과제 요구사항 5·6] 이 컴포넌트가 책임지는 디자인만 scoped 로 남깁니다.
   패널 / 검색 / 카드 / 히어로 / 예보칸 의 스타일은 각 .vue 파일로 옮겼습니다.
   여기 남은 것은 "부모만 아는 것" 뿐입니다.
     · 스플래시 · 셸 · 2단 그리드 · 앱바 · 상태바
     · 그리고 슬롯으로 내려보낸 예보 칸 내용물 (아래 [7] 참고)
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

/* ── [2] 셸 & 그리드 ──────────────────────────────────────── */
.wx-shell {
  box-sizing: border-box;
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 26px 24px 40px;
  animation: wx-in 0.45s ease;
}

/* DOM 순서는 히어로 → 예보 → 검색/카드 입니다. 모바일에서 그대로 읽히도록
   그렇게 짜 두고, 넓은 화면에서는 아래처럼 자리를 직접 지정해 되돌립니다.
     1행 : 히어로(왼쪽 340px) | 검색·카드(오른쪽)
     2행 : 예보 (두 칸 전부 차지)
   grid-area 로 잡으면 DOM 순서와 무관하게 배치되므로,
   화면 폭에 따라 마크업을 두 벌 만들 필요가 없습니다. */
.wx-grid {
  display: grid;
  grid-template-columns: 340px minmax(0, 1fr);
  gap: 16px;
  align-items: stretch;
}

.wx-grid-hero {
  grid-column: 1;
  grid-row: 1;
}

.wx-grid > .wx-side {
  grid-column: 2;
  grid-row: 1;
}

.wx-grid > .wx-forecasts {
  grid-column: 1 / -1;
  grid-row: 2;
}

/* ── [3] 앱 바 ────────────────────────────────────────────── */
.wx-appbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
  padding: 0 4px;
}

/* 단위 토글 + 테마 토글을 오른쪽에 나란히 세웁니다. 좁아지면 자연스럽게 줄바꿈. */
.wx-appbar-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

.wx-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-size: 20px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.wx-segment {
  display: flex;
  gap: 2px;
  padding: 3px;
  border: 1px solid var(--line);
  border-radius: 999px;
}

.wx-segment-btn {
  padding: 5px 15px;
  color: var(--dim);
  font: inherit;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  background: none;
  border: 0;
  border-radius: 999px;
  cursor: pointer;
  transition: 0.2s;
}

.wx-segment-btn:hover {
  color: var(--fg);
}

.wx-segment-btn.is-on {
  color: var(--bg);
  background: var(--fg);
}

/* ── [4] 우측 열 ──────────────────────────────────────────── */
.wx-side {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ── [5] 카드 격자 ────────────────────────────────────────── */
/* 카드 한 장의 생김새는 WeatherCard.vue 가 책임지고,
   "몇 열로 늘어놓을지"는 배치를 아는 부모가 정합니다.

   도시가 3개에서 7개로 늘면서 최소폭을 180px → 160px 로 줄였습니다.
   오른쪽 열은 1120 - 48(셸 패딩) - 340(히어로) - 16(그리드 gap) = 716px 이라
     180px → (716-28)/3  = 3열 → 7개면 3줄
     160px → (716-36)/4  = 4열 → 7개면 2줄 (4 + 3)
   셸 폭(max-width: 1120px)을 넓혀 4열을 만드는 방법도 있지만, 히어로가 340px
   고정이라 넓힐수록 좌우 비대칭이 커집니다. 그래서 카드를 줄이는 쪽을 택했습니다. */
/* [2일차 추가] 카드 위 정렬/요약 줄.
   패널 테두리를 두르지 않고 헤어라인도 없이 여백만으로 띄웁니다.
   여기에 또 상자를 만들면 검색 패널과 카드 사이에 상자가 세 겹이 됩니다. */
.wx-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 0 4px;
}

.wx-count {
  margin: 0;
  color: var(--dim);
  font-size: 13px;
}

.wx-count strong {
  color: var(--fg);
  font-weight: 400;
}

.wx-count-fav {
  margin-left: 4px;
}

.wx-sort {
  display: inline-flex;
  align-items: center;
  gap: 9px;
}

.wx-sort-label {
  color: var(--dim);
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

/* 브라우저 기본 select 는 OS 위젯이라 이 목업의 톤과 전혀 안 맞습니다.
   appearance:none 으로 벗겨내고 테두리만 남긴 뒤, 화살표는 배경 이미지 대신
   유니코드 ⌄ 를 그대로 씁니다 (외부 파일 없이 오프라인 동작). */
.wx-sort-select {
  padding: 6px 26px 6px 12px;
  color: var(--fg);
  font: inherit;
  font-size: 13px;
  background: var(--bg);
  background-image: linear-gradient(45deg, transparent 50%, currentColor 50%), linear-gradient(135deg, currentColor 50%, transparent 50%);
  background-position:
    right 13px top 51%,
    right 9px top 51%;
  background-size:
    4px 4px,
    4px 4px;
  background-repeat: no-repeat;
  border: 1px solid var(--line-hi);
  border-radius: 999px;
  cursor: pointer;
  appearance: none;
  transition: border-color 0.2s;
}

.wx-sort-select:hover,
.wx-sort-select:focus-visible {
  border-color: var(--fg);
  outline: none;
}

.wx-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}

/* [2일차 요구사항 4-c] 검색 결과 없음 안내. 한글 문장이라 15px. */
.wx-empty {
  margin: 0;
  padding: 26px 4px;
  color: var(--dim);
  font-size: 15px;
  text-align: center;
}

/* ── [6] 예보 배치 ────────────────────────────────────────── */
/* margin-top 을 뺐습니다. 이제 .wx-grid 안에 들어가 있어서
   위쪽 간격은 그리드의 gap(16px)이 이미 만들어 줍니다.
   그대로 두면 간격이 32px 로 두 배가 됩니다. */
.wx-forecasts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
}

/* ── [7] 예보 칸 내용물 ───────────────────────────────────── */
/* ⚠️ 이 세 규칙이 왜 ForecastStrip.vue 가 아니라 여기 있는가:
   .wx-cell-key / .wx-cell-val 은 위 템플릿의 <template #default> 안에서
   제가 직접 쓴 마크업입니다. 슬롯 콘텐츠는 자식 안에 렌더링되더라도
   "부모 스코프에서 컴파일"되므로 data-v 도장이 부모 것으로 찍힙니다.
   따라서 ForecastStrip 의 scoped 스타일로는 이 요소들에 닿을 수 없습니다. */
.wx-cell-key {
  color: var(--dim);
  font-size: 12px;
  letter-spacing: 0.08em;
  white-space: nowrap;
}

.wx-cell-key.is-now {
  color: var(--fg);
}

.wx-cell-val {
  font-size: 15px;
  white-space: nowrap;
}

/* 일별 예보의 최저기온. 최고기온과 구분은 하되 읽히긴 해야 하므로
   --dimmer(4.5:1) 를 쓰고, 기울임은 빼서 작은 숫자가 뭉개지지 않게 했습니다. */
.wx-cell-val i {
  color: var(--dimmer);
  font-style: normal;
}

/* ── [8] 상태바 ───────────────────────────────────────────── */
.wx-statusbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 16px;
  padding: 15px 20px;
  /* 상태바도 한글 문장("서울이 선택되었습니다")이 들어가는 자리라 15px. */
  font-size: 15px;
  border: 1px solid var(--line);
  border-radius: 999px;
}

.wx-statusbar p {
  margin: 0;
}

/* ── [9] 좁은 화면 보정 ───────────────────────────────────── */
/* 히어로 · 카드 · 예보 각자의 반응형 규칙은 해당 컴포넌트 파일 안에 있습니다.
   여기서는 "판 자체"가 접히는 것만 다룹니다. */
@media (max-width: 860px) {
  .wx-grid {
    grid-template-columns: 1fr;
  }

  /* 위에서 지정한 자리(1행 좌/우, 2행 전체)를 전부 풀어 줍니다.
     그래야 DOM 순서 그대로 히어로 → 예보 → 검색·카드 로 쌓입니다.
     선택한 도시의 정보(현재 날씨 · 옷차림 · 시간별/일별 예보)가 한 덩어리로
     위에 모여서, 카드 목록을 지나 스크롤하지 않아도 됩니다. */
  .wx-grid-hero,
  .wx-grid > .wx-side,
  .wx-grid > .wx-forecasts {
    grid-column: auto;
    grid-row: auto;
  }

  /* 이 폭에서 예보를 2열로 두면 한 칸이 50px 남짓이라 날짜·온도가 잘립니다 */
  .wx-forecasts {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .wx-shell {
    padding: 18px 16px 32px;
  }

  .wx-brand {
    font-size: 17px;
  }

  /* 검색 패널도 좁아지면 좌우 테두리를 걷어 원본 폰 화면처럼 되돌립니다.
     .wx-panel 은 BaseDashboardCard 가 가진 클래스라, 클래스 두 개로
     우선순위를 올려야 기본 패딩을 확실히 덮어씁니다. */
  .wx-search-panel.wx-panel {
    padding: 18px 4px;
    border-right: 0;
    border-left: 0;
    border-radius: 0;
  }

  .wx-cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .wx-forecasts {
    grid-template-columns: 1fr;
  }
}
</style>

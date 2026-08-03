<script setup>
import { ref, computed, watch, watchEffect, onMounted, onBeforeUnmount } from 'vue'
import PixelIcon from './PixelIcon.vue'
import MonoIcon from './MonoIcon.vue'

/* ════════════════════════════════════════════════════════════
   [종합과제] 날씨 Mockup — 웹 대시보드
   아이콘: Nothing Weather App Icons (Community) 닷매트릭스 SVG

   주석의 [1일차 …] / [2일차 …] 표시는 어느 날 과제에서 나온 코드인지를 뜻한다.
     · 1일차 (Vue 기본 문법)
         1 v-for + :key   2 v-if / v-else   3 검색어 양방향 바인딩   4 이벤트 처리
     · 2일차 (Composition API)
         1 반응형 상태 관리   2 computed 필터   3 watch / watchEffect   4 검색 결과 표시
     · [2일차 추가] 는 "나만의 반응형 변수를 만들어 보라"는 지시로 직접 붙인 부분
   ════════════════════════════════════════════════════════════ */

/* ────────────────────────────────────────────────
   [1일차 요구사항 1] 배열 렌더링용 날씨 데이터
   [2일차 요구사항 1] 이 배열이 곧 반응형 상태(weatherList) 다.
   id · name · temp · status 는 과제 스펙 그대로.
   웹 화면을 채우려고 icon / high / low / 예보를 덧붙였다.
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
])

/* ────────────────────────────────────────────────
   [2일차 요구사항 1] 반응형 상태 관리
   과제가 요구한 3종은 searchQuery · selectedCityInfo · 위쪽 weatherList 이고,
   나머지는 화면을 굴리려고 내가 덧붙인 상태다. (1일차와 동일한 ref 선언 방식)
   ──────────────────────────────────────────────── */
const isBooting = ref(true) // 스플래시 표시 여부
const selectedId = ref('city_01') // 히어로에 띄울 도시

// [2일차 추가] 시스템(OS) 다크 모드 연동
// matchMedia 는 "이 조건에 지금 해당하나?" 를 알려주는 브라우저 API 다.
// prefers-color-scheme 는 맥/윈도우 시스템 설정의 라이트·다크 값을 그대로 반영한다.
// CSS 는 한 줄도 건드리지 않는다. 테마 색은 이미 .wx--dark / .wx--light 두 벌로 나뉘어 있고,
// 템플릿에서 :class 로 골라 붙이므로 isDark 라는 반응형 변수 하나만 바꿔주면 화면 전체가 뒤집힌다.
const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')

// 다크 / 라이트 테마 — 초깃값을 .matches 로 잡아 두면 첫 렌더부터 OS 설정을 따라간다.
// (예전엔 ref(true) 로 다크 고정이었다.)
const isDark = ref(darkModeQuery.matches)

// 앱이 켜져 있는 동안 사용자가 OS 설정을 바꾸면 change 이벤트가 날아온다.
// event.matches 가 곧 "지금 다크인가" 이므로 그대로 옮겨 담는다.
const onSystemThemeChange = (event) => {
  isDark.value = event.matches
}

// [2일차 요구사항 1] 검색어
// [1일차 요구사항 3] 이 값이 input 과 양방향으로 묶인다.
const searchQuery = ref('')

// [2일차 요구사항 1] 선택된 도시 안내 문구
// [1일차 요구사항 4] 카드 클릭 이벤트가 이 값을 바꾸고, 하단 상태바가 그린다.
const selectedCityInfo = ref('Select a city card to begin.')

// [2일차 추가] 직접 선언한 반응형 변수 — 온도 단위 (섭씨 / 화씨)
// 이 변수 하나가 computed 와 watch 를 동시에 끌고 다니도록 설계했다.
const tempUnit = ref('C')

// 더움 / 선선함을 가르는 기준 온도 (과제 스펙: 25도)
const HOT_TEMP = 25

// 스플래시를 잠깐 보여준 뒤 대시보드로 넘어간다.
onMounted(() => {
  // 브라우저 이벤트 구독은 화면이 실제로 붙은 뒤(onMounted)에 거는 것이 원칙이다.
  darkModeQuery.addEventListener('change', onSystemThemeChange)

  setTimeout(() => (isBooting.value = false), 1200)
})

// 컴포넌트가 사라질 때 구독을 풀어 준다.
// 안 풀면 이 컴포넌트가 없어져도 리스너가 남아 메모리에 계속 붙어 있는다. (메모리 누수)
onBeforeUnmount(() => {
  darkModeQuery.removeEventListener('change', onSystemThemeChange)
})

/* ────────────────────────────────────────────────
   [2일차 요구사항 2] computed 파생 값
   ──────────────────────────────────────────────── */
// 선택된 도시. 목록에서 지워졌으면 첫 번째 도시로 되돌아간다.
const current = computed(() => weatherList.value.find((c) => c.id === selectedId.value) ?? weatherList.value[0])

// [2일차 요구사항 2] 검색어가 도시 이름에 포함된 것만 담아 두는 computed 배열.
// 의존하는 searchQuery / weatherList 가 바뀔 때만 다시 계산되고, 그 외에는 캐싱된 값을 재사용한다.
const filteredWeatherList = computed(() => {
  const query = searchQuery.value.trim()
  // [2일차 요구사항 4-a] 검색어가 비어 있으면 원본 데이터를 그대로 내보낸다.
  if (!query) return weatherList.value
  return weatherList.value.filter((c) => c.name.includes(query))
})

/* ────────────────────────────────────────────────
   [2일차 추가] tempUnit 을 기반으로 파생되는 값들
   ──────────────────────────────────────────────── */

// 섭씨 값을 현재 단위로 환산한다. computed 안에서만 호출하는 순수 함수.
// (템플릿에서 직접 호출하면 리렌더링마다 재실행되므로 일부러 computed 로 감쌌다.)
const convert = (celsius) => (tempUnit.value === 'C' ? celsius : Math.round((celsius * 9) / 5 + 32))

// 화면에 그릴 카드 목록 — filteredWeatherList(검색 결과) 위에 단위 환산을 얹은 computed.
// computed 가 computed 를 의존해도 되고, 이때도 캐싱은 그대로 동작한다.
const displayWeatherList = computed(() =>
  filteredWeatherList.value.map((city) => ({
    ...city,
    shownTemp: convert(city.temp),
  })),
)

// 히어로 영역의 큰 숫자들도 같은 방식으로 환산해 둔다.
const currentTemp = computed(() => convert(current.value.temp))
const currentHigh = computed(() => convert(current.value.high))
const currentLow = computed(() => convert(current.value.low))

// 예보 스트립도 단위를 따라가야 화면 전체가 어긋나지 않는다.
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
// 감시 대상을 콕 집어 지정했으므로 이전 값까지 받아볼 수 있다.
// 카드를 처음 클릭하기 전에는 실행되지 않는다. (값이 바뀌는 순간에만 발동)
watch(selectedCityInfo, (newInfo, oldInfo) => {
  console.log(` [watch] 상태바 문구 변경: "${oldInfo}" -> "${newInfo}"`)
})

// [2일차 요구사항 3-2] searchQuery 를 watchEffect 로 감시 — 타이핑할 때마다 콘솔 로그.
// 감시 대상을 안 적어도 콜백 안에서 읽은 searchQuery 를 자동으로 추적한다.
// 대신 컴포넌트가 만들어질 때 최초 1회 즉시 실행되고, 이전 값(oldValue)은 주지 않는다.
watchEffect(() => {
  console.log(`🤖 [watchEffect] 검색어 '${searchQuery.value}' 로 날씨 API 를 다시 조회합니다.`)
})

// [2일차 추가] Multi-Source Watch — 내가 만든 tempUnit 과 selectedId 를 배열로 묶어 한 번에 감시한다.
// 둘 중 하나만 바뀌어도 콜백이 돌기 때문에, 실무에서 "조건이 하나라도 바뀌면 재조회" 하는 패턴에 쓴다.
watch([selectedId, tempUnit], ([newId, newUnit], [oldId, oldUnit]) => {
  console.log(`🌡️ [multi watch] 도시 ${oldId} -> ${newId} / 단위 °${oldUnit} -> °${newUnit} — 조건이 바뀌어 다시 계산합니다.`)
})

/* ────────────────────────────────────────────────
   동작
   ──────────────────────────────────────────────── */

// 받침 유무로 조사를 골라준다. ("서울이" / "제주가")
// 지금 데이터는 전부 받침이 있지만, 도시가 늘어나도 문장이 어색해지지 않도록 미리 빼 두었다.
const withParticle = (name) => {
  const code = name.charCodeAt(name.length - 1)
  const isHangul = code >= 0xac00 && code <= 0xd7a3
  const hasFinalConsonant = isHangul && (code - 0xac00) % 28 !== 0
  return `${name}${hasFinalConsonant ? '이' : '가'}`
}

// [1일차 요구사항 4] 카드를 누르면 상태바에 선택 문구를 띄운다.
const selectCity = (city) => {
  selectedId.value = city.id
  selectedCityInfo.value = `${withParticle(city.name)} 선택되었습니다.`
}

// [1일차 요구사항 4] 상세보기 — 부모 카드의 click 까지 번지지 않도록 템플릿에서 .stop 을 건다.
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
  selectedCityInfo.value = `Removed ${city.name}.`
}

// [1일차 요구사항 3] :value 로 내려주고 @input 으로 되받는 수동 양방향 바인딩.
// 값을 가공하지 않고 그대로 넣기 때문에 한글 조합 중에도 글자가 깨지지 않는다.
const onSearchInput = (event) => {
  searchQuery.value = event.target.value
}

const clearSearch = () => {
  searchQuery.value = ''
}

// [2일차 추가] 내가 만든 반응형 변수를 바꾸는 유일한 통로.
// 값이 바뀌는 즉시 위쪽 computed 들과 multi watch 가 연쇄로 반응한다.
const toggleUnit = () => {
  tempUnit.value = tempUnit.value === 'C' ? 'F' : 'C'
}
</script>

<template>
  <!-- :class 로 테마를 통째로 갈아끼운다 -->
  <div class="wx" :class="isDark ? 'wx--dark' : 'wx--light'">
    <!-- ══════════ SPLASH ══════════ -->
    <div v-if="isBooting" class="wx-splash">
      <h1 class="wx-splash-title">Weather</h1>
      <p class="wx-splash-sub">A minimal weather dashboard</p>
    </div>

    <!-- ══════════ DASHBOARD ══════════ -->
    <div v-else class="wx-shell">
      <!-- ── 앱 바 ── -->
      <header class="wx-appbar">
        <!-- 로고 옆 작은 닷매트릭스 — 지금 선택된 도시 날씨를 따라 바뀐다 -->
        <p class="wx-brand">
          <PixelIcon :name="current.icon" :size="22" />
          Weather
        </p>

        <div class="wx-appbar-controls">
          <!-- [2일차 추가] 내가 만든 tempUnit 을 뒤집는 버튼 -->
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
        <!-- 히어로는 폭에 따라 방향이 바뀐다.
             넓은 웹 / 좁은 모바일 = 세로 (원본 폰 화면 비율)
             중간 태블릿 폭 = 가로 (아이콘 | 숫자) — 안 그러면 좌우가 텅 빈다 -->
        <section class="wx-panel wx-hero">
          <header class="wx-hero-head">
            <h2 class="wx-hero-city">{{ current.name }}</h2>
            <p class="wx-label">Current Location · {{ today }}</p>
          </header>

          <!-- 히어로는 원본 목업처럼 큼직한 라인 아이콘.
               닷매트릭스(PixelIcon)는 작게 찍힐 때 제일 예뻐서 카드·예보에만 쓴다. -->
          <MonoIcon :name="current.icon" :size="118" :width="1.1" class="wx-hero-icon" />

          <div class="wx-hero-figures">
            <!-- [2일차 추가] 원본 대신 단위가 환산된 computed 값을 그린다 -->
            <p class="wx-temp">
              <span class="wx-temp-num">{{ currentTemp }}</span>
              <span class="wx-temp-unit">°{{ tempUnit }}</span>
            </p>
            <p class="wx-condition">{{ current.status }}</p>

            <p class="wx-minmax">
              <span>↓ {{ currentLow }}°</span>
              <span>↑ {{ currentHigh }}°</span>
            </p>

            <!-- [1일차 요구사항 2] v-if / v-else — 거짓인 쪽은 DOM 에서 아예 사라진다.
                 25도 기준은 과제 스펙이므로 환산값이 아닌 원본 섭씨로 판정한다. -->
            <p v-if="current.temp >= HOT_TEMP" class="wx-badge is-hot">HOT · {{ HOT_TEMP }}°C AND ABOVE</p>
            <p v-else class="wx-badge is-cool">COOL · BELOW {{ HOT_TEMP }}°C</p>
          </div>

          <div class="wx-suntimes">
            <span class="wx-suntime"> <MonoIcon name="sunrise" :size="18" /> {{ current.sunrise }} </span>
            <span class="wx-suntime"> <MonoIcon name="sunset" :size="18" /> {{ current.sunset }} </span>
          </div>
        </section>

        <!-- ══════════ 우 : 검색 + 도시 카드 ══════════ -->
        <section class="wx-side">
          <!-- [1일차 요구사항 3] 한글 검색 -->
          <div class="wx-panel wx-search-panel">
            <label class="wx-label" for="citySearch">Search City</label>
            <div class="wx-search-field">
              <input id="citySearch" type="text" class="wx-search-input" placeholder="한글로 입력해 보세요 (예: 서울)" autocomplete="off" :value="searchQuery" @input="onSearchInput" />
              <button v-if="searchQuery" class="wx-icon-btn" aria-label="Clear" @click="clearSearch">
                <MonoIcon name="close" :size="14" />
              </button>
            </div>

            <!-- 입력한 도시명을 그대로 되돌려 출력 -->
            <p class="wx-echo">
              Query
              <strong v-if="searchQuery">{{ searchQuery }}</strong>
              <span v-else class="wx-echo-empty">—</span>
            </p>
          </div>

          <!-- [1일차 요구사항 1] v-for 로 반복 출력 · :key 에는 고유 id 를 바인딩
               [2일차 요구사항 4-a] 검색어가 비었을 때는 원본 데이터 전체가 나오고,
               [2일차 요구사항 4-b] 일치하는 데이터가 있으면 그 도시만 나온다.
               둘 다 원본이 아닌 computed 배열을 그리기 때문에 자동으로 처리된다. -->
          <div class="wx-cards">
            <article v-for="city in displayWeatherList" :key="city.id" class="wx-panel wx-card" :class="{ 'is-active': city.id === selectedId }" @click="selectCity(city)">
              <button class="wx-icon-btn wx-card-remove" aria-label="Remove" @click.stop="removeCity(city)">
                <MonoIcon name="close" :size="13" />
              </button>

              <PixelIcon :name="city.icon" :size="44" />

              <h3 class="wx-card-city">{{ city.name }}</h3>
              <p class="wx-card-temp">
                {{ city.shownTemp }}<span>°{{ tempUnit }}</span>
              </p>
              <p class="wx-card-status">{{ city.status }}</p>

              <!-- [1일차 요구사항 2] 25도 기준 라벨 -->
              <p v-if="city.temp >= HOT_TEMP" class="wx-badge is-hot">HOT</p>
              <p v-else class="wx-badge is-cool">COOL</p>

              <!-- [1일차 요구사항 4] .stop 이 없으면 카드의 @click 까지 함께 실행된다 (이벤트 버블링) -->
              <button class="wx-detail-btn" @click.stop="showDetail(city.name, city.status)">Details</button>
            </article>
          </div>

          <!-- [2일차 요구사항 4-c] 일치하는 데이터가 없으면 없다고 안내한다 -->
          <p v-if="displayWeatherList.length === 0" class="wx-empty">“{{ searchQuery }}” 와(과) 일치하는 도시가 없습니다.</p>
        </section>
      </div>

      <!-- ══════════ 예보 ══════════ -->
      <div class="wx-forecasts">
        <section class="wx-panel">
          <p class="wx-label">Hourly Forecast</p>
          <div class="wx-strip">
            <div v-for="(h, i) in currentHourly" :key="h.id" class="wx-cell">
              <span class="wx-cell-key" :class="{ 'is-now': i === 0 }">{{ h.time }}</span>
              <PixelIcon :name="h.icon" :size="30" />
              <span class="wx-cell-val">{{ h.shownTemp }}°</span>
            </div>
          </div>
        </section>

        <section class="wx-panel">
          <p class="wx-label">Daily Forecast</p>
          <div class="wx-strip">
            <div v-for="d in currentDaily" :key="d.id" class="wx-cell">
              <span class="wx-cell-key">{{ d.date }}</span>
              <PixelIcon :name="d.icon" :size="30" />
              <span class="wx-cell-val"
                >{{ d.shownHigh }}° <i>{{ d.shownLow }}°</i></span
              >
            </div>
          </div>
        </section>
      </div>

      <!-- [1일차 요구사항 4] 상태바 -->
      <footer class="wx-statusbar">
        <PixelIcon :name="current.icon" :size="18" />
        <p>{{ selectedCityInfo }}</p>
      </footer>
    </div>
  </div>
</template>

<style>
/* 디자인은 전부 별도 CSS 파일로 분리해 관리합니다. */
@import '@/assets/weather.css';
</style>

<script setup>
import { ref, computed, onMounted } from 'vue'
import PixelIcon from './PixelIcon.vue'
import MonoIcon from './MonoIcon.vue'

/* ════════════════════════════════════════════════════════════
   [종합과제 1단계] 날씨 Mockup — 웹 대시보드
   아이콘: Nothing Weather App Icons (Community) 닷매트릭스 SVG
   ════════════════════════════════════════════════════════════ */

/* ────────────────────────────────────────────────
   [요구사항 1] 배열 렌더링용 날씨 데이터
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
   화면 상태
   ──────────────────────────────────────────────── */
const isBooting = ref(true) // 스플래시 표시 여부
const isDark = ref(true) // 다크 / 라이트 테마
const selectedId = ref('city_01') // 히어로에 띄울 도시

// [요구사항 3] input 과 양방향으로 묶이는 검색어
const searchQuery = ref('')
// 한글 IME 조합 중인지 — 조합 도중에 "결과 없음"이 깜빡이는 걸 막는다.
const isComposing = ref(false)

// [요구사항 4] 하단 상태바 문구
const selectedCityInfo = ref('Select a city card to begin.')

// 더움 / 선선함을 가르는 기준 온도 (과제 스펙: 25도)
const HOT_TEMP = 25

// 스플래시를 잠깐 보여준 뒤 대시보드로 넘어간다.
onMounted(() => {
  setTimeout(() => (isBooting.value = false), 1200)
})

/* ────────────────────────────────────────────────
   파생 값
   ──────────────────────────────────────────────── */
// 선택된 도시. 목록에서 지워졌으면 첫 번째 도시로 되돌아간다.
const current = computed(
  () => weatherList.value.find((c) => c.id === selectedId.value) ?? weatherList.value[0],
)

// 검색어가 도시 이름에 포함된 것만 — 비어 있으면 전체를 보여준다.
const filteredList = computed(() =>
  weatherList.value.filter((c) => c.name.includes(searchQuery.value.trim())),
)

const today = new Date()
  .toLocaleDateString('en-US', { month: 'short', day: '2-digit', weekday: 'short' })
  .toUpperCase()

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

// [요구사항 4] 카드를 누르면 상태바에 선택 문구를 띄운다.
const selectCity = (city) => {
  selectedId.value = city.id
  selectedCityInfo.value = `${withParticle(city.name)} 선택되었습니다.`
}

// [요구사항 4] 상세보기 — 부모 카드의 click 까지 번지지 않도록 템플릿에서 .stop 을 건다.
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

// [요구사항 3] :value 로 내려주고 @input 으로 되받는 수동 양방향 바인딩.
// 값을 가공하지 않고 그대로 넣기 때문에 한글 조합 중에도 글자가 깨지지 않는다.
const onSearchInput = (event) => {
  searchQuery.value = event.target.value
}

const clearSearch = () => {
  searchQuery.value = ''
  isComposing.value = false
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

        <!-- 테마 전환 -->
        <div class="wx-segment" role="group" aria-label="Theme">
          <button class="wx-segment-btn" :class="{ 'is-on': isDark }" @click="isDark = true">
            Dark
          </button>
          <button class="wx-segment-btn" :class="{ 'is-on': !isDark }" @click="isDark = false">
            Light
          </button>
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
            <p class="wx-temp">
              <span class="wx-temp-num">{{ current.temp }}</span>
              <span class="wx-temp-unit">°C</span>
            </p>
            <p class="wx-condition">{{ current.status }}</p>

            <p class="wx-minmax">
              <span>↓ {{ current.low }}°</span>
              <span>↑ {{ current.high }}°</span>
            </p>

            <!-- [요구사항 2] v-if / v-else — 거짓인 쪽은 DOM 에서 아예 사라진다 -->
            <p v-if="current.temp >= HOT_TEMP" class="wx-badge is-hot">
              HOT · {{ HOT_TEMP }}°C AND ABOVE
            </p>
            <p v-else class="wx-badge is-cool">COOL · BELOW {{ HOT_TEMP }}°C</p>
          </div>

          <div class="wx-suntimes">
            <span class="wx-suntime">
              <MonoIcon name="sunrise" :size="18" /> {{ current.sunrise }}
            </span>
            <span class="wx-suntime">
              <MonoIcon name="sunset" :size="18" /> {{ current.sunset }}
            </span>
          </div>
        </section>

        <!-- ══════════ 우 : 검색 + 도시 카드 ══════════ -->
        <section class="wx-side">
          <!-- [요구사항 3] 한글 검색 -->
          <div class="wx-panel wx-search-panel">
            <label class="wx-label" for="citySearch">Search City</label>
            <div class="wx-search-field">
              <input
                id="citySearch"
                type="text"
                class="wx-search-input"
                placeholder="한글로 입력해 보세요 (예: 서울)"
                autocomplete="off"
                :value="searchQuery"
                @input="onSearchInput"
                @compositionstart="isComposing = true"
                @compositionend="isComposing = false"
              />
              <button
                v-if="searchQuery"
                class="wx-icon-btn"
                aria-label="Clear"
                @click="clearSearch"
              >
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

          <!-- [요구사항 1] v-for 로 반복 출력 · :key 에는 고유 id 를 바인딩 -->
          <div class="wx-cards">
            <article
              v-for="city in filteredList"
              :key="city.id"
              class="wx-panel wx-card"
              :class="{ 'is-active': city.id === selectedId }"
              @click="selectCity(city)"
            >
              <button
                class="wx-icon-btn wx-card-remove"
                aria-label="Remove"
                @click.stop="removeCity(city)"
              >
                <MonoIcon name="close" :size="13" />
              </button>

              <PixelIcon :name="city.icon" :size="44" />

              <h3 class="wx-card-city">{{ city.name }}</h3>
              <p class="wx-card-temp">{{ city.temp }}<span>°C</span></p>
              <p class="wx-card-status">{{ city.status }}</p>

              <!-- [요구사항 2] 25도 기준 라벨 -->
              <p v-if="city.temp >= HOT_TEMP" class="wx-badge is-hot">HOT</p>
              <p v-else class="wx-badge is-cool">COOL</p>

              <!-- [요구사항 4] .stop 이 없으면 카드의 @click 까지 함께 실행된다 (이벤트 버블링) -->
              <button class="wx-detail-btn" @click.stop="showDetail(city.name, city.status)">
                Details
              </button>
            </article>
          </div>

          <!-- 조합 중에는 문구가 깜빡이므로 완성된 검색어일 때만 안내한다 -->
          <p v-if="!isComposing && filteredList.length === 0" class="wx-empty">
            No city matches “{{ searchQuery }}”.
          </p>
        </section>
      </div>

      <!-- ══════════ 예보 ══════════ -->
      <div class="wx-forecasts">
        <section class="wx-panel">
          <p class="wx-label">Hourly Forecast</p>
          <div class="wx-strip">
            <div v-for="(h, i) in current.hourly" :key="h.id" class="wx-cell">
              <span class="wx-cell-key" :class="{ 'is-now': i === 0 }">{{ h.time }}</span>
              <PixelIcon :name="h.icon" :size="30" />
              <span class="wx-cell-val">{{ h.temp }}°</span>
            </div>
          </div>
        </section>

        <section class="wx-panel">
          <p class="wx-label">Daily Forecast</p>
          <div class="wx-strip">
            <div v-for="d in current.daily" :key="d.id" class="wx-cell">
              <span class="wx-cell-key">{{ d.date }}</span>
              <PixelIcon :name="d.icon" :size="30" />
              <span class="wx-cell-val">{{ d.high }}° <i>{{ d.low }}°</i></span>
            </div>
          </div>
        </section>
      </div>

      <!-- [요구사항 4] 상태바 -->
      <footer class="wx-statusbar">
        <PixelIcon :name="current.icon" :size="18" />
        <p>{{ selectedCityInfo }}</p>
      </footer>
    </div>
  </div>
</template>

<style>
/* 디자인은 전부 별도 CSS 파일로 분리해 관리한다 */
@import '@/assets/weather.css';
</style>

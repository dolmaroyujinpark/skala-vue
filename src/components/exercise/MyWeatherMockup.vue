<script setup>
import { ref, computed, onMounted } from 'vue'
import MonoIcon from './MonoIcon.vue'

/* ────────────────────────────────────────────────
   [1단계] 날씨 목록 데이터
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
      { id: 'h3', time: '12:00', icon: 'sun', temp: 30 },
      { id: 'h4', time: '13:00', icon: 'cloud', temp: 31 },
      { id: 'h5', time: '14:00', icon: 'cloud', temp: 30 },
      { id: 'h6', time: '15:00', icon: 'sun', temp: 29 },
    ],
    daily: [
      { id: 'd1', date: '7월 31일', icon: 'sun', high: 31, low: 22 },
      { id: 'd2', date: '8월 1일', icon: 'sun', high: 32, low: 23 },
      { id: 'd3', date: '8월 2일', icon: 'cloud', high: 29, low: 22 },
      { id: 'd4', date: '8월 3일', icon: 'rain', high: 26, low: 21 },
      { id: 'd5', date: '8월 4일', icon: 'rain', high: 25, low: 20 },
      { id: 'd6', date: '8월 5일', icon: 'sun', high: 30, low: 21 },
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
      { id: 'h6', time: '15:00', icon: 'cloud', temp: 24 },
    ],
    daily: [
      { id: 'd1', date: '7월 31일', icon: 'rain', high: 26, low: 19 },
      { id: 'd2', date: '8월 1일', icon: 'rain', high: 25, low: 19 },
      { id: 'd3', date: '8월 2일', icon: 'cloud', high: 27, low: 20 },
      { id: 'd4', date: '8월 3일', icon: 'cloud', high: 28, low: 21 },
      { id: 'd5', date: '8월 4일', icon: 'sun', high: 29, low: 21 },
      { id: 'd6', date: '8월 5일', icon: 'sun', high: 30, low: 22 },
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
      { id: 'h3', time: '12:00', icon: 'sun', temp: 28 },
      { id: 'h4', time: '13:00', icon: 'sun', temp: 28 },
      { id: 'h5', time: '14:00', icon: 'cloud', temp: 27 },
      { id: 'h6', time: '15:00', icon: 'rain', temp: 26 },
    ],
    daily: [
      { id: 'd1', date: '7월 31일', icon: 'cloud', high: 28, low: 23 },
      { id: 'd2', date: '8월 1일', icon: 'sun', high: 30, low: 24 },
      { id: 'd3', date: '8월 2일', icon: 'sun', high: 31, low: 24 },
      { id: 'd4', date: '8월 3일', icon: 'cloud', high: 29, low: 23 },
      { id: 'd5', date: '8월 4일', icon: 'rain', high: 27, low: 22 },
      { id: 'd6', date: '8월 5일', icon: 'cloud', high: 28, low: 23 },
    ],
  },
])

/* ────────────────────────────────────────────────
   화면 상태
   ──────────────────────────────────────────────── */
// 'splash' | 'home' | 'forecast' | 'locations' | 'settings'
const screen = ref('splash')
const selectedId = ref('city_01')
const isDark = ref(true)

// [4단계] 검색어 상태
const searchQuery = ref('')

// 하단 상태바에 띄울 안내 문구
const selectedCityInfo = ref('도시를 선택해 보세요.')

// 더움/선선함을 가르는 기준 온도.
const HOT_TEMP = 25

// 스플래시를 1.4초 보여준 뒤 홈으로 넘어간다.
onMounted(() => {
  setTimeout(() => {
    if (screen.value === 'splash') screen.value = 'home'
  }, 1400)
})

// 선택된 도시. 목록에서 지워졌으면 첫 번째 도시로 되돌아간다.
const current = computed(() => weatherList.value.find((c) => c.id === selectedId.value) ?? weatherList.value[0])

// 검색어로 목록 필터링 — 입력값이 비어 있으면 전체를 보여준다.
const filteredList = computed(() => weatherList.value.filter((c) => c.name.includes(searchQuery.value.trim())))

const today = new Date().toLocaleDateString('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long',
})

const go = (next) => (screen.value = next)

// 도시 선택 → 홈으로 이동
const selectCity = (city) => {
  selectedId.value = city.id
  selectedCityInfo.value = `${city.name} 선택됨 · ${city.temp}°C · ${city.status}`
  screen.value = 'home'
}

// 목록에서 도시 삭제 (:key 를 id 로 써야 하는 이유를 보여주는 동작)
const removeCity = (city) => {
  if (weatherList.value.length === 1) {
    selectedCityInfo.value = '마지막 도시는 삭제할 수 없습니다.'
    return
  }
  weatherList.value = weatherList.value.filter((c) => c.id !== city.id)
  selectedCityInfo.value = `${city.name} 삭제됨`
}
</script>

<template>
  <!-- :class 로 다크/라이트 테마를 통째로 전환한다 -->
  <div class="wx" :class="isDark ? 'wx--dark' : 'wx--light'">
    <div class="wx-phone">
      <!-- ══════════ SPLASH ══════════ -->
      <section v-if="screen === 'splash'" class="wx-screen wx-splash">
        <h1 class="wx-splash-title">Weather</h1>
        <p class="wx-splash-sub">A minimal weather app</p>
      </section>

      <!-- ══════════ HOME ══════════ -->
      <section v-else-if="screen === 'home'" class="wx-screen">
        <header class="wx-topbar">
          <div>
            <h1 class="wx-city">{{ current.name }}</h1>
            <p class="wx-caption">Current Location</p>
          </div>
          <div class="wx-topbar-actions">
            <button class="wx-icon-btn" aria-label="도시 선택" @click="go('locations')">
              <MonoIcon name="map" :size="22" />
            </button>
            <button class="wx-icon-btn" aria-label="설정" @click="go('settings')">
              <MonoIcon name="gear" :size="22" />
            </button>
          </div>
        </header>

        <p class="wx-sync">in sync</p>
        <p class="wx-date">{{ today }}</p>

        <div class="wx-temp">
          <span class="wx-temp-num">{{ current.temp }}</span>
          <span class="wx-temp-unit">°C</span>
        </div>

        <div class="wx-minmax">
          <span>↓ {{ current.low }}°C</span>
          <span>↑ {{ current.high }}°C</span>
        </div>

        <div class="wx-hero-icon">
          <MonoIcon :name="current.icon" :size="120" :width="1.1" />
        </div>

        <p class="wx-condition">{{ current.status }}</p>

        <!-- [3단계] v-if / v-else 는 조건이 거짓이면 DOM 에서 아예 제거된다. -->
        <p v-if="current.temp >= HOT_TEMP" class="wx-hint">HOT · {{ HOT_TEMP }}°C 이상</p>
        <p v-else class="wx-hint">COOL · {{ HOT_TEMP }}°C 미만</p>

        <div class="wx-suntimes">
          <span class="wx-suntime"><MonoIcon name="sunrise" :size="20" /> {{ current.sunrise }}</span>
          <span class="wx-suntime"><MonoIcon name="sunset" :size="20" /> {{ current.sunset }}</span>
        </div>

        <nav class="wx-pager">
          <button class="wx-dot is-on" aria-label="홈"></button>
          <button class="wx-dot" aria-label="예보" @click="go('forecast')"></button>
        </nav>
      </section>

      <!-- ══════════ FORECAST ══════════ -->
      <section v-else-if="screen === 'forecast'" class="wx-screen">
        <header class="wx-topbar">
          <div>
            <h1 class="wx-city">{{ current.name }}</h1>
            <p class="wx-caption">Current Location</p>
          </div>
          <div class="wx-topbar-actions">
            <button class="wx-icon-btn" aria-label="도시 선택" @click="go('locations')">
              <MonoIcon name="map" :size="22" />
            </button>
            <button class="wx-icon-btn" aria-label="설정" @click="go('settings')">
              <MonoIcon name="gear" :size="22" />
            </button>
          </div>
        </header>

        <h2 class="wx-page-title">Forecast</h2>

        <h3 class="wx-section-label">Hourly Forecast</h3>
        <div class="wx-scroller">
          <!-- [2단계] :key 에는 반드시 고유한 id 를 쓴다.
               index 를 쓰면 목록 중간이 삭제될 때 Vue 가 엉뚱한 DOM 을 재사용한다. -->
          <div v-for="(h, i) in current.hourly" :key="h.id" class="wx-hour">
            <span class="wx-hour-time" :class="{ 'is-now': i === 0 }">{{ h.time }}</span>
            <MonoIcon :name="h.icon" :size="32" />
            <span class="wx-hour-temp">{{ h.temp }}°</span>
          </div>
        </div>

        <h3 class="wx-section-label">Daily Forecast</h3>
        <div class="wx-scroller">
          <div v-for="d in current.daily" :key="d.id" class="wx-day">
            <span class="wx-day-date">{{ d.date }}</span>
            <MonoIcon :name="d.icon" :size="32" />
            <span class="wx-day-temp">↑ {{ d.high }}°C</span>
            <span class="wx-day-temp is-dim">↓ {{ d.low }}°C</span>
          </div>
        </div>

        <nav class="wx-pager">
          <button class="wx-dot" aria-label="홈" @click="go('home')"></button>
          <button class="wx-dot is-on" aria-label="예보"></button>
        </nav>
      </section>

      <!-- ══════════ LOCATIONS ══════════ -->
      <section v-else-if="screen === 'locations'" class="wx-screen">
        <header class="wx-navbar">
          <button class="wx-nav-back" @click="go('home')">
            <MonoIcon name="back" :size="20" />
            <span>Select City</span>
          </button>
          <button class="wx-icon-btn" aria-label="도시 추가">
            <MonoIcon name="plus" :size="20" />
          </button>
        </header>

        <!-- [4단계] input 값을 searchQuery 에 바인딩 -->
        <input type="text" class="wx-search" :value="searchQuery" @input="(e) => (searchQuery = e.target.value)" placeholder="도시 검색 (예: 서울)" />

        <ul class="wx-city-list">
          <li v-for="city in filteredList" :key="city.id" class="wx-city-row" :class="{ 'is-active': city.id === selectedId }" @click="selectCity(city)">
            <div class="wx-city-info">
              <p class="wx-city-name">{{ city.name }}</p>
              <p class="wx-city-temp">{{ city.temp }}°C</p>
              <p class="wx-city-status">
                {{ city.status }}
                <!-- v-if / v-else -->
                <span v-if="city.temp >= HOT_TEMP" class="wx-tag">HOT</span>
                <span v-else class="wx-tag">COOL</span>
              </p>
            </div>

            <div class="wx-city-right">
              <MonoIcon :name="city.icon" :size="40" :width="1.3" />
              <!-- .stop 이 없으면 부모 li 의 @click 까지 같이 실행된다 (이벤트 버블링) -->
              <button class="wx-icon-btn wx-remove" aria-label="삭제" @click.stop="removeCity(city)">
                <MonoIcon name="close" :size="16" />
              </button>
            </div>
          </li>
        </ul>

        <p v-if="filteredList.length === 0" class="wx-empty">'{{ searchQuery }}' 검색 결과가 없습니다.</p>

        <p class="wx-statusbar">{{ selectedCityInfo }}</p>
      </section>

      <!-- ══════════ SETTINGS ══════════ -->
      <section v-else class="wx-screen">
        <header class="wx-navbar">
          <button class="wx-nav-back" @click="go('home')">
            <MonoIcon name="back" :size="20" />
            <span>Settings</span>
          </button>
        </header>

        <h2 class="wx-page-title">Theme</h2>
        <button class="wx-setting" @click="isDark = true">
          <span>
            <span class="wx-setting-title">Dark Theme</span>
            <span class="wx-setting-desc">Join the Dark Side!</span>
          </span>
          <MonoIcon v-if="isDark" name="check" :size="20" />
        </button>
        <button class="wx-setting" @click="isDark = false">
          <span>
            <span class="wx-setting-title">Light Theme</span>
            <span class="wx-setting-desc">Let There be Light!</span>
          </span>
          <MonoIcon v-if="!isDark" name="check" :size="20" />
        </button>

        <h2 class="wx-page-title">Feedback</h2>
        <div class="wx-setting">
          <span>
            <span class="wx-setting-title">Report an Issue</span>
            <span class="wx-setting-desc">Facing an issue? Report and we'll look into it.</span>
          </span>
        </div>
        <div class="wx-setting">
          <span>
            <span class="wx-setting-title">Rate on App Store</span>
            <span class="wx-setting-desc">Enjoying the app? Leave a review on the App Store.</span>
          </span>
        </div>

        <h2 class="wx-page-title">About</h2>
        <div class="wx-setting">
          <span>
            <span class="wx-setting-title">About Weather</span>
            <span class="wx-setting-desc">Read a bit more about the app.</span>
          </span>
        </div>
        <div class="wx-setting">
          <span>
            <span class="wx-setting-title">The Team</span>
            <span class="wx-setting-desc">종합과제 1일차 · Vue 3</span>
          </span>
        </div>
      </section>
    </div>
  </div>
</template>

<style>
/* 디자인은 전부 별도 CSS 파일로 분리 (레퍼런스: Mono Weather UI Kit / Nothing Weather Icons) */
@import '@/assets/weather.css';
</style>

<script setup>
import { ref, computed, inject, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import BaseDashboardCard from '@/components/mine/weather/BaseDashboardCard.vue'
import WeatherHero from '@/components/mine/weather/WeatherHero.vue'
import ForecastStrip from '@/components/mine/weather/ForecastStrip.vue'
import PixelIcon from '@/components/mine/icons/PixelIcon.vue'
import { findCityById } from '@/data/cities'

/* ════════════════════════════════════════════════════════════
   [3일차 과제] WeatherDetailView.vue — /weather/:cityId (요구사항 4)

   ── 디자인을 새로 만들지 않은 이유 ────────────────────────
   이 화면에 필요한 조각은 2일차에 이미 다 만들어 두었습니다.
     WeatherHero       선택된 도시의 큰 기온 · 상태 · 옷차림 · 일출/일몰
     ForecastStrip     시간별 / 일별 예보 (Scoped Slot)
     BaseDashboardCard 패널 테두리 규칙
     .wx-label / .wx-action / PixelIcon   공용 유틸
   그래서 이 파일은 "무엇을 어떤 순서로 놓을지"만 정합니다. 아래 scoped 스타일은
   배치(grid · gap)와, 슬롯 안 마크업이라 여기 있어야만 하는 예보 칸 규칙뿐입니다.
   색은 한 개도 새로 고르지 않고 .wx 테마 토큰(--dim · --fg)만 씁니다.

   ── 요구사항 4 ────────────────────────────────────────────
     · 도시 코드에 해당하는 Mock Data 를 임시로 활용
     · 동적 경로의 cityId 를 기반으로 Mount 시점에 도시 객체 선택
   ════════════════════════════════════════════════════════════ */

/* useRoute 와 useRouter 는 이름이 비슷하지만 하는 일이 반대입니다.
     route  = 지금 주소에 대한 정보 (읽기)   → params.cityId 를 꺼냅니다
     router = 주소를 바꾸는 도구 (쓰기)      → 목록으로 돌려보냅니다 */
const route = useRoute()
const router = useRouter()

// [3일차] 온도 단위는 App.vue 가 provide 합니다.
// 목록에서 °F 로 보다가 들어와도 여기서 °C 로 되돌아가지 않습니다.
const tempUnit = inject('tempUnit', ref('C'))

/* ────────────────────────────────────────────────
   [요구사항 4] Mount 시점에 도시 객체 선택

   cityData 를 ref(null) 로 시작하는 이유 — 아직 "못 찾았다"가 아니라
   "아직 안 찾았다" 상태입니다. 지금은 동기 함수라 순식간에 채워지지만,
   나중에 axios 로 서버에서 받아 오면 그 사이에 빈 화면이 필요합니다.
   그때 코드를 고치지 않아도 되도록 처음부터 이 모양으로 두었습니다.
   ──────────────────────────────────────────────── */
const cityData = ref(null)

/* 옷차림 패널 펼침 상태. 목록 화면과 같은 구조 — 상태는 부모가 쥐고
   히어로는 신호만 올립니다. 목록에서는 접힌 채로 시작하지만 여기서는
   일부러 상세를 보러 들어온 화면이라 펼친 채로 시작합니다. */
const showOutfit = ref(true)

onMounted(() => {
  // route.params.cityId 의 이름은 router/index.js 의 path: '/weather/:cityId' 에서 옵니다.
  // 둘 중 하나만 고치면 조용히 undefined 가 되므로 항상 같이 봐야 합니다.
  cityData.value = findCityById(route.params.cityId) ?? null

  if (!cityData.value) {
    console.warn(`🔍 [detail] '${route.params.cityId}' 에 해당하는 도시가 Mock Data 에 없습니다.`)
  }
})

/* ────────────────────────────────────────────────
   단위 환산 — 목록 화면과 똑같은 방식
   자식(WeatherHero · ForecastStrip)은 환산된 숫자만 받습니다.
   ──────────────────────────────────────────────── */
const convert = (celsius) => (tempUnit.value === 'C' ? celsius : Math.round((celsius * 9) / 5 + 32))

// cityData 가 아직 null 일 수 있으므로 ?? 로 받치고, 아래 v-if 가 실제 렌더링을 막습니다.
const shownTemp = computed(() => convert(cityData.value?.temp ?? 0))
const shownHigh = computed(() => convert(cityData.value?.high ?? 0))
const shownLow = computed(() => convert(cityData.value?.low ?? 0))

const hourly = computed(() => (cityData.value?.hourly ?? []).map((h) => ({ ...h, shownTemp: convert(h.temp) })))
const daily = computed(() =>
  (cityData.value?.daily ?? []).map((d) => ({
    ...d,
    shownHigh: convert(d.high),
    shownLow: convert(d.low),
  })),
)

const today = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', weekday: 'short' }).toUpperCase()

/* 관측 지표 — 화면에 그릴 순서대로 배열 하나로 묶습니다.
   템플릿에 <p> 를 여섯 벌 쓰는 대신 v-for 로 돌리면, 항목을 하나 더할 때
   마크업이 아니라 이 배열만 고치면 됩니다. (1일차 v-for 실습의 연장) */
const metrics = computed(() => {
  const city = cityData.value
  if (!city) return []

  return [
    { id: 'humidity', label: 'Humidity', value: `${city.humidity}%` },
    { id: 'wind', label: 'Wind', value: `${city.wind}m/s` },
    { id: 'pressure', label: 'Pressure', value: `${city.pressure}hPa` },
    { id: 'uv', label: 'UV Index', value: `${city.uv}` },
    { id: 'sunrise', label: 'Sunrise', value: city.sunrise },
    { id: 'sunset', label: 'Sunset', value: city.sunset },
  ]
})

/* 목록으로 돌아가기.
   router.back() 이 아니라 push('/') 인 이유 — 주소창에 /weather/city_01 을
   직접 쳐서 들어온 사용자는 "뒤로" 갈 곳이 없습니다. back() 이면 앱 밖으로
   나가 버리거나 아무 일도 일어나지 않습니다. push 는 어느 경로로 들어왔든
   목록으로 보냅니다. */
const goList = () => {
  router.push('/')
}
</script>

<template>
  <!-- 목록 화면(.wx-grid)과 같은 세로 리듬(gap 16px)을 씁니다. -->
  <div class="wx-detail">
    <!-- ══════════ 도시를 찾은 경우 ══════════ -->
    <template v-if="cityData">
      <!-- 목록에서 쓰던 히어로를 그대로 재사용합니다. 넘기는 props 도 같습니다.
           목록과의 유일한 차이는 showOutfit 초깃값(여기는 펼친 채로 시작) 뿐입니다. -->
      <WeatherHero
        :city="cityData"
        :temp="shownTemp"
        :high="shownHigh"
        :low="shownLow"
        :date-label="today"
        :show-outfit="showOutfit"
        @toggle-outfit="showOutfit = !showOutfit"
      />

      <!-- ── [요구사항 4] 지역별 상세 기상 관측 정보 ── -->
      <BaseDashboardCard tag="section">
        <template #header>
          <header>
            <h2 class="wx-detail-city">{{ cityData.region }}</h2>
            <!-- .wx-label 은 2일차부터 쓰던 공용 캡션입니다 (Current Location · Hourly Forecast …) -->
            <p class="wx-label">Observation · {{ cityData.id }}</p>
          </header>
        </template>

        <dl class="wx-metrics">
          <!-- v-for 로 지표를 반복 출력 · :key 에는 고유 id 를 바인딩 -->
          <div v-for="metric in metrics" :key="metric.id" class="wx-metric">
            <dt class="wx-label">{{ metric.label }}</dt>
            <dd class="wx-metric-value">{{ metric.value }}</dd>
          </div>
        </dl>
      </BaseDashboardCard>

      <!-- 예보도 목록 화면과 같은 컴포넌트 · 같은 슬롯 내용물입니다.
           .wx-cell-key / .wx-cell-val 은 슬롯 안 마크업이라 부모 스코프에서
           컴파일됩니다. 그래서 이 파일의 scoped 스타일에도 같은 규칙이 필요합니다.
           (자세한 이유는 WeatherHomeView 의 [5] 주석 참고) -->
      <div class="wx-detail-forecasts">
        <ForecastStrip :title="`${cityData.name} · Hourly Forecast`" :items="hourly">
          <template #default="{ item, isFirst }">
            <span class="wx-cell-key" :class="{ 'is-now': isFirst }">{{ item.time }}</span>
            <PixelIcon :name="item.icon" :size="30" />
            <span class="wx-cell-val">{{ item.shownTemp }}°</span>
          </template>
        </ForecastStrip>

        <ForecastStrip :title="`${cityData.name} · Daily Forecast`" :items="daily">
          <template #default="{ item }">
            <span class="wx-cell-key">{{ item.date }}</span>
            <PixelIcon :name="item.icon" :size="30" />
            <span class="wx-cell-val"
              >{{ item.shownHigh }}° <i>{{ item.shownLow }}°</i></span
            >
          </template>
        </ForecastStrip>
      </div>

      <!-- 상세 페이지는 내비게이션에 항목이 없는 화면이라, 돌아가는 길을 본문에 둡니다. -->
      <footer class="wx-detail-foot">
        <button class="wx-action" @click="goList">← 목록으로 돌아가기</button>
      </footer>
    </template>

    <!-- ══════════ 없는 도시 코드로 들어온 경우 ══════════ -->
    <!-- 경로 패턴(/weather/:cityId)에는 맞으므로 404 로 가지 않습니다.
         "주소는 맞는데 그런 도시가 없다"는 다른 상황이라 여기서 안내합니다. -->
    <BaseDashboardCard v-else tag="section" class="wx-detail-missing">
      <p class="wx-label">Not in dataset</p>
      <p class="wx-detail-missing-text">
        도시 코드 <strong>{{ route.params.cityId }}</strong> 에 해당하는 관측 정보가 없습니다.
      </p>
      <button class="wx-action" @click="goList">목록으로 돌아가기</button>
    </BaseDashboardCard>
  </div>
</template>

<style scoped>
/* ════════════════════════════════════════════════════════════
   배치만 정합니다. 패널 테두리 · 캡션 · 버튼 · 색은 새로 만들지 않고
   BaseDashboardCard / .wx-label / .wx-action / .wx 테마 토큰을 그대로 씁니다.
   ════════════════════════════════════════════════════════════ */

/* 목록 화면(.wx-grid)과 같은 16px 리듬 */
.wx-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 패널 제목 — 히어로의 도시 이름과 같은 크기를 씁니다 */
.wx-detail-city {
  margin: 0;
  font-size: 26px;
  font-weight: 400;
}

/* 관측 지표 격자. 좁아지면 열이 알아서 줄어듭니다 (auto-fit) */
.wx-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 18px 12px;
  margin: 4px 0 0;
}

.wx-metric {
  min-width: 0;
}

/* dt 에 이미 .wx-label 이 붙어 아래 여백(14px)을 갖고 있어서,
   여기서는 그 여백을 줄여 숫자를 캡션 바로 아래 붙입니다. */
.wx-metric .wx-label {
  margin-bottom: 4px;
}

.wx-metric-value {
  margin: 0;
  font-size: 22px;
  white-space: nowrap;
}

/* 예보 두 벌 — 목록 화면의 .wx-forecasts 와 같은 규칙 */
.wx-detail-forecasts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
}

/* 예보 칸 내용물. 슬롯 콘텐츠는 부모 스코프에서 컴파일되므로
   ForecastStrip 의 scoped 스타일로는 닿지 않습니다. */
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

.wx-cell-val i {
  color: var(--dimmer);
  font-style: normal;
}

/* 없는 도시 안내 */
.wx-detail-missing {
  text-align: center;
}

.wx-detail-missing-text {
  margin: 0 0 20px;
  font-size: 15px;
}

.wx-detail-foot {
  display: flex;
  justify-content: center;
}

@media (max-width: 860px) {
  .wx-detail-forecasts {
    grid-template-columns: 1fr;
  }
}
</style>

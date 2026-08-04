<script setup>
import { ref, computed, watch, watchEffect, inject, onMounted } from 'vue'
import { useRouter } from 'vue-router'

// 컴포넌트 파일을 가져올 때는 파스칼 케이스(PascalCase)
import BaseDashboardCard from '@/components/mine/weather/BaseDashboardCard.vue'
import SearchBar from '@/components/mine/weather/SearchBar.vue'
import WeatherCard from '@/components/mine/weather/WeatherCard.vue'
import WeatherHero from '@/components/mine/weather/WeatherHero.vue'
import ForecastStrip from '@/components/mine/weather/ForecastStrip.vue'
import PixelIcon from '@/components/mine/icons/PixelIcon.vue'
import { cities } from '@/data/cities'

/* ════════════════════════════════════════════════════════════
   [3일차 과제] WeatherHomeView.vue — / 경로의 대시보드 (요구사항 3)
   2일차 원본: components/mine/weather/WeatherParent.vue.day2

   ── WeatherParent 를 대체하면서 달라진 것 ────────────────
   요구사항은 "WeatherParent 대체" 다. 파일 이름만 바꾼 게 아니라,
   WeatherParent 가 하던 두 가지 일 중 하나만 물려받았습니다.

     앱 껍데기(스플래시 · 테마 · 앱 바 · 단위 토글)  →  App.vue 로 올라감
     대시보드 화면(히어로 · 예보 · 검색 · 카드)      →  이 파일

   나눈 기준은 "주소가 바뀌면 사라져야 하는가" 다. /about 으로 갔을 때
   테마와 앱 바는 남아야 하고 카드 목록은 사라져야 합니다. 남아야 하는 것이
   App.vue, 사라져야 하는 것이 여기입니다.

   ── 그래서 이 파일에 남은 책임 ────────────────────────────
     · weatherList · 검색어 · 정렬 · 즐겨찾기 · 선택된 도시 — 이 화면의 상태
     · 자식이 올려보낸 이벤트를 받아 그 상태를 고치는 일
     · [요구사항 3] Details 버튼 → router.push 로 상세 페이지 이동

   상태를 바꾸는 코드는 여전히 이 파일 안에만 있습니다. 자식은 "무슨 일이
   있었는지"만 보고하고, 실제로 값을 고치는 건 언제나 부모입니다.
   ════════════════════════════════════════════════════════════ */

/* [요구사항 3] Programmatic Navigation 을 위한 라우터 인스턴스.
   템플릿의 <RouterLink> 는 "사용자가 누를 링크"고, 이건 "코드가 판단해서
   보내는 이동"입니다. 여기서는 자식 카드가 올려보낸 이벤트를 받아서
   가야 하므로 링크로는 못 하고 useRouter() 가 필요합니다. */
const router = useRouter()

/* [3일차 변경] 온도 단위는 이제 App.vue 가 쥐고 provide 합니다.
   2일차에는 이 자리에서 ref('C') 로 선언했지만, °C/°F 버튼이 앱 바로
   올라가면서 상태도 같이 따라갔습니다. 여기서는 읽기만 합니다.
   두 번째 인자는 이 화면을 단독으로 띄웠을 때의 기본값입니다. */
const tempUnit = inject('tempUnit', ref('C'))

/* ────────────────────────────────────────────────
   [1일차 요구사항 1] 배열 렌더링용 날씨 데이터
   [2일차 요구사항 1] 이 배열이 곧 반응형 상태(weatherList) 다.

   [3일차 변경] 데이터 자체는 src/data/cities.js 로 옮겼습니다.
   상세 페이지도 같은 데이터를 봐야 하는데, 여기 두면 그쪽에서
   가져다 쓸 방법이 없습니다.

   [...스프레드]로 복사해서 ref 에 담는 이유 — 아래 removeCity 가
   목록에서 도시를 지웁니다. 원본 배열을 그대로 넘기면 이 화면에서
   지운 도시가 import 한 모듈에서도 사라져, 상세 페이지가 "없는 도시"가
   됩니다. 원본은 원본대로 두고, 화면은 자기 복사본 위에서 움직입니다.
   ──────────────────────────────────────────────── */
const weatherList = ref([...cities])

/* ────────────────────────────────────────────────
   [2일차 요구사항 1] 반응형 상태 관리
   ──────────────────────────────────────────────── */
const selectedId = ref('city_01') // 히어로에 띄울 도시

// [2일차 요구사항 1] 검색어
// [2일차 컴포넌트 요구사항 3] 이 값이 SearchBar 로 내려가고(props), 타이핑은 emit 으로 되돌아옵니다.
const searchQuery = ref('')

// [2일차 요구사항 1] 선택된 도시 안내 문구
// [2일차 컴포넌트 요구사항 4] WeatherCard 의 select-card 이벤트가 이 값을 바꿉니다.
const selectedCityInfo = ref('Select a city card to begin.')

// [2일차 직접 추가] 반응형 변수 — 옷차림 추천 패널을 켤지 끌지
// 이 값 하나로 화면에서 패널이 사라졌다 나타났다 합니다.
// 템플릿에서는 v-if 가 아니라 v-show 로 묶었습니다. 사용자가 버튼을 누를 때마다
// 자주 켜고 끄는 자리라, DOM 을 지웠다 다시 만드는 v-if 보다
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

// SearchBar 가 defineExpose 로 열어 준 메서드를 잡기 위한 템플릿 ref
const searchBar = ref(null)

/* [3일차 변경] 검색창 자동 포커스가 이 파일로 내려왔습니다.
   2일차에는 App 쪽(당시 WeatherParent)이 스플래시를 걷은 뒤 nextTick 으로
   기다렸다가 포커스를 줬습니다. 이제 SearchBar 는 RouterView 안쪽에 있어
   App.vue 에서는 닿지 않습니다.

   대신 더 간단해졌습니다 — App.vue 의 v-else(=셸)가 켜지는 그 순간이
   이 화면이 mount 되는 시점이라, 여기서는 그냥 onMounted 면 됩니다.
   이미 DOM 이 붙은 뒤 호출되는 훅이라 nextTick 도 필요 없습니다. */
onMounted(() => {
  searchBar.value?.focus()
})

/* ────────────────────────────────────────────────
   [2일차 요구사항 2] computed 파생 값
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
// [3일차] tempUnit 은 이제 App.vue 에서 inject 로 받아 온 ref 지만, 감시하는 쪽 코드는
// 그대로입니다. watch 는 "이게 어디서 왔는지"가 아니라 "ref 인지"만 봅니다.
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

/* ════════════════════════════════════════════════════════════
   [3일차 요구사항 3] 상세보기 — window.alert() 제거, 라우터로 이동

   2일차에는 이랬습니다:
     const showDetail = (cityName, status) => {
       window.alert(`${cityName}의 현재 날씨는 [${status}] 상태입니다.`)
     }

   alert 의 문제는 못생긴 것이 아니라, 그게 "화면"이 아니라는 점입니다.
   주소가 없으니 링크로 공유할 수도, 뒤로 가기로 돌아올 수도, 새로고침으로
   같은 내용을 다시 볼 수도 없습니다. 게다가 브라우저 전체가 멈춰 섭니다.

   router.push 로 바꾸면 그 전부가 해결됩니다. 주소창에 /weather/city_01 이
   찍히고, 뒤로 가기가 동작하고, 그 주소를 그대로 붙여넣으면 같은 화면이 뜹니다.

   ── push vs replace ──
   push 는 방문 기록에 한 칸 쌓고, replace 는 지금 칸을 덮어씁니다.
   여기서는 "목록에서 상세로 들어갔다"가 기록에 남아야 뒤로 가기로
   목록에 돌아올 수 있으므로 push 가 맞습니다.
   ════════════════════════════════════════════════════════════ */
const showDetail = (city) => {
  selectedCityInfo.value = `${city.name} 상세 정보로 이동합니다.`
  router.push(`/weather/${city.id}`)
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
</script>

<template>
  <!-- [3일차] .wx 테마 래퍼와 앱 바는 App.vue 로 올라갔습니다.
       이 화면은 이제 "본문"만 그립니다. -->
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
        <!-- [3일차 변경] @click-detail 이 이제 도시 객체를 통째로 받습니다.
             2일차에는 (이름, 상태) 두 개를 받아 alert 문장을 만들었지만,
             라우터로 보내려면 필요한 건 id 입니다. 다른 이벤트들(select-card ·
             remove-card · toggle-favorite)이 전부 cityItem 을 올려보내고 있어서,
             거기에 맞춰 WeatherCard 쪽 emit 도 통일했습니다. -->
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

    <!-- [1일차 요구사항 4] 상태바 — 자식이 올려보낸 이벤트의 최종 결과가 여기 찍힙니다.
         [3일차] 앱 바와 달리 이건 "이 화면에서 무슨 일이 있었는지"를 적는 자리라
         App.vue 로 올리지 않고 여기 남겼습니다. /about 에 상태바가 있으면 이상합니다. -->
    <footer class="wx-statusbar">
      <PixelIcon :name="current.icon" :size="18" />
      <p>{{ selectedCityInfo }}</p>
    </footer>
  </div>
</template>

<style scoped>
/* ════════════════════════════════════════════════════════════
   [과제 요구사항 5·6] 이 화면이 책임지는 디자인만 scoped 로 남깁니다.
   패널 / 검색 / 카드 / 히어로 / 예보칸 의 스타일은 각 .vue 파일로 옮겼고,
   스플래시 / 셸 / 앱 바 는 App.vue 로 올라갔습니다.
   여기 남은 것은 "이 화면의 배치" 뿐입니다.
     · 2단 그리드 · 우측 열 · 카드 격자 · 예보 배치 · 상태바
     · 그리고 슬롯으로 내려보낸 예보 칸 내용물 (아래 [4] 참고)
   ════════════════════════════════════════════════════════════ */

/* ── [1] 그리드 ───────────────────────────────────────────── */
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

/* [3일차 추가] 상태바는 그리드의 마지막 줄에서 전체 폭을 씁니다.
   2일차에는 .wx-grid 바깥(셸 바로 밑)에 있었지만, 셸이 App.vue 로
   올라가면서 이 화면의 그리드 안으로 들어왔습니다. */
.wx-grid > .wx-statusbar {
  grid-column: 1 / -1;
  grid-row: 3;
}

/* ── [2] 우측 열 ──────────────────────────────────────────── */
.wx-side {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ── [3] 카드 격자 ────────────────────────────────────────── */
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

/* ── [4] 예보 배치 ────────────────────────────────────────── */
/* margin-top 을 뺐습니다. 이제 .wx-grid 안에 들어가 있어서
   위쪽 간격은 그리드의 gap(16px)이 이미 만들어 줍니다.
   그대로 두면 간격이 32px 로 두 배가 됩니다. */
.wx-forecasts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
}

/* ── [5] 예보 칸 내용물 ───────────────────────────────────── */
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

/* ── [6] 상태바 ───────────────────────────────────────────── */
.wx-statusbar {
  display: flex;
  align-items: center;
  gap: 10px;
  /* [3일차] margin-top 을 뺐습니다. 그리드 안으로 들어와서
     위쪽 간격은 gap(16px)이 이미 만들어 줍니다. */
  padding: 15px 20px;
  /* 상태바도 한글 문장("서울이 선택되었습니다")이 들어가는 자리라 15px. */
  font-size: 15px;
  border: 1px solid var(--line);
  border-radius: 999px;
}

.wx-statusbar p {
  margin: 0;
}

/* ── [7] 좁은 화면 보정 ───────────────────────────────────── */
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
  .wx-grid > .wx-forecasts,
  .wx-grid > .wx-statusbar {
    grid-column: auto;
    grid-row: auto;
  }

  /* 이 폭에서 예보를 2열로 두면 한 칸이 50px 남짓이라 날짜·온도가 잘립니다 */
  .wx-forecasts {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
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

import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { cities, makePlaceholderCity } from '@/data/cities'
import { registerCities } from '@/api/weather'

/* ════════════════════════════════════════════════════════════
   cityStore — 이 앱이 보여 주는 도시 목록

   ── 왜 생겼나 ────────────────────────────────────────────
   전에는 도시가 data/cities.js 에 손으로 적어 둔 20곳으로 고정이었습니다.
   그래서 이 앱은 "누가 골라 준 20개 도시" 였습니다.
   검색으로 아무 지역이나 담을 수 있게 되면서, 목록이 사용자마다 달라지는
   값이 됐습니다 — 고정 표가 아니라 상태입니다.

   ── store 로 올린 판단 ───────────────────────────────────
   두 질문 중 하나라도 '예' 여야 store 로 갑니다. (둘 다 아니면 그냥 ref)

     1) 화면보다 오래 살아야 하는가?
        예 — 담아 둔 도시가 새로고침으로 사라지면 담는 의미가 없습니다.

     2) 트리로 이어지지 않는 두 곳 이상이 쓰는가?
        예 — 목록 화면이 카드를 그리고, 상세 화면(/weather/:cityId)이
        "그런 도시가 있는가" 를 판단합니다. 둘은 형제 화면입니다.

   ── 기본 20곳은 왜 여기 안 담나 ──────────────────────────
   담지 않습니다. 그건 바뀌지 않는 표라 상태가 아닙니다.
   state 에는 "사용자가 담은 것" 만 두고, 화면에 나갈 전체 목록은
   getter 에서 둘을 합쳐 만듭니다. 그래야 localStorage 에 20곳을
   통째로 복사해 두는 낭비가 없고, 나중에 기본 도시를 하나 고쳐도
   저장된 옛 값이 화면을 덮어쓰지 않습니다.
   ════════════════════════════════════════════════════════════ */

const STORAGE_KEY = 'wx-custom-cities'

/* 저장해 두는 것은 좌표와 이름뿐입니다. 기온 · 예보는 담지 않습니다 —
   저장하는 순간 옛 날씨가 되고, 어차피 앱을 켤 때 다시 받아 옵니다. */
const loadCustom = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (!Array.isArray(saved)) return []
    // 필요한 열쇠가 다 있는 것만 통과시킵니다. 하나라도 없으면 조회가 터집니다.
    return saved.filter((c) => c && c.id && c.name && typeof c.lat === 'number' && typeof c.lon === 'number')
  } catch {
    return []
  }
}

export const useCityStore = defineStore('city', () => {
  /* ── [state] ─────────────────────────────────────────────
     검색으로 담은 도시들. { id, name, region, lat, lon } 만 있습니다. */
  const customCities = ref(loadCustom())

  /* ── [getters] ───────────────────────────────────────────
     화면에 나갈 전체 목록 = 기본 20곳 + 담은 곳.

     담은 도시는 자리표(makePlaceholderCity)로 만듭니다. 실제 날씨는
     화면이 mount 되면서 API 로 덮어씁니다. 자리표가 없으면 응답이
     오기 전까지 카드가 빈 상자로 남습니다. */
  const allCities = computed(() => [...cities, ...customCities.value.map(makePlaceholderCity)])

  // 이 도시가 검색으로 담은 것인가. 카드에 삭제 버튼을 띄울지 정할 때 씁니다.
  const isCustom = computed(() => (cityId) => customCities.value.some((c) => c.id === cityId))

  // 상세 화면이 "그런 도시가 있는가" 를 물을 때. 없으면 undefined.
  const findById = computed(() => (cityId) => allCities.value.find((c) => c.id === cityId))

  /* ── [actions] ───────────────────────────────────────────
     검색 결과 한 건을 목록에 담습니다.

     이미 있으면 아무 일도 하지 않고 false 를 돌려줍니다 — 화면이
     "이미 담긴 도시입니다" 라고 안내할 수 있게. 좌표가 곧 id 라
     같은 지점을 두 번 담는 일이 자연스럽게 막힙니다. */
  function addCity(place) {
    const exists = allCities.value.some((c) => c.id === place.id)
    if (exists) return false

    const { id, name, region, lat, lon } = place
    const city = { id, name, region, lat, lon }

    customCities.value = [...customCities.value, city]

    /* ⚠️ 여기서 곧바로 등록합니다. 아래 watch 도 같은 일을 하지만
       Vue 의 watch 는 기본이 비동기(다음 틱)입니다. 화면은 담자마자
       그 도시의 날씨를 부르는데, 그 시점에는 아직 등록 전이라
       "알 수 없는 도시 코드" 로 실패했습니다.
       watch 는 저장과 이후 변경을 맡고, 방금 담은 것만 여기서 즉시 알립니다. */
    registerCities([city])

    return true
  }

  /* 담은 도시를 뺍니다. 기본 20곳은 여기 없으므로 지워지지 않습니다 —
     "내가 담은 것만 지울 수 있다" 가 자료 구조로 보장됩니다. */
  function removeCity(cityId) {
    customCities.value = customCities.value.filter((c) => c.id !== cityId)
  }

  /* ── 저장 · 조회 등록 ────────────────────────────────────
     한 번의 watch 가 두 가지를 합니다.
       1) localStorage 에 저장 — 새로고침해도 남게
       2) api/weather.js 에 좌표를 알려 주기 — 조회가 되게

     immediate: true 가 중요합니다. 앱을 켤 때 localStorage 에서 읽어 온
     도시들도 곧바로 등록돼야, 첫 조회(fetchAllCities)에 함께 실립니다. */
  watch(
    customCities,
    (list) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
      registerCities(list)
      console.log(`📍 [store] 담은 도시 ${list.length}곳`, list.map((c) => c.name).join(' · '))
    },
    { deep: true, immediate: true },
  )

  return { customCities, allCities, isCustom, findById, addCity, removeCity }
})

import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'

/* ════════════════════════════════════════════════════════════
   favoriteStore — 즐겨찾기한 도시 목록

   ── 왜 화면에서 store 로 옮겼나 ──────────────────────────
   2일차부터 이 값은 WeatherHomeView 의 ref 였습니다. 그때는 즐겨찾기를
   쓰는 곳이 그 화면 하나뿐이라 맞는 자리였습니다.

   지금은 사정이 다릅니다.
     · 도시 상세(/weather/:cityId)에서도 별을 누를 수 있어야 자연스럽고
     · 새로고침해도 남아야 하는 값이라 localStorage 와 짝을 이룹니다

   화면이 소유하면 그 화면을 떠날 때마다 값이 사라지고, 화면마다 같은
   localStorage 코드를 다시 적어야 합니다. store 는 컴포넌트 트리 밖에
   있어서 누구의 조상도 아니고, 필요한 쪽이 useFavoriteStore() 로 직접
   집어 옵니다. (configStore 를 만들 때와 같은 이유입니다)

   ── store 로 올린 판단 ───────────────────────────────────
   두 질문 중 하나라도 '예' 여야 store 로 갑니다. (둘 다 아니면 그냥 ref)

     1) 화면보다 오래 살아야 하는가?
        예 — 새로고침해도 남아야 해서 localStorage 와 짝을 이룹니다.
        저장하는 watch 가 화면에 있으면 그 화면이 떠 있는 동안에만 저장됩니다.

     2) 트리로 이어지지 않는 두 곳 이상이 쓰는가?
        예 — 목록 화면이 읽고, 나중에 상세 화면에서도 별을 누를 수 있어야 합니다.

   ── 순서가 곧 의미입니다 ────────────────────────────────
   이 배열은 "무엇이 즐겨찾기인가" 만이 아니라 "어떤 순서인가" 까지
   담습니다. 최근에 담은 것이 앞이고, 맨 앞이 대표 도시(앱을 켜면
   히어로에 뜨는 곳)입니다. 그래서 별을 다시 누르는 것만으로 순서를
   바꿀 수 있습니다.

   ── Setup Store 문법 · 세 칸 ─────────────────────────────
     ref()      → state    지금 무엇이 어떤 순서로 즐겨찾기인가
     computed() → getters  그 값에서 파생되는 것 (개수 · 포함 여부)
     function   → actions  값을 바꾸는 유일한 통로 (별 누르기)

   ⚠️ state 를 밖에서 직접 대입할 수도 있지만 그러지 않습니다. 통로를
      actions 로 좁혀 두면 "어디서 이 값이 바뀌었나"를 이 파일 안에서만
      찾으면 됩니다.
   ════════════════════════════════════════════════════════════ */

/* 저장 키를 store 밖(모듈 최상위)에 둔 이유 — 바뀌지 않는 상수라
   store 인스턴스마다 새로 만들 필요가 없습니다. */
const STORAGE_KEY = 'wx-favorite-cities'

/* 새로고침해도 남아야 하는 값이라 localStorage 에서 초깃값을 읽어 옵니다.
   JSON.parse 는 저장된 문자열이 깨져 있으면 예외를 던지므로 try 로 감쌌습니다.
   (사용자가 개발자도구로 값을 건드렸을 때 앱 전체가 죽는 걸 막습니다)
   Array.isArray 로 한 번 더 거르는 이유 — 파싱은 됐지만 배열이 아닌 값
   (null · 숫자 · 객체)이 들어 있으면 아래 includes 에서 터집니다. */
const loadFavorites = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

export const useFavoriteStore = defineStore('favorite', () => {
  /* ── [state] ─────────────────────────────────────────────
     도시 객체가 아니라 id 만 담습니다. 객체를 담으면 API 응답이 새로
     와서 기온이 바뀔 때마다 즐겨찾기 안의 값이 옛 기온인 채로 남습니다.
     "무엇을 즐겨찾기했는가"는 id 하나면 충분하고, 나머지는 목록에서
     그때그때 찾아 쓰면 됩니다. */
  const favoriteIds = ref(loadFavorites())

  /* ── [getters] ───────────────────────────────────────────
     화면에 "즐겨찾기 3" 처럼 보여 주는 개수. 목록이 바뀔 때만 다시 셉니다. */
  const favoriteCount = computed(() => favoriteIds.value.length)

  /* 대표 도시 — 가장 최근에 즐겨찾기한 곳.

     따로 저장하지 않고 목록의 첫 칸을 그대로 씁니다. 별도로 들고 있으면
     "즐겨찾기를 해제했는데 대표는 그대로" 같은 어긋남을 직접 막아 줘야
     합니다. 순서가 이미 그 답을 갖고 있으면 어긋날 일이 없습니다.
     아무것도 없으면 null — 화면이 기본 도시로 받칩니다. */
  const topFavoriteId = computed(() => favoriteIds.value[0] ?? null)

  /* 즐겨찾기 안에서의 순서. 목록 정렬이 이 값을 씁니다.
     즐겨찾기가 아니면 Infinity 를 돌려줘서 자연히 뒤로 밀립니다 —
     "아님" 을 -1 로 두면 정렬식에서 맨 앞으로 와 버립니다. */
  const favoriteRank = computed(() => (cityId) => {
    const index = favoriteIds.value.indexOf(cityId)
    return index === -1 ? Infinity : index
  })

  /* 이 도시가 즐겨찾기인지.

     computed 는 인자를 받을 수 없는데 이 값은 도시마다 달라집니다.
     그래서 "함수를 돌려주는 getter" 로 두었습니다 — Pinia 문서가 인자
     받는 getter 를 만들 때 권하는 모양입니다.

     ⚠️ 이 방식은 캐싱되지 않습니다. 바깥 computed 는 함수를 한 번 만들어
        들고 있을 뿐이고, favoriteIds 를 실제로 읽는 것은 돌려받은 함수를
        부르는 순간입니다. 그 읽기는 함수를 부른 쪽(예: sortedWeatherList
        computed)의 의존성으로 잡히므로, 즐겨찾기가 바뀌면 그쪽이 다시
        계산됩니다. 반응성은 그대로 살아 있고 캐싱만 없습니다.
        도시 20개짜리 includes 라 그 비용은 문제가 되지 않습니다. */
  const isFavorite = computed(() => (cityId) => favoriteIds.value.includes(cityId))

  /* ── [actions] ───────────────────────────────────────────
     별을 눌렀을 때. 이미 있으면 빼고, 없으면 더합니다.

     ⚠️ 새로 담는 것을 뒤가 아니라 맨 앞에 붙입니다.
        이 배열의 순서가 곧 화면의 순서이고, 첫 칸이 곧 대표 도시입니다.
        그래서 "위로 올리고 싶으면 다시 즐겨찾기" 라는 규칙이 성립합니다 —
        별을 껐다 켜면 그 도시가 맨 앞으로 옵니다. 순서를 바꾸는 UI 를
        따로 만들지 않고도 사용자가 순서를 정할 수 있습니다.
        (핀을 따로 두었다가 걷어낸 이유이기도 합니다. 별 하나로 '자주 봄'과
         '대표' 를 함께 표현하면 카드에 아이콘이 둘 있을 이유가 없습니다)

     filter / [...스프레드] 로 매번 새 배열을 만들어 대입합니다.
     push/unshift 로 원본을 고치는 것보다 코드가 길지만, "이전 목록"과
     "새 목록"이 서로 다른 객체라 아래 watch 가 확실히 잡고,
     되돌리기(undo) 같은 걸 붙이기도 쉽습니다.

     돌려주는 boolean 은 "지금 켜졌는가" 입니다. 화면이 상태바 문구를
     고를 때 씁니다 — 바꾼 쪽이 결과를 알려 주지 않으면, 부른 쪽은
     값을 다시 읽어 보고 판단해야 합니다. */
  function toggleFavorite(cityId) {
    const willBeFavorite = !favoriteIds.value.includes(cityId)

    favoriteIds.value = willBeFavorite ? [cityId, ...favoriteIds.value] : favoriteIds.value.filter((id) => id !== cityId)

    return willBeFavorite
  }

  /* ── 저장 ────────────────────────────────────────────────
     목록이 바뀔 때마다 localStorage 에 씁니다.

     이 watch 를 화면이 아니라 store 안에 둔 것이 이번 이사의 핵심입니다.
     화면에 있으면 "그 화면이 떠 있는 동안에만" 저장됩니다. 상세 화면에서
     별을 눌렀는데 저장이 안 되는 식의 구멍이 생깁니다.

     deep: true 가 필요한 이유 — favoriteIds 는 배열이라, push/splice 로
     안을 고치면 ref 가 가리키는 배열 "주소"는 그대로입니다. 얕은 감시로는
     변화를 못 잡습니다. (위 actions 는 새 배열을 만들어 대입하므로 사실
     deep 없이도 잡히지만, 나중에 push 로 바꿔 쓰더라도 저장이 조용히
     멈추지 않도록 켜 두었습니다) */
  watch(
    favoriteIds,
    (ids) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
      console.log(`⭐ [store] 즐겨찾기 ${ids.length}개 저장됨 →`, ids)
    },
    { deep: true },
  )

  return { favoriteIds, favoriteCount, topFavoriteId, favoriteRank, isFavorite, toggleFavorite }
})

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

/* ════════════════════════════════════════════════════════════
   [4일차 과제] configStore — 온도 단위를 앱 전체가 공유하는 자리

   ── 왜 store 로 옮겼나 ────────────────────────────────────
   3일차까지는 이 값이 App.vue 의 ref 였고, provide/inject 로 후손에게
   내려보냈습니다. 그때는 그게 맞았습니다 — 값을 쥔 App.vue 가 모든 화면의
   조상이라, 후손은 어디서든 inject 로 꺼낼 수 있었으니까요.

   provide/inject 의 한계는 "조상-후손" 관계가 있어야만 통한다는 점입니다.
   단위를 바꾸는 UI 가 앱 바가 아닌 곳으로 옮겨가거나, 라우터 가드처럼
   컴포넌트 트리 밖에 있는 코드가 이 값을 읽어야 하면 손이 닿지 않습니다.

   store 는 트리 밖에 있습니다. 누구의 조상도 아니라서, 필요한 쪽이
   useConfigStore() 로 직접 집어 옵니다. 화면 구조가 바뀌어도 영향이 없습니다.

   ── store 로 올린 판단 ───────────────────────────────────
   두 질문 중 하나라도 '예' 여야 store 로 갑니다. (둘 다 아니면 그냥 ref)

     1) 화면보다 오래 살아야 하는가?
        예 — 목록에서 ℉ 로 보다가 상세로 들어가도 ℃ 로 되돌아가면 안 됩니다.

     2) 트리로 이어지지 않는 두 곳 이상이 쓰는가?
        예 — 앱 바(UnitToggler) · 히어로 · 카드 · 상세 화면. 특히 앱 바와
        카드는 조상-후손 관계가 아니라 props 로는 이어지지 않습니다.

   ── Setup Store 문법 ──────────────────────────────────────
   defineStore 의 두 번째 인자로 함수를 넘기는 방식(Setup Store)을 썼습니다.
   <script setup> 안에서 쓰던 문법이 그대로 통합니다.
     ref()      → state
     computed() → getters
     function   → actions
   객체를 넘기는 Option Store 방식도 있지만, 이미 익숙한 문법을 그대로
   쓸 수 있어서 이쪽을 골랐습니다.
   ════════════════════════════════════════════════════════════ */
export const useConfigStore = defineStore('config', () => {
  /* [state] 단위를 저장하는 변수. 초기값은 섭씨.
     값은 'celsius' 또는 'fahrenheit' 둘 중 하나만 가집니다.
     true/false 로 두지 않은 이유 — 나중에 켈빈이 늘어나도 문자열이면
     값 하나만 추가하면 되지만, boolean 이면 구조를 통째로 갈아야 합니다. */
  const unit = ref('celsius')

  /* [getters] 화면에 찍을 기호. ℃ / ℉ 는 각각 한 글자짜리 유니코드입니다.
     ('°' + 'C' 두 글자가 아닙니다)

     이걸 store 에 둔 이유 — 기호를 쓰는 곳이 히어로 · 카드 두 군데인데,
     각자 삼항 연산자를 쓰면 나중에 표기를 '°C' 로 바꿀 때 두 곳을 고쳐야
     합니다. 파생되는 값은 원본 옆에 두는 편이 안전합니다. */
  const unitSymbol = computed(() => (unit.value === 'celsius' ? '℃' : '℉'))

  /* [actions] 두 값을 오가는 토글.
     이 함수가 unit 을 바꾸는 유일한 통로입니다. 밖에서 store.unit 에
     직접 대입할 수도 있지만, 그러면 'C' 같은 엉뚱한 값이 들어가도
     아무도 못 막습니다. 통로를 하나로 좁혀 두면 잘못된 값 자체가
     생기지 않습니다. */
  function toggleUnit() {
    unit.value = unit.value === 'celsius' ? 'fahrenheit' : 'celsius'
  }

  return { unit, unitSymbol, toggleUnit }
})

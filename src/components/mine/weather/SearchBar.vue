<script setup>
import { ref } from 'vue'
import MonoIcon from '@/components/mine/icons/MonoIcon.vue'

/* ════════════════════════════════════════════════════════════
   [과제 요구사항 3] SearchBar.vue
     · 부모로부터 검색 도시 반응형 데이터를 전달받아 표시   → props
     · 도시 검색 시 update-query 이벤트로 검색어를 부모에게 → emits

   [1일차 요구사항 3] 의 양방향 바인딩이 컴포넌트 경계를 넘어간 형태다.
   v-model 을 쓰면 한 줄로 끝나지만, 그러면 Props ↓ / Emits ↑ 흐름이
   문법 뒤에 숨어 버리므로 과제 취지대로 :value + @input 으로 직접 짰다.
   ════════════════════════════════════════════════════════════ */

/* ────────────────────────────────────────────────
   [Props · 하행선] 부모 → 자식
   currentQuery 는 읽기 전용이다. 자식이 직접 대입하면 ReadOnly 에러가 난다.
   그래서 값을 바꾸고 싶을 때는 아래 emit 으로 "요청"만 올려보낸다.
   ──────────────────────────────────────────────── */
defineProps({
  // 부모가 들고 있는 검색어. input 의 :value 로 되돌려 넣어야
  // 한글 조합(초성·중성·종성)이 중간에 끊기지 않는다.
  currentQuery: {
    type: String,
    default: '',
  },
  // [지시 외 추가] 캡션과 placeholder 까지 props 로 빼 두면
  // 이 컴포넌트를 "도시 검색" 말고 다른 검색에도 그대로 재사용할 수 있다.
  label: {
    type: String,
    default: 'Search City',
  },
  placeholder: {
    type: String,
    default: '한글로 입력해 보세요 (예: 서울)',
  },
})

/* ────────────────────────────────────────────────
   [Emits · 상행선] 자식 → 부모
   이벤트 타입명은 관례대로 kebab-case.
   ──────────────────────────────────────────────── */
const emit = defineEmits(['update-query'])

// [지시 외 추가] defineExpose 실습.
// <script setup> 은 기본적으로 내부가 전부 닫혀 있어서 부모가 자식의 함수를
// 호출할 수 없다. 꼭 열어야 하는 것만 골라서 내보내는 매크로가 defineExpose 다.
const inputEl = ref(null)
const focus = () => inputEl.value?.focus()
defineExpose({ focus })

// 입력값을 가공하지 않고 그대로 올려보낸다. (한글 조합 중 글자가 깨지지 않는 이유)
const onInput = (event) => {
  emit('update-query', event.target.value)
}

// 지우기 버튼 — 빈 문자열을 올려보내면 부모의 searchQuery 가 비워진다.
// 지운 뒤 커서를 입력창에 돌려놔야 바로 다시 칠 수 있다.
const onClear = () => {
  emit('update-query', '')
  focus()
}
</script>

<template>
  <div class="wx-search-inner">
    <label class="wx-label" for="citySearch">{{ label }}</label>

    <div class="wx-search-field">
      <!-- [1일차 요구사항 3] :value 로 내려받고 @input 으로 되돌려 준다 -->
      <input id="citySearch" ref="inputEl" type="text" class="wx-search-input" :placeholder="placeholder" autocomplete="off" :value="currentQuery" @input="onInput" />

      <button v-if="currentQuery" class="wx-icon-btn" aria-label="Clear" @click="onClear">
        <MonoIcon name="close" :size="14" />
      </button>
    </div>

    <!-- 부모가 들고 있는 검색어를 그대로 되돌려 출력 = Props 가 살아 있다는 증거 -->
    <p class="wx-echo">
      Query
      <strong v-if="currentQuery">{{ currentQuery }}</strong>
      <span v-else class="wx-echo-empty">—</span>
    </p>
  </div>
</template>

<style scoped>
/* [과제 요구사항 6] 검색 영역의 디자인만 이 파일이 책임진다. */
.wx-search-field {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 2px 10px;
  border-bottom: 1px solid var(--line-hi);
  transition: border-color 0.2s;
}

/* 입력창이 아니라 "줄"에 포커스 표시를 준다 (원본 목업 규칙) */
.wx-search-field:focus-within {
  border-bottom-color: var(--fg);
}

.wx-search-input {
  flex: 1;
  min-width: 0;
  padding: 0;
  color: var(--fg);
  font: inherit;
  font-size: 19px;
  background: none;
  border: 0;
  outline: none;
}

.wx-search-input::placeholder {
  color: var(--dimmer);
}

/* "QUERY" 라벨. 넓은 자간 + 대문자는 라틴 캡션에만 어울리므로,
   실제 한글 검색어가 들어가는 strong 에서는 아래처럼 전부 되돌린다. */
.wx-echo {
  margin: 14px 0 0;
  color: var(--dim);
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.wx-echo strong {
  margin-left: 10px;
  color: var(--fg);
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 0.02em;
  text-transform: none;
}

.wx-echo-empty {
  margin-left: 10px;
  color: var(--dimmer);
}
</style>

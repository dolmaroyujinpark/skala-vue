<script setup>
import { watch } from 'vue'
import MonoIcon from '@/components/mine/icons/MonoIcon.vue'
import { useRadioStore } from '@/stores/radioStore'

/* ════════════════════════════════════════════════════════════
   WeatherRadio.vue — 히어로 안의 재생 조작 줄 (버튼 세 개 + 한 줄)

   소리는 여기서 나지 않습니다. 실제 재생기(RadioEngine)는 App.vue 에
   있고, 이 컴포넌트는 store 를 통해 신호만 보냅니다. 그래서 화면을
   옮겨 다녀도 음악이 끊기지 않습니다.

   ── 디자인 원칙: 아무것도 새로 만들지 않기 ───────────────
   이 앱은 "채우지 않습니다 · 캡션은 작게 대문자 자간 넓게 · 선은 1px".
   음악 플레이어는 보통 알약 버튼과 진행 바를 달고 오는데, 그걸 그대로
   두면 히어로에서 이 줄만 다른 앱처럼 보입니다. 그래서 바로 위
   Outfit 버튼과 똑같은 말투 — 테두리도 배경도 없이, 색(--dim → --fg)
   으로만 상태를 알리는 캡션 줄로 만들었습니다.
   진행 바와 시간 표시는 넣지 않았습니다. 세 시간짜리 플레이리스트라
   숫자가 아무 의미도 없고, 히어로에 눈금이 하나 더 생길 뿐입니다.

   ── props 는 날씨만 받습니다 ─────────────────────────────
   재생 상태는 store 에서 직접 집어 옵니다(UnitToggler 와 같은 방식).
   부모(WeatherHero)는 음악에 대해 아무것도 모르고, 알 필요도 없습니다.
   여기서 필요한 것은 "지금 어떤 하늘인가" 뿐입니다.
   ════════════════════════════════════════════════════════════ */
const props = defineProps({
  // 화면에 보이는 상태 문구 ('빗방울' · '햇살 가득' …)
  status: { type: String, default: '' },
  // rain / cloud / sun — 상태 문구가 낯설 때의 안전망
  icon: { type: String, default: 'sun' },
})

const radio = useRadioStore()

/* 도시를 바꾸거나 API 응답이 도착하면 그 하늘에 맞는 목록으로 갈아탑니다.
   immediate: true 라 첫 렌더에도 한 번 돕니다 — 컴포넌트가 붙자마자
   맞는 플레이리스트 이름이 보여야 하기 때문입니다.

   같은 갈래로 옮길 때 듣던 곡이 처음으로 되감기지 않는 것은 store 가
   막아 줍니다(syncMood). 서울 → 판교 둘 다 맑음이면 아무 일도 없습니다. */
watch(
  () => [props.status, props.icon],
  ([status, icon]) => radio.syncMood(status, icon),
  { immediate: true },
)
</script>

<template>
  <div class="wx-radio">
    <!-- 조작 줄. 이전/다음은 곡이 하나뿐인 목록에서도 의미가 있도록 늘 둡니다
         (목록 끝에서 처음으로 되돌아옵니다) -->
    <div class="wx-radio-transport">
      <button class="wx-radio-btn" aria-label="이전 곡" @click="radio.prev()">
        <MonoIcon name="prev" :size="19" :width="1.4" />
      </button>

      <!-- 하나의 버튼이 재생과 정지를 겸합니다. 지금 상태가 아니라
           "누르면 무엇이 되는지"를 그립니다 — 재생 중이면 ❚❚ -->
      <button class="wx-radio-btn is-main" :class="{ 'is-on': radio.isPlaying }" :aria-label="radio.isPlaying ? '일시정지' : '재생'" @click="radio.toggle()">
        <MonoIcon :name="radio.isPlaying ? 'pause' : 'play'" :size="26" :width="1.3" />
      </button>

      <button class="wx-radio-btn" aria-label="다음 곡" @click="radio.next()">
        <MonoIcon name="next" :size="19" :width="1.4" />
      </button>
    </div>

    <!-- 지금 걸린 목록. 재생 중에는 왼쪽 이퀄라이저가 움직이고 글자가 밝아집니다. -->
    <p class="wx-radio-now" :class="{ 'is-on': radio.isPlaying }">
      <!-- 막대 세 개. 재생 중이 아닐 때도 자리는 차지합니다 —
           보일 때만 만들면 글자가 옆으로 밀립니다. -->
      <span class="wx-radio-eq" aria-hidden="true">
        <i></i><i></i><i></i>
      </span>
      <span class="wx-radio-mood">{{ radio.playlist.caption }}</span>
      <!-- [8일차 과제] Element Plus 적용 — el-tooltip.
           제목이 길면 줄임표로 잘립니다. 전에는 title 속성을 썼는데, 그건
           브라우저가 그리는 OS 툴팁이라 이 앱의 톤과 무관하게 뜹니다.
           el-tooltip 은 색도 테두리도 앱 토큰을 따릅니다. -->
      <el-tooltip :content="radio.track.title" placement="top" :teleported="false" :show-after="400">
        <span class="wx-radio-title">{{ radio.track.title }}</span>
      </el-tooltip>
    </p>
  </div>
</template>

<style scoped>
/* 세로 두 줄 — 히어로 폭이 340px 이라 버튼과 제목을 한 줄에 두면
   제목이 늘 잘립니다. 아이콘 줄과 글자 줄로 나눴습니다.
   가운데/왼쪽 정렬은 부모(WeatherHero)가 정합니다 — 태블릿 폭에서 히어로가
   가로로 누우면 이 줄도 함께 왼쪽으로 붙어야 하기 때문입니다. */
.wx-radio {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  max-width: 100%;
  margin-top: 24px;
}

.wx-radio-transport {
  display: flex;
  align-items: center;
  gap: 22px;
}

/* Outfit 버튼과 같은 규칙 — 채우지 않고, 색으로만 말합니다. */
.wx-radio-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  color: var(--dimmer);
  background: none;
  border: 0;
  cursor: pointer;
  transition: 0.2s;
}

.wx-radio-btn:hover {
  color: var(--fg);
}

/* 가운데 ▶ 는 이 줄의 주인공이라 한 단계 밝게 시작합니다.
   테두리(원·알약)는 두르지 않습니다 — 히어로에는 이미 HOT 배지라는
   테두리 도형이 하나 있어서, 그 바로 아래 또 두르면 둘이 겹쳐 보입니다.
   크기와 밝기 차이만으로 충분히 주인공이 됩니다. */
.wx-radio-btn.is-main {
  color: var(--dim);
}

.wx-radio-btn.is-main.is-on {
  color: var(--fg);
}

.wx-radio-now {
  display: flex;
  align-items: center;
  gap: 9px;
  max-width: 100%;
  margin: 0;
  color: var(--dim);
  font-size: 12px;
  letter-spacing: 0.04em;
  transition: color 0.2s;
}

.wx-radio-now.is-on {
  color: var(--dim);
}

/* 갈래 이름(RAINY)만 캡션 말투 — 앱 전체의 .wx-label 과 같은 규칙 */
.wx-radio-mood {
  flex: none;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

/* 제목은 한글이라 자간을 넓히지 않습니다. 넘치면 줄임표.
   min-width: 0 이 없으면 flex 항목이 내용만큼 버텨서 줄임표가 안 생깁니다. */
.wx-radio-title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 제목 앞의 가운뎃점 — 마크업에 문자를 직접 넣지 않고 CSS 로 그립니다.
   화면에는 보이지만 스크린 리더나 복사에는 끼어들지 않습니다. */
.wx-radio-title::before {
  content: '·';
  margin-right: 8px;
}

/* ── 이퀄라이저 ──────────────────────────────────────────
   재생 중이라는 것을 알리는 유일한 장식입니다. 아이콘을 하나 더 그리는
   대신 막대 세 개로 둔 이유 — 이 앱의 PixelIcon(닷매트릭스)과 같은
   "네모난 점"의 언어라 새 모양이 늘어나지 않습니다. */
.wx-radio-eq {
  display: inline-flex;
  align-items: flex-end;
  flex: none;
  gap: 2px;
  width: 12px;
  height: 10px;
}

.wx-radio-eq i {
  width: 2px;
  height: 3px;
  background: currentColor;
  /* 멈춰 있을 때는 자리만 지키고 보이지 않습니다 */
  opacity: 0;
  transition: opacity 0.3s;
}

.wx-radio-now.is-on .wx-radio-eq i {
  opacity: 1;
  animation: wx-eq 1s ease-in-out infinite;
}

/* 세 막대가 같은 박자로 뛰면 막대가 아니라 한 덩어리로 보입니다.
   시작 시점을 어긋나게 해서 서로 다른 높이를 지나가게 합니다. */
.wx-radio-now.is-on .wx-radio-eq i:nth-child(2) {
  animation-delay: 0.25s;
}

.wx-radio-now.is-on .wx-radio-eq i:nth-child(3) {
  animation-delay: 0.5s;
}

@keyframes wx-eq {
  0%,
  100% {
    height: 3px;
  }
  50% {
    height: 10px;
  }
}

/* 움직임을 줄여 달라고 설정한 사용자에게는 막대를 세워만 둡니다.
   (OS 의 '동작 줄이기' 설정 — 어지럼증·전정기관 문제가 있는 분들이 켭니다) */
@media (prefers-reduced-motion: reduce) {
  .wx-radio-now.is-on .wx-radio-eq i {
    height: 6px;
    animation: none;
  }
}
</style>

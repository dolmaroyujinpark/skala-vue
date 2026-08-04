<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRadioStore } from '@/stores/radioStore'

/* ════════════════════════════════════════════════════════════
   RadioEngine.vue — 소리만 내는 컴포넌트 (화면에는 보이지 않습니다)

   ── 왜 셸(App.vue)에 있나 ────────────────────────────────
   재생기는 화면보다 오래 살아야 합니다. 히어로 안에 두면 도시를 눌러
   상세로 넘어가는 순간 unmount 되면서 음악이 뚝 끊깁니다.
   RouterView 바깥, 셸 안에 두면 주소가 바뀌어도 이 컴포넌트는 그대로
   남아 있습니다. (같은 이유로 앱 바와 설정줄도 여기 있습니다)

   ── 왜 YouTube 인가 ──────────────────────────────────────
   음원 파일을 저장소에 넣을 수는 없습니다(저작권). 임베드는 원저작자
   채널의 재생 수로 잡히므로 문제가 없고, 키도 필요 없습니다.
   검색(Data API v3)만 키가 필요한데 우리는 목록을 고정해 두었습니다.

   ── 이 컴포넌트가 하는 일은 하나뿐입니다 ─────────────────
   store 의 값(isPlaying · track)을 보고 iframe 을 그대로 따라가게 하는 것.
   판단은 전부 store 가 하고, 여기는 "YouTube 말로 옮기는 통역"입니다.
   ════════════════════════════════════════════════════════════ */

const radio = useRadioStore()

// YT.Player 가 이 <div> 를 통째로 <iframe> 으로 갈아끼웁니다.
const host = ref(null)

/* player 와 isReady 를 ref 로 두지 않은 이유 —
   화면에 그려지는 값이 아닙니다. ref 로 만들면 Vue 가 YouTube 객체
   내부까지 반응형으로 감싸려 들어(Proxy) 오히려 오작동합니다. */
let player = null
let isReady = false

/* 곡을 넘겨도 계속 실패할 때 무한히 도는 것을 막습니다.
   목록을 한 바퀴 다 돌 만큼 실패하면 그만둡니다. */
let errorStreak = 0

/* ────────────────────────────────────────────────
   YouTube IFrame Player API 스크립트 — 딱 한 번만

   이 스크립트는 준비되면 window.onYouTubeIframeAPIReady 를 부릅니다.
   전역 콜백이라 여러 번 걸면 서로 덮어씁니다. Promise 하나에 담아
   두 번째부터는 같은 약속을 돌려주도록 했습니다.
   ──────────────────────────────────────────────── */
let apiPromise = null

const loadYouTubeApi = () => {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (apiPromise) return apiPromise

  apiPromise = new Promise((resolve) => {
    window.onYouTubeIframeAPIReady = () => resolve(window.YT)

    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(tag)
  })

  return apiPromise
}

/* ────────────────────────────────────────────────
   재생기 만들기 — 앱을 켤 때 한 번

   ⚠️ 자동재생 정책 — 브라우저는 사용자가 한 번도 건드리지 않은 페이지에서
      소리가 나는 것을 막습니다. (자주 방문해 손에 익은 사이트는 크롬이
      풀어 주기도 합니다 — Media Engagement Index)
      그래서 autoplay: 1 은 "요청"입니다. 막히면 아래 확인 타이머가
      store 에 알리고, 화면에는 ▶ 가 그대로 남습니다. 한 번 누르면
      그때부터는 정상적으로 재생됩니다.
   ──────────────────────────────────────────────── */
let creating = null

const createPlayer = () => {
  if (player) return Promise.resolve()

  // 빠르게 두 번 누르면 여기 두 번 들어옵니다. 같은 약속을 돌려줘 재생기가 둘 생기는 것을 막습니다.
  if (creating) return creating

  creating = loadYouTubeApi().then((YT) => {
    player = new YT.Player(host.value, {
      /* 쿠키 없는 도메인. 재생 기록이 사용자 계정에 남지 않습니다.
         (iframe_api 스크립트 자체는 www 에서 받아야 합니다) */
      host: 'https://www.youtube-nocookie.com',
      videoId: radio.track.id,
      playerVars: {
        autoplay: 1,
        controls: 0, // 조작은 우리 버튼으로만 — 유튜브 UI 는 보이지도 않습니다
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        playsinline: 1, // 아이폰에서 전체화면으로 튀어나오지 않게
        rel: 0,
        origin: window.location.origin,
      },
      events: {
        onReady: () => {
          isReady = true
          /* 재생기를 만드는 동안(스크립트 내려받는 몇백 ms) 날씨가 바뀌었을 수
             있습니다 — seed 로 '맑음' 이었다가 API 응답이 '비' 로 정정하는 흐름이
             딱 이 구간입니다. 그래서 먼저 곡부터 맞춘 뒤 재생합니다. */
          syncTrack()
          applyPlayState()
          watchAutoplay()
        },
        onStateChange: onPlayerStateChange,
        onError: onPlayerError,
      },
    })
  })

  return creating
}

/* ────────────────────────────────────────────────
   자동재생이 실제로 통했는지 확인

   playVideo() 는 막혀도 예외를 던지지 않습니다. 조용히 아무 일도
   일어나지 않을 뿐입니다. 그래서 잠깐 기다렸다가 실제 상태를 물어봅니다.
   1.5초는 재생기가 첫 조각을 받아 오는 시간을 넉넉히 잡은 값입니다.
   ──────────────────────────────────────────────── */
let autoplayTimer = null

const watchAutoplay = () => {
  if (!radio.isPlaying) return

  autoplayTimer = setTimeout(() => {
    if (!player) return

    // 1 = PLAYING, 3 = BUFFERING (곧 나옵니다). 그 밖이면 막힌 것으로 봅니다.
    const state = player.getPlayerState?.()
    if (state === 1 || state === 3) return

    console.info('🎵 [radio] 브라우저가 자동재생을 막았습니다 — ▶ 를 누르면 재생됩니다.')
    radio.reportBlocked()
  }, 3000)
}

/* store 가 원하는 상태로 iframe 을 맞춥니다.

   ⚠️ 멈출 때 "지금 실제로 나오고 있을 때만" 멈춥니다.
      아직 시작하지 않은(UNSTARTED) 재생기에 pauseVideo() 를 부르면,
      곧 나오려던 소리가 그대로 죽어 버립니다. 자동재생 확인 타이머가
      조금 성급하게 판단했을 때 음악이 1~2초 나오다 끊기던 원인이
      바로 이것이었습니다. */
const applyPlayState = () => {
  if (!player || !isReady) return

  if (radio.isPlaying) {
    player.playVideo()
    return
  }

  const state = player.getPlayerState?.()
  if (state === 1 || state === 3) player.pauseVideo() // PLAYING · BUFFERING
}

/* store 가 가리키는 곡으로 맞춥니다.
     load  = 불러오고 곧바로 재생
     cue   = 불러만 두고 대기 — 멈춰 있던 사람에게 갑자기 소리를 내지 않습니다
   이미 그 곡이 걸려 있으면 아무것도 하지 않습니다. 그냥 부르면 듣던
   자리에서 처음으로 되감기기 때문입니다. */
const syncTrack = () => {
  if (!player || !isReady) return

  const wanted = radio.track.id
  if (player.getVideoData?.()?.video_id === wanted) return

  if (radio.isPlaying) player.loadVideoById(wanted)
  else player.cueVideoById(wanted)
}

/* ────────────────────────────────────────────────
   YouTube → store (되돌아오는 방향)

   사용자가 유튜브 쪽 사정으로 멈추거나(자동재생 차단 등) 곡이 끝나면
   화면의 ▶/❚❚ 표시가 실제와 어긋납니다. 그래서 실제 상태를 store 에
   되돌려 줍니다.
   ──────────────────────────────────────────────── */
const onPlayerStateChange = (event) => {
  const state = window.YT.PlayerState

  if (event.data === state.PLAYING) {
    errorStreak = 0
    radio.reportPlaying(true)
  } else if (event.data === state.PAUSED) {
    radio.reportPlaying(false)
  } else if (event.data === state.ENDED) {
    // 3시간짜리 플레이리스트라 실제로 여기까지 오는 일은 드뭅니다.
    // isPlaying 은 true 로 둔 채 곡만 넘기면 아래 watch 가 이어서 틀어 줍니다.
    radio.next()
  }
}

/* 영상이 내려갔거나 임베드가 막힌 경우. 목록에 담을 때 전부 확인했지만
   업로더가 나중에 설정을 바꿀 수 있습니다. 그럴 때 조용히 멈춰 있는 대신
   다음 곡으로 넘어갑니다. */
const onPlayerError = (event) => {
  console.warn(`🎵 [radio] ${radio.track.title} 재생 실패 (code ${event.data}) — 다음 곡으로 넘깁니다.`)

  errorStreak += 1

  if (errorStreak >= radio.playlist.tracks.length) {
    console.error('🎵 [radio] 이 플레이리스트의 곡을 모두 재생할 수 없습니다.')
    errorStreak = 0
    radio.reportPlaying(false)
    return
  }

  radio.next()
}

/* ────────────────────────────────────────────────
   store → YouTube (내려가는 방향)
   ──────────────────────────────────────────────── */

// ▶/❚❚
watch(
  () => radio.isPlaying,
  async (playing) => {
    if (playing) await createPlayer()
    applyPlayState()
  },
)

/* ────────────────────────────────────────────────
   첫 재생은 "날씨가 정해진 뒤"에

   화면은 seed 데이터로 먼저 그려지고(맑음), 잠시 뒤 API 응답이 실제
   날씨로 정정합니다(예: 구름). 셸이 뜨자마자 재생기를 만들면 그
   정정 순간에 곡이 통째로 갈리면서, 잘 나오던 음악이 뚝 끊겼다가
   다른 곡으로 다시 시작합니다.

   그래서 갈래가 조용해질 때까지 기다렸다가 만듭니다.
     · 갈래가 바뀔 때마다 대기를 다시 셉니다
     · 응답이 아무리 늦어도 START_LATEST_MS 뒤에는 어쨌든 시작합니다
   기다리는 동안에는 iframe 자체가 없으므로 소리가 날 일도 없습니다.
   ──────────────────────────────────────────────── */
const SETTLE_MS = 900
const START_LATEST_MS = 5000

let settleTimer = null
let hardTimer = null
let stopMoodWatch = null

const beginPlayback = () => {
  clearTimeout(settleTimer)
  clearTimeout(hardTimer)
  stopMoodWatch?.() // 감시 해제 — 이후의 갈래 변경은 아래 track watch 가 맡습니다
  stopMoodWatch = null

  createPlayer()
}

onMounted(() => {
  stopMoodWatch = watch(() => radio.moodKey, waitForQuiet)

  waitForQuiet()
  hardTimer = setTimeout(beginPlayback, START_LATEST_MS)
})

function waitForQuiet() {
  clearTimeout(settleTimer)
  settleTimer = setTimeout(beginPlayback, SETTLE_MS)
}

/* 곡이 바뀌었을 때. 넘긴 이유가 무엇이든(버튼 · 곡 종료 · 날씨 변경)
   여기 한 곳으로 모입니다. */
watch(() => radio.track.id, syncTrack)

/* 셸이 사라질 때(사실상 앱을 닫을 때) iframe 과 그 안의 타이머까지 정리합니다. */
onBeforeUnmount(() => {
  clearTimeout(autoplayTimer)
  clearTimeout(settleTimer)
  clearTimeout(hardTimer)
  player?.destroy()
  player = null
  isReady = false
})
</script>

<template>
  <!-- 눈에 보이지 않지만 "그려져는 있어야" 합니다.
       display:none / visibility:hidden 으로 감추면 브라우저에 따라 재생 자체가
       막힙니다. 그래서 1px 짜리로 만들어 화면 밖에 세워 둡니다.
       aria-hidden 으로 스크린 리더에서는 완전히 빼 둡니다 —
       조작 수단은 히어로의 버튼(WeatherRadio)이고 이것은 스피커일 뿐입니다. -->
  <div class="wx-radio-engine" aria-hidden="true">
    <div ref="host"></div>
  </div>
</template>

<style scoped>
.wx-radio-engine {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 1px;
  height: 1px;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
  z-index: -1;
}
</style>

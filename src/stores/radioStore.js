import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { getPlaylist, toMoodKey } from '@/data/weatherPlaylists'

/* ════════════════════════════════════════════════════════════
   radioStore — 지금 무슨 곡이 어떤 상태로 걸려 있는가

   ── 왜 컴포넌트가 아니라 store 인가 ──────────────────────
   재생 상태를 히어로(WeatherHero) 안에 ref 로 두면, 도시를 눌러
   상세 화면으로 넘어가는 순간 히어로가 unmount 되면서 음악이 끊깁니다.
   RouterView 가 갈아끼우는 것은 화면이지 소리가 아니어야 합니다.

   그래서 값은 트리 밖(store)에, 실제 재생기는 화면 밖(App.vue 의
   RadioEngine)에 두었습니다. 히어로에 있는 것은 버튼 세 개뿐입니다.
     configStore  화면이 바뀌어도 유지돼야 하는 값  (℃/℉)
     radioStore   화면이 바뀌어도 끊기면 안 되는 것 (재생)
   같은 이유로 store 에 온 두 번째 값입니다.

   ── 이 store 는 소리를 내지 않습니다 ─────────────────────
   YouTube 를 직접 부르는 코드는 여기 없습니다. store 는 "무엇을 틀고
   싶은가"만 들고 있고, 실제 iframe 조작은 RadioEngine.vue 가 합니다.
   덕분에 나중에 재생 수단을 Spotify 나 <audio> 로 바꿔도 이 파일은
   그대로입니다.
   ════════════════════════════════════════════════════════════ */
export const useRadioStore = defineStore('radio', () => {
  /* [state] 지금 걸린 날씨 갈래와 그 안에서 몇 번째 곡인지.
     곡 객체를 통째로 들지 않고 인덱스만 드는 이유 — 갈래가 바뀌면
     목록 자체가 통째로 갈리는데, 그때 곡 객체를 들고 있으면
     "지금 목록에 없는 곡"이 남습니다. */
  const moodKey = ref('sun')
  const trackIndex = ref(0)

  /* 원하는 상태입니다. 실제로 소리가 나는지가 아니라 "틀어 달라고 했는가" —
     RadioEngine 이 이 값을 보고 따라옵니다. 반대로 YouTube 쪽 사정으로
     멈추면 엔진이 이 값을 되돌립니다.

     처음부터 true — 앱을 켜자마자 틀어 봅니다.
     ⚠️ 브라우저는 사용자가 한 번도 건드리지 않은 페이지에서 소리가 나는 것을
        막습니다(자동재생 정책). 막히면 RadioEngine 이 실제 상태를 되돌려
        주므로 ▶ 가 그대로 남고, 한 번 누르면 재생됩니다.
        즉 이 값은 "틀어 달라는 요청"이지 "반드시 난다"가 아닙니다. */
  const isPlaying = ref(true)

  /* 자동재생이 막혔는지 여부. 화면에서 안내를 띄우지는 않고,
     콘솔 로그와 (혹시 나중에 필요하면) 조건부 문구용으로만 둡니다. */
  const isBlocked = ref(false)

  /* [getters] 지금 갈래의 플레이리스트와 그 안의 현재 곡 */
  const playlist = computed(() => getPlaylist(moodKey.value))
  const track = computed(() => playlist.value.tracks[trackIndex.value] ?? playlist.value.tracks[0])

  /* [actions] ------------------------------------------------ */

  /* 날씨가 정해지면(도시를 고르거나 API 응답이 오면) 화면이 불러 줍니다.
     같은 갈래면 아무 일도 하지 않는 것이 중요합니다 — 그냥 대입하면
     서울(맑음)에서 판교(맑음)로 옮길 때마다 듣던 곡이 1번으로 되감깁니다. */
  function syncMood(status, icon) {
    const next = toMoodKey(status, icon)
    if (next === moodKey.value) return

    moodKey.value = next
    trackIndex.value = 0
  }

  function toggle() {
    // 눌렀다는 것은 곧 사용자 조작 — 자동재생이 막혔던 상태도 여기서 풀립니다.
    isBlocked.value = false
    isPlaying.value = !isPlaying.value
  }

  /* 목록 끝에서 다음을 누르면 처음으로 돌아옵니다 (% 나머지 연산).
     끝에서 멈춰 버리면 "고장 난 버튼"처럼 보입니다. */
  function next() {
    const total = playlist.value.tracks.length
    trackIndex.value = (trackIndex.value + 1) % total
  }

  function prev() {
    const total = playlist.value.tracks.length
    trackIndex.value = (trackIndex.value - 1 + total) % total
  }

  /* 엔진이 알려 오는 실제 재생 상태. 사용자가 YouTube 안에서 멈췄거나
     자동재생이 막혔을 때, 화면의 ▶/❚❚ 가 거짓말하지 않게 해 줍니다. */
  function reportPlaying(playing) {
    isPlaying.value = playing
  }

  /* 자동재생이 막혔을 때 엔진이 알려 줍니다. isPlaying 은 false 로 되돌아가고,
     화면에는 ▶ 가 남습니다 — 사용자가 한 번 누르면 그때부터 정상입니다. */
  function reportBlocked() {
    isBlocked.value = true
    isPlaying.value = false
  }

  return { moodKey, trackIndex, isPlaying, isBlocked, playlist, track, syncMood, toggle, next, prev, reportPlaying, reportBlocked }
})

/* ════════════════════════════════════════════════════════════
   날씨별 플레이리스트 — 오늘 하늘에 어울리는 노래

   ── 왜 검색이 아니라 고정 목록인가 ────────────────────────
   YouTube Data API v3 로 그때그때 검색할 수도 있습니다. 다만
     · 검색에는 API 키가 하나 더 필요하고 (하루 10,000 쿼터 · 검색 1회 100)
     · 무엇이 1등으로 올라올지 우리가 모릅니다. 임베드가 막힌 영상,
       광고만 붙은 영상이 걸리면 재생 버튼이 조용히 아무 일도 안 합니다.
   이 앱에서 음악은 "덤"이라 실패해도 되는 자리가 아닙니다. 그래서
   날씨 여섯 갈래에 플레이리스트를 미리 골라 두었습니다.
   전부 임베드 허용 여부를 확인한 국내 노래 모음입니다.

   ── 갈래를 여섯으로 나눈 이유 ────────────────────────────
   API 가 주는 상태 문구는 수십 가지지만(weatherLabels.js 참고), 사람이
   "이런 날엔 이런 노래"라고 느끼는 결은 그보다 훨씬 적습니다.
   맑음 · 구름 · 비 · 천둥 · 눈 · 안개 여섯이면 충분했습니다.

   ── 이 파일도 아무것도 import 하지 않습니다 ──────────────
   weatherLabels.js 와 같은 이유입니다. 화면도 store 도 이 표를 읽지만,
   이 표는 누구도 읽지 않습니다. 그래야 순환 참조가 생기지 않습니다.
   ════════════════════════════════════════════════════════════ */

/* 제목은 영상 원제가 아니라 우리가 줄여 쓴 이름입니다.
   원제에는 𝐏𝐥𝐚𝐲𝐥𝐢𝐬𝐭 같은 장식 문자와 이모지, 아티스트 나열이 섞여 있어서
   히어로의 조용한 캡션 줄에 그대로 넣으면 그 한 줄만 시끄러워집니다.
   재생 중 제목을 player.getVideoData() 로 가져오지 않는 것도 같은 이유입니다.

   caption 은 대문자 영문 — 이 앱의 캡션(Current Location · Hourly Forecast)과
   같은 말투입니다. 옆에 붙는 한글 제목이 내용이고, 이쪽은 이름표입니다.

   ⚠️ 순서가 곧 우선순위입니다. 각 갈래의 첫 곡이 그 날씨의 기본값이라,
      직접 골라 담은 것을 맨 앞에 둡니다. */
const PLAYLISTS = {
  sun: {
    key: 'sun',
    caption: 'SUNNY',
    tracks: [
      { id: 'fY4wgaEb5TY', title: '수현이 고른 여름 낮의 악뮤' },
      { id: 'QY0C7WO13d0', title: '기분이 맑아지는 국내 음악' },
      { id: '97ZcbeUhlZw', title: '햇살 좋은 날의 어쿠스틱' },
      { id: 'f4jS6yW83MU', title: '여름을 좋아하는 그대에게' },
    ],
  },

  cloud: {
    key: 'cloud',
    caption: 'CLOUDY',
    tracks: [
      { id: 'RBFdO-iFCm4', title: '휴식이 필요할 때, 존박' },
      { id: 'CrfsnUklH4k', title: '문득 인디음악에 파묻히고 싶을 때' },
      { id: 'GcFw-rWPhOk', title: '흐린 날, 괜히 조용한 노래들' },
    ],
  },

  rain: {
    key: 'rain',
    caption: 'RAINY',
    tracks: [
      { id: 'IzOeYCGkg10', title: '기억은 쏟아버린 구슬처럼, 잔나비' },
      { id: 'ulOXj1UJd68', title: '빈지노 노래 모음' },
      { id: 'c_l1ZwJbAnc', title: '비도 오고, 늘어져서 듣는 인디' },
    ],
  },

  /* 천둥은 비와 따로 뒀습니다. 같은 비라도 장맛비·폭우는 결이 다릅니다. */
  thunder: {
    key: 'thunder',
    caption: 'STORM',
    tracks: [
      /* 비와 천둥 양쪽에 같은 곡이 들어갑니다. 갈래마다 목록을 따로 두는
         구조라 중복이 허용됩니다 — 같은 곡이라도 어느 하늘에서 몇 번째로
         걸릴지는 갈래가 정합니다. */
      { id: 'ulOXj1UJd68', title: '빈지노 노래 모음' },
      { id: 'SNJbQ1SM6TU', title: '장맛비 내릴 때 듣는 노래' },
      { id: '89Eu2lEu7Ys', title: '장마철에 틀어놓는 국내 노래' },
      { id: '8VTfUAZucu4', title: '비가 내리는 초원에서' },
    ],
  },

  snow: {
    key: 'snow',
    caption: 'SNOWY',
    tracks: [
      { id: 'Kk9e-zkOk88', title: '겨울을 좋아하는 사람들' },
      { id: 'q-ZFpbrokMg', title: '퍼펙트 크리스마스 캐롤' },
      { id: 's0CUqIrNXuk', title: '창가에 소복이, 겨울 피아노' },
    ],
  },

  mist: {
    key: 'mist',
    caption: 'MISTY',
    tracks: [
      { id: 'LwJ5IUWLACw', title: '검정치마, 카더가든의 새벽' },
      { id: 'hiMoy4pyAl0', title: '선선한 새벽, 혼자 걷고 싶을 때' },
      { id: 'PRfXz1iN3_o', title: '새벽감성 인디 플레이리스트' },
    ],
  },
}

/* ────────────────────────────────────────────────
   상태 문구 → 갈래

   weatherLabels.js 의 표를 다시 쓰지 않고 낱말로 찾습니다.
   그 표를 거치지 않은 문구도 화면에 올라올 수 있기 때문입니다 —
   toFriendlyStatus 는 모르는 문구를 원문 그대로 통과시킵니다.
   ('황사' 처럼) 낱말로 보면 '빗방울' 이든 '실 비' 든 '가벼운 비' 든
   전부 비로 걸립니다.

   ⚠️ 순서가 규칙입니다. 위에서부터 처음 걸리는 것이 이깁니다.
      · 천둥이 비보다 위 — '천둥번개'에는 '비'가 없지만, 폭우를 동반한
        표기가 오면 비가 아니라 천둥으로 보내고 싶습니다.
      · 눈이 비보다 위 — '진눈깨비'는 눈이면서 글자에 '비'가 들어갑니다.
   ──────────────────────────────────────────────── */
const RULES = [
  { mood: 'thunder', test: /천둥|번개|뇌우|폭우/ },
  { mood: 'snow', test: /눈|진눈깨비/ },
  { mood: 'rain', test: /비|빗|소나기|이슬/ },
  { mood: 'mist', test: /안개|박무|연무|황사|먼지/ },
  { mood: 'cloud', test: /구름|흐림|흐린|회색/ },
  { mood: 'sun', test: /맑|햇살|화창/ },
]

/* 아이콘은 마지막 안전망입니다. 상태 문구는 API 표기에 따라 바뀔 수 있지만
   icon 은 우리가 직접 rain / cloud / sun 셋으로 정리해 둔 값이라 늘 셋 중
   하나입니다. (api/weather.js 의 toCityIcon) */
const BY_ICON = { rain: 'rain', cloud: 'cloud', sun: 'sun' }

export const toMoodKey = (status = '', icon = 'sun') => {
  const found = RULES.find((rule) => rule.test.test(status))
  if (found) return found.mood
  return BY_ICON[icon] ?? 'sun'
}

/* 없는 키로 물어봐도 화면이 깨지지 않도록 맑음으로 받칩니다. */
export const getPlaylist = (moodKey) => PLAYLISTS[moodKey] ?? PLAYLISTS.sun

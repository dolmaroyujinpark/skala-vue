/* ════════════════════════════════════════════════════════════
   기온별 옷차림 구간표 — 기상청 생활기상지수의 "체감온도별 옷차림"

   ── 왜 컴포넌트에서 빼냈나 ────────────────────────────────
   원래 이 표는 OutfitCard.vue 안에 있었습니다. 쓰는 곳이 하나뿐일 때는
   그게 맞았습니다. 소개 화면(About)이 "옷차림은 몇 도에서 어떻게 갈리나"
   를 설명하게 되면서 읽는 쪽이 둘이 됐습니다.

   같은 표를 두 곳에 적으면, 구간을 하나 고칠 때 한쪽만 고쳐도 아무도
   에러를 내지 않습니다. 화면과 설명이 조용히 어긋날 뿐입니다.
   그래서 weatherLabels.js · weatherPlaylists.js 와 같은 자리로 옮겼습니다.

   ── 순서가 규칙입니다 ────────────────────────────────────
   위에서부터 훑어 내려가다 처음 만나는 min 이 정답이므로 내림차순이어야
   합니다. 마지막 칸의 min 을 -Infinity 로 둬서 "못 찾는 경우"가 아예
   생기지 않게 막았습니다.
   ════════════════════════════════════════════════════════════ */
export const OUTFIT_TABLE = [
  { min: 28, label: '한여름', items: ['민소매', '반팔', '반바지', '원피스'] },
  { min: 23, label: '더움', items: ['반팔', '얇은 셔츠', '반바지', '면바지'] },
  { min: 20, label: '선선함', items: ['긴팔', '얇은 가디건', '면바지', '청바지'] },
  { min: 17, label: '쌀쌀함', items: ['얇은 니트', '맨투맨', '가디건', '청바지'] },
  { min: 12, label: '서늘함', items: ['자켓', '가디건', '야상', '스타킹'] },
  { min: 9, label: '추움', items: ['트렌치코트', '점퍼', '기모바지'] },
  { min: 5, label: '많이 추움', items: ['코트', '가죽자켓', '히트텍', '니트'] },
  { min: -Infinity, label: '한겨울', items: ['패딩', '두꺼운 코트', '목도리', '기모'] },
]

/* 기온 하나로 구간을 찾습니다. 판정 기준은 언제나 원본 섭씨 —
   화씨로 환산한 값을 넣으면 28°C 와 82°F 를 구분할 수 없습니다. */
export const findOutfit = (celsius) => OUTFIT_TABLE.find((row) => celsius >= row.min)

/* 소개 화면에서 "9°C ~ 11°C" 처럼 구간을 문장으로 적을 때 씁니다.
   위 칸의 min 이 이 칸의 상한이라, 표만 고치면 문구도 따라옵니다. */
export const toRangeLabel = (index) => {
  const row = OUTFIT_TABLE[index]
  const upper = OUTFIT_TABLE[index - 1]

  if (!upper) return `${row.min}°C 이상`
  if (row.min === -Infinity) return `${upper.min}°C 미만`

  return `${row.min}°C ~ ${upper.min - 1}°C`
}

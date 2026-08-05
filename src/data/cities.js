/* ════════════════════════════════════════════════════════════
   도시 명부 — 이 앱이 다루는 지역과 그 좌표

   ── 4일차에 성격이 바뀐 파일입니다 ───────────────────────
   3일차까지 이 파일은 "화면에 뿌릴 날씨 데이터" 였습니다. 도시마다
   기온·상태는 물론 시간별 6칸, 일별 6칸까지 손으로 적어 두었습니다.

   지금은 날씨를 OpenWeatherMap 이 줍니다. 그래서 이 파일에는 API 가
   모르는 것만 남깁니다.

     API 가 주는 것    기온 · 상태 · 습도 · 풍속 · 기압 · 일출/일몰 · 예보
     우리가 아는 것    도시 코드 · 한글 이름 · 행정구역명 · 좌표

   API 응답의 도시 이름은 'Seoul' · 'Seryui-dong' · 'Kŏje' 처럼 제각각인
   영문이라 화면에 쓸 수 없습니다. 한글 이름은 우리가 들고 있어야 합니다.

   ── seed 는 무엇인가 ─────────────────────────────────────
   API 응답이 오기 전 잠깐, 그리고 통신이 실패했을 때 화면을 채울 값입니다.
   실제 날씨가 아니라 "화면이 깨지지 않을 만큼의 그럴듯한 숫자" 입니다.
   도시가 20개로 늘면서 예보 12칸씩을 손으로 적는 건 무의미해져,
   아래 buildSeedCity 가 seed 하나로 하루치를 만들어 냅니다.

   ── 도시 수를 20개로 정한 이유 ───────────────────────────
   OpenWeatherMap 무료 플랜은 분당 60회입니다. 목록 화면이 도시마다
   /weather 를 한 번씩 부르므로 20개면 20회 — 1분에 두세 번 새로고침해도
   한도 안입니다. (예보는 선택된 도시 것만 따로 부릅니다)
   ════════════════════════════════════════════════════════════ */

/* 전국 시·도가 고르게 들어가도록 골랐습니다.
   좌표는 각 도시의 중심부 기준이며, 20곳 전부 실제 응답을 확인했습니다. */
const ROSTER = [
  { id: 'city_01', name: '서울', region: '서울특별시', lat: 37.5665, lon: 126.978, seed: { temp: 28, status: '햇살 가득', icon: 'sun' } },
  { id: 'city_02', name: '인천', region: '인천광역시 중구', lat: 37.4563, lon: 126.7052, seed: { temp: 26, status: '솜구름', icon: 'cloud' } },
  { id: 'city_03', name: '수원', region: '경기도 수원시 영통구', lat: 37.2636, lon: 127.0286, seed: { temp: 27, status: '구름 한가득', icon: 'cloud' } },
  { id: 'city_04', name: '판교', region: '경기도 성남시 분당구', lat: 37.3947, lon: 127.1112, seed: { temp: 27, status: '햇살 가득', icon: 'sun' } },
  { id: 'city_05', name: '춘천', region: '강원특별자치도 춘천시', lat: 37.8813, lon: 127.73, seed: { temp: 26, status: '솜구름', icon: 'cloud' } },
  { id: 'city_06', name: '강릉', region: '강원특별자치도 강릉시', lat: 37.7519, lon: 128.8761, seed: { temp: 25, status: '빗방울', icon: 'rain' } },
  { id: 'city_07', name: '원주', region: '강원특별자치도 원주시', lat: 37.3422, lon: 127.9202, seed: { temp: 26, status: '햇살 가득', icon: 'sun' } },
  { id: 'city_08', name: '대전', region: '대전광역시 서구', lat: 36.3504, lon: 127.3845, seed: { temp: 28, status: '햇살 가득', icon: 'sun' } },
  { id: 'city_09', name: '세종', region: '세종특별자치시', lat: 36.48, lon: 127.289, seed: { temp: 28, status: '솜구름', icon: 'cloud' } },
  { id: 'city_10', name: '청주', region: '충청북도 청주시 상당구', lat: 36.6424, lon: 127.489, seed: { temp: 28, status: '햇살 가득', icon: 'sun' } },
  { id: 'city_11', name: '천안', region: '충청남도 천안시 동남구', lat: 36.8151, lon: 127.1139, seed: { temp: 27, status: '구름 한가득', icon: 'cloud' } },
  { id: 'city_12', name: '전주', region: '전북특별자치도 전주시 완산구', lat: 35.8242, lon: 127.148, seed: { temp: 29, status: '햇살 가득', icon: 'sun' } },
  { id: 'city_13', name: '광주', region: '광주광역시 서구', lat: 35.1595, lon: 126.8526, seed: { temp: 30, status: '햇살 가득', icon: 'sun' } },
  { id: 'city_14', name: '여수', region: '전라남도 여수시', lat: 34.7604, lon: 127.6622, seed: { temp: 26, status: '구름 한가득', icon: 'cloud' } },
  { id: 'city_15', name: '대구', region: '대구광역시 중구', lat: 35.8714, lon: 128.6014, seed: { temp: 31, status: '햇살 가득', icon: 'sun' } },
  { id: 'city_16', name: '포항', region: '경상북도 포항시 북구', lat: 36.019, lon: 129.3435, seed: { temp: 28, status: '솜구름', icon: 'cloud' } },
  { id: 'city_17', name: '울산', region: '울산광역시 남구', lat: 35.5384, lon: 129.3114, seed: { temp: 28, status: '구름 한가득', icon: 'cloud' } },
  { id: 'city_18', name: '부산', region: '부산광역시 해운대구', lat: 35.1587, lon: 129.1604, seed: { temp: 27, status: '구름 한가득', icon: 'cloud' } },
  { id: 'city_19', name: '거제', region: '경상남도 거제시', lat: 34.8806, lon: 128.6212, seed: { temp: 26, status: '빗방울', icon: 'rain' } },
  { id: 'city_20', name: '제주', region: '제주특별자치도 제주시', lat: 33.4996, lon: 126.5312, seed: { temp: 29, status: '솜구름', icon: 'cloud' } },
]

/* 조회에 필요한 정보만 뽑은 지도. api/weather.js 가 이걸 봅니다.
   { city_01: { lat, lon, name, region }, ... } 모양이 됩니다.

   Object.fromEntries 는 [키, 값] 쌍의 배열을 객체로 되돌립니다.
   배열을 그대로 두고 매번 find 로 뒤져도 되지만, id 로 찾는 일이
   잦아서 처음부터 객체로 만들어 두는 편이 읽기 쉽습니다. */
export const CITY_QUERY = Object.fromEntries(ROSTER.map(({ id, lat, lon, name, region }) => [id, { lat, lon, name, region }]))

/* ────────────────────────────────────────────────
   seed 하나로 화면이 요구하는 도시 객체를 만들어 냅니다.

   화면 컴포넌트는 hourly 6칸 · daily 6칸이 반드시 있다고 가정하고
   그립니다. 비어 있으면 예보 스트립이 빈 상자로 남습니다.
   그래서 실제 값은 아니어도 모양은 갖춰 줍니다.
   ──────────────────────────────────────────────── */
const HOURS = ['09:00', '12:00', '15:00', '18:00', '21:00', '00:00']

// 한낮에 조금 오르고 밤에 내려가는, 하루 기온의 대략적인 모양
const HOUR_OFFSETS = [0, 2, 3, 1, -1, -3]

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

const buildSeedCity = ({ id, name, region, seed }) => {
  const today = new Date()

  return {
    id,
    name,
    region,
    temp: seed.temp,
    status: seed.status,
    icon: seed.icon,
    high: seed.temp + 3,
    low: seed.temp - 5,
    sunrise: '05:30',
    sunset: '19:45',
    humidity: 60,
    wind: 2.5,
    pressure: 1010,

    hourly: HOURS.map((time, index) => ({
      id: `h${index}`,
      time,
      icon: seed.icon,
      temp: seed.temp + HOUR_OFFSETS[index],
    })),

    // 오늘부터 6일. 날짜만 실제로 세고 기온은 seed 를 그대로 씁니다.
    daily: Array.from({ length: 6 }, (_, index) => {
      const day = new Date(today)
      day.setDate(today.getDate() + index)

      return {
        id: `d${index}`,
        date: `${MONTHS[day.getMonth()]} ${String(day.getDate()).padStart(2, '0')}`,
        icon: seed.icon,
        high: seed.temp + 3,
        low: seed.temp - 5,
      }
    }),
  }
}

/* 화면이 import 하는 것 — 20개 도시의 초기 상태.
   API 응답이 도착하면 이 값들은 실시간 데이터로 덮어써집니다. */
export const cities = ROSTER.map(buildSeedCity)

/* [추가] 검색으로 담은 도시의 자리표.

   명부에 없는 도시는 seed 가 없습니다. 그런데 화면은 hourly 6칸 ·
   daily 6칸이 반드시 있다고 가정하고 그리므로, 응답이 도착하기 전
   잠깐 동안 쓸 껍데기가 필요합니다.

   기온을 20도로 둔 것은 "그럴듯한 숫자" 여서가 아니라 카드 높이를
   흔들지 않을 자리 채움이기 때문입니다. 상태 문구는 '—' 로 두어
   실제 값이 아님을 드러냅니다 — 여기에 '맑음' 같은 걸 적으면 잠깐이라도
   화면이 거짓말을 합니다. */
export const makePlaceholderCity = ({ id, name, region }) => buildSeedCity({ id, name, region, seed: { temp: 20, status: '—', icon: 'cloud' } })

/* ────────────────────────────────────────────────
   [추가] 이 좌표에서 가장 가까운 우리 도시

   검색으로 담는 지역은 '옥포동' · '서면' 처럼 작은 단위입니다. 그런데
   OpenWeatherMap 은 한국 주소의 시·도(state)를 돌려주지 않습니다.
   그래서 "경상남도 거제시 옥포동" 같은 문구를 응답만으로는 만들 수 없습니다.

   대신 우리가 이미 가진 것을 씁니다 — 20곳의 좌표와 행정구역명입니다.
   가장 가까운 곳을 찾아 '거제 부근' 이라고 적어 주면,
     · 어디쯤인지 감이 오고
     · 같은 이름이 둘 나올 때 구분이 됩니다
       ('서면' 은 포항 부근에도 있고 춘천 부근에도 있습니다)

   ⚠️ 위경도 차이를 그대로 제곱해 더합니다. 지구가 둥근 것을 무시한
      근사값이지만, 한국 안 40km 안팎을 가리는 데는 충분합니다.
      정확한 거리(하버사인)를 쓰면 코드가 길어지는데 얻는 것이 없습니다.
   ──────────────────────────────────────────────── */
const NEAR_LIMIT_KM = 45

export const findNearestCity = (lat, lon) => {
  let best = null
  let bestScore = Infinity

  for (const city of ROSTER) {
    // 위도 1도 ≈ 111km. 경도는 위도가 높을수록 좁아지지만 한국(위도 33~38)
    // 에서는 0.8 정도로 보정하면 실제와 크게 어긋나지 않습니다.
    const dy = (city.lat - lat) * 111
    const dx = (city.lon - lon) * 111 * 0.8
    const score = dy * dy + dx * dx

    if (score < bestScore) {
      bestScore = score
      best = city
    }
  }

  return Math.sqrt(bestScore) <= NEAR_LIMIT_KM ? best : null
}

/* id 로 도시 하나를 찾습니다. 없는 id 면 undefined 를 돌려주고,
   "없다"는 판단은 호출한 화면이 합니다. (상세 페이지는 안내 문구를 띄웁니다) */
export const findCityById = (cityId) => cities.find((city) => city.id === cityId)

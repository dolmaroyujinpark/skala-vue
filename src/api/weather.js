import axios from 'axios'
import { cities, CITY_QUERY, makePlaceholderCity, findNearestCity } from '@/data/cities'
import { toPlaceAlias } from '@/data/placeAliases'
import { toFriendlyStatus } from '@/data/weatherLabels'

// 도시 명부는 data/cities.js 한 곳에만 둡니다. 여기서 다시 export 하는 것은
// 화면들이 "API 쪽 이름"으로도 자연스럽게 집어 갈 수 있게 하기 위해서입니다.
export { CITY_QUERY }

/* ════════════════════════════════════════════════════════════
   [4일차 과제] OpenWeatherMap 연동

   ── 화면이 아니라 여기에 두는 이유 ────────────────────────
   과제 참고 코드는 뷰 파일 안에서 axios.get 을 직접 부릅니다. 화면이
   하나면 그래도 되지만, 우리는 목록과 상세 두 화면이 같은 데이터를 씁니다.
   양쪽에 같은 URL 과 같은 변환 코드를 쓰면, API 응답 모양이 바뀔 때
   두 파일을 똑같이 고쳐야 합니다. 한쪽만 고치면 화면마다 값이 달라집니다.

   그래서 "바깥 세상과 이야기하는 일"을 이 파일 하나로 모았습니다.
   화면은 fetchCityWeather / fetchAllCities 두 함수만 알면 됩니다.
   OpenWeatherMap 을 기상청 API 로 바꾸더라도 고칠 파일은 여기 하나입니다.

   ── 무료 플랜의 한계와 우리가 고른 조합 ──────────────────
     /weather   현재 날씨       기온 · 상태 · 습도 · 풍속 · 기압 · 일출/일몰
     /forecast  3시간 간격 5일치 → 시간별 스트립 + 일별 스트립으로 가공
     UV 지수는 One Call API(유료)에만 있어서 화면에서 뺐습니다.
   ════════════════════════════════════════════════════════════ */

const API_KEY = import.meta.env.VITE_OWM_API_KEY

if (!API_KEY) {
  console.warn('⚠️ VITE_OWM_API_KEY 가 없습니다. .env.example 을 .env.local 로 복사하고 키를 채우세요. 지금은 Mock 데이터로 동작합니다.')
}

/* axios.create 로 공통 설정을 묶어 둡니다.
   매 호출마다 appid·units·lang 을 손으로 붙이면 한 군데만 빠뜨려도
   그 요청만 영어로 오거나 화씨로 옵니다. params 에 넣어 두면 그럴 일이 없습니다.

   units: 'metric'  섭씨로 받습니다. 화씨 변환은 configStore 가 담당하므로
                    원본은 항상 섭씨여야 합니다.
   lang: 'kr'       weather[0].description 이 '맑음' 처럼 한글로 옵니다.
   timeout          응답이 없을 때 무한정 기다리지 않고 8초에 끊습니다. */
const api = axios.create({
  baseURL: 'https://api.openweathermap.org/data/2.5',
  timeout: 8000,
  params: { appid: API_KEY, units: 'metric', lang: 'kr' },
})

/* ── 도시 이름(q=) 이 아니라 좌표(lat/lon) 로 부르는 이유 ──
   처음에는 q=Seoul,KR 처럼 이름으로 짰는데 거제만 404 가 났습니다.
   OpenWeatherMap 의 이름 검색은 자체 도시 목록에 등재된 표기만 찾습니다.
   Geoje / Geoje-si / Okpo 를 전부 시도해도 없었고, 응답에 찍히는 이름은
   'Kŏje' 였습니다 — 매큔-라이샤워 표기라 우리가 맞힐 수 있는 철자가 아닙니다.

   좌표에는 그런 문제가 없습니다. 지구상의 한 점은 표기법과 무관하고,
   API 가 알아서 가장 가까운 관측 지점을 잡아 줍니다. 실제로 OpenWeatherMap
   문서도 q= 대신 좌표 사용을 권장하고 있습니다.

   덤으로 정확도도 올라갑니다 — 판교는 등재된 지명이 아니라 이름으로는
   성남시 전체를 부를 수밖에 없었는데, 좌표를 쓰면 판교 지점을 곧장 찍습니다.

   좌표 표는 data/cities.js 의 ROSTER 에 있습니다. 도시를 추가하려면
   그 파일 한 곳만 고치면 API 조회와 화면 표시가 함께 따라옵니다. */

/* ────────────────────────────────────────────────
   도시 명부 — 고정 20곳 + 검색으로 담은 곳

   [추가] 전에는 CITY_QUERY 하나만 봤습니다. 그 표는 data/cities.js 에
   손으로 적어 둔 20곳이라, 사용자가 검색으로 담은 도시는 여기서
   "알 수 없는 도시 코드" 가 되어 조회가 막혔습니다.

   그래서 표를 복사해 두고 늘어날 수 있게 했습니다.

   ⚠️ 왜 store 를 import 하지 않는가 —
      추가 도시의 주인은 stores/cityStore.js 입니다. 이 파일이 그 store 를
      직접 읽으면 api → store → (언젠가) api 로 도는 순환 참조가 생기고,
      Pinia 가 준비되기 전에 이 모듈이 평가되면 터집니다.
      대신 store 가 바뀔 때마다 이쪽으로 밀어 넣습니다(registerCities).
      이 파일은 여전히 "바깥 세상과만 이야기하는" 자리로 남습니다.
   ──────────────────────────────────────────────── */
const cityRegistry = { ...CITY_QUERY }

export const registerCities = (list = []) => {
  for (const { id, lat, lon, name, region } of list) {
    cityRegistry[id] = { lat, lon, name, region }
  }
}

// 이 id 를 조회할 수 있는가. 화면이 "없는 도시" 안내를 띄울지 판단할 때 씁니다.
export const isKnownCity = (cityId) => Boolean(cityRegistry[cityId])

// 도시 하나가 좌표를 어떻게 넘기는지 — 두 엔드포인트가 같은 형태를 씁니다.
const coordsOf = (cityId) => {
  const meta = cityRegistry[cityId]
  if (!meta) throw new Error(`알 수 없는 도시 코드: ${cityId}`)
  return { lat: meta.lat, lon: meta.lon }
}

/* ────────────────────────────────────────────────
   변환 도구들 — API 의 말을 우리 화면의 말로 옮깁니다
   ──────────────────────────────────────────────── */

/* OpenWeatherMap 아이콘 코드는 '10d' 처럼 [숫자 2자리 + d/n] 입니다.
   앞 두 자리가 날씨 종류, 마지막 글자가 낮(d)/밤(n) 입니다.

   ⚠️ 히어로와 예보 칸이 서로 다른 아이콘 컴포넌트를 씁니다.
      MonoIcon(히어로)  — sun · cloud · rain 세 가지뿐
      PixelIcon(예보 칸) — sun · cloud · rain · partly · night
      그래서 변환 함수도 두 개입니다. 히어로에 'partly' 를 주면
      MonoIcon 에 해당 분기가 없어 아이콘이 아예 안 그려집니다. */
const RAIN_CODES = ['09', '10', '11', '13'] // 소나기 · 비 · 뇌우 · 눈

const toCityIcon = (owmIcon = '01d') => {
  const code = owmIcon.slice(0, 2)
  if (RAIN_CODES.includes(code)) return 'rain'
  if (code === '01') return 'sun'
  return 'cloud'
}

const toStripIcon = (owmIcon = '01d') => {
  const code = owmIcon.slice(0, 2)
  const isNight = owmIcon.endsWith('n')
  if (RAIN_CODES.includes(code)) return 'rain'
  if (code === '01') return isNight ? 'night' : 'sun'
  if (code === '02') return isNight ? 'night' : 'partly'
  return 'cloud'
}

/* API 의 시각은 전부 UTC 기준 유닉스 초입니다. 응답의 timezone 은
   그 도시가 UTC 에서 몇 초 떨어져 있는지를 알려 줍니다 (한국은 32400 = +9시간).

   유닉스 값에 offset 을 더한 뒤 getUTC* 로 읽는 것이 요령입니다.
   getHours() 로 읽으면 이 코드를 실행하는 "브라우저의" 시간대가 섞여서,
   해외에서 접속하면 서울 일출이 엉뚱한 시각으로 표시됩니다. */
const shiftToCityTime = (unixSeconds, tzOffsetSeconds) => new Date((unixSeconds + tzOffsetSeconds) * 1000)

const toTimeLabel = (unixSeconds, tzOffsetSeconds) => {
  const d = shiftToCityTime(unixSeconds, tzOffsetSeconds)
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

const toDateLabel = (unixSeconds, tzOffsetSeconds) => {
  const d = shiftToCityTime(unixSeconds, tzOffsetSeconds)
  return `${MONTHS[d.getUTCMonth()]} ${String(d.getUTCDate()).padStart(2, '0')}`
}

const toDateKey = (unixSeconds, tzOffsetSeconds) => {
  const d = shiftToCityTime(unixSeconds, tzOffsetSeconds)
  return `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`
}

/* ────────────────────────────────────────────────
   예보 가공 — /forecast 응답 하나로 스트립 두 개를 만듭니다
   ──────────────────────────────────────────────── */

/* 시간별: 앞에서 6칸만 씁니다. 3시간 간격이라 약 18시간치입니다.
   (원본 Mock 도 6칸이었고, 스트립 폭이 그만큼입니다) */
const buildHourly = (list, tz) =>
  list.slice(0, 6).map((slot, index) => ({
    id: `h${index}`,
    time: toTimeLabel(slot.dt, tz),
    icon: toStripIcon(slot.weather[0]?.icon),
    temp: Math.round(slot.main.temp),
  }))

/* 일별: /forecast 는 "일별"을 주지 않습니다. 3시간짜리 40칸을 날짜별로
   묶어서 최고/최저를 직접 뽑아야 합니다.

   대표 아이콘을 정오에 가장 가까운 칸에서 고르는 이유 — 하루를 아이콘
   하나로 요약해야 하는데, 첫 칸(새벽)을 쓰면 거의 매일 'night' 가 됩니다.
   사람이 "오늘 날씨"를 떠올릴 때 기준으로 삼는 시간대가 한낮입니다. */
const buildDaily = (list, tz) => {
  const buckets = new Map()

  for (const slot of list) {
    const key = toDateKey(slot.dt, tz)
    if (!buckets.has(key)) buckets.set(key, [])
    buckets.get(key).push(slot)
  }

  return [...buckets.values()].slice(0, 6).map((slots, index) => {
    const temps = slots.map((s) => s.main.temp)
    const noon = slots.reduce((best, s) => {
      const hour = shiftToCityTime(s.dt, tz).getUTCHours()
      const bestHour = shiftToCityTime(best.dt, tz).getUTCHours()
      return Math.abs(hour - 12) < Math.abs(bestHour - 12) ? s : best
    }, slots[0])

    return {
      id: `d${index}`,
      date: toDateLabel(slots[0].dt, tz),
      icon: toStripIcon(noon.weather[0]?.icon),
      high: Math.round(Math.max(...temps)),
      low: Math.round(Math.min(...temps)),
    }
  })
}

/* ────────────────────────────────────────────────
   조립 — 두 응답을 화면이 쓰던 도시 객체 모양으로 되돌립니다
   ──────────────────────────────────────────────── */

/* 반환 모양을 data/cities.js 의 seed 와 정확히 똑같이 맞춥니다.
   그래야 화면 컴포넌트를 한 줄도 안 고치고 데이터 출처만 바꿀 수 있습니다.
   (Mock 에만 있던 uv 는 무료 API 에 없어서 뺐고, 화면에서도 뺐습니다)

   forecastData 는 없을 수 있습니다 — 목록 화면은 예보를 안 부르기 때문입니다.
   그때는 hourly/daily 를 비워 두고, 선택된 도시에 한해 나중에 채웁니다. */
const buildCity = (cityId, currentData, forecastData = null) => {
  const meta = cityRegistry[cityId]
  const tz = currentData.timezone ?? 32400
  const daily = forecastData ? buildDaily(forecastData.list ?? [], tz) : []

  return {
    id: cityId,
    name: meta.name,
    region: meta.region,
    temp: Math.round(currentData.main.temp),
    // API 원문('약간의 구름이 낀 하늘')을 이 앱의 말투('솜구름')로 옮깁니다
    status: toFriendlyStatus(currentData.weather[0]?.description ?? '정보 없음'),
    icon: toCityIcon(currentData.weather[0]?.icon),
    // 오늘의 최고/최저는 예보에서 뽑는 편이 정확합니다. /weather 의
    // temp_max/min 은 관측 지점들의 편차라서 하루 최고기온과 다릅니다.
    // 예보를 안 받아 왔으면 현재 응답의 값으로 대신합니다.
    high: daily[0]?.high ?? Math.round(currentData.main.temp_max),
    low: daily[0]?.low ?? Math.round(currentData.main.temp_min),
    sunrise: toTimeLabel(currentData.sys.sunrise, tz),
    sunset: toTimeLabel(currentData.sys.sunset, tz),
    humidity: currentData.main.humidity,
    wind: currentData.wind.speed,
    pressure: currentData.main.pressure,
    hourly: forecastData ? buildHourly(forecastData.list ?? [], tz) : [],
    daily,
  }
}

/* ════════════════════════════════════════════════════════════
   화면이 부르는 함수 세 개

   ── 왜 "현재"와 "예보"를 나눴나 ──────────────────────────
   처음에는 도시마다 두 엔드포인트를 함께 불렀습니다. 도시가 7개일 때는
   14회라 괜찮았지만, 20개로 늘리면서 40회가 됐습니다.
   OpenWeatherMap 무료 플랜은 분당 60회 — 1분에 두 번만 새로고침해도
   한도를 넘겨 429 가 떨어집니다.

   그런데 화면을 보면 예보 스트립은 "선택된 한 도시" 것만 그립니다.
   나머지 19개 도시의 예보는 받아 놓고 한 번도 쓰이지 않았습니다.

     목록 로드   /weather × 20                 = 20회
     도시 선택   /forecast × 1 (그 도시만)     = 1회

   필요할 때 필요한 것만 부르는 쪽으로 바꿨습니다.
   ════════════════════════════════════════════════════════════ */

/* [1] 현재 날씨만 — 목록 카드가 쓰는 최소한의 정보 */
export const fetchCityCurrent = async (cityId) => {
  const { data } = await api.get('/weather', { params: coordsOf(cityId) })
  return buildCity(cityId, data)
}

/* [2] 현재 + 예보 — 상세 페이지처럼 한 도시를 깊게 보여줄 때.

   Promise.all 로 묶는 이유: 순서대로 await 두 번 하면 첫 응답을 기다리는
   동안 두 번째는 시작조차 안 합니다. 함께 출발시키면 총 시간이 절반입니다.
   서로의 결과가 필요 없는 요청은 항상 이렇게 묶습니다. */
export const fetchCityWeather = async (cityId) => {
  const coords = coordsOf(cityId)

  const [current, forecast] = await Promise.all([api.get('/weather', { params: coords }), api.get('/forecast', { params: coords })])

  return buildCity(cityId, current.data, forecast.data)
}

/* [3] 도시 전체 — 목록 화면용. 예보는 부르지 않습니다.

   ⚠️ Promise.all 이 아니라 allSettled 인 이유:
      all 은 하나라도 실패하면 나머지가 성공했어도 전부 버립니다. 도시 한
      곳의 응답이 늦었다고 대시보드가 통째로 비면 곤란합니다.
      allSettled 는 성공/실패를 각각 알려 주므로, 실패한 도시만 seed 로
      메우고 나머지는 실시간 값을 씁니다. */
export const fetchAllCities = async () => {
  const ids = Object.keys(cityRegistry)
  const results = await Promise.allSettled(ids.map((id) => fetchCityCurrent(id)))

  lastAllCities = results.map((result, index) => {
    if (result.status === 'fulfilled') return result.value

    const id = ids[index]
    console.error(`🔴 [${id}] 실시간 조회 실패 — 저장된 값으로 대체합니다.`, result.reason?.message ?? result.reason)

    // 명부에 있는 도시는 seed 로, 검색으로 담은 도시는 자리표로 대체합니다.
    return cities.find((city) => city.id === id) ?? makePlaceholderCity({ id, ...cityRegistry[id] })
  })

  return lastAllCities
}

/* ── 마지막으로 받아 온 목록 ──────────────────────────────
   [추가] 소개 화면에 갔다가 대시보드로 돌아오면 WeatherHomeView 가 새로
   mount 됩니다. 그때 화면은 seed(저장된 값)로 먼저 그려지고, 잠시 뒤
   응답이 와서 다시 실제 값으로 바뀝니다. 눈에 보이는 증상이 둘이었습니다.

     · 기온이 잠깐 옛날 숫자로 깜빡임
     · 히어로의 날씨가 seed → 실제 로 두 번 바뀌면서, 그 날씨를 따라가는
       음악이 끊겼다가 다른 곡으로 다시 시작됨

   그래서 마지막 응답을 모듈 안에 기억해 둡니다. 모듈은 화면보다 오래
   살기 때문에(App 이 켜져 있는 동안 한 번만 평가됨) 돌아왔을 때 seed 가
   아니라 방금 보던 값으로 시작할 수 있습니다.

   ⚠️ 이것은 store 가 아니라 그냥 모듈 변수입니다. 반응형이 필요 없기
      때문입니다 — 화면은 mount 될 때 한 번만 이 값을 읽어 자기 ref 에
      담고, 그 뒤로는 자기 것으로 씁니다. 값이 바뀌었다고 화면이 저절로
      다시 그려질 필요가 없으면 ref 로 만들 이유도 없습니다.
      (본격적인 캐시 — 만료 시간, 도시별 공유 — 가 필요해지면 그때
       store 로 올리는 것이 맞습니다) */
let lastAllCities = null

export const getCachedCities = () => lastAllCities

/* ════════════════════════════════════════════════════════════
   [추가] 지역 검색 — 이름을 좌표로 (Geocoding API)

   이 앱은 좌표로만 날씨를 부릅니다. 그래서 사용자가 "속초" 라고 적으면
   먼저 그 이름을 좌표로 바꿔야 합니다. OpenWeatherMap 은 같은 키로
   /geo/1.0/direct 를 열어 둡니다 — 새 키를 발급받을 필요가 없습니다.

   baseURL 이 다른 이유 — 날씨는 /data/2.5, 지오코딩은 /geo/1.0 입니다.
   위의 api 인스턴스는 /data/2.5 에 묶여 있어서 따로 부릅니다.

   ── 한글 검색이 반쪽인 문제 ──────────────────────────────
   실제로 돌려 보면 '제주' · '판교' 는 찾는데 '속초' 는 못 찾습니다.
   OpenWeatherMap 의 한글 색인이 도시마다 들쭉날쭉합니다.
   ('Sokcho' 로는 찾고, 응답의 local_names.ko 에는 '속초시' 가 들어 있습니다)

   그래서 두 번 시도합니다.
     1) "속초,KR"  나라를 못 박아 브라질의 동명 도시를 걸러냅니다
     2) "속초"     그래도 없으면 나라 없이 한 번 더
   둘 다 비면 화면이 "영문 이름으로도 찾아보세요" 라고 안내합니다.
   ════════════════════════════════════════════════════════════ */
const geoApi = axios.create({
  baseURL: 'https://api.openweathermap.org/geo/1.0',
  timeout: 8000,
  params: { appid: API_KEY, limit: 5 },
})

/* 좌표를 그대로 id 로 씁니다 (소수점 셋째 자리까지 정수화).

   순번(city_21)으로 하지 않은 이유 — 지웠다 다시 담으면 번호가 어긋나고,
   주소창의 /weather/city_21 이 어제와 다른 도시를 가리키게 됩니다.
   좌표는 그 지점 자체라 언제 어디서 담아도 같은 id 가 나옵니다.
   덤으로 id 만 있으면 좌표를 되뽑을 수 있습니다. */
const toGeoId = (lat, lon) => `geo_${Math.round(lat * 1000)}_${Math.round(lon * 1000)}`

/* 응답 한 건을 이 앱이 쓰는 모양으로 옮깁니다.

   name 에 local_names.ko 를 먼저 쓰는 이유 — 응답의 name 은 'Sokcho-si'
   처럼 로마자입니다. 카드에 한글 이름이 필요합니다.
   region 은 시/도(state)가 있으면 그것을, 없으면 나라 코드를 씁니다. */
const toPlace = (row) => {
  const near = row.country === 'KR' ? findNearestCity(row.lat, row.lon) : null

  /* region 은 카드가 아니라 상세 화면에 적히는 줄입니다.
       한국  '경상남도 거제시 부근'   ← 우리 명부에서 가장 가까운 곳
       해외  'Ile-de-France' 또는 'FR'  ← 응답이 주는 대로 */
  const region = near ? `${near.region} 부근` : (row.state ?? row.country)

  return {
    id: toGeoId(row.lat, row.lon),
    // 카드에는 이 이름만 뜹니다 — '옥포동' · '해운대구'
    name: row.local_names?.ko ?? row.name,
    region,
    lat: row.lat,
    lon: row.lon,
    /* 후보 목록에서 어디인지 가늠하는 줄.
       같은 이름이 둘 나올 때 이 줄만 다릅니다
       ('서면 · 경상북도 포항시 부근' vs '서면 · 강원특별자치도 춘천시 부근') */
    label: near ? region : `${row.name} · ${row.country}`,
  }
}

export const searchPlaces = async (query) => {
  const keyword = query.trim()
  if (!keyword) return []

  /* 세 번 시도합니다. 앞에서 걸리면 뒤는 부르지 않습니다.

     1) "속초,KR"  나라를 못 박아 브라질의 동명 도시를 걸러냅니다
     2) "속초"      나라를 풀어 해외 지명도 찾을 수 있게 ('파리' · '방콕')
     3) "Sokcho,KR" 한글로 못 찾는 국내 지명을 보정표로 우회
                    (data/placeAliases.js — 전국 135곳을 돌려 만든 표) */
  const attempts = [`${keyword},KR`, keyword]

  const alias = toPlaceAlias(keyword)
  if (alias) attempts.push(`${alias},KR`)

  for (const q of attempts) {
    const { data } = await geoApi.get('/direct', { params: { q } })
    if (Array.isArray(data) && data.length) return data.map(toPlace)
  }

  return []
}

/* ── 좌표 → 지명 (역방향 지오코딩) ────────────────────────
   GPS 가 알려 주는 것은 숫자 두 개뿐입니다. 카드에 '37.5, 127.0' 이라고
   적을 수는 없으니 그 지점의 이름을 물어봅니다.
   응답 모양은 /direct 와 같아서 toPlace 를 그대로 씁니다. */
export const searchByCoords = async (lat, lon) => {
  const { data } = await geoApi.get('/reverse', { params: { lat, lon, limit: 1 } })
  if (!Array.isArray(data) || !data.length) return null

  /* ⚠️ 응답의 좌표가 아니라 GPS 좌표를 씁니다.
     역지오코딩은 "가장 가까운 등록 지점" 을 돌려주는데(강남역 → '서울'),
     그 지점의 좌표로 날씨를 부르면 실제 내 위치가 아니라 시청 날씨가
     됩니다. 이름만 빌리고 좌표는 내 것을 지킵니다. */
  const place = toPlace(data[0])
  return { ...place, id: toGeoId(lat, lon), lat, lon }
}

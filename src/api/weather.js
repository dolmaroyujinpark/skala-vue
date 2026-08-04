import axios from 'axios'
import { cities } from '@/data/cities'

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

/* 우리 도시 코드 ↔ OpenWeatherMap 조회 좌표 매핑.
   API 는 'city_01' 을 모르고, 우리 화면은 위경도를 안 씁니다.

   ── 도시 이름(q=) 이 아니라 좌표(lat/lon) 로 부르는 이유 ──
   처음에는 q=Seoul,KR 처럼 이름으로 짰는데 거제만 404 가 났습니다.
   OpenWeatherMap 의 이름 검색은 자체 도시 목록에 등재된 표기만 찾습니다.
   Geoje / Geoje-si / Okpo 를 전부 시도해도 없었고, 응답에 찍히는 이름은
   'Kŏje' 였습니다 — 매큔-라이샤워 표기라 우리가 맞힐 수 있는 철자가 아닙니다.

   좌표에는 그런 문제가 없습니다. 지구상의 한 점은 표기법과 무관하고,
   API 가 알아서 가장 가까운 관측 지점을 잡아 줍니다. 실제로 OpenWeatherMap
   문서도 q= 대신 좌표 사용을 권장하고 있습니다.

   덤으로 정확도도 올라갑니다 — 판교는 등재된 지명이 아니라 이름으로는
   성남시 전체를 부를 수밖에 없었는데, 좌표를 쓰면 판교 지점을 곧장 찍습니다. */
export const CITY_QUERY = {
  city_01: { lat: 37.5665, lon: 126.978, name: '서울', region: '대한민국 서울특별시' },
  city_02: { lat: 37.2636, lon: 127.0286, name: '수원', region: '경기도 수원시 영통구' },
  city_03: { lat: 35.1587, lon: 129.1604, name: '부산', region: '부산광역시 해운대구' },
  city_04: { lat: 37.3947, lon: 127.1112, name: '판교', region: '경기도 성남시 분당구' },
  city_05: { lat: 37.7519, lon: 128.8761, name: '강릉', region: '강원특별자치도 강릉시' },
  city_06: { lat: 34.8806, lon: 128.6212, name: '거제', region: '경상남도 거제시' },
  city_07: { lat: 33.4996, lon: 126.5312, name: '제주', region: '제주특별자치도 제주시' },
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

/* 반환 모양을 data/cities.js 의 Mock 과 정확히 똑같이 맞춥니다.
   그래야 화면 컴포넌트를 한 줄도 안 고치고 데이터 출처만 바꿀 수 있습니다.
   (Mock 에만 있던 uv 는 무료 API 에 없어서 뺐고, 화면에서도 뺐습니다) */
const buildCity = (cityId, currentData, forecastData) => {
  const meta = CITY_QUERY[cityId]
  const tz = currentData.timezone ?? 32400
  const daily = buildDaily(forecastData.list ?? [], tz)

  return {
    id: cityId,
    name: meta.name,
    region: meta.region,
    temp: Math.round(currentData.main.temp),
    status: currentData.weather[0]?.description ?? '정보 없음',
    icon: toCityIcon(currentData.weather[0]?.icon),
    // 오늘의 최고/최저는 예보에서 뽑는 편이 정확합니다. /weather 의
    // temp_max/min 은 관측 지점들의 편차라서 하루 최고기온과 다릅니다.
    high: daily[0]?.high ?? Math.round(currentData.main.temp_max),
    low: daily[0]?.low ?? Math.round(currentData.main.temp_min),
    sunrise: toTimeLabel(currentData.sys.sunrise, tz),
    sunset: toTimeLabel(currentData.sys.sunset, tz),
    humidity: currentData.main.humidity,
    wind: currentData.wind.speed,
    pressure: currentData.main.pressure,
    hourly: buildHourly(forecastData.list ?? [], tz),
    daily,
  }
}

/* ────────────────────────────────────────────────
   화면이 부르는 함수는 이 둘뿐입니다
   ──────────────────────────────────────────────── */

/* 도시 하나 — 현재와 예보를 동시에 부릅니다.
   순서대로 await 두 번 하면 첫 응답을 기다리는 동안 두 번째는 시작조차
   안 합니다. Promise.all 로 묶으면 둘이 같이 출발해 총 시간이 절반입니다.
   서로의 결과가 필요 없는 요청은 항상 이렇게 묶습니다. */
export const fetchCityWeather = async (cityId) => {
  const meta = CITY_QUERY[cityId]
  if (!meta) throw new Error(`알 수 없는 도시 코드: ${cityId}`)

  const coords = { lat: meta.lat, lon: meta.lon }

  const [current, forecast] = await Promise.all([api.get('/weather', { params: coords }), api.get('/forecast', { params: coords })])

  return buildCity(cityId, current.data, forecast.data)
}

/* 도시 전체 — 7개를 한꺼번에 부릅니다.

   ⚠️ Promise.all 이 아니라 allSettled 인 이유:
      all 은 하나라도 실패하면 나머지가 성공했어도 전부 버립니다. 도시 한
      곳의 응답이 늦었다고 대시보드가 통째로 비면 곤란합니다.
      allSettled 는 성공/실패를 각각 알려 주므로, 실패한 도시만 Mock 으로
      메우고 나머지는 실시간 값을 씁니다. */
export const fetchAllCities = async () => {
  const ids = Object.keys(CITY_QUERY)
  const results = await Promise.allSettled(ids.map((id) => fetchCityWeather(id)))

  return results.map((result, index) => {
    if (result.status === 'fulfilled') return result.value

    const id = ids[index]
    console.error(`🔴 [${id}] 실시간 조회 실패 — Mock 으로 대체합니다.`, result.reason?.message ?? result.reason)
    return cities.find((city) => city.id === id)
  })
}

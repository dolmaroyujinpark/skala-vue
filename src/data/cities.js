/* ════════════════════════════════════════════════════════════
   [3일차 과제] 도시 Mock 데이터 — 화면 밖으로 뺀 이유

   2일차까지는 이 배열이 WeatherParent.vue 안에 있었습니다. 화면이 하나뿐이라
   그래도 됐지만, 3일차에 라우터가 붙으면서 같은 데이터를 두 화면이 씁니다.

     /              WeatherHomeView   — 카드 목록 · 검색 · 정렬
     /weather/:id   WeatherDetailView — 그중 한 도시의 상세

   여기서 데이터를 각 화면에 복사해 두면, 도시를 하나 추가할 때 두 파일을
   똑같이 고쳐야 하고 한쪽만 고치면 목록에는 있는데 상세는 "없는 도시"가 됩니다.
   그래서 데이터는 한 벌만 두고 두 화면이 같은 모듈을 import 합니다.

   ── 필드 ─────────────────────────────────────────────────
     id · name · temp · status        1일차 과제 스펙 그대로
     icon · high · low · hourly ·     화면을 채우려고 덧붙인 값
     daily · sunrise · sunset
     region · humidity · wind ·       [3일차 추가] 상세 페이지 전용 지표
     pressure · uv

   ⚠️ 이 배열은 "원본"이라 export 한 뒤 아무도 직접 고치지 않습니다.
      화면에서 도시를 지우는 건 각 화면이 ref 로 복사본을 만들어 그 위에서 합니다.
   ════════════════════════════════════════════════════════════ */
export const cities = [

  {
    id: 'city_01',
    name: '서울',
    temp: 28,
    status: '맑음',
    icon: 'sun',
    high: 31,
    low: 22,
    sunrise: '05:32',
    sunset: '19:48',
    region: '대한민국 서울특별시',
    humidity: 55,
    wind: 2.5,
    pressure: 1008,
    uv: 8,
    hourly: [
      { id: 'h1', time: '10:00', icon: 'sun', temp: 28 },
      { id: 'h2', time: '11:00', icon: 'sun', temp: 29 },
      { id: 'h3', time: '12:00', icon: 'partly', temp: 30 },
      { id: 'h4', time: '13:00', icon: 'cloud', temp: 31 },
      { id: 'h5', time: '14:00', icon: 'cloud', temp: 30 },
      { id: 'h6', time: '15:00', icon: 'night', temp: 29 },
    ],
    daily: [
      { id: 'd1', date: 'JUL 31', icon: 'sun', high: 31, low: 22 },
      { id: 'd2', date: 'AUG 01', icon: 'sun', high: 32, low: 23 },
      { id: 'd3', date: 'AUG 02', icon: 'partly', high: 29, low: 22 },
      { id: 'd4', date: 'AUG 03', icon: 'rain', high: 26, low: 21 },
      { id: 'd5', date: 'AUG 04', icon: 'rain', high: 25, low: 20 },
      { id: 'd6', date: 'AUG 05', icon: 'sun', high: 30, low: 21 },
    ],
  },
  {
    id: 'city_02',
    name: '수원',
    temp: 24,
    status: '비',
    icon: 'rain',
    high: 26,
    low: 19,
    sunrise: '05:34',
    sunset: '19:47',
    region: '경기도 수원시 영통구',
    humidity: 85,
    wind: 4.1,
    pressure: 1005,
    uv: 3,
    hourly: [
      { id: 'h1', time: '10:00', icon: 'rain', temp: 24 },
      { id: 'h2', time: '11:00', icon: 'rain', temp: 24 },
      { id: 'h3', time: '12:00', icon: 'rain', temp: 25 },
      { id: 'h4', time: '13:00', icon: 'cloud', temp: 26 },
      { id: 'h5', time: '14:00', icon: 'cloud', temp: 25 },
      { id: 'h6', time: '15:00', icon: 'night', temp: 24 },
    ],
    daily: [
      { id: 'd1', date: 'JUL 31', icon: 'rain', high: 26, low: 19 },
      { id: 'd2', date: 'AUG 01', icon: 'rain', high: 25, low: 19 },
      { id: 'd3', date: 'AUG 02', icon: 'cloud', high: 27, low: 20 },
      { id: 'd4', date: 'AUG 03', icon: 'cloud', high: 28, low: 21 },
      { id: 'd5', date: 'AUG 04', icon: 'partly', high: 29, low: 21 },
      { id: 'd6', date: 'AUG 05', icon: 'sun', high: 30, low: 22 },
    ],
  },
  {
    id: 'city_03',
    name: '부산',
    temp: 26,
    status: '구름',
    icon: 'cloud',
    high: 28,
    low: 23,
    sunrise: '05:21',
    sunset: '19:38',
    region: '부산광역시 해운대구',
    humidity: 65,
    wind: 5.0,
    pressure: 1010,
    uv: 6,
    hourly: [
      { id: 'h1', time: '10:00', icon: 'cloud', temp: 26 },
      { id: 'h2', time: '11:00', icon: 'cloud', temp: 27 },
      { id: 'h3', time: '12:00', icon: 'partly', temp: 28 },
      { id: 'h4', time: '13:00', icon: 'sun', temp: 28 },
      { id: 'h5', time: '14:00', icon: 'cloud', temp: 27 },
      { id: 'h6', time: '15:00', icon: 'night', temp: 26 },
    ],
    daily: [
      { id: 'd1', date: 'JUL 31', icon: 'cloud', high: 28, low: 23 },
      { id: 'd2', date: 'AUG 01', icon: 'sun', high: 30, low: 24 },
      { id: 'd3', date: 'AUG 02', icon: 'sun', high: 31, low: 24 },
      { id: 'd4', date: 'AUG 03', icon: 'partly', high: 29, low: 23 },
      { id: 'd5', date: 'AUG 04', icon: 'rain', high: 27, low: 22 },
      { id: 'd6', date: 'AUG 05', icon: 'cloud', high: 28, low: 23 },
    ],
  },
  {
    id: 'city_04',
    name: '판교',
    temp: 29,
    status: '맑음',
    icon: 'sun',
    high: 32,
    low: 23,
    sunrise: '05:33',
    sunset: '19:47',
    region: '경기도 성남시 분당구',
    humidity: 50,
    wind: 2.1,
    pressure: 1009,
    uv: 9,
    hourly: [
      { id: 'h1', time: '10:00', icon: 'sun', temp: 29 },
      { id: 'h2', time: '11:00', icon: 'sun', temp: 30 },
      { id: 'h3', time: '12:00', icon: 'sun', temp: 31 },
      { id: 'h4', time: '13:00', icon: 'partly', temp: 32 },
      { id: 'h5', time: '14:00', icon: 'cloud', temp: 31 },
      { id: 'h6', time: '15:00', icon: 'night', temp: 29 },
    ],
    daily: [
      { id: 'd1', date: 'JUL 31', icon: 'sun', high: 32, low: 23 },
      { id: 'd2', date: 'AUG 01', icon: 'sun', high: 33, low: 24 },
      { id: 'd3', date: 'AUG 02', icon: 'partly', high: 30, low: 23 },
      { id: 'd4', date: 'AUG 03', icon: 'rain', high: 27, low: 22 },
      { id: 'd5', date: 'AUG 04', icon: 'cloud', high: 28, low: 22 },
      { id: 'd6', date: 'AUG 05', icon: 'sun', high: 31, low: 23 },
    ],
  },
  {
    id: 'city_05',
    name: '강릉',
    temp: 30,
    status: '맑음',
    icon: 'sun',
    high: 33,
    low: 24,
    sunrise: '05:27',
    sunset: '19:44',
    region: '강원특별자치도 강릉시',
    humidity: 45,
    wind: 3.4,
    pressure: 1011,
    uv: 10,
    hourly: [
      { id: 'h1', time: '10:00', icon: 'sun', temp: 30 },
      { id: 'h2', time: '11:00', icon: 'sun', temp: 31 },
      { id: 'h3', time: '12:00', icon: 'sun', temp: 33 },
      { id: 'h4', time: '13:00', icon: 'sun', temp: 33 },
      { id: 'h5', time: '14:00', icon: 'partly', temp: 32 },
      { id: 'h6', time: '15:00', icon: 'night', temp: 30 },
    ],
    daily: [
      { id: 'd1', date: 'JUL 31', icon: 'sun', high: 33, low: 24 },
      { id: 'd2', date: 'AUG 01', icon: 'sun', high: 34, low: 25 },
      { id: 'd3', date: 'AUG 02', icon: 'sun', high: 33, low: 25 },
      { id: 'd4', date: 'AUG 03', icon: 'partly', high: 31, low: 24 },
      { id: 'd5', date: 'AUG 04', icon: 'cloud', high: 29, low: 23 },
      { id: 'd6', date: 'AUG 05', icon: 'sun', high: 32, low: 24 },
    ],
  },
  {
    id: 'city_06',
    name: '거제',
    temp: 27,
    status: '구름',
    icon: 'cloud',
    high: 29,
    low: 24,
    sunrise: '05:24',
    sunset: '19:39',
    region: '경상남도 거제시',
    humidity: 70,
    wind: 4.6,
    pressure: 1009,
    uv: 6,
    hourly: [
      { id: 'h1', time: '10:00', icon: 'cloud', temp: 27 },
      { id: 'h2', time: '11:00', icon: 'cloud', temp: 28 },
      { id: 'h3', time: '12:00', icon: 'partly', temp: 29 },
      { id: 'h4', time: '13:00', icon: 'partly', temp: 29 },
      { id: 'h5', time: '14:00', icon: 'cloud', temp: 28 },
      { id: 'h6', time: '15:00', icon: 'night', temp: 27 },
    ],
    daily: [
      { id: 'd1', date: 'JUL 31', icon: 'cloud', high: 29, low: 24 },
      { id: 'd2', date: 'AUG 01', icon: 'partly', high: 30, low: 24 },
      { id: 'd3', date: 'AUG 02', icon: 'sun', high: 31, low: 25 },
      { id: 'd4', date: 'AUG 03', icon: 'rain', high: 28, low: 24 },
      { id: 'd5', date: 'AUG 04', icon: 'rain', high: 27, low: 23 },
      { id: 'd6', date: 'AUG 05', icon: 'cloud', high: 29, low: 24 },
    ],
  },
  {
    id: 'city_07',
    name: '제주',
    temp: 25,
    status: '비',
    icon: 'rain',
    high: 27,
    low: 23,
    sunrise: '05:35',
    sunset: '19:44',
    region: '제주특별자치도 제주시',
    humidity: 80,
    wind: 6.2,
    pressure: 1004,
    uv: 4,
    hourly: [
      { id: 'h1', time: '10:00', icon: 'rain', temp: 25 },
      { id: 'h2', time: '11:00', icon: 'rain', temp: 25 },
      { id: 'h3', time: '12:00', icon: 'rain', temp: 26 },
      { id: 'h4', time: '13:00', icon: 'cloud', temp: 27 },
      { id: 'h5', time: '14:00', icon: 'cloud', temp: 26 },
      { id: 'h6', time: '15:00', icon: 'night', temp: 25 },
    ],
    daily: [
      { id: 'd1', date: 'JUL 31', icon: 'rain', high: 27, low: 23 },
      { id: 'd2', date: 'AUG 01', icon: 'rain', high: 26, low: 23 },
      { id: 'd3', date: 'AUG 02', icon: 'cloud', high: 28, low: 24 },
      { id: 'd4', date: 'AUG 03', icon: 'partly', high: 29, low: 24 },
      { id: 'd5', date: 'AUG 04', icon: 'sun', high: 30, low: 25 },
      { id: 'd6', date: 'AUG 05', icon: 'sun', high: 30, low: 25 },
    ],
  },
]

/* id 로 도시 하나를 찾습니다. 없는 id 면 undefined 를 돌려주고,
   "없다"는 판단은 호출한 화면이 합니다. (상세 페이지는 안내 문구를 띄웁니다)

   find 는 매번 배열을 훑지만 도시가 7개뿐이라 의미 있는 비용이 아닙니다.
   나중에 수백 개가 되면 Map 으로 바꾸면 됩니다. */
export const findCityById = (cityId) => cities.find((city) => city.id === cityId)

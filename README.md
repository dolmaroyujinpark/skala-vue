# 🌤️ Dora's Weather

전국 20개 지역의 실시간 날씨와 예보를 한 화면에서 보는 대시보드입니다.
기온에 맞는 옷차림을 추천하고, 그날 하늘에 어울리는 플레이리스트를 틀어 줍니다.

SKALA Full-Stack Engineering — Frontend framework (Vue.js) 과정의 실습 과제입니다.

<br>

## I. 개발자 (Developer) 👥

| 박유진(FE) |
|:---:|
| <img src="https://github.com/dolmaroyujinpark.png" width="100"> |
| [@dolmaroyujinpark](https://github.com/dolmaroyujinpark) |

<br><br>

## II. 실행 방법 (Getting Started) ⚙️

```bash
npm install
cp .env.example .env.local     # OpenWeatherMap 키를 채웁니다
npm run dev
```

API 키는 `.env.local` 에 두고 커밋하지 않습니다 (`.gitignore` 의 `*.local`).

```bash
VITE_OWM_API_KEY=발급받은_키
```

키가 없어도 앱은 뜹니다 — `data/cities.js` 의 저장된 값으로 화면을 채우고, 상태바가 실시간이 아님을 알려 줍니다.

| 명령 | 하는 일 |
|:---|:---|
| `npm run dev` | 개발 서버 |
| `npm run build` | `dist/` 로 정적 빌드 |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm run lint` | oxlint + eslint |
| `npm run format` | Prettier |

<br><br>

## III. 화면 (Pages) 🗺️

| 경로 | 화면 | 하는 일 |
|:---|:---|:---|
| `/` | 대시보드 | 선택한 도시의 큰 기온 · 옷차림 · 예보, 20개 도시 카드, 검색 · 정렬 · 즐겨찾기 |
| `/weather/:cityId` | 도시 상세 | 습도 · 풍속 · 기압 · 일출/일몰과 시간별 · 일별 예보 |
| `/about` | 소개 | 무엇이 과제이고 무엇이 덤인지, 어떤 값을 왜 store 에 두었는지 |
| 그 외 | 404 | 정의되지 않은 주소를 전부 받는 Catch-all |

<br><br>

## IV. 기술 스택 (Tech Stack) 🧰

`Vue 3 (Composition API · script setup)` · `Vue Router` · `Pinia` · `Axios` · `Element Plus` · `Vite`

날씨는 [OpenWeatherMap](https://openweathermap.org/api) 에서 받아 옵니다.
현재 날씨는 `/weather`, 예보는 3시간 간격 5일치를 주는 `/forecast` 를 받아 시간별 · 일별 두 벌로 가공합니다.

도시는 이름 대신 **좌표로** 조회합니다 — 영문 표기가 제각각이라(거제는 응답에 `Kŏje` 로 옵니다) 이름으로는 못 찾는 곳이 있었습니다.

<br><br>

## V. 과제 요구사항 (Requirements) ✅

| 요구사항 | 구현 |
|:---|:---|
| 배열 렌더링 (`v-for` · `:key` 는 id) | `WeatherHomeView` → `WeatherCard` |
| 조건부 렌더링 (`v-if` / `v-else`, 25℃ 기준) | `WeatherCard` · `WeatherHero` 의 HOT / COOL 배지 |
| 컴포넌트 분리 (Props · Emits · Slot) | `components/mine/weather/` — 상태는 부모가 쥐고, 자식은 신호만 올립니다 |
| `computed` · `watch` · `watchEffect` | `WeatherHomeView` 의 검색 · 정렬 · 콘솔 로그 |
| Vue Router (지연 로딩 · 동적 경로 · Catch-all) | `router/index.js` |
| Pinia (state · getters · actions) | `stores/` — 아래 VI 참고 |
| Axios 연동 · 로딩 / 실패 표시 | `api/weather.js` · 대시보드 상태바 · 상세의 `OFFLINE` 안내 |
| Element Plus | 정렬 `el-select`, 설명 말풍선 `el-tooltip` |

<br><br>

## VI. 상태 관리 판단 (State) 🗃️

store 로 올릴지는 두 가지만 물어보고 정했습니다.
**화면보다 오래 살아야 하는가**, **트리로 이어지지 않는 두 곳 이상이 쓰는가**.
둘 다 아니면 그냥 `ref` 로 남겼습니다 — 전역으로 올리는 순간 "이 값이 어디서 바뀌었나" 를 찾을 범위가 앱 전체로 넓어지기 때문입니다.

| 값 | 자리 | 이유 |
|:---|:---|:---|
| ℃ / ℉ 단위 | `configStore` | 앱 바 · 히어로 · 카드 · 상세가 씁니다. 앱 바와 카드는 조상-후손이 아니라 props 로 안 이어집니다 |
| 즐겨찾기 목록 | `favoriteStore` | 새로고침해도 남아야 해서 localStorage 와 짝입니다. 저장 watch 가 화면에 있으면 그 화면이 떠 있을 때만 저장됩니다 |
| 음악 재생 상태 | `radioStore` | 소리를 내는 `RadioEngine`(앱 셸)과 누르는 `WeatherRadio`(히어로 안)는 형제라 props 로 이을 방법이 없습니다 |
| 다크 / 라이트 | `App.vue` 의 `ref` | 읽는 곳이 `:class` 한 줄뿐입니다. 자식들은 CSS 변수를 상속으로 받아 테마를 알 필요조차 없습니다 |
| 검색어 · 정렬 · 선택 도시 | `WeatherHomeView` 의 `ref` | 화면을 떠나면 사라지는 것이 맞습니다 |

한때 대표 도시를 지정하는 `pinStore` 가 하나 더 있었습니다.
즐겨찾기 순서가 같은 일을 더 잘하게 되자 — 최근에 담은 도시가 맨 앞이고 그게 곧 대표입니다 — 존재 이유가 사라져 걷어냈습니다.
기준은 만들 때만 쓰는 것이 아니라 지울 때도 씁니다.

<br><br>

## VII. 직접 붙인 기능 (Extras) ✨

| 기능 | 설명 |
|:---|:---|
| ⭐ 즐겨찾기 · 정렬 | 별을 누른 순서가 곧 목록 순서입니다. 다시 담으면 맨 앞으로 오고, 맨 앞 도시가 앱을 켤 때 뜹니다 |
| 👕 옷차림 추천 | 기상청 생활기상지수의 체감온도별 구간표를 그대로 옮겨, 기온에서 `computed` 로 파생시킵니다 |
| 🎵 날씨 라디오 | 하늘을 여섯 갈래로 나눠 갈래마다 플레이리스트를 걸어 두고 YouTube IFrame Player API 로 재생합니다. 재생기가 `RouterView` 바깥에 있어 화면을 옮겨도 끊기지 않습니다 |
| 🌗 스플래시 · 테마 | 웹폰트가 준비될 때까지 스플래시로 덮고, 다크 / 라이트는 OS 설정을 따라갑니다 |

<br><br>

## VIII. 폴더 구조 (Structure) 📁

```
src/
├── api/weather.js          바깥 세상과 이야기하는 유일한 파일
├── data/                   API 가 모르는 것 — 도시 명부 · 상태 문구 · 옷차림 표 · 플레이리스트
├── stores/                 configStore · favoriteStore · radioStore
├── router/index.js         지연 로딩 · 동적 경로 · Catch-all
├── views/                  주소마다 갈아끼워지는 화면 넷
├── components/mine/        이 앱을 이루는 부품 (weather · icons)
└── assets/                 테마 토큰 · 공용 유틸 · Element Plus 톤 맞추기
```

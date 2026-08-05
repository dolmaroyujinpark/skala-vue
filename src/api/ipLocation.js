import axios from 'axios'

/* ════════════════════════════════════════════════════════════
   [추가] IP 로 대략적인 위치 구하기 — 브라우저 측위가 실패했을 때

   ── 왜 필요했나 ──────────────────────────────────────────
   브라우저에 위치를 "허용" 해 줘도 좌표가 안 오는 환경이 있습니다.
   실제로 이 프로젝트를 만든 맥이 그렇습니다.

     · 시스템 설정 > 개인정보 보호 > 위치 서비스에서 Chrome 은 켜져 있음
     · 그런데도 getCurrentPosition 이 오류 코드 2(POSITION_UNAVAILABLE)

   맥에는 GPS 칩이 없어서, 위치를 물으면 주변 WiFi 목록을 애플 서버에
   보내 "이 신호가 잡히는 곳은 어디" 를 되받습니다. 사내망이나 VPN 이
   그 통신을 막으면 권한과 무관하게 좌표를 만들 수 없습니다.
   즉 앱이 고칠 수 없는 실패입니다 — 코드를 아무리 고쳐도 브라우저는
   같은 오류를 돌려줍니다.

   ── 그래서 무엇을 하나 ────────────────────────────────────
   같은 질문을 다른 곳에 물어봅니다. 접속한 IP 가 어느 동네 것인지는
   외부 서비스가 알고 있습니다. 정확하지는 않지만("성남시" 수준)
   이 앱이 위치로 하는 일은 두 가지뿐이라 그 정도면 됩니다.

     · 도시 20곳 중 가장 가까운 곳 고르기 (서로 50km 간격)
     · 그 좌표의 지명을 찾아 후보로 올리기

   ── 왜 ipwho.is 인가 ─────────────────────────────────────
   가입·API 키 없이 HTTPS 와 CORS 를 열어 둔 곳이라 브라우저에서 바로
   부를 수 있습니다. (ipapi.co 도 후보였지만 무료 한도가 빨리 차서
   RateLimited 를 돌려줍니다. ip-api.com 은 무료 플랜이 HTTP 뿐이라
   HTTPS 페이지에서 차단됩니다.)

   ⚠️ VPN 을 켜 두면 VPN 출구의 위치가 나옵니다. 그래서 이 값은
      "확정" 이 아니라 "짐작" 으로 다룹니다 — 화면에도 그렇게 적고,
      아래 accuracy 로 신뢰도를 정직하게 신고합니다.
   ════════════════════════════════════════════════════════════ */

/* IP 위치는 오차를 알려 주지 않습니다. 그래서 우리가 정해 줘야 하는데,
   이 숫자가 곧 WeatherHomeView 의 isAccurateEnough 를 통과하느냐를
   가릅니다(한계 25km).

   20km 로 잡은 이유 — IP 위치는 보통 시/군 단위까지는 맞습니다.
   도시들이 50km 간격이니 20km 오차로도 어느 쪽이 가까운지는 갈립니다.
   실제보다 낙관적으로(예: 1km) 신고하면 안 됩니다. 그러면 나중에
   오차로 거르는 장치가 통째로 무의미해집니다. */
const IP_LOCATION_ACCURACY_M = 20000

/* 5초. 브라우저 측위(8초 × 2)가 이미 실패한 뒤에 부르는 마지막 시도라,
   여기서 또 오래 끌면 사용자는 버튼이 죽은 줄 압니다. */
const ipApi = axios.create({ baseURL: 'https://ipwho.is', timeout: 5000 })

/* 반환 모양을 브라우저의 GeolocationPosition 과 똑같이 맞춥니다.
   그래야 부르는 쪽이 "이건 IP 로 구한 값" 이라고 분기하지 않아도
   isAccurateEnough · findNearestOf 에 그대로 흘려보낼 수 있습니다.

   source 만 하나 덧붙입니다. 화면에 "짐작한 위치입니다" 라고 적어야 할
   때가 있고, 탭 복귀 시 "이동했나?" 를 묻는 데는 쓰면 안 되기 때문입니다
   (책상에 앉아 있으면 IP 는 영원히 그대로라 이동을 감지할 수 없습니다). */
export const locateByIp = async () => {
  const { data } = await ipApi.get('/')

  /* ⚠️ 실패해도 HTTP 200 으로 옵니다. 본문의 success 를 봐야 합니다 —
     axios 의 에러 처리만 믿으면 좌표 자리에 undefined 가 흘러갑니다. */
  if (!data?.success || typeof data.latitude !== 'number' || typeof data.longitude !== 'number') {
    throw new Error(data?.message ?? 'IP 로 위치를 알아내지 못했습니다')
  }

  console.log(`🌐 [geo] IP 로 짐작한 위치 — ${data.city ?? '?'} (${data.latitude.toFixed(4)}, ${data.longitude.toFixed(4)})`)

  return {
    coords: { latitude: data.latitude, longitude: data.longitude, accuracy: IP_LOCATION_ACCURACY_M },
    timestamp: Date.now(),
    source: 'ip',
  }
}

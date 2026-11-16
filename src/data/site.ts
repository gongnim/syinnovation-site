export const company = {
  name: '신영이노베이션',
  nameEn: 'SYINNOVATION',
  legal: '㈜신영이노베이션',
  ceo: '강형구',
  bizNo: '439-88-02733', // 사업자등록번호, as on the previous homepage footer
  address: '서울 마포구 마포대로 78, 제2서울핀테크랩 (경찰공제회 11층)',
  email: 'mkt@syinnovation.net',
  phone: '070-4236-9504', // from the user's screenshot of the company contact block (2026-11-11)
  slogan: 'RE:Think innovation',
  motto: 'Never Trust, Always Verify',
};

// Brand is now "Trust ..." only; the old "TrustIn" prefix (still in SDS/code) is not used publicly.
export const appName = 'Trust Auth';

// Trust Gateway's three uses (user-confirmed 2026-11-11). Shared by home and /trust-gateway.
export const parts = [
  { k: '통합 인증', who: '금융사 앱에', h: '비밀번호 대신 휴대폰 보안 칩으로', short: '카드사와 저축은행 인증 서비스에서 운영 중인 모바일 인증 기술을 금융사 앱에 넣습니다.', d: '카드사와 저축은행 인증 서비스에서 운영 중인 모바일 인증 기술입니다. SDK로 금융사 앱에 넣어, 휴대폰 보안 칩 안의 키와 인증서로 본인을 확인합니다.', pts: ['기기 · 사용자 · 생체 인증서', '고객사 앱에 넣는 SDK', 'iOS · Android'] },
  { k: '직원용', who: '임직원과 협력사에게', h: 'VPN 없이 여는 사내 업무', short: 'PC는 기기를, 휴대폰은 사용자를 증명하고, 매 순간 다시 확인해 허락된 업무만 엽니다.', d: 'PC는 기기를, 휴대폰은 사용자를 증명하고, 게이트웨이가 매 순간 다시 확인합니다. 허락된 업무 앱과 경로만 열립니다.', pts: ['매 순간 재평가', '들어오는 포트 없음', 'Windows · macOS'] },
  { k: '대고객용', who: '결제사에게', h: '이상거래를 탐지해 알림', short: '결제 거래에서 이상거래를 탐지해 고객사 FDS에 알림과 권고를 보내고, 리포트로 FDS 규칙의 오탐과 미탐을 진단합니다.', d: '결제사가 보낸 거래의 기기, 위치, 금액 같은 신호를 평소와 비교해 이상거래를 탐지합니다. 이상하면 고객사 FDS에 알림과 권고를 근거와 함께 보내고, 권고 뒤에도 승인된 거래와 FDS 규칙의 오탐과 미탐은 리포트로 알립니다. 결제 승인과 거절은 고객사가 정합니다.', pts: ['탐지와 알림, 결정은 고객사', '사후 리포트와 FDS 진단', '같은 판단 엔진 공유'] },
];

// Where Trust Gateway is used, as tabs on home and /trust-gateway (i: icon on home; g: which of the three uses)
// user, 2026-11-16: no 금융 앱 인증 tab (통합 인증 stays in parts, it is just not one of the tabs)
const [, staff, pay] = parts;
export const tgUses = [
  // user, 2026-11-13: not only from outside; it is the everyday system inside the office too, for internal and external systems
  { id: 'office', i: 'server', g: staff.k, t: '사내 업무', h: '사무실 안에서도 같은 기준으로', d: '밖에서만 쓰는 것이 아닙니다. 사무실에서 평소 업무를 볼 때도 Trust Gateway가 매 순간 사람과 기기를 확인합니다. 사내망에 있다는 이유만으로 믿지 않습니다.', pts: ['사무실 안과 밖에 같은 기준 적용', '대내외 업무 시스템에 적용', '망분리 완화 대응', '허락된 업무 앱과 경로만 연결'] },
  { id: 'remote', i: 'pin', g: staff.k, t: '재택 · 출장', h: '집에서도, 출장지에서도 같은 확인', d: '업무 PC와 내 휴대폰이 함께 있어야 접속됩니다. 낯선 네트워크로 바뀌면 휴대폰으로 다시 확인합니다.', pts: ['VPN 없이 허락된 업무 앱만 연결', '새 네트워크에서는 휴대폰으로 추가 인증', '분실 PC는 관리 콘솔에서 바로 차단'] },
  { id: 'partner', i: 'user', g: staff.k, t: '협력사 · 외주', h: '필요한 사람에게 필요한 앱만', d: '협력사 인력에게 사내망 전체가 아닌 지정된 앱과 경로만 열어 줍니다.', pts: ['사람별, 경로별 허용 범위 지정', '인사 시스템 연동으로 퇴사·계약 종료 반영', '누가 무엇에 접속했는지 기록'] },
  { id: 'shared', i: 'laptop', g: staff.k, t: '공용 PC', h: '한 대의 PC를 여러 사람이 써도', d: '회사 PC의 기기 신원과 지금 쓰는 사람의 신원을 따로 관리합니다. 사람이 바뀌면 휴대폰으로 다시 본인 확인을 하고, 각자 권한에 맞는 업무 앱만 엽니다.', pts: ['기기 신원과 사용자 신원을 따로 관리', '사용자 전환이나 자리 비움 때 이전 사용자의 인증 해제', '각자 권한에 맞는 업무 앱만 연결'] },
  { id: 'payment', i: 'chart', g: pay.k, t: '결제 이상거래', h: '이상거래를 찾아 알립니다', d: '결제사가 거래를 보내면 기기, 위치, 금액 같은 신호를 평소와 비교해 이상거래를 찾습니다. 이상하면 고객사 FDS에 알림과 권고를 근거와 함께 보내고, 결제 승인과 거절은 고객사가 정합니다.', pts: ['이상거래 실시간 알림과 권고', '권고 뒤 승인된 거래는 리포트로 다시 알림', '고객사 FDS 규칙 보완(오탐 · 미탐 · 중복 규칙)'] },
];

// 자료실 has three pages; the header shows them as its sub-menu and each page shows them as tabs
export const libraryNav = [
  { href: '/library', label: '문서' },
  { href: '/library/videos', label: '영상' },
  { href: '/library/glossary', label: '용어집' },
];

// 소식 has two pages: the header shows them as its sub-menu and each page shows them as tabs
export const newsNav = [
  { href: '/news', label: '사내소식' },
  { href: '/news/press', label: '언론보도' },
];

export const nav: { href: string; label: string; children?: { href: string; label: string }[] }[] = [
  // CEO, 2026-11-16: not everyone knows the logo goes home
  { href: '/', label: '홈' },
  { href: '/trust-gateway', label: 'Trust Gateway' },
  { href: '/consulting', label: 'IT 컨설팅·개발' },
  { href: '/news', label: '소식', children: newsNav },
  { href: '/library', label: '자료실', children: libraryNav },
  { href: '/company', label: '회사소개' },
];

// the one button on the right of the header (PacketGo puts its 접속하기 there)
export const cta = { href: '/contact', label: '문의하기' };

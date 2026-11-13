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
  { k: '직원용', who: '임직원과 협력사에게', h: 'VPN 없이 여는 사내 업무', short: 'PC는 기기를, 휴대폰은 사람을 증명하고, 요청마다 다시 확인해 허락된 업무만 엽니다.', d: 'PC는 기기를, 휴대폰은 사람을 증명하고, 게이트웨이가 요청마다 다시 확인합니다. 허락된 업무 앱과 경로만 열립니다.', pts: ['요청마다 재평가', '들어오는 포트 0', 'Windows · macOS'] },
  { k: '대고객용', who: '결제사에게', h: '결제 위험도를 평가해 권고', short: '결제 거래의 위험도를 평가해 결제사에 권고하고, 고객사 FDS 룰의 오탐과 미탐을 진단합니다.', d: '결제사가 보낸 거래의 기기와 위치, 신호 사이의 모순을 평가해 승인, 추가 확인, 보류를 권고합니다. 고객사 FDS 룰의 오탐과 미탐도 진단합니다.', pts: ['최종 결정은 결제사', 'FDS 룰 진단', '같은 판단 엔진 공유'] },
];

// Where Trust Gateway is used, as tabs on home and /trust-gateway (i: icon on home; g: which of the three uses)
const [auth, staff, pay] = parts;
export const tgUses = [
  { id: 'remote', i: 'pin', g: staff.k, t: '재택 · 출장', h: '집에서도, 출장지에서도 같은 확인', d: '업무 PC와 내 휴대폰이 함께 있어야 접속됩니다. 낯선 네트워크로 바뀌면 휴대폰으로 다시 확인합니다.', pts: ['VPN 없이 허락된 업무 앱만 연결', '새 네트워크에서는 휴대폰으로 추가 인증', '분실 PC는 관리 콘솔에서 바로 차단'] },
  { id: 'partner', i: 'user', g: staff.k, t: '협력사 · 외주', h: '필요한 사람에게 필요한 앱만', d: '협력사 인력에게 사내망 전체가 아닌 지정된 앱과 경로만 열어 줍니다.', pts: ['사람별, 경로별 허용 범위 지정', '인사 시스템 연동으로 퇴사·계약 종료 반영', '누가 무엇에 접속했는지 기록'] },
  { id: 'shared', i: 'laptop', g: staff.k, t: '공용 PC', h: '한 대의 PC를 여러 사람이 써도', d: '회사 PC의 기기 신원과 지금 쓰는 사람의 신원을 따로 관리합니다. 사람이 바뀌면 휴대폰으로 다시 본인 확인을 하고, 각자 권한에 맞는 업무 앱만 엽니다.', pts: ['사람이 바뀌면 휴대폰으로 다시 본인 확인', '사용자 전환이나 자리 비움 때 이전 사람의 확인 해제', '각자 권한에 맞는 업무 앱만 연결'] },
  { id: 'auth', i: 'phone', g: auth.k, t: '금융 앱 인증', h: auth.h, d: auth.d, pts: auth.pts },
  { id: 'payment', i: 'chart', g: pay.k, t: '결제 이상거래', h: '결제 위험도를 평가해 권고합니다', d: '결제사가 거래를 보내면 기기와 위치, 신호 사이의 모순을 평가해 승인, 추가 확인, 보류를 권고합니다. 최종 결정은 결제사가 합니다.', pts: ['승인 · 추가 확인 · 보류 권고', '최종 차단은 결제사가 결정', '고객사 FDS 룰 진단(오탐 · 미탐 · 중복 룰)'] },
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
  { href: '/trust-gateway', label: 'Trust Gateway' },
  { href: '/consulting', label: 'IT 컨설팅·개발' },
  { href: '/news', label: '소식', children: newsNav },
  { href: '/library', label: '자료실', children: libraryNav },
  { href: '/company', label: '회사소개' },
];

// the one button on the right of the header (PacketGo puts its 접속하기 there)
export const cta = { href: '/contact', label: '문의하기' };

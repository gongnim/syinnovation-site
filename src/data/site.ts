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
  { k: '대고객용', who: '결제사에게', h: '결제 위험도를 평가해 권고', short: '결제 거래의 위험도를 평가해 결제사에 권고하고, 고객사 FDS 룰의 오탐과 미탐을 진단합니다.', d: '결제사가 보낸 거래의 기기와 위치, 신호 사이의 모순을 평가해 허용, 추가 확인, 거부를 권고합니다. 고객사 FDS 룰의 오탐과 미탐도 진단합니다.', pts: ['최종 결정은 결제사', 'FDS 룰 진단', '같은 판단 엔진 공유'] },
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
  { href: '/ai-consulting', label: 'AI컨설팅' },
  { href: '/news', label: '소식', children: newsNav },
  { href: '/library', label: '자료실', children: libraryNav },
  { href: '/company', label: '회사소개' },
];

// the one button on the right of the header (PacketGo puts its 접속하기 there)
export const cta = { href: '/contact', label: '문의하기' };

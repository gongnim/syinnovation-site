import { href, type Lang } from '../lib/i18n';
export const company = {
  name: '신영이노베이션',
  nameEn: 'SYINNOVATION',
  legal: '㈜신영이노베이션',
  ceo: '강형구',
  bizNo: '439-88-02733', // 사업자등록번호, as on the previous homepage footer
  address: '서울 마포구 마포대로 78, 제2서울핀테크랩 (경찰공제회 11층)',
  email: 'mkt@syinnovation.net',
  slogan: 'RE:Think innovation',
  motto: 'Never Trust, Always Verify',
  // English site (docs/i18n-terms.md)
  en: {
    legal: 'SYINNOVATION Co., Ltd.',
    ceo: 'Hyungku Kang',
    address: '11F, Police Mutual Aid Association Bldg. (Seoul Fintech Lab 2), 78 Mapo-daero, Mapo-gu, Seoul',
  },
};

// Web3Forms access key for the contact form. Web3Forms publishes it as a public key: it only lets a form send to the
// inbox set on the Web3Forms account (mkt@syinnovation.net). Made by the user on 2026-11-16.
export const web3formsKey = '5a19d582-3059-4997-926c-9178f09bf02d';

// Google Analytics 4 property of the old site, kept so visit statistics continue (user, 2026-11-17). Base.astro loads it
// only on syinnovation.net; the privacy policy's Art. 9 says so.
export const gaId = 'G-9J9KG3CLLY';

// Search engines (Base.astro): false keeps every page out of search results (noindex) while this site is not yet the one
// at syinnovation.net. True since 2026-11-17, when this site went to syinnovation.net (.github/workflows/deploy-pages.yml).
export const launched = true;
// site ownership codes from Google Search Console, Naver Search Advisor and Bing Webmaster Tools (the content="" part of
// the meta tag each one gives you); empty ones are left out of the page
export const verify = { google: '', naver: '', bing: '' };
// meta keywords: Google and Naver mostly ignore them, but they cost nothing; only words the site itself uses
export const keywords = {
  ko: '신영이노베이션, SYINNOVATION, 제로트러스트, Zero Trust, ZTNA, Trust Gateway, 트러스트 게이트웨이, 다중 신호 교차 검증, 접근 제어, 보안 솔루션, 결제 이상거래 탐지, FDS, AI 프로세스 혁신, PI 컨설팅, 공정 자동화, 업무 지원 프로그램',
  en: 'SYINNOVATION, Zero Trust, ZTNA, Trust Gateway, Multi-Signal Cross Check, access control, security solution, payment fraud detection, FDS, PI by AI, process innovation, PI consulting, process automation, Korea',
};

// Brand is now "Trust ..." only; the old "TrustIn" prefix (still in SDS/code) is not used publicly.
export const appName = 'Trust Auth';

// Trust Gateway's three uses (user-confirmed 2026-11-11). Shared by home and /trust-gateway.
export const parts = [
  { k: '통합 인증', who: '금융사 앱에', h: '비밀번호 대신 휴대폰 보안 칩으로', short: '카드사와 저축은행 인증 서비스에서 운영 중인 모바일 인증 기술을 금융사 앱에 넣습니다.', d: '카드사와 저축은행 인증 서비스에서 운영 중인 모바일 인증 기술입니다. SDK로 금융사 앱에 넣어, 휴대폰 보안 칩 안의 키와 인증서로 본인을 확인합니다.', pts: ['기기 · 사용자 · 생체 인증서', '고객사 앱에 넣는 SDK', 'iOS · Android'] },
  { k: '직원용', who: '임직원과 협력사에게', h: '허락된 업무만 여는 직원 접속', short: 'PC는 기기를, 휴대폰은 사용자를 증명하고, 매 순간 다시 확인해 허락된 업무만 엽니다.', d: 'PC는 기기를, 휴대폰은 사용자를 증명하고, 게이트웨이가 매 순간 다시 확인합니다. 허락된 업무 앱만 열립니다.', pts: ['매 순간 재평가', '들어오는 포트 없음', 'Windows · macOS'] },
  { k: '대고객용', who: '결제사에게', h: '이상거래를 평가해 권고', short: '결제사 시스템이 요청하면 거래를 평가해 권고 판정과 근거를 돌려주고, FDS 진단으로 FDS 규칙을 점검합니다.', d: '결제사 시스템이 거래 평가를 요청하면, 기기, 위치, 금액 같은 신호를 평소와 비교해 권고 판정과 근거를 돌려줍니다. 결제 승인과 거절은 요청한 고객사 시스템이 정합니다. FDS 진단으로 고객사 FDS 규칙도 점검합니다.', pts: ['권고와 근거, 결정은 고객사', 'FDS 진단', '같은 판단 엔진 공유'] },
];

// English for the uses tabs (docs/i18n-terms.md); g is the English of the matching part's k
const partsEn: Record<string, string> = { '통합 인증': 'Integrated authentication', 직원용: 'For employees', 대고객용: 'For customers' };
const usesEn: Record<string, { t: string; h: string; d: string; pts: string[] }> = {
  office: { t: 'Work in the office', h: 'The same standard inside the office', d: 'It is not only for working outside. When you work in the office as usual, Trust Gateway also checks the person and the device at every moment. It does not trust anyone just because they are on the company network.', pts: ['The same standard inside and outside the office', 'For internal and external business systems', 'Only permitted business apps connect'] },
  remote: { t: 'Remote work · business trips', h: 'The same check at home and on business trips', d: 'The locations and Wi-Fi of your work PC and your own phone are compared together. When the risk rises, it checks again on your phone, depending on company policy.', pts: ['Only permitted business apps connect', 'Step-up authentication on the phone when the risk rises', "A lost PC's certificate is revoked from the Admin Console"] },
  partner: { t: 'Partners · contractors', h: 'Only the apps each person needs', d: 'Partner staff get only the designated apps, not the whole company network.', pts: ['Allowed scope set per person and per app', 'When a contract ends, the binding is released and phone credentials are revoked', 'A record of who accessed what'] },
  shared: { t: 'Shared PCs', h: 'One PC, many people', d: 'The identity of the company PC and the identity of the person using it now are managed separately. When the person changes, they verify themselves again on their phone, and only the business apps their own permissions allow will open.', pts: ['Device identity and user identity managed separately', "The previous user's authentication is cleared on a user switch or after a set idle time", 'Only the business apps each person is allowed to use connect'] },
  payment: { t: 'Payment fraud', h: 'Evaluates transactions and recommends', d: "When a payment company's system asks for an evaluation, it compares signals such as the device, location and amount with the usual pattern and returns a recommendation with reasons. The client system that asked decides whether to approve or decline the payment.", pts: ['A recommendation and reasons for every transaction', 'Fraud the FDS missed, compared transaction by transaction', 'Client FDS rule improvement'] },
};

// Where Trust Gateway is used, as tabs on home and /trust-gateway (i: icon on home; g: which of the three uses)
// user, 2026-11-16: no 금융 앱 인증 tab (통합 인증 stays in parts, it is just not one of the tabs)
const [, staff, pay] = parts;
export const tgUses = [
  // user, 2026-11-13: not only from outside; it is the everyday system inside the office too, for internal and external systems
  { id: 'office', i: 'server', g: staff.k, t: '사내 업무', h: '사무실 안에서도 같은 기준으로', d: '밖에서만 쓰는 것이 아닙니다. 사무실에서 평소 업무를 볼 때도 Trust Gateway가 매 순간 사람과 기기를 확인합니다. 사내망에 있다는 이유만으로 믿지 않습니다.', pts: ['사무실 안과 밖에 같은 기준 적용', '대내외 업무 시스템에 적용', '허락된 업무 앱만 연결'] },
  { id: 'remote', i: 'pin', g: staff.k, t: '재택 · 출장', h: '집에서도, 출장지에서도 같은 확인', d: '업무 PC와 내 휴대폰의 위치와 Wi-Fi를 함께 대조합니다. 위험이 높아지면 회사 정책에 따라 휴대폰으로 다시 확인합니다.', pts: ['허락된 업무 앱만 연결', '위험이 높아지면 휴대폰으로 추가 인증', '분실 PC는 관리 콘솔에서 인증서 폐기'] },
  { id: 'partner', i: 'user', g: staff.k, t: '협력사 · 외주', h: '필요한 사람에게 필요한 앱만', d: '협력사 인력에게 사내망 전체가 아닌 지정된 앱만 열어 줍니다.', pts: ['사람별, 앱별 허용 범위 지정', '계약이 끝나면 연결 해제와 휴대폰 인증 수단 회수', '누가 무엇에 접속했는지 기록'] },
  { id: 'shared', i: 'laptop', g: staff.k, t: '공용 PC', h: '한 대의 PC를 여러 사람이 써도', d: '회사 PC의 기기 신원과 지금 쓰는 사람의 신원을 따로 관리합니다. 사람이 바뀌면 휴대폰으로 다시 본인 확인을 하고, 각자 권한에 맞는 업무 앱만 엽니다.', pts: ['기기 신원과 사용자 신원을 따로 관리', '사용자가 바뀌거나 정해진 시간 동안 쓰지 않으면 이전 사용자의 인증 해제', '각자 권한에 맞는 업무 앱만 연결'] },
  { id: 'payment', i: 'chart', g: pay.k, t: '결제 이상거래', h: '이상거래를 평가해 권고합니다', d: '결제사 시스템이 거래 평가를 요청하면, 기기, 위치, 금액 같은 신호를 평소와 비교해 권고 판정과 근거를 돌려줍니다. 결제 승인과 거절은 요청한 고객사 시스템이 정합니다.', pts: ['거래마다 권고 판정과 근거', 'FDS가 놓친 사기를 같은 거래끼리 비교', '고객사 FDS 규칙 보완'] },
];

/** the uses tabs in one language */
export const useCases = (lang: Lang) => tgUses.map((u) => (lang === 'en' ? { ...u, g: partsEn[u.g] ?? u.g, ...usesEn[u.id] } : u));

// a menu item: label is Korean, en the English label (docs/i18n-terms.md); hrefs are Korean paths, made English by menu()
export type MenuItem = { href: string; label: string; en: string; children?: MenuItem[] };

// 자료실 has three pages; the header shows them as its sub-menu and each page shows them as tabs
export const libraryNav: MenuItem[] = [
  { href: '/library', label: '문서', en: 'Documents' },
  { href: '/library/videos', label: '영상', en: 'Videos' },
  { href: '/library/glossary', label: '용어집', en: 'Glossary' },
];

// 소식 has two pages: the header shows them as its sub-menu and each page shows them as tabs
export const newsNav: MenuItem[] = [
  { href: '/news', label: '사내소식', en: 'Company news' },
  { href: '/news/press', label: '보안사고', en: 'Security incidents' },
  { href: '/news/vulnerabilities', label: '보안뉴스', en: 'Security News' },
];

export const nav: MenuItem[] = [
  // CEO, 2026-11-16: not everyone knows the logo goes home
  { href: '/', label: '홈', en: 'Home' },
  { href: '/trust-gateway', label: 'Trust Gateway', en: 'Trust Gateway' },
  // CEO, 2026-11-17: was IT 컨설팅·개발
  { href: '/consulting', label: 'AI 프로세스 혁신', en: 'PI by AI' },
  { href: '/news', label: '소식', en: 'News', children: newsNav },
  { href: '/library', label: '자료실', en: 'Resources', children: libraryNav },
  { href: '/company', label: '회사소개', en: 'Company' },
];

// the one button on the right of the header (PacketGo puts its 접속하기 there)
export const cta: MenuItem = { href: '/contact', label: '문의하기', en: 'Contact us' };

/** menu items in one language: English labels and /en/ paths for 'en' */
export const menu = (items: MenuItem[], lang: Lang): MenuItem[] =>
  items.map((n) => ({ ...n, href: href(n.href, lang), label: lang === 'en' ? n.en : n.label, children: n.children && menu(n.children, lang) }));

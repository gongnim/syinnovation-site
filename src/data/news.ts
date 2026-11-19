// 소식. 사내소식 = kind 'own'; 언론보도 = kind 'press' (articles about us) plus the security incident list below.
// shortcut: hand-written seed; later rows come from the Google Sheet and RSS collector (docs/site-research §4-3)
import incidents from './security-news.json';
export type NewsKind = 'own' | 'press' | 'sns' | 'security' | 'video';

export interface NewsItem {
  slug: string;
  kind: NewsKind;
  source: string;
  title: string;
  date: string; // YYYY-MM-DD, or YYYY-MM when the day is not confirmed
  url?: string; // external items open the original
  image?: string;
  cardImage?: string; // a version framed for the square news cards, when the plain image does not fit them
  imagePos?: string; // CSS object-position for the card crop, e.g. 'center top'
  body?: string[];
}

export const kindLabel: Record<NewsKind, string> = {
  own: '신영 소식',
  press: '언론 보도',
  sns: 'SNS',
  security: '보안 이슈',
  video: '영상',
};

export const news: NewsItem[] = [
  {
    slug: 'hankyung-fintechlab-interview',
    kind: 'press',
    source: '한경매거진',
    title: '제로트러스트 기반 금융 보안·인증·결제 솔루션을 개발하는 신영이노베이션',
    date: '2026-10-09',
    url: 'https://magazine.hankyung.com/job-joy/article/202610093110d',
    // the article's own preview image; cropped to the top so the old product name on the lower screen stays out
    image: '/images/news/hankyung-2026-10-09.webp',
    imagePos: 'center top',
    // faces in the upper half over a navy band, so the card's title does not cover them (and the old name stays out)
    cardImage: '/images/news/hankyung-2026-10-09-card.webp',
  },
  {
    slug: 'jobjoy-371-cover',
    kind: 'press',
    source: '한경 잡앤조이',
    title: '한경 잡앤조이 371호 표지, 2026 제2서울핀테크랩 스타트업 CEO',
    date: '2026-09-14',
    url: 'https://magazine.hankyung.com/emagazine/job-joy/371',
    image: '/images/news/jobjoy-371-cover.webp',
    imagePos: 'center 35%',
  },
  {
    slug: 'third-anniversary',
    kind: 'own',
    source: '신영이노베이션',
    title: '신영이노베이션 창립 3주년',
    date: '2026-10-26',
    image: '/images/photos/anniversary-3rd.webp',
    body: [
      '2023년 10월 25일 문을 연 신영이노베이션이 창립 3주년을 맞았습니다.',
      '앞으로도 Never Trust, Always Verify 원칙으로 금융과 기업의 업무 접속을 지키는 솔루션을 만들겠습니다.',
    ],
  },
  {
    slug: 'startup-package-selected',
    kind: 'own',
    source: '신영이노베이션',
    title: '2026년 초기창업패키지 선정',
    date: '2026-10',
    // illustrative picture (generated: the kickoff orientation of a startup support programme; no faces, text or logos)
    image: '/images/news/startup-package-2026.webp',
    body: ['신영이노베이션이 2026년 초기창업패키지 지원 기업으로 선정되었습니다.'],
  },
  {
    slug: 'seoul-fintech-lab',
    kind: 'own',
    source: '신영이노베이션',
    title: '제2서울핀테크랩 입주',
    date: '2026-07',
    // illustrative picture (generated: moving into a new office lounge; not the real building). Replace it with our own
    // photo of the building once taken: the city's photos are KOGL type 4 (no commercial use)
    image: '/images/news/fintechlab-move-in-2026.webp',
    body: ['신영이노베이션이 제2서울핀테크랩에 입주해 마포에서 새로운 사무실을 열었습니다.'],
  },
];

export const sorted = [...news].sort((a, b) => b.date.localeCompare(a.date));

// Security incidents for 언론보도: major hacks and leaks, each with our own wording, the outlet and a link to the
// original (no article text or photos are copied). Hand-picked rows and rows from the automatic collector
// (scripts/collect-security-news.mjs) share src/data/security-news.json; hidden: true takes a row off the site.
export interface Incident {
  slug?: string; // our page at /news/press/<slug> (every article shown has one)
  image?: string; // the card picture: made for us, or for a video its YouTube thumbnail (never a news photo)
  youtube?: string; // a news video: the YouTube id, played on our site
  credit?: { name: string; url: string; id?: number }; // the photographer of a free Pexels photo
  date: string; // YYYY-MM-DD, or YYYY-MM when the day is not clear
  region: '국내' | '해외';
  org?: string; // the organisation hit (not shown; the collector uses it to skip stories already listed)
  aka?: string[]; // other names in headlines (English names, follow-up wording); the collector skips them for 60 days
  type: string; // 랜섬웨어, 개인정보 유출, 해킹, 디도스, 공급망 공격, 계정 탈취, 기타
  title: string;
  summary?: string;
  source: string;
  url: string;
  auto?: boolean; // added by the collector
  hidden?: boolean;
}
// Only written-up articles are shown, each on our own page (user, 2026-11-16): an article the collector adds (auto)
// waits off the site until it is written up like the hand-picked ones (slug, summary and a write-up in
// security-stories.json, auto removed). Videos from Korean outlets go up as they come.
export const security = (incidents as Incident[])
  .filter((n) => !n.hidden && (!n.auto || n.youtube))
  .sort((a, b) => b.date.localeCompare(a.date));
/** cards per page of 언론보도 (/news/press, /news/press/page/2, …) */
export const pressPage = 12;
export const fmt = (d: string) => d.replaceAll('-', '.');

// 보안뉴스 (/news/vulnerabilities, renamed from 취약점 소식 on 2026-11-19): vulnerability news with what to do about it. Rows come from the collector
// (scripts/collect-vuln-news.mjs, auto: true) or are written by hand (no auto: the collector only adds outlets to
// them); hidden: true takes a row off the site and keeps its flaw from being added again. The steps under 할 일 come
// from src/data/vuln-howto.json by product key.
import vulnRows from './vuln-news.json';
import howtoKo from './vuln-howto.json';
import { vulnHowtoEn, vulnNewsEn } from './en';
import { href, type Lang } from '../lib/i18n';
import { uniqueTitles, summaryFor, describe, termsFor } from '../lib/vuln-text.js';
export interface Step { t: string; code?: string }
export interface Vuln {
  date: string;
  title: string;
  source: string;
  url: string;
  sources?: { source: string; url: string }[]; // other outlets that reported the same flaw
  products: string[]; // keys of vuln-howto.json, the main product first
  cves: string[];
  severity?: string; // as stated: "CVSS 9.8", 치명적, 고위험, 긴급
  status?: string; // 악용 중, 패치 나옴, 조치 권고
  fixed?: string[]; // fixed versions named by the article or the vendor notice (never guessed)
  workaround?: (string | Step)[]; // a temporary measure from the vendor notice or the article (hand-written rows)
  youtube?: string; // our 보안 속보 Short about this flaw (YouTube id); shown at the top of the card (user, 2026-11-19)
  youtubeDate?: string; // the Short's upload date (YYYY-MM-DD), for its VideoObject; left out of the data when unknown
  note?: string; // a hand-written line about this flaw
  slug: string; // our page: /news/vulnerabilities/<slug>, given once by the collector and never changed
  name?: string; // the product as the headline names it, when it is none of vuln-howto.json's (for our title)
  nameEn?: string; // the same in English, when known
  notice?: { title: string; url: string; date?: string }; // the KISA 보호나라 보안공지 about it
  auto?: boolean;
  hidden?: boolean;
}
export const vulns = (vulnRows as Vuln[]).filter((v) => !v.hidden).sort((a, b) => b.date.localeCompare(a.date));
/** rows per page of 보안뉴스 (/news/vulnerabilities, /news/vulnerabilities/page/2, …) */
export const vulnPage = 20;

// Each row also has its own page (/news/vulnerabilities/<slug>, for search; coordinator, 2026-11-19) with our own
// title and summary, made from the row's fields by src/lib/vuln-text.js (no sentence of an article is copied).
type HowStep = string | Step;
export interface How { label: string; who: string; steps: HowStep[]; note?: string; links: { label: string; url: string }[] }
const howto = howtoKo as unknown as Record<string, How>;
const titles = { ko: uniqueTitles(vulns, 'ko', howto, vulnHowtoEn), en: uniqueTitles(vulns, 'en', howto, vulnHowtoEn) };
/** our title for a row: "크롬 제로데이(CVE-…) 악용 중, 업데이트 방법" */
export const vulnTitle = (v: Vuln, lang: Lang): string => titles[lang].get(v.slug) ?? v.title;
/** our summary, sentence by sentence (the hand-written note last) */
export const vulnSummary = (v: Vuln, lang: Lang): string[] => summaryFor(v, lang, howto, vulnHowtoEn, lang === 'en' ? vulnNewsEn[v.url]?.note : undefined);
export const vulnDescription = (v: Vuln, lang: Lang): string => describe(vulnSummary(v, lang), lang === 'en' ? 160 : 110);
export const vulnHref = (v: Vuln, lang: Lang): string => href(`/news/vulnerabilities/${v.slug}`, lang);
export const vulnTerms = (v: Vuln): string[] => termsFor(v);
/** one product's steps in a language: English text over the Korean list, commands and links kept */
export const howFor = (key: string, lang: Lang): How => {
  const ko = howto[key] ?? howto._default;
  const e = lang === 'en' ? vulnHowtoEn[howto[key] ? key : '_default'] : undefined;
  if (!e) return ko;
  return {
    label: e.label ?? ko.label, who: e.who ?? ko.who, note: ko.note && (e.note ?? ko.note),
    steps: ko.steps.map((s, i) => (typeof s === 'string' ? e.steps?.[i] ?? s : { ...s, t: e.steps?.[i] ?? s.t })),
    links: ko.links.map((l, i) => ({ ...l, label: e.links?.[i] ?? l.label })),
  };
};
/** the products whose steps a row shows (the default steps when it names none we know) */
export const howKeys = (v: Vuln): string[] => (v.products.length ? v.products.slice(0, 3) : ['_default']);
export const stepOf = (s: HowStep): Step => (typeof s === 'string' ? { t: s } : s);
export const vulnStatus: Record<string, { en: string; cls: string }> = {
  '악용 중': { en: 'Exploited', cls: 'hot' },
  '패치 나옴': { en: 'Patch out', cls: 'ok' },
  '조치 권고': { en: 'Action advised', cls: 'warn' },
};
const SEVERITY_EN: Record<string, string> = { 치명적: 'Critical', 고위험: 'High risk', 긴급: 'Urgent' };
export const sevText = (s: string, lang: Lang): string => (lang === 'en' ? SEVERITY_EN[s] ?? s : s);

// New posts get noticed (user, 2026-11-19: "업데이트 되면 New 이런 게 있으면"): an item younger than its tab's window shows
// a NEW chip, and the 소식 menu and tab show a dot while the tab's newest item is that young and the visitor hasn't
// opened the tab since. Ages are worked out in the browser (src/layouts/Base.astro), because the site is only rebuilt
// when something changes and a chip baked in at build time would outlive its window.
export const newDays: Record<string, number> = { '/news': 7, '/news/press': 3, '/news/vulnerabilities': 3 };
const latest: Record<string, string> = { '/news': sorted[0]?.date ?? '', '/news/press': security[0]?.date ?? '', '/news/vulnerabilities': vulns[0]?.date ?? '' };
/** data attributes for a 소식 tab link (/en links included) so the browser can mark it; {} for other links */
export const newMark = (href: string): Record<string, string | number> => {
  const k = href.replace(/^\/en(?=\/|$)/, '') || '/';
  return latest[k] ? { 'data-latest': latest[k], 'data-new-days': newDays[k], 'data-seen-key': k } : {};
};

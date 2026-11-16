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
export const fmt = (d: string) => d.replaceAll('-', '.');

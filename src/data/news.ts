// shortcut: hand-written seed; later rows come from the Google Sheet and RSS collector (docs/site-research §4-3)
export type NewsKind = 'own' | 'press' | 'sns' | 'security' | 'video';

export interface NewsItem {
  slug: string;
  kind: NewsKind;
  source: string;
  title: string;
  date: string; // YYYY-MM-DD, or YYYY-MM when the day is not confirmed
  url?: string; // external items open the original
  image?: string;
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
      '앞으로도 Never Trust, Always Verify. 원칙으로 금융과 기업의 업무 접속을 지키는 제품을 만들겠습니다.',
    ],
  },
  {
    slug: 'startup-package-selected',
    kind: 'own',
    source: '신영이노베이션',
    title: '2026년 초기창업패키지 선정',
    date: '2026-10',
    body: ['신영이노베이션이 2026년 초기창업패키지 지원 기업으로 선정되었습니다.'],
  },
  {
    slug: 'seoul-fintech-lab',
    kind: 'own',
    source: '신영이노베이션',
    title: '제2서울핀테크랩 입주',
    date: '2026-07',
    body: ['신영이노베이션이 제2서울핀테크랩에 입주해 마포에서 새로운 사무실을 열었습니다.'],
  },
];

export const sorted = [...news].sort((a, b) => b.date.localeCompare(a.date));
export const fmt = (d: string) => d.replaceAll('-', '.');

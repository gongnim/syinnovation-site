import { test } from 'node:test';
import assert from 'node:assert/strict';
import { clean, org, breadcrumb, newsArticle, howTo, video } from '../src/lib/ld.js';

const site = new URL('https://syinnovation.net');
const url = 'https://syinnovation.net/news/vulnerabilities/2026-11-12-chrome-zero-day';
// no undefined, null, empty string or empty list anywhere
const full = (x) => (Array.isArray(x) ? x.length > 0 && x.every(full) : x && typeof x === 'object' ? Object.values(x).every(full) : x !== undefined && x !== null && x !== '');

test('clean drops empty fields at every depth', () => {
  assert.deepEqual(clean({ a: 1, b: undefined, c: '', d: [], e: { f: null }, g: [{ h: undefined }, 2] }), { a: 1, g: [2] });
});

test('article, how-to, video and breadcrumb have absolute URLs, ISO dates and no empty fields', () => {
  const graph = [
    newsArticle({ url, headline: '크롬 제로데이 악용 중, 업데이트 방법', description: '요약', date: '2026-11-12', lang: 'ko', publisher: org(site, false), image: 'https://syinnovation.net/images/og/og-ko.png', basedOn: ['https://news.example/1'] }),
    howTo({ url, name: '해결 방법', description: '요약', lang: 'ko', steps: [{ name: '설치된 버전 확인', text: '설치된 버전 확인: nginx -v' }] }),
    video({ id: 'abc123', name: '영상', description: '요약' }),
    breadcrumb([{ name: '소식', url: 'https://syinnovation.net/news' }, { name: '보안뉴스', url: 'https://syinnovation.net/news/vulnerabilities' }, { name: '제목', url }]),
  ];
  for (const n of graph) assert.ok(full(n), n['@type']);
  const json = JSON.parse(JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }));
  assert.equal(json['@graph'][0].datePublished, '2026-11-12');
  assert.equal(json['@graph'][0].publisher['@id'], 'https://syinnovation.net/#org');
  assert.equal(json['@graph'][1].step[0].position, 1);
  assert.equal('uploadDate' in json['@graph'][2], false); // unknown upload date: left out, not guessed
  assert.equal(json['@graph'][3].itemListElement[2].item, url);
  assert.equal(newsArticle({ url, headline: 'x'.repeat(130), date: '2026-11', lang: 'en' }).headline.length, 110);
});

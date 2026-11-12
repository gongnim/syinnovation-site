import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseRss, classify, isUnwanted, stories, merge, regionOf } from '../scripts/security-news-lib.mjs';

const cfg = { exclude: ['롯데카드'], noise: ['대회', 'webinar'], minOutlets: 2, maxNewPerRun: 6, keepDays: 120 };

test('Google News items: the outlet is taken off the end of the headline and kept as the source', () => {
  const xml = `<rss><channel><item><title><![CDATA[A사 랜섬웨어 공격으로 서비스 중단 - 연합뉴스]]></title>
    <link>https://news.google.com/rss/articles/abc</link><pubDate>Tue, 14 Oct 2026 23:30:00 GMT</pubDate>
    <source url="https://www.yna.co.kr">연합뉴스</source></item></channel></rss>`;
  assert.deepEqual(parseRss(xml), [{ title: 'A사 랜섬웨어 공격으로 서비스 중단', url: 'https://news.google.com/rss/articles/abc', source: '연합뉴스', date: '2026-10-15' }]);
});

test('headlines are sorted into incident types; other news is not an incident', () => {
  assert.equal(classify('B은행 랜섬웨어 감염'), '랜섬웨어');
  assert.equal(classify('C쇼핑몰 고객 정보 300만 건 유출'), '개인정보 유출');
  assert.equal(classify('Hackers breach D Corp, data of 2 million exposed'), '개인정보 유출');
  assert.equal(classify('E사 신제품 출시'), null);
});

test('excluded names and event or column headlines are dropped', () => {
  assert.equal(isUnwanted('롯데카드 해킹 피해 확인', cfg), true);
  assert.equal(isUnwanted('대학생 해킹 대회 개최', cfg), true);
  assert.equal(isUnwanted('F사 해킹으로 회원 정보 유출', cfg), false);
});

const item = (title, source, date, url = `https://example.com/${encodeURIComponent(source + title)}`) => ({ title, source, date, url, region: '국내' });

test('headlines about the same incident from different outlets form one story', () => {
  const s = stories([
    item('지에스몰 해킹 회원정보 유출', '연합뉴스', '2026-10-01'),
    item('지에스몰 회원정보 대량 유출 해킹 확인', '전자신문', '2026-10-02'),
    item('하나투어 랜섬웨어 감염', '보안뉴스', '2026-10-02'),
  ]);
  assert.equal(s.length, 2);
  assert.equal(s.find((x) => x.title.startsWith('지에스몰')).outlets, 2);
});

test('the same story is recognised through particles and word endings; Korean headlines about other countries are abroad', () => {
  const s = stories([
    item('금융보안원마저 뚫렸다…해킹 공격에 금융사 정보 유출', '중앙일보', '2026-11-10'),
    item('금융보안원도 해킹에 뚫려…금융사 보안 정보 유출', '경향신문', '2026-11-10'),
  ]);
  assert.equal(s.length, 1);
  assert.equal(s[0].outlets, 2);
  assert.equal(regionOf("프랑스, 냉장고 해킹 배후로 '이란' 지목", '국내'), '해외');
  assert.equal(regionOf('금융보안원 해킹 확인', '국내'), '국내');
});

test('merge adds only stories reported by enough outlets, never twice, and keeps hand-picked rows', () => {
  const handPicked = { date: '2026-09-10', region: '국내', type: '해킹', title: '직접 고른 사건', source: '보안뉴스', url: 'https://x/1' };
  const found = [
    item('지에스몰 해킹 회원정보 유출', '연합뉴스', '2026-10-01'),
    item('지에스몰 회원정보 대량 유출 해킹 확인', '전자신문', '2026-10-02'),
    item('하나투어 랜섬웨어 감염', '보안뉴스', '2026-10-02'), // one outlet only
    item('롯데카드 해킹 정황', '연합뉴스', '2026-10-03'), item('롯데카드 해킹 정황 확인', 'KBS', '2026-10-03'),
  ];
  const once = merge([handPicked], found, cfg, '2026-10-05');
  assert.equal(once.added, 1);
  assert.equal(once.rows[0].auto, true);
  assert.deepEqual(once.rows.at(-1), handPicked);
  const twice = merge(once.rows, found, cfg, '2026-10-05');
  assert.equal(twice.added, 0);
});

test('a headline naming an organisation already listed in the past week is not added again', () => {
  const listed = { date: '2026-11-10', region: '국내', type: '해킹', org: '금융보안원', title: '금융보안원, 외부 침입으로 행정서식 유출', source: '디지털데일리', url: 'https://x/2' };
  const found = [
    item('금융보안원마저 뚫렸다…해킹 공격에 금융사 정보 유출', '중앙일보', '2026-11-11'),
    item('금융보안원도 해킹에 뚫려…금융사 보안 정보 유출', '경향신문', '2026-11-11'),
  ];
  assert.equal(merge([listed], found, cfg, '2026-11-12').added, 0);
});

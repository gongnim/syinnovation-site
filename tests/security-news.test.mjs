import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseRss, classify, isUnwanted, stories, merge, regionOf, pickVideos, photoQuery, listed, plainNumber, hangul } from '../scripts/security-news-lib.mjs';

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
  assert.equal(regionOf('야스쿠니신사 사이트 해킹…1만4천500건 정보 유출', '국내'), '해외');
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

test('foreign reports and follow-ups of a listed story are known by its other names (aka) for 60 days', () => {
  const france = { date: '2026-10-12', region: '해외', type: '해킹', org: 'Intermarché·Carrefour', aka: ['냉장고 해킹', 'refrigerat'], title: '프랑스 대형마트 수백 곳, 냉장설비 해킹으로 식품 폐기', source: 'x', url: 'https://x/4' };
  const found = [
    item("프랑스, 냉장고 해킹 배후로 '이란' 지목", 'BBC', '2026-11-10'),
    item("프랑스, 냉장고 해킹 배후로 '이란' 지목", '연합뉴스', '2026-11-10'),
    item('France Blames Iran for Cyberattack on Refrigeration Systems', 'The New York Times', '2026-11-10'),
    item('France Blames Iran for Cyberattack on Refrigeration Systems', 'Reuters', '2026-11-10'),
    item('France Blames Iran for Cyberattack on Refrigeration Systems', 'AP', '2026-11-10'),
  ];
  assert.equal(merge([france], found, cfg, '2026-11-12').added, 0);
  assert.equal(merge([{ ...france, date: '2026-08-01' }], found, cfg, '2026-11-12').added > 0, true); // past 60 days: news again
});

test('news videos: only incident videos from Korean outlets, in Korean, never ones already listed', () => {
  const vcfg = { ...cfg, videoChannels: ['YTN', 'KBS', 'KNN'], maxVideosPerRun: 3 };
  const listedRow = { date: '2026-11-10', region: '국내', type: '해킹', org: '금융보안원', title: '금융보안원 침입', source: 'x', url: 'https://x/3' };
  const picked = pickVideos([listedRow], [
    { id: 'a1', title: '쇼핑몰 회원정보 대량 유출 확인 | YTN', channel: 'YTN', date: '2026-11-11', region: '국내' },
    { id: 'a2', title: '해킹 대처법 브이로그', channel: '개인 채널', date: '2026-11-11', region: '국내' }, // not a broadcaster
    { id: 'a3', title: '금융보안원 해킹 후속 보도', channel: 'KBS News', date: '2026-11-11', region: '국내' }, // already listed
    { id: 'a4', title: '신제품 출시 소식', channel: 'YTN', date: '2026-11-11', region: '국내' }, // not an incident
    { id: 'a5', title: 'Bank confirms data breach after cyberattack', channel: 'GMA News', date: '2026-11-11', region: '해외' }, // foreign outlet
    { id: 'a6', title: 'Hospital hit by ransomware attack', channel: 'KBS World', date: '2026-11-11', region: '해외' }, // not in Korean
    { id: 'a7', title: '일본 대형 병원 랜섬웨어 감염 / KNN', channel: 'KNN NEWS', date: '2026-11-10', region: '국내' }, // abroad, by Korean media
  ], vcfg);
  assert.deepEqual(picked.map((v) => v.youtube), ['a1', 'a7']);
  assert.equal(picked[1].title, '일본 대형 병원 랜섬웨어 감염'); // "/ KNN": the channel's first word goes too
  assert.equal(picked[1].region, '해외'); // a Korean outlet's report on an incident abroad
  assert.equal(picked[0].url, 'https://www.youtube.com/watch?v=a1');
  assert.equal(picked[0].title, '쇼핑몰 회원정보 대량 유출 확인'); // the channel is not repeated in the title
});

test('free photo search: the field named in the headline first, else the kind of incident', () => {
  assert.equal(photoQuery('OO은행 고객 정보 유출', '개인정보 유출'), 'bank office');
  assert.equal(photoQuery('Airline confirms breach of booking system', '개인정보 유출'), 'airport terminal');
  assert.equal(photoQuery('XX사 랜섬웨어 감염', '랜섬웨어'), 'server room red light');
});

test('news abroad from Korean media: the region follows the place a Korean headline names', () => {
  assert.equal(regionOf('日 대형 출판사 랜섬웨어 감염…고객 정보 유출', '해외'), '해외');
  assert.equal(regionOf('미국 병원 해킹으로 환자 기록 유출', '국내'), '해외');
  assert.equal(regionOf('코인원 고객상담 수탁사 해킹', '해외'), '국내'); // found by the search abroad, but at home
});

test('a video title loses its channel and MBC\'s date tail', () => {
  const [v] = pickVideos([], [{ id: 'm1', title: '코인원 등 전방위 해킹 (2026.11.15/뉴스데스크/MBC)', channel: 'MBCNEWS', date: '2026-11-15', region: '국내' }], { ...cfg, videoChannels: ['MBC'] });
  assert.equal(v.title, '코인원 등 전방위 해킹');
});

test('a video title loses a leading [속보] tag, emoji and the channel with its English name', () => {
  const [v] = pickVideos([], [{ id: 'y1', title: '[🔴속보] "사례비 받아가세요" 믿고 열었다간…북한 해킹조직 \'김수키\' 신종 공격 / 연합뉴스TV(YonhapnewsTV)', channel: '연합뉴스TV', date: '2026-11-16', region: '국내' }], { ...cfg, videoChannels: ['연합뉴스TV'] });
  assert.equal(v.title, '"사례비 받아가세요" 믿고 열었다간…북한 해킹조직 \'김수키\' 신종 공격');
});

test('headline hanja are spelled out in Hangul', () => {
  assert.equal(hangul("北 해킹조직 '라자루스', 국내 서버 30곳 조준"), "북한 해킹조직 '라자루스', 국내 서버 30곳 조준");
  assert.equal(hangul('日, 개인정보 유출 잇따라'), '일본, 개인정보 유출 잇따라');
  assert.equal(hangul('中企 노린 랜섬웨어'), '중소기업 노린 랜섬웨어');
});

test('an English headline about South Korea counts as an incident at home', () => {
  assert.equal(regionOf("South Korea's financial security regulator found personal information stolen", '해외'), '국내');
  assert.equal(regionOf('Capcom confirms data breach', '해외'), '해외');
});

test('the same count written two ways is the same word, so a second report of a listed story is known', () => {
  assert.equal(plainNumber('1만4천500건'), '14500건');
  assert.equal(plainNumber('1만4500건'), '14500건');
  assert.equal(plainNumber('109만건'), '1090000건');
  assert.equal(plainNumber('1811명'), '1811명');
  const isListed = listed([{ date: '2026-11-12', title: "'침략미화' 야스쿠니신사 사이트 해킹…1만4천500건 정보 유출", url: 'https://x/a' }]);
  assert.ok(isListed({ date: '2026-11-12', title: 'A급 전범 합사된 日 야스쿠니 신사 해킹…개인정보 1만4500건 유출', url: 'https://x/b' }));
  assert.ok(!isListed({ date: '2026-11-13', title: 'KB캐피탈, 해킹에 임직원·고객 1811명 개인정보 유출', url: 'https://x/c' }));
});

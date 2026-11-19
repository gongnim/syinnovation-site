import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { cvesOf, severityOf, statusOf, productsOf, fixedVersions, isVulnStory, stories, mergeVulns, noticeFor, windows, addPageFields } from '../scripts/vuln-news-lib.mjs';
import { flawOf, nameFromTitle, nameEn, titleFor, uniqueTitles, summaryFor, describe, slugFor, termsFor } from '../src/lib/vuln-text.js';

const howto = JSON.parse(fs.readFileSync(new URL('../src/data/vuln-howto.json', import.meta.url), 'utf8'));
const howtoEn = JSON.parse(fs.readFileSync(new URL('../src/data/i18n/vuln-howto.en.json', import.meta.url), 'utf8'));
const cfg = { noise: ['출시', '세미나'], excludeSources: ['GeekNews'], minOutlets: 2, trustedSources: ['보안뉴스', '데일리시큐'], preferSources: ['보안뉴스', '연합뉴스'] };
const item = (title, source, date, url = `https://example.com/${encodeURIComponent(source + title)}`) => ({ title, source, date, url });

test('CVE ids, severity and status are read off the text as stated', () => {
  assert.deepEqual(cvesOf('리눅스 커널 cve-2026-99288 및 CVE-2026-99288, CVE-2026-119618'), ['CVE-2026-99288', 'CVE-2026-119618']);
  assert.equal(severityOf('아파치 결함, CVSS 9.8 치명적'), 'CVSS 9.8');
  assert.equal(severityOf('CVSS 3.1 기준 7.5점'), 'CVSS 7.5');
  assert.equal(severityOf('웹서버 엔진엑스서 치명적 취약점'), '치명적');
  assert.equal(severityOf('크롬 보안 업데이트'), '');
  assert.equal(statusOf('아웃룩 제로데이는 이미 공격에 쓰였다'), '악용 중');
  assert.equal(statusOf('악용 가능성 있어 업데이트 권고'), '패치 나옴'); // "could be exploited" is not "exploited"
  assert.equal(statusOf('Ubuntu, 제로데이 패치 미출시'), '조치 권고');
  assert.equal(statusOf('자바 취약점 발견…정부 긴급 점검 당부'), '조치 권고');
  assert.equal(statusOf('티오리, nginx 취약점 5건 발견'), '');
});

test('products come from the how-to map; FortiOS is not iOS and JavaScript is not Java', () => {
  assert.deepEqual(productsOf("웹서버 '엔진엑스'서 치명적 취약점", howto), ['nginx']);
  assert.deepEqual(productsOf('HTTP/2 켠 서버만 노출... 아파치 웹서버 원격 코드 실행 결함', howto), ['apache-httpd']);
  assert.deepEqual(productsOf('MS, 11월 보안 패치로 취약점 1235개 수정…아웃룩 제로데이', howto), ['ms-office', 'windows']);
  assert.deepEqual(productsOf('애플, 아이폰·맥 긴급 보안 업데이트', howto), ['iphone', 'mac']);
  assert.deepEqual(productsOf('포티넷 FortiOS 인증 우회 취약점', howto), []);
  assert.deepEqual(productsOf('자바스크립트 라이브러리 취약점', howto), []);
  assert.deepEqual(productsOf("오라클, '자바4셸' 등 RCE 취약점 긴급 패치", howto), ['java']);
});

test('fixed versions: only versions the text names as fixed, never affected ranges', () => {
  assert.deepEqual(fixedVersions('nginx 1.30.7, 1.31.9 버전으로 업데이트'), ['1.30.7', '1.31.9']);
  assert.deepEqual(fixedVersions('nginx 1.30.7 및 1.31.9 버전으로 업데이트해야'), ['1.30.7', '1.31.9']);
  assert.deepEqual(fixedVersions('아파치 HTTP 서버 2.4.71 공개…HTTP/2 원격 코드 실행 취약점 수정'), ['2.4.71']);
  assert.deepEqual(fixedVersions('2.4.55부터 2.4.70까지 영향, 2.4.71에서 수정'), ['2.4.71']);
  assert.deepEqual(fixedVersions('1.30.6 이하 버전 업데이트 필요'), []);
  assert.deepEqual(fixedVersions('CVSS 9.8 치명적 결함 패치'), []);
  assert.deepEqual(fixedVersions('iOS 26.1로 업데이트'), ['26.1']);
});

test('vulnerability headlines are kept; launches, events and other news are not', () => {
  assert.equal(isVulnStory('자바 오픈JDK 보안 취약점 발견…KISA 보안조치 권고', cfg), true);
  assert.equal(isVulnStory('A사, AI 취약점 진단 솔루션 출시', cfg), false);
  assert.equal(isVulnStory('B사 해킹으로 개인정보 유출', cfg), false);
  assert.equal(isVulnStory('NGINX 원격 코드 실행 취약점', cfg, 'GeekNews'), false);
});

test('reports of one flaw from many outlets become one story; the preferred outlet gives the headline', () => {
  const s = stories([
    item('PHP 이어 자바도 고위험 취약점…정부 긴급 점검 권고', '연합뉴스', '2026-11-17'),
    item("[자바 취약점 비상] 오라클, '자바4셸' 등 RCE 취약점 11건 긴급 패치", '보안뉴스', '2026-11-18'),
    item('자바 보안 취약점 발견…정부 긴급 점검 당부', '프라임경제', '2026-11-18'),
    item("웹서버 '엔진엑스'서 치명적 취약점", '연합뉴스', '2026-11-19'),
  ], howto, cfg);
  assert.equal(s.length, 2);
  const java = s.find((x) => x.products[0] === 'java');
  assert.equal(java.outlets, 3);
  assert.equal(java.source, '보안뉴스');
  assert.deepEqual(java.products, ['java']); // "PHP 이어 자바도" is not about PHP
  assert.equal(java.status, '패치 나옴');
  assert.equal(java.sources.length, 2);
});

test('two different CVEs in the same product in one week stay apart', () => {
  const s = stories([
    item('크롬 제로데이 CVE-2026-1111 긴급 패치', '보안뉴스', '2026-06-01'),
    item('크롬 제로데이 CVE-2026-2222 긴급 패치', '데일리시큐', '2026-06-03'),
  ], howto, cfg);
  assert.equal(s.length, 2);
});

test('merge: enough outlets, a KISA notice or a trusted outlet with something to act on; known flaws only gain outlets', () => {
  const notices = [{ title: 'NGINX 제품 보안 업데이트 권고', url: 'https://www.boho.or.kr/kr/bbs/view.do?nttId=1', date: '2026-11-19' }];
  const found = [
    item("웹서버 '엔진엑스'서 치명적 취약점", '아시아경제', '2026-11-19'), // one outlet, KISA backs it
    item('레디스 원격코드실행 취약점 5건 패치', '데일리시큐', '2026-10-30'), // trusted, a patch
    item('취약점 공개·패치 적용까지 공백 위험', '어느신문', '2026-01-21'), // one outlet, nothing to act on
  ];
  const { rows, added } = mergeVulns([], found, { ...cfg, maxNewPerRun: 0 }, howto, notices);
  assert.equal(added.length, 2);
  const ngx = rows.find((r) => r.products[0] === 'nginx');
  assert.equal(ngx.notice.url, notices[0].url);
  assert.equal(ngx.status, '패치 나옴'); // the KISA notice is an update advisory

  const hand = { date: '2026-11-19', title: "티오리, 'nginx' 취약점 5건 발견", source: '전자신문', url: 'https://www.etnews.com/1', products: ['nginx'], cves: [], fixed: ['1.30.7'] };
  const again = mergeVulns([hand], [item('엔진엑스 취약점 5건 공개', '데일리시큐', '2026-11-20')], cfg, howto);
  assert.equal(again.added.length, 0);
  assert.deepEqual(again.rows[0].sources.map((x) => x.source), ['데일리시큐']);
  assert.deepEqual(again.rows[0].fixed, ['1.30.7']); // a hand-written row keeps its own fields

  const hidden = { ...hand, hidden: true, sources: [] };
  assert.equal(mergeVulns([hidden], [item('엔진엑스 취약점 5건 공개', '데일리시큐', '2026-11-20')], cfg, howto).rows[0].sources.length, 0);
});

test('a KISA notice matches by product, or by the vendor name in the headline', () => {
  const s = { title: 'SonicWall SSL-VPN 인증 우회 취약점', date: '2026-11-07', products: [] };
  const n = [{ title: 'SonicWall 제품 보안 업데이트 권고', url: 'u', date: '2026-11-08' }, { title: 'Git 제품 보안 업데이트 권고', url: 'g', date: '2026-11-08' }];
  assert.equal(noticeFor(s, n, howto).url, 'u');
  assert.equal(noticeFor({ ...s, date: '2026-12-30' }, n, howto), undefined);
});

test('backfill windows cover every day from the start to today', () => {
  const w = windows('2026-01-01', '2026-01-20');
  assert.deepEqual(w[0], ['2026-01-01', '2026-01-08']);
  assert.equal(w.at(-1)[1] >= '2026-01-20', true);
});

test('every how-to entry has who, steps and an official link, and the English file matches it step by step', () => {
  for (const [k, h] of Object.entries(howto)) {
    if (k === '_about') continue;
    assert.ok(h.label && h.who && h.steps.length && h.links.length, k);
    if (k !== '_default') assert.doesNotThrow(() => new RegExp(h.match, 'i'), k);
    for (const l of h.links) assert.match(l.url, /^https:\/\//, k);
    assert.ok(howtoEn[k], `English for ${k}`);
    assert.equal(howtoEn[k].steps.length, h.steps.length, `English steps for ${k}`);
    assert.equal(howtoEn[k].links.length, h.links.length, `English links for ${k}`);
    for (const s of h.steps) if (typeof s === 'object') assert.doesNotMatch(s.code, /[가-힣]/, `command in ${k}`);
  }
});

test('stored rows have the fields the page reads', () => {
  const rows = JSON.parse(fs.readFileSync(new URL('../src/data/vuln-news.json', import.meta.url), 'utf8'));
  for (const r of rows) {
    assert.match(r.date, /^\d{4}-\d{2}-\d{2}$/, r.title);
    assert.ok(r.title && r.source && /^https?:\/\//.test(r.url), r.title);
    assert.ok(Array.isArray(r.products) && Array.isArray(r.cves), r.title);
    for (const p of r.products) assert.ok(howto[p], `${p} in vuln-howto.json`);
    // every row has its own page; a slug starts with the date, so it never meets the list's page/N
    assert.match(r.slug ?? '', /^\d{4}-\d{2}-\d{2}-[a-z0-9-]+$/, r.title);
  }
  assert.equal(new Set(rows.map((r) => r.slug)).size, rows.length, 'slugs are unique');
  const shown = rows.filter((r) => !r.hidden);
  for (const lang of ['ko', 'en']) assert.equal(new Set(uniqueTitles(shown, lang, howto, howtoEn).values()).size, shown.length, `${lang} titles are unique`);
});

const chrome = { date: '2026-11-12', title: '비운 메모리 다시 건드리는 결함... 구글, 올해 8번째 크롬 제로데이 긴급 패치', source: '보안뉴스', url: 'https://x/1',
  sources: [{ source: '데일리시큐', url: 'https://x/2' }, { source: '전자신문', url: 'https://x/3' }], products: ['chrome'], cves: ['CVE-2026-125350'], severity: '긴급', status: '악용 중', fixed: [] };

test('our title: product, flaw words, CVE and status, never the headline', () => {
  assert.deepEqual(flawOf('인증 없이 원격 코드 실행 가능'), { ko: '원격 코드 실행 취약점', en: 'remote code execution flaw', slug: 'rce' });
  assert.equal(flawOf('크롬 제로데이 긴급 패치').ko, '제로데이');
  assert.equal(flawOf('윈도우 넷로그온 결함').ko, '보안 취약점');
  assert.equal(titleFor(chrome, 'ko', howto, howtoEn), '크롬 제로데이(CVE-2026-125350) 악용 중, 업데이트 방법');
  assert.equal(titleFor(chrome, 'en', howto, howtoEn), 'Chrome zero-day (CVE-2026-125350) exploited: how to update');
  const ngx = { ...chrome, title: '엔진엑스 취약점 5건 공개', products: ['nginx'], cves: [], status: '패치 나옴' };
  assert.equal(titleFor(ngx, 'en', howto, howtoEn), 'nginx vulnerability patched: how to update'); // the name keeps its case
  const two = uniqueTitles([{ ...chrome, slug: 'a' }, { ...chrome, slug: 'b', date: '2026-06-10' }], 'ko', howto, howtoEn);
  assert.deepEqual([...two.values()], ['크롬 제로데이(CVE-2026-125350) 악용 중, 업데이트 방법 (2026년 11월)', '크롬 제로데이(CVE-2026-125350) 악용 중, 업데이트 방법 (2026년 6월)']);
});

test('a product we have no steps for is named from the headline, in English where known', () => {
  assert.equal(nameFromTitle('시스코 브로드웍스 취약점, 패치 공개 약 석 달 만에 실제 공격에 악용'), '시스코 브로드웍스');
  assert.equal(nameFromTitle('[긴급] 레디스서 원격코드실행 취약점 5건 발견'), '레디스');
  assert.equal(nameFromTitle('“로그인 없이 개발 서버 뚫린다” 깃랩, CVSS 10점 치명적 결함 긴급 패치'), '깃랩');
  assert.equal(nameEn('시스코 브로드웍스'), 'Cisco BroadWorks');
  assert.equal(nameEn('자마드'), '');
  const row = { date: '2026-11-12', title: '시스코 브로드웍스 취약점, 패치 공개 약 석 달 만에 실제 공격에 악용', products: [], cves: [], status: '악용 중' };
  assert.equal(titleFor({ ...row, name: '시스코 브로드웍스' }, 'ko', howto, howtoEn), '시스코 브로드웍스 보안 취약점 악용 중, 업데이트 방법');
});

test('our summary is built from the fields: date, outlets, status, severity, fixed version, notice, who', () => {
  const ko = summaryFor({ ...chrome, fixed: ['142.0.1'], notice: { title: 'Google 제품 보안 업데이트 권고', url: 'u' } }, 'ko', howto, howtoEn);
  assert.equal(ko[0], '2026년 11월 12일, 국내 언론 3곳이 크롬의 제로데이(CVE-2026-125350)를 보도했습니다.');
  assert.ok(ko.some((x) => x.includes('실제 공격에 쓰이고')));
  assert.ok(ko.some((x) => x.includes("'긴급'")));
  assert.ok(ko.some((x) => x.includes('142.0.1')));
  assert.ok(ko.some((x) => x.startsWith('KISA 보호나라')));
  assert.ok(ko.at(-1).startsWith('PC에서 Chrome 브라우저를 쓰는 사람이라면'));
  assert.ok(!ko.join(' ').includes('비운 메모리'), 'no words of the headline');
  const en = summaryFor(chrome, 'en', howto, howtoEn);
  assert.equal(en[0], 'On November 12, 2026, 3 Korean news outlets reported a zero-day in Chrome (CVE-2026-125350).');
  const many = summaryFor({ ...chrome, sources: Array(6).fill({ source: 'x', url: 'y' }) }, 'ko', howto, howtoEn);
  assert.match(many[0], /국내 언론 7곳 이상이/);
  assert.equal(describe(['짧은 문장입니다.', '두 번째 문장입니다.'], 15), '짧은 문장입니다.');
});

test('slugs: date, product, flaw; the CVE when no English name; -2 when taken', () => {
  const taken = new Set();
  assert.equal(slugFor(chrome, taken), '2026-11-12-chrome-zero-day');
  assert.equal(slugFor(chrome, taken), '2026-11-12-chrome-zero-day-2');
  assert.equal(slugFor({ date: '2026-08-12', title: '해커가 원격에서 방화벽 멈춘다…CVE-2026-20349 공격 확인', products: [], name: '해커가', cves: ['CVE-2026-20349'] }), '2026-08-12-cve-2026-20349-dos');
  assert.equal(slugFor({ date: '2026-11-12', title: '이반티 엔드포인트 매니저, SQL 삽입 취약점 수정', products: [], cves: [] }), '2026-11-12-ivanti-endpoint-manager-sql-injection');
  const rows = [{ ...chrome, slug: '2026-11-12-chrome-zero-day' }, { ...chrome, date: '2026-11-13', title: '깃랩 원격 코드 실행 취약점', products: [], cves: [] }];
  const given = addPageFields(rows);
  assert.equal(given.length, 1);
  assert.deepEqual([rows[1].name, rows[1].nameEn, rows[1].slug], ['깃랩', 'GitLab', '2026-11-13-gitlab-rce']);
  assert.equal(rows[0].slug, '2026-11-12-chrome-zero-day'); // a given slug never changes
  assert.deepEqual(termsFor(chrome), ['vulnerability', 'cve', 'zero-day', 'patch-management']);
});

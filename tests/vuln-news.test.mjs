import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { cvesOf, severityOf, statusOf, productsOf, fixedVersions, isVulnStory, stories, mergeVulns, noticeFor, windows } from '../scripts/vuln-news-lib.mjs';

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
  }
});

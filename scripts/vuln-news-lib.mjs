// Pure helpers for the vulnerability news collector (scripts/collect-vuln-news.mjs), kept apart so they can be tested.
// A row keeps a headline, the outlet, the date and links, plus what we read off the headline (and Naver's short
// description): the product (a key of src/data/vuln-howto.json), CVE ids, the severity and status as stated, and the
// fixed versions the text names. No article text is stored.
import { tokens, isUnwanted, isoDate } from './security-news-lib.mjs';
import { slugFor, nameFromTitle, nameEn } from '../src/lib/vuln-text.js';

/** CVE ids in a text, upper case, each once. */
export const cvesOf = (text) => [...new Set((text.match(/CVE-\d{4}-\d{4,7}/gi) ?? []).map((c) => c.toUpperCase()))];

/** The severity as the text states it: "CVSS 9.8", or the word used (치명적, 고위험, 긴급); '' when none. */
export function severityOf(text) {
  const cvss = [...text.matchAll(/(?:CVSS|위험도|심각도)[^0-9가-힣]{0,6}(?:v?[234](?:\.\d)?\s*)?(?:점수|기준)?[^0-9]{0,6}(\d{1,2}\.\d)/gi)]
    .map((m) => Number(m[1])).filter((n) => n <= 10);
  if (cvss.length) return `CVSS ${Math.max(...cvss).toFixed(1)}`;
  if (/치명적|critical/i.test(text)) return '치명적';
  if (/고위험|high[- ]severity/i.test(text)) return '고위험';
  if (/긴급/.test(text)) return '긴급';
  return '';
}

// "이미 공격에 쓰였다", "악용 사례 확인", "악용되고": exploited. "악용 가능", "악용될 수", "악용 우려": not yet.
const EXPLOITED = /(?:실제|이미|활발히|적극)\s*(?:공격|악용)|공격당|악용\s*(?:중|사례|확인|정황)|악용(?:된|되고|돼|당한)|공격에\s*(?:쓰였|쓰이고|사용됐|이용됐|악용)|공격\s*(?:정황|확인|포착)|(?:직후|만에)\s*공격|in the wild|actively exploited/i;
const UNPATCHED = /패치\s*(?:미|없|안\s|전)|미패치|미출시|패치되지|패치 안 된|패치가 없|개발\s*중|수정 불가/;
/** 악용 중, 패치 나옴 or 조치 권고 as the text says; '' when it says none of these. */
export function statusOf(text) {
  if (EXPLOITED.test(text)) return '악용 중';
  if (UNPATCHED.test(text)) return '조치 권고';
  if (/패치|업데이트|수정\s*버전|취약점[^…,]{0,12}(?:수정|해결)|fixed|patch/i.test(text)) return '패치 나옴';
  if (/권고|당부|주의|점검|경고/.test(text)) return '조치 권고';
  return '';
}
const URGENCY = ['', '조치 권고', '패치 나옴', '악용 중'];
const urgent = (a, b) => (URGENCY.indexOf(b) > URGENCY.indexOf(a) ? b : a);

/** The products a text names: keys of the how-to map whose "match" pattern it contains, in the map's order. */
export const productsOf = (text, howto) =>
  Object.entries(howto).filter(([k, h]) => !k.startsWith('_') && h.match && new RegExp(h.match, 'i').test(text)).map(([k]) => k);

/**
 * Versions the text names as fixed: in a clause that says patched/updated/released ("2.4.71에서 수정", "1.30.7 및
 * 1.31.9 버전으로 업데이트", "fixed in 2.4.71"), leaving out a version followed by words for an affected range
 * ("2.4.55부터 2.4.70까지 영향", "1.30.6 이하"). A version needs three parts (1.30.7), or two after an OS or browser
 * name (iOS 26.1), so a CVSS score is never taken for one.
 */
export function fixedVersions(text) {
  const out = new Set();
  // a comma before a number joins a list of versions ("1.30.7, 1.31.9"), so the clause goes on
  for (const clause of text.split(/,(?!\s*\d)|[;…\n]|[.。](?=\s|$)|\s(?:하지만|그러나)\s/)) {
    if (!/수정|패치|업데이트|업그레이드|해결|공개|배포|릴리스|fixed|patched|이상/i.test(clause)) continue;
    for (const m of clause.matchAll(/(?<![\d.])(\d+\.\d+\.\d+(?:\.\d+)?)(?![\d.])|(?:iOS|iPadOS|macOS|watchOS|visionOS|Chrome|크롬)\s*(\d+(?:\.\d+)+)/gi)) {
      const after = clause.slice(m.index + m[0].length);
      if (!/^\s*(?:버전\s*)?(?:이하|이전|미만|까지|부터|영향|에\s*영향|취약|and earlier|and below|affected)/i.test(after)) out.add(m[1] ?? m[2]);
    }
  }
  return [...out];
}

const VULN = /취약점|제로데이|CVE-\d|보안\s*(?:업데이트|패치)|긴급\s*패치|원격\s*(?:코드|명령)|권한\s*상승|보안\s*결함|vulnerab|zero[- ]day/i;
/** True when a headline is about a vulnerability (and not an event, product launch, column or other noise). */
export const isVulnStory = (title, cfg, source = '') => VULN.test(title) && !isUnwanted(title, cfg, source);

// words every vulnerability headline shares; they say nothing about which flaw it is
const VSTOP = new Set(('취약점 보안 패치 업데이트 긴급 권고 발견 원격 코드 실행 제로데이 공지 주의 점검 치명적 고위험 심각 심각한 버전 사용자 '
  + '당부 적용 조치 배포 공개 수정 결함 악용 위험 경고 비상 정부 과기정통부 kisa 한국인터넷진흥원 정보보호 신속 즉시 필요 '
  + '최신 제품 다수 대응 우려 가능 공격자 해커 해커들 비상등 rce vulnerability vulnerabilities patch patches update flaw critical '
  + 'zero day exploit exploited 인증 없이 없는 로그인 서버 웹서버 관리자 시스템 장악 탈취 루트 권한 필수 대규모 실제 국내 '
  + '세계 전세계 기업 공공 기관 신규 추가 확인 연쇄 노출 우회 침투 사용자들 이용자 계정').split(' '));
const vtokens = (title) => new Set([...tokens(title)].filter((w) => !VSTOP.has(w) && !/^cve/.test(w)));
const days = (a, b) => Math.abs(new Date(a) - new Date(b)) / 864e5;
const shared = (a, b) => [...a].filter((w) => b.has(w)).length;

/**
 * True when g (a story or a stored row) and f are the same flaw: a shared CVE id within 60 days, or, within four days
 * of g's latest report and ten of its first, the same main product (the first one named) or, when either names no
 * product, two shared distinctive words.
 */
export function sameFlaw(g, f) {
  const gc = g.cves ?? [], fc = f.cves ?? [], gp = g.products?.[0], fp = f.products?.[0];
  if (fc.some((c) => gc.includes(c)) && days(g.date, f.date) <= 60) return true;
  if (days(g.last ?? g.date, f.date) > 4 || days(g.date, f.date) > 10) return false;
  // the same product, unless both name CVE ids and none is shared (two Chrome flaws in one week are two rows)
  if (gp && fp) return gp === fp && (!fc.length || !gc.length);
  if (gp || fp) return false; // one names a product we know, the other does not: keep them apart
  return shared(vtokens(f.title), g.tk ?? vtokens(g.title)) >= 2;
}

/**
 * Group headlines about the same flaw. A story's first report gives the date; its headline and link come from the first
 * report by a preferred outlet (cfg.preferSources), else the first report. Every outlet is kept once in sources.
 */
export function stories(items, howto, cfg = {}) {
  const prefer = (cfg.preferSources ?? []).map((s) => s.toLowerCase());
  const trusted = (cfg.trustedSources ?? []).map((s) => s.toLowerCase());
  const groups = [];
  for (const it of [...items].sort((a, b) => a.date.localeCompare(b.date))) {
    const text = `${it.title} ${it.summary ?? ''}`;
    const f = { ...it, text, cves: cvesOf(text), products: productsOf(text, howto) };
    const g = groups.find((s) => sameFlaw(s, f));
    if (g) {
      g.items.push(f);
      g.last = f.date;
      for (const c of f.cves) if (!g.cves.includes(c)) g.cves.push(c);
      for (const p of f.products) if (!g.products.includes(p)) g.products.push(p);
      vtokens(f.title).forEach((w) => g.tk.add(w));
    } else groups.push({ date: f.date, last: f.date, title: f.title, items: [f], cves: [...f.cves], products: [...f.products], tk: vtokens(f.title) });
  }
  return groups.map((g) => {
    const lead = prefer.map((p) => g.items.find((i) => (i.source ?? '').toLowerCase().includes(p))).find(Boolean) ?? g.items[0];
    const bySource = new Map();
    for (const i of g.items) if (!bySource.has(i.source || i.url)) bySource.set(i.source || i.url, { source: i.source, url: i.url });
    const text = g.items.map((i) => i.text).join('\n');
    return {
      date: lead.date, title: lead.title, source: lead.source, url: lead.url,
      sources: [...bySource.values()].filter((s) => s.url !== lead.url),
      outlets: bySource.size, trusted: g.items.some((i) => trusted.some((t) => (i.source ?? '').toLowerCase().includes(t))),
      // the product the story was grouped by, then the others its headline names ("PHP 이어 자바도" is not about PHP)
      products: [...new Set([g.products[0], ...lead.products])].filter(Boolean), cves: g.cves,
      severity: severityOf(text), status: g.items.reduce((s, i) => urgent(s, statusOf(i.text)), ''), fixed: fixedVersions(text),
    };
  });
}

/** The KISA 보안공지 about the same product within a week of the story (title "NGINX 제품 보안 업데이트 권고"). */
export function noticeFor(story, notices, howto) {
  const vendorIn = (n) => {
    const vendor = n.title.split(/\s*제품|\s*보안/)[0].trim().toLowerCase();
    return vendor.length >= 3 && /^[a-z0-9 .-]+$/.test(vendor) && story.title.toLowerCase().includes(vendor);
  };
  const near = notices.filter((n) => n.date && (new Date(n.date) - new Date(story.date)) / 864e5 >= -3 && (new Date(n.date) - new Date(story.date)) / 864e5 <= 7);
  const n = near.find((x) => story.products[0] && productsOf(x.title, howto).includes(story.products[0])) ?? near.find(vendorIn);
  return n && { title: n.title, url: n.url, date: n.date };
}

const MAX_SOURCES = 6;
/**
 * Merge new stories into the stored rows. A story about a flaw already listed (hidden rows too) only adds its outlets
 * to that row (an auto row also takes its CVE ids, fixed versions and a more urgent status). A new story is added when at
 * least minOutlets outlets reported it, a KISA notice backs it, or one outlet in cfg.trustedSources (security trade
 * press, which often covers a flaw alone) reported it and it is something to act on: it names a product we have steps
 * for, a CVE id, a patch or an attack. At most maxNewPerRun (0: no limit). Newest first.
 */
export function mergeVulns(stored, found, cfg, howto, notices = []) {
  const rows = stored.map((r) => ({ ...r }));
  const fresh = [];
  for (const s of stories(found, howto, cfg)) {
    const hit = rows.find((r) => r.url === s.url || r.sources?.some((x) => x.url === s.url) || sameFlaw(r, s));
    if (hit) {
      if (hit.hidden) continue;
      const known = new Set([hit.source, ...(hit.sources ?? []).map((x) => x.source)]);
      hit.sources = [...(hit.sources ?? []), ...[{ source: s.source, url: s.url }, ...s.sources].filter((x) => !known.has(x.source) && known.add(x.source))].slice(0, MAX_SOURCES);
      if (hit.auto) {
        hit.cves = [...new Set([...(hit.cves ?? []), ...s.cves])];
        hit.status = urgent(hit.status ?? '', s.status);
        hit.severity ||= s.severity;
        hit.fixed = [...new Set([...(hit.fixed ?? []), ...s.fixed])];
        hit.notice ??= noticeFor(s, notices, howto);
      }
      continue;
    }
    const notice = noticeFor(s, notices, howto);
    const actionable = s.products.length || s.cves.length || s.status === '패치 나옴' || s.status === '악용 중';
    if (s.outlets < (cfg.minOutlets ?? 2) && !notice && !(s.trusted && actionable)) continue;
    const { outlets, trusted, ...row } = s;
    if (!row.status && notice && /업데이트|패치/.test(notice.title)) row.status = '패치 나옴'; // KISA: "… 보안 업데이트 권고"
    fresh.push({ ...row, sources: row.sources.slice(0, MAX_SOURCES), ...(notice && { notice }), auto: true });
  }
  const limit = cfg.maxNewPerRun ?? 0;
  fresh.sort((a, b) => b.date.localeCompare(a.date));
  const added = limit ? fresh.slice(0, limit) : fresh;
  return { rows: [...added, ...rows].sort((a, b) => b.date.localeCompare(a.date)), added };
}

/** Week-long windows [after, before) from a date up to today, for a month-by-month backfill. */
export function windows(from, to = isoDate(new Date()), step = 7) {
  const out = [];
  for (let t = new Date(from); t <= new Date(to); t = new Date(t.getTime() + step * 864e5)) {
    out.push([t.toISOString().slice(0, 10), new Date(t.getTime() + step * 864e5).toISOString().slice(0, 10)]);
  }
  return out;
}

/**
 * Give every row without one a page address (slug, /news/vulnerabilities/<slug>), oldest first so a "-2" goes to the
 * later row; a row naming no product we have steps for also stores the product name read off its headline (name, and
 * nameEn when we know the English), for its title on our page. Slugs never change once given. Returns the rows given one.
 */
export function addPageFields(rows) {
  const taken = new Set(rows.map((r) => r.slug).filter(Boolean));
  const todo = rows.filter((r) => !r.slug).sort((a, b) => a.date.localeCompare(b.date));
  for (const r of todo) {
    if (!r.products?.length && !r.name) {
      const n = nameFromTitle(r.title), e = n && nameEn(n);
      if (n) r.name = n;
      if (e) r.nameEn = e;
    }
    r.slug = slugFor(r, taken);
  }
  return todo;
}

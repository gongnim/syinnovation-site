// Pure helpers for the security news collector (scripts/collect-security-news.mjs), kept apart so they can be tested.
// The site lists only a headline, the outlet, the date and a link; no article text or images are stored.

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'" };
const decode = (s) => s
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/&(#x?[0-9a-f]+|[a-z]+|#39);/gi, (m, e) => {
    if (ENTITIES[e.toLowerCase()]) return ENTITIES[e.toLowerCase()];
    if (e[0] === '#') return String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
    return m;
  })
  .replace(/<[^>]+>/g, '')
  .trim();
const tag = (xml, name) => { const m = xml.match(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)</${name}>`, 'i')); return m ? decode(m[1]) : ''; };

/** RSS 2.0 items (Google News search feeds, most media feeds): title, link, date, source. */
export function parseRss(xml) {
  return [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)].map(([, item]) => {
    let title = tag(item, 'title');
    let source = tag(item, 'source');
    // Google News titles end with " - Outlet"; keep the outlet once, in source
    if (source && title.endsWith(` - ${source}`)) title = title.slice(0, -(source.length + 3));
    const pub = tag(item, 'pubDate');
    return { title, url: tag(item, 'link'), source, date: pub ? isoDate(pub) : '' };
  }).filter((i) => i.title && i.url);
}

/** A date in Korea time as YYYY-MM-DD. */
export function isoDate(d) {
  const t = new Date(d);
  if (Number.isNaN(t.getTime())) return '';
  return new Date(t.getTime() + 9 * 3600e3).toISOString().slice(0, 10);
}

const TYPES = [
  ['랜섬웨어', /랜섬웨어|ransomware/i],
  ['디도스', /디도스|DDoS/i],
  ['공급망 공격', /공급망|supply[- ]chain/i],
  ['계정 탈취', /계정 탈취|크리덴셜|credential|account takeover|피싱|phishing/i],
  ['개인정보 유출', /유출|leak|breach|exposed|노출/i],
  ['해킹', /해킹|침해|hack|cyber ?attack|intrusion/i],
];
/** What kind of incident a headline is about, or null when it is not about an incident at all. */
export function classify(title) {
  for (const [type, re] of TYPES) if (re.test(title)) return type;
  return null;
}

/**
 * True when the headline names an excluded organisation or is an event, column, ad, market note or speculation,
 * or when it comes from a source that is not a news outlet (law-firm notices and the like).
 */
export function isUnwanted(title, { exclude = [], noise = [], excludeSources = [] }, source = '') {
  const t = title.toLowerCase(), s = source.toLowerCase();
  return [...exclude, ...noise].some((w) => t.includes(w.toLowerCase())) || excludeSources.some((w) => s.includes(w.toLowerCase()));
}
/** How many outlets must report a story before it is added: one number, or one per region. */
const minOutlets = (cfg, region) => (typeof cfg.minOutlets === 'object' ? cfg.minOutlets[region] ?? 2 : cfg.minOutlets ?? 2);

const STOP = new Set(('해킹 유출 개인정보 정보 랜섬웨어 공격 사고 피해 고객 확인 발생 관련 의혹 정부 조사 신고 수사 경찰 이상 '
  + '사이버 보안 침해 디도스 데이터 서버 시스템 회사 기업 기관 고객정보 만명 명의 속보 단독 종합 '
  + 'data breach ransomware attack attacks cyberattack hacked hackers hacker leak leaked exposed after says said '
  + 'with from that this have been over million users customers company report reports cyber security').split(' '));
const PARTICLE = /(에서도|으로도|까지도|에게서|마저|조차|에도|이라도|라도|처럼|보다|으로|에서|에게|까지|부터|이며|이고|으며|하고|에|은|는|이|가|을|를|의|와|과|로|도|만)$/;
/** Distinctive words of a headline, for telling whether two headlines are about the same story. */
export function tokens(title) {
  return new Set(title.toLowerCase()
    .split(/[^0-9a-z가-힣]+/)
    .map((w) => (/[가-힣]/.test(w) ? w.replace(PARTICLE, '') : w))
    .filter((w) => (/[가-힣]/.test(w) ? w.length >= 2 : w.length >= 3) && !STOP.has(w) && !/^\d+$/.test(w)));
}

const days = (a, b) => Math.abs(new Date(a) - new Date(b)) / 864e5;
// words match when equal, or when one starts the other and is at least three letters ("금융보안원" / "금융보안원마저")
const same = (a, b) => a === b || (Math.min(a.length, b.length) >= 3 && (a.startsWith(b) || b.startsWith(a)));
const shared = (a, b) => [...a].filter((w) => [...b].some((v) => same(w, v))).length;

// a Korean headline naming another country is about an incident abroad
const FOREIGN = /미국|일본|중국|프랑스|영국|독일|러시아|이란|우크라이나|대만|유럽|EU|호주|캐나다|인도|베트남|싱가포르|이스라엘|홍콩|브라질/;
export const regionOf = (title, region) => (region === '국내' && FOREIGN.test(title) ? '해외' : region);

/**
 * Group headlines about the same incident (two shared distinctive words, within three days). A story's size is the
 * number of different outlets that reported it; its first report gives the date, headline and link.
 */
export function stories(items) {
  const groups = [];
  for (const it of [...items].sort((a, b) => a.date.localeCompare(b.date))) {
    const tk = tokens(it.title);
    const g = groups.find((s) => days(s.first.date, it.date) <= 3 && shared(tk, s.tokens) >= 2);
    if (g) { g.items.push(it); tk.forEach((w) => g.tokens.add(w)); }
    else groups.push({ first: it, items: [it], tokens: tk });
  }
  return groups.map((g) => ({ ...g.first, outlets: new Set(g.items.map((i) => i.source || i.url)).size, tokens: g.tokens }));
}

/**
 * Merge new stories into the stored rows: skip excluded or noisy headlines, stories reported by fewer than
 * minOutlets outlets, and anything already stored (same link, or the same story as a stored row); add at most
 * maxNewPerRun; drop collector rows older than keepDays. Hand-picked rows are never dropped or changed.
 */
export function merge(stored, found, cfg, today = isoDate(new Date())) {
  const known = new Set(stored.map((r) => r.url));
  const storedTokens = stored.map((r) => ({ date: r.date, tk: tokens(r.title) }));
  // organisations of stored rows ("대한항공·아시아나항공", "Helpfeel (Gyazo)"): a new headline naming one within a week is the same story
  const storedOrgs = stored.flatMap((r) => (r.org ?? '').split(/[·,()]/).map((o) => o.trim().toLowerCase()).filter((o) => o.length >= 2).map((o) => ({ date: r.date, o })));
  const fresh = [];
  for (const s of stories(found)) {
    const type = classify(s.title);
    if (!type || isUnwanted(s.title, cfg, s.source) || s.outlets < minOutlets(cfg, s.region) || known.has(s.url)) continue;
    if (storedTokens.some((r) => days(r.date, s.date) <= 3 && shared(s.tokens, r.tk) >= 2)) continue;
    if (storedOrgs.some((r) => days(r.date, s.date) <= 7 && s.title.toLowerCase().includes(r.o))) continue;
    fresh.push({ date: s.date, region: regionOf(s.title, s.region), type, title: s.title, source: s.source, url: s.url, auto: true });
  }
  fresh.sort((a, b) => b.date.localeCompare(a.date));
  const kept = stored.filter((r) => !r.auto || days(r.date, today) <= (cfg.keepDays ?? 120));
  return { rows: [...fresh.slice(0, cfg.maxNewPerRun ?? 6), ...kept], added: Math.min(fresh.length, cfg.maxNewPerRun ?? 6) };
}

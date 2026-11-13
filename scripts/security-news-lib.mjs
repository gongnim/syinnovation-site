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
// "1만4천500건" and "1만4500건" (and "14,500건") are the same count: write Korean numbers as plain digits
const UNIT = { 억: 1e8, 만: 1e4, 천: 1e3, 백: 1e2 };
export function plainNumber(w) {
  const m = w.match(/^(\d[\d.]*(?:[억만천백][\d.]*)*)(.*)$/);
  if (!m || !/[억만천백]/.test(m[1])) return w;
  let total = 0, section = 0;
  for (const [, n, u] of m[1].matchAll(/([\d.]+)([억만천백])?/g)) {
    const v = Number(n);
    if (u === '억' || u === '만') { total += (section + v) * UNIT[u]; section = 0; } else section += v * (u ? UNIT[u] : 1);
  }
  return String(total + section) + m[2];
}
/** Distinctive words of a headline, for telling whether two headlines are about the same story. */
export function tokens(title) {
  return new Set(title.toLowerCase().replace(/(\d),(?=\d{3})/g, '$1')
    .split(/[^0-9a-z가-힣]+/)
    .map((w) => (/[가-힣]/.test(w) ? plainNumber(w).replace(PARTICLE, '') : w))
    .filter((w) => (/[가-힣]/.test(w) ? w.length >= 2 : w.length >= 3) && !STOP.has(w) && !/^\d+$/.test(w)));
}

const days = (a, b) => Math.abs(new Date(a) - new Date(b)) / 864e5;
// words match when equal, or when one starts the other and is at least three letters ("금융보안원" / "금융보안원마저")
const same = (a, b) => a === b || (Math.min(a.length, b.length) >= 3 && (a.startsWith(b) || b.startsWith(a)));
const shared = (a, b) => [...a].filter((w) => [...b].some((v) => same(w, v))).length;

// a Korean headline naming another country, or a big city or landmark abroad, is about an incident abroad
// (no 파리: it is also in Korean brand names)
const FOREIGN = /미국|일본|중국|프랑스|영국|독일|러시아|이란|우크라이나|대만|유럽|EU|호주|캐나다|인도|베트남|싱가포르|이스라엘|홍콩|브라질|도쿄|오사카|야스쿠니|뉴욕|워싱턴|런던|베이징|상하이/;
// and an English headline about South Korea is about an incident at home
const KOREA = /South Korea|Korean|Seoul/;
export const regionOf = (title, region) => (region === '국내' && FOREIGN.test(title) ? '해외' : region === '해외' && KOREA.test(title) ? '국내' : region);

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
/**
 * A test for "is this already on the list?": the same link, a headline sharing two distinctive words with a stored
 * row from within three days, a headline naming the organisation of a stored row from within a week
 * ("대한항공·아시아나항공", "Helpfeel (Gyazo)" name two each), or a headline using one of a stored row's other
 * names ("aka": English names, follow-up wording) within 60 days, so foreign reports and follow-ups of a story we
 * already cover are not added again.
 */
export function listed(stored) {
  const known = new Set(stored.map((r) => r.url));
  const storedTokens = stored.map((r) => ({ date: r.date, tk: tokens(r.title) }));
  const storedOrgs = stored.flatMap((r) => (r.org ?? '').split(/[·,()]/).map((o) => o.trim().toLowerCase()).filter((o) => o.length >= 2).map((o) => ({ date: r.date, o })));
  const storedAka = stored.flatMap((r) => (r.aka ?? []).map((a) => ({ date: r.date, a: a.toLowerCase() })));
  return ({ url, title, date }) => known.has(url)
    || storedTokens.some((r) => days(r.date, date) <= 3 && shared(tokens(title), r.tk) >= 2)
    || storedOrgs.some((r) => days(r.date, date) <= 7 && title.toLowerCase().includes(r.o))
    || storedAka.some((r) => days(r.date, date) <= 60 && title.toLowerCase().includes(r.a));
}

export function merge(stored, found, cfg, today = isoDate(new Date())) {
  const isListed = listed(stored);
  const fresh = [];
  for (const s of stories(found)) {
    const type = classify(s.title);
    if (!type || isUnwanted(s.title, cfg, s.source) || s.outlets < minOutlets(cfg, s.region) || isListed(s)) continue;
    fresh.push({ date: s.date, region: regionOf(s.title, s.region), type, title: s.title, source: s.source, url: s.url, auto: true });
  }
  fresh.sort((a, b) => b.date.localeCompare(a.date));
  const kept = stored.filter((r) => !r.auto || days(r.date, today) <= (cfg.keepDays ?? 120));
  return { rows: [...fresh.slice(0, cfg.maxNewPerRun ?? 6), ...kept], added: Math.min(fresh.length, cfg.maxNewPerRun ?? 6) };
}

// what to search a free photo library for: the field named in the headline first, else the kind of incident
const PHOTO_FIELDS = [
  [/은행|bank/i, 'bank office'], [/카드|card/i, 'credit card payment'], [/증권|stock|투자|broker/i, 'stock trading screens'],
  [/보험|insurance/i, 'insurance office'], [/항공|airline|airport/i, 'airport terminal'], [/병원|hospital|의료|health/i, 'hospital corridor'],
  [/대학|university|학교|school|college/i, 'university library'], [/게임|gaming|game/i, 'gaming setup'],
  [/쇼핑|몰|커머스|이커머스|retail|retailer|shop|마트|supermarket/i, 'online shopping'], [/통신|텔레콤|telecom|carrier/i, 'telecom tower'],
  [/클라우드|cloud|데이터센터|data ?cent/i, 'data center servers'], [/정부|공공|부처|지자체|government|ministry|agency/i, 'government building'],
  [/택배|물류|배송|logistics|delivery|shipping/i, 'logistics warehouse'], [/호텔|여행|travel|hotel/i, 'hotel lobby'],
  [/자동차|car maker|automaker|automotive/i, 'car factory'], [/전력|에너지|발전|power|energy|utility/i, 'power plant control room'],
  [/교회|church/i, 'church interior'], [/교육|이러닝|e-?learning/i, 'online learning laptop'],
];
const PHOTO_TYPES = {
  랜섬웨어: 'server room red light', '개인정보 유출': 'data privacy laptop', 해킹: 'code on screen dark',
  '공급망 공격': 'business network connections', 디도스: 'network cables server', '계정 탈취': 'password login screen', 기타: 'cyber security',
};
export const photoQuery = (title, type) => PHOTO_FIELDS.find(([re]) => re.test(title))?.[1] ?? PHOTO_TYPES[type] ?? PHOTO_TYPES['기타'];

/**
 * News videos to add: about an incident, from a broadcaster's channel (cfg.videoChannels, matched in the channel
 * name), not excluded, not already listed; newest first, at most cfg.maxVideosPerRun.
 * videos: { id, title, channel, date, region }
 */
// a video title often ends with " | Channel" or " - Channel"; the card shows the channel already
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const bare = (title, channel) => title.replace(new RegExp(`\\s*[|-]\\s*${escapeRe(channel)}\\s*$`, 'i'), '');

export function pickVideos(stored, videos, cfg) {
  const isListed = listed(stored);
  const channels = (cfg.videoChannels ?? []).map((c) => c.toLowerCase());
  const seen = new Set();
  return videos
    .map((v) => ({ ...v, url: `https://www.youtube.com/watch?v=${v.id}`, type: classify(v.title) }))
    .filter((v) => v.type && !isUnwanted(v.title, cfg, v.channel) && channels.some((c) => v.channel.toLowerCase().includes(c)))
    .filter((v) => !isListed(v) && !seen.has(v.id) && seen.add(v.id))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, cfg.maxVideosPerRun ?? 2)
    .map((v) => ({ date: v.date, region: regionOf(v.title, v.region), type: v.type, title: bare(v.title, v.channel), source: v.channel, url: v.url, youtube: v.id, auto: true }));
}

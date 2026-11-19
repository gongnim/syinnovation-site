// Our own words for a 보안뉴스 row (src/data/vuln-news.json): its page address (slug), title and summary, made from the
// row's fields (product, flaw type words in the headline, CVE, status, severity, fixed version, KISA notice, number
// of outlets) so that no sentence of an article is copied. Plain JS so the collector (scripts/collect-vuln-news.mjs)
// and the tests can use it; the pages bind it to the how-to data in src/data/news.ts.

// flaw types named in headlines: the Korean words, the English, the slug word
const FLAWS = [
  [/원격\s*(?:코드|명령)\s*실행|원격코드실행|코드\s*실행|\bRCE\b|서버\s*(?:원격\s*)?장악/i, '원격 코드 실행', 'remote code execution', 'rce'],
  [/SQL\s*(?:삽입|인젝션)|SQL injection/i, 'SQL 삽입', 'SQL injection', 'sql-injection'],
  [/권한\s*(?:상승|탈취|획득)|루트\s*권한|SYSTEM\s*권한|privilege escalation/i, '권한 상승', 'privilege escalation', 'privilege-escalation'],
  [/서비스\s*거부|\bDoS\b|멈춘다|멈추|메모리\s*고갈|마비/i, '서비스 거부', 'denial-of-service', 'dos'],
  [/인증\s*우회|MFA\s*우회|다중인증도?\s*무력화|authentication bypass/i, '인증 우회', 'authentication bypass', 'auth-bypass'],
  [/\bSSRF\b/i, 'SSRF', 'SSRF', 'ssrf'],
];
const ZERO_DAY = /제로데이|zero[- ]?day|0-day/i;

/** The flaw as we name it: { ko: '원격 코드 실행 취약점', en: 'remote code execution flaw', slug: 'rce' }. */
export function flawOf(title) {
  const f = FLAWS.find(([re]) => re.test(title));
  const zero = ZERO_DAY.test(title);
  if (!f) return zero ? { ko: '제로데이', en: 'zero-day', slug: 'zero-day' } : { ko: '보안 취약점', en: 'vulnerability', slug: 'vulnerability' };
  return zero
    ? { ko: `${f[1]} 제로데이`, en: `${f[2]} zero-day`, slug: `${f[3]}-zero-day` }
    : { ko: `${f[1]} 취약점`, en: `${f[2]} flaw`, slug: f[3] };
}

// vendor and product names in Korean headlines, in English (longer names first where one contains another)
const VENDORS = [
  ['팔로알토네트웍스', 'Palo Alto Networks'], ['팔로알토', 'Palo Alto'], ['마이크로소프트', 'Microsoft'], ['트렌드마이크로', 'Trend Micro'],
  ['비욘드트러스트', 'BeyondTrust'], ['전자정부 프레임워크', 'eGovFrame'], ['유니버설 로봇', 'Universal Robots'], ['엔드포인트 매니저', 'Endpoint Manager'],
  ['에이펙스 원', 'Apex One'], ['시큐어 워크로드', 'Secure Workload'], ['아이덴티티 관리자', 'Identity Manager'], ['프로젝트 매니저', 'Project Manager'],
  ['구글', 'Google'], ['애플', 'Apple'], ['삼성', 'Samsung'], ['시스코', 'Cisco'], ['아이반티', 'Ivanti'], ['이반티', 'Ivanti'], ['포티넷', 'Fortinet'],
  ['포티OS', 'FortiOS'], ['포티샌드박스', 'FortiSandbox'], ['소닉월', 'SonicWall'], ['오라클', 'Oracle'], ['웹로직', 'WebLogic'], ['어도비', 'Adobe'],
  ['콜드퓨전', 'ColdFusion'], ['깃랩', 'GitLab'], ['깃허브', 'GitHub'], ['레디스', 'Redis'], ['시놀로지', 'Synology'], ['큐냅', 'QNAP'],
  ['시트릭스', 'Citrix'], ['넷스케일러', 'NetScaler'], ['브로드컴', 'Broadcom'], ['드루팔', 'Drupal'], ['스플렁크', 'Splunk'], ['셰어포인트', 'SharePoint'],
  ['마이크로틱', 'MikroTik'], ['디펜더', 'Defender'], ['파이어폭스', 'Firefox'], ['모질라', 'Mozilla'], ['노트패드++', 'Notepad++'], ['체크포인트', 'Check Point'],
  ['레일스', 'Rails'], ['지오서버', 'GeoServer'], ['팀시티', 'TeamCity'], ['아루바', 'Aruba'], ['솔라윈즈', 'SolarWinds'], ['서브유', 'Serv-U'],
  ['디링크', 'D-Link'], ['줌', 'Zoom'], ['프리즈마 브라우저', 'Prisma Browser'], ['브로드웍스', 'BroadWorks'], ['크로스워크', 'Crosswork'], ['폴리', 'Poly'],
  ['녹스', 'Knox'], ['리눅스 커널', 'Linux kernel'], ['리눅스', 'Linux'], ['우분투', 'Ubuntu'], ['워드프레스', 'WordPress'], ['자바', 'Java'], ['크롬', 'Chrome'],
  ['윈도우', 'Windows'], ['윈도', 'Windows'], ['아이폰', 'iPhone'], ['갤럭시', 'Galaxy'], ['안드로이드', 'Android'], ['공유기', 'router'], ['엔진엑스', 'nginx'],
  ['아파치', 'Apache'], ['톰캣', 'Tomcat'], ['오픈SSL', 'OpenSSL'], ['오픈SSH', 'OpenSSH'], ['한컴', 'Hancom'], ['북잇', 'BookIt'], ['엘리멘터 프로', 'Elementor Pro'],
];
/** A Korean product name in English: known names translated, other Korean words left out; '' when nothing is left. */
export function nameEn(ko) {
  let s = ` ${ko} `;
  for (const [k, e] of VENDORS) s = s.split(k).join(e);
  return s.split(/\s+/).filter((w) => w && !/[가-힣]/.test(w)).join(' ').replace(/^[·,\s]+|[·,\s]+$/g, '');
}

// a headline's leading words, up to the first word about the flaw: "시스코 브로드웍스 취약점, …" → "시스코 브로드웍스"
const FLAW_WORD = /^(?:취약점|제로데이|원격|인증|권한|치명적|긴급|보안|결함|SQL|패치|업데이트|CVE|CVSS|최고|심각|핵심|중대|고위험|초고위험|실제|PoC|공개|발견|SSRF|VM|핫패치|최대|역대|사용자|로그인|이미지|합성|스냅|커널|\d)/;
/** The product a headline is about when it names none we have steps for (the collector stores it as the row's name). */
export function nameFromTitle(title) {
  const t = title.replace(/^\s*(?:\[[^\]]*\]\s*)+/, '').replace(/^[“"'‘][^”"'’]*[”"'’]\s*/, '');
  const words = [];
  for (const w of t.split(/\s+/)) {
    if (!w || FLAW_WORD.test(w.replace(/^[‘'"“(]/, ''))) break;
    const end = /[,…·:]$|[,…]/.test(w);
    words.push(w.replace(/[,…:].*$/, '').replace(/^[‘'"“]|[’'"”]$/g, ''));
    if (end || words.length >= 3) break;
  }
  // a particle on the last word: "레디스서" → "레디스", "아파치의" → "아파치"
  return words.join(' ').replace(/(?<=[가-힣]{2})(?:에서|서|의|도)$/, '').replace(/[‘’'"“”]/g, '').trim();
}

const kernel = (v) => v.products?.[0] === 'linux' && /커널|kernel/i.test(v.title);
/** The product name shown in our title: the how-to labels (up to two), else the stored name, else the headline's. */
export function productName(v, lang, howtoKo, howtoEn = {}) {
  if (v.products?.length) {
    if (kernel(v)) return lang === 'en' ? 'Linux kernel' : '리눅스 커널';
    return v.products.slice(0, 2).map((k) => (lang === 'en' ? howtoEn[k]?.label : undefined) ?? howtoKo[k]?.label ?? k).join(lang === 'en' ? ' and ' : '·');
  }
  if (lang === 'en') return v.nameEn ?? nameEn(v.name ?? nameFromTitle(v.title));
  return v.name ?? nameFromTitle(v.title);
}

const cveText = (v) => (v.cves?.length ? (v.cves.length > 1 ? `${v.cves[0]} 등` : v.cves[0]) : '');
const cveTextEn = (v) => (v.cves?.length ? (v.cves.length > 1 ? `${v.cves[0]} and others` : v.cves[0]) : '');
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/** Our title: "크롬 제로데이(CVE-2026-12345) 악용 중, 업데이트 방법" / "Chrome zero-day (CVE-2026-12345) exploited: how to update". */
export function titleFor(v, lang, howtoKo, howtoEn) {
  const f = flawOf(`${v.title} ${v.note ?? ''}`), name = productName(v, lang, howtoKo, howtoEn); // a hand-written note can name the flaw type
  if (lang === 'en') {
    const c = cveTextEn(v);
    const base = `${name ? `${name} ` : cap(f.en)}${name ? f.en : ''}${c ? ` (${c})` : ''}`; // names keep their case: nginx, iPhone
    return base + ({ '악용 중': ' exploited: how to update', '패치 나옴': ' patched: how to update', '조치 권고': ': what to check and do' }[v.status] ?? ': how to check and update');
  }
  const c = cveText(v);
  const base = `${name ? `${name} ` : ''}${f.ko}${c ? `(${c})` : ''}`;
  return base + ({ '악용 중': ' 악용 중, 업데이트 방법', '패치 나옴': ' 패치 공개, 업데이트 방법', '조치 권고': ' 주의, 확인과 조치 방법' }[v.status] ?? ', 확인과 업데이트 방법');
}

/**
 * Titles for a set of rows, each one different: a title shared by several rows gets the month, or the day when the
 * month is shared too ("윈도우 제로데이 악용 중, 업데이트 방법 (2026년 8월)"). Returns a Map from slug to title.
 */
export function uniqueTitles(rows, lang, howtoKo, howtoEn) {
  const when = (d, day) => { const [y, m, dd] = d.split('-').map(Number); return lang === 'en' ? (day ? dayEn(d) : `${MONTHS[m - 1]} ${y}`) : (day ? `${y}년 ${m}월 ${dd}일` : `${y}년 ${m}월`); };
  const base = rows.map((v) => titleFor(v, lang, howtoKo, howtoEn));
  const count = (list) => list.reduce((m, t) => m.set(t, (m.get(t) ?? 0) + 1), new Map());
  const c1 = count(base);
  const month = base.map((t, i) => (c1.get(t) > 1 ? `${t} (${when(rows[i].date, false)})` : t));
  const c2 = count(month);
  return new Map(rows.map((v, i) => [v.slug, c2.get(month[i]) > 1 ? `${base[i]} (${when(v.date, true)})` : month[i]]));
}

// Korean particles after a word: 을/를, 이라면/라면 (a closing parenthesis is skipped: "취약점(CVE-…)을")
const jong = (s) => { const t = s.replace(/\s*\([^)]*\)\s*$/, '').trim(); const c = t.charCodeAt(t.length - 1); return c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28 > 0; };
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const dayKo = (d) => { const [y, m, dd] = d.split('-').map(Number); return dd ? `${y}년 ${m}월 ${dd}일` : `${y}년 ${m}월`; };
const dayEn = (d) => { const [y, m, dd] = d.split('-').map(Number); return dd ? `${MONTHS[m - 1]} ${dd}, ${y}` : `${MONTHS[m - 1]} ${y}`; };
const SEV_EN = { 치명적: 'critical', 고위험: 'high-risk', 긴급: 'urgent' };
const MAX_SOURCES = 6; // the collector keeps at most this many other outlets, so a full list means "or more"

/**
 * Our summary, sentence by sentence, from the row's fields only; a hand-written note (Korean on the row, English in
 * src/data/i18n/vuln-news.en.json) comes last. who is the how-to's "who is affected" line for the main product.
 */
export function summaryFor(v, lang, howtoKo, howtoEn = {}, noteEn) {
  const f = flawOf(`${v.title} ${v.note ?? ''}`), name = productName(v, lang, howtoKo, howtoEn); // a hand-written note can name the flaw type
  const n = 1 + (v.sources?.length ?? 0), more = (v.sources?.length ?? 0) >= MAX_SOURCES;
  const key = v.products?.[0] && howtoKo[v.products[0]] ? v.products[0] : '_default';
  const out = [];
  if (lang === 'en') {
    const c = cveTextEn(v), what = `${/^[aeiou]/i.test(f.en) ? 'an' : 'a'} ${f.en}${name ? ` in ${name}` : ''}${c ? ` (${c})` : ''}`;
    out.push(`On ${dayEn(v.date)}, ${n > 1 ? `${n}${more ? ' or more' : ''} Korean news outlets` : 'the Korean press'} reported ${what}.`);
    out.push({ '악용 중': 'Reports say it is being exploited in real attacks, so update right away.', '패치 나옴': 'According to the reports, an update that fixes it is out.', '조치 권고': 'The reports advised checking and acting on it; see the vendor notice for a fixed update.' }[v.status] ?? '');
    if (v.severity) out.push(v.severity.startsWith('CVSS') ? `Its severity is ${v.severity} (as reported).` : `The reports rated it ${SEV_EN[v.severity] ?? v.severity}.`);
    if (v.fixed?.length) out.push(`Fixed version: ${v.fixed.join(', ')} (as reported or announced).`);
    if (v.notice) out.push("KISA's KrCERT also issued a security notice.");
    const who = howtoEn[key]?.who ?? howtoKo[key]?.who;
    if (who) out.push(`Who is affected: ${who.charAt(0).toLowerCase() + who.slice(1)}. The steps below show how to check your version and update.`);
    if (noteEn) out.push(noteEn);
  } else {
    const c = cveText(v), what = `${name ? `${name}의 ` : ''}${f.ko}${c ? `(${c})` : ''}`;
    out.push(`${dayKo(v.date)}, ${n > 1 ? `국내 언론 ${n}곳${more ? ' 이상' : ''}이` : '국내 언론이'} ${what}${jong(what) ? '을' : '를'} 보도했습니다.`);
    out.push({ '악용 중': '실제 공격에 쓰이고 있다는 보도가 있어 바로 업데이트하는 것이 좋습니다.', '패치 나옴': '보도에 따르면 이 문제를 고친 업데이트가 나왔습니다.', '조치 권고': '보도에서는 점검과 조치를 권고했습니다. 고친 업데이트가 나왔는지 제조사 공지를 확인하세요.' }[v.status] ?? '');
    if (v.severity) out.push(v.severity.startsWith('CVSS') ? `위험도는 ${v.severity}점입니다(보도 기준).` : `보도에서는 '${v.severity}' 수준으로 다뤘습니다.`);
    if (v.fixed?.length) out.push(`고쳐진 버전은 ${v.fixed.join(', ')}입니다(보도·공지 기준).`);
    if (v.notice) out.push('KISA 보호나라도 보안공지를 냈습니다.');
    const who = howtoKo[key]?.who;
    if (who) out.push(`${who}${jong(who) ? '이라면' : '라면'} 아래 해결 방법대로 버전을 확인하고 업데이트하세요.`);
    if (v.note) out.push(v.note);
  }
  return out.filter(Boolean);
}

/** A meta description: the summary's sentences up to about max characters. */
export function describe(sentences, max = 150) {
  let s = '';
  for (const x of sentences) { if (s && (s + ' ' + x).length > max) break; s = s ? `${s} ${x}` : x; }
  return s.length > max + 40 ? `${s.slice(0, max).trim()}…` : s;
}

/**
 * The row's address under /news/vulnerabilities/: date, product, flaw ("2026-11-12-chrome-zero-day"); a CVE when no
 * product name in English is known; -2, -3 … when taken. Always starts with the date, so it never meets "page/N".
 */
export function slugFor(v, taken = new Set()) {
  const ascii = (s) => s.toLowerCase().replace(/\+/g, 'plus').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const name = v.products?.[0] ?? ascii(v.nameEn ?? nameEn(v.name ?? nameFromTitle(v.title))).split('-').filter((w) => !['for', 'and', 'the', 'of'].includes(w)).slice(0, 4).join('-');
  const parts = [v.date, name || (v.cves?.[0] ?? '').toLowerCase(), flawOf(v.title).slug].filter(Boolean);
  const base = ascii(parts.join('-')).replace(/^(\d{4})-(\d{2})-(\d{2})/, '$1-$2-$3');
  let slug = base;
  for (let i = 2; taken.has(slug); i++) slug = `${base}-${i}`;
  taken.add(slug);
  return slug;
}

// glossary terms (src/data/glossary.ts ids) that explain words on the page
const TERMS = [
  [() => true, 'vulnerability'], [(v) => v.cves?.length, 'cve'], [(v) => ZERO_DAY.test(v.title), 'zero-day'], [() => true, 'patch-management'],
  [(v) => /권한/.test(v.title), 'privilege'], [(v) => /HTTP\/2/i.test(v.title), 'http2'], [(v) => v.products?.[0] === 'openssh' || /SSH/.test(v.title), 'ssh'],
  [(v) => v.products?.[0] === 'openssl', 'tls'], [(v) => v.products?.[0] === 'router', 'router'], [(v) => /랜섬웨어/.test(v.title), 'ransomware'],
  [(v) => /VPN/.test(v.title), 'vpn'], [(v) => /공급망/.test(v.title), 'supply-chain'], [(v) => /방화벽/.test(v.title), 'firewall'],
];
/** Glossary ids for the row, at most five. */
export const termsFor = (v) => TERMS.filter(([ok]) => ok(v)).map(([, id]) => id).slice(0, 5);

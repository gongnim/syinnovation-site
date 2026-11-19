// News sources shared by the collectors (collect-security-news.mjs, collect-vuln-news.mjs): Google News search feeds
// (no key), the Naver news search API (NAVER_CLIENT_ID / NAVER_CLIENT_SECRET, optional) and KISA 보호나라 보안공지.
import { parseRss, isoDate } from './security-news-lib.mjs';

const env = process.env;
const UA = { 'User-Agent': 'Mozilla/5.0 (security-news collector)' };

/** Google News search: range is 'when:3d' for the daily runs, or 'after:2026-01-01 before:2026-02-01' for a backfill. */
export async function googleNews({ q, lang, region }, range = 'when:3d') {
  const loc = lang === 'ko' ? 'hl=ko&gl=KR&ceid=KR:ko' : 'hl=en-US&gl=US&ceid=US:en';
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(`(${q}) ${range}`)}&${loc}`;
  let res;
  for (let tries = 0; tries < 4; tries++) { // Google answers 429 when asked too often: wait and ask again
    res = await fetch(url, { headers: UA });
    if (res.status !== 429) break;
    await new Promise((r) => setTimeout(r, 5000 * (tries + 1)));
  }
  if (!res.ok) throw new Error(`Google News ${region ?? ''}: HTTP ${res.status}`);
  return parseRss(await res.text()).map((i) => ({ ...i, region }));
}

export const strip = (s) => s.replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

/** Naver news search, newest first; summary is Naver's short description (used for parsing only, never stored). */
export async function naverNews({ q, region }) {
  if (!env.NAVER_CLIENT_ID || !env.NAVER_CLIENT_SECRET) return [];
  const query = q.split(' OR ').slice(0, 3).join(' '); // the API takes plain words
  const res = await fetch(`https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(query)}&display=100&sort=date`, {
    headers: { 'X-Naver-Client-Id': env.NAVER_CLIENT_ID, 'X-Naver-Client-Secret': env.NAVER_CLIENT_SECRET },
  });
  if (!res.ok) throw new Error(`Naver: HTTP ${res.status}`);
  const { items = [] } = await res.json();
  return items.map((i) => {
    const url = i.originallink || i.link;
    return { title: strip(i.title), summary: strip(i.description ?? ''), url, source: new URL(url).hostname.replace(/^www\./, ''), date: isoDate(i.pubDate), region };
  });
}

const KISA = 'https://www.boho.or.kr';
const clean = (s) => s.replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
/**
 * KISA 보호나라 보안공지 ("NGINX 제품 보안 업데이트 권고"): { title, url, date }. The feed holds the latest ten; pages > 0
 * also read that many pages of the board's list (for a backfill; pinned notices repeat on every page).
 */
export async function kisaNotices(pages = 0) {
  const out = [];
  const res = await fetch(`${KISA}/kr/rss.do?bbsId=B0000133`, { headers: UA });
  if (!res.ok) throw new Error(`KISA: HTTP ${res.status}`);
  for (const i of parseRss(await res.text())) out.push({ title: clean(i.title), url: clean(i.url), date: clean(i.date ?? '').slice(0, 10) });
  for (let p = 1; p <= pages; p++) {
    const html = await (await fetch(`${KISA}/kr/bbs/list.do?menuNo=205020&bbsId=B0000133&pageIndex=${p}`, { headers: UA })).text();
    for (const [, link, title, date] of html.matchAll(/<a href="(\/kr\/bbs\/view\.do[^"]*nttId=\d+)">\s*([^<]+?)\s*<\/a>[\s\S]*?<td class="date">(\d{4}-\d{2}-\d{2})<\/td>/g)) {
      out.push({ title: clean(title), url: KISA + clean(link).replace(/pageIndex=\d+/, 'pageIndex=1'), date });
    }
  }
  const byId = new Map(out.map((n) => [n.url.match(/nttId=(\d+)/)?.[1] ?? n.url, n]));
  return [...byId.values()];
}

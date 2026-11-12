// Collect major security incident news for 소식 > 언론보도 and add it to src/data/security-news.json.
// Runs on a schedule in GitHub Actions (.github/workflows/security-news.yml) or by hand:
//   node scripts/collect-security-news.mjs          add new stories to the data file
//   node scripts/collect-security-news.mjs --dry    only print what would be added
// Sources: Google News search feeds (no key needed) and, when NAVER_CLIENT_ID / NAVER_CLIENT_SECRET are set, the
// Naver news search API. Word lists live in scripts/security-news.config.json. A row in the data file with
// "hidden": true stays stored but is not shown on the site, and is never added again.
import fs from 'node:fs';
import { parseRss, isoDate, merge } from './security-news-lib.mjs';

const DATA = new URL('../src/data/security-news.json', import.meta.url);
const cfg = JSON.parse(fs.readFileSync(new URL('./security-news.config.json', import.meta.url), 'utf8'));
const dry = process.argv.includes('--dry');

async function googleNews({ q, lang, region }) {
  const loc = lang === 'ko' ? 'hl=ko&gl=KR&ceid=KR:ko' : 'hl=en-US&gl=US&ceid=US:en';
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(`(${q}) when:3d`)}&${loc}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (security-news collector)' } });
  if (!res.ok) throw new Error(`Google News ${region}: HTTP ${res.status}`);
  return parseRss(await res.text()).map((i) => ({ ...i, region }));
}

async function naverNews({ q, region }) {
  const id = process.env.NAVER_CLIENT_ID, secret = process.env.NAVER_CLIENT_SECRET;
  if (!id || !secret) return [];
  const query = q.split(' OR ').slice(0, 3).join(' '); // the API takes plain words
  const res = await fetch(`https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(query)}&display=100&sort=date`, {
    headers: { 'X-Naver-Client-Id': id, 'X-Naver-Client-Secret': secret },
  });
  if (!res.ok) throw new Error(`Naver: HTTP ${res.status}`);
  const { items = [] } = await res.json();
  const strip = (s) => s.replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  return items.map((i) => {
    const url = i.originallink || i.link;
    return { title: strip(i.title), url, source: new URL(url).hostname.replace(/^www\./, ''), date: isoDate(i.pubDate), region };
  });
}

const found = [];
for (const q of cfg.queries) {
  for (const get of [googleNews, ...(q.lang === 'ko' ? [naverNews] : [])]) {
    try { found.push(...(await get(q))); } catch (e) { console.warn(String(e.message ?? e)); }
  }
}

const stored = JSON.parse(fs.readFileSync(DATA, 'utf8'));
const { rows, added } = merge(stored, found, cfg);
console.log(`fetched ${found.length} headlines; ${added} new ${added === 1 ? 'story' : 'stories'}`);
for (const r of rows.slice(0, added)) console.log(`  + ${r.date} [${r.region} · ${r.type}] ${r.title} (${r.source})`);
if (!dry && (added || rows.length !== stored.length)) fs.writeFileSync(DATA, JSON.stringify(rows, null, 2) + '\n');

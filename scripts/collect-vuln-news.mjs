// Collect vulnerability news for 소식 > 보안뉴스 and add it to src/data/vuln-news.json; each row gets its own page at
// /news/vulnerabilities/<slug> (the slug, and a product name when the headline names none we have steps for, are stored).
// Runs with the security news job (.github/workflows/security-news.yml) or by hand:
//   node scripts/collect-vuln-news.mjs                      add new stories from the last three days
//   node scripts/collect-vuln-news.mjs --dry                only print what would be added
//   node scripts/collect-vuln-news.mjs --backfill 2026-01-01   search week by week from that date to today (no limit)
// Sources: Google News search feeds (no key), the Naver news search API (NAVER_CLIENT_ID / NAVER_CLIENT_SECRET) and
// KISA 보호나라 보안공지 (no key; it backs single-outlet stories and gives the official notice link). Stories about the
// same flaw from many outlets become one row with several sources. Word lists live in scripts/vuln-news.config.json,
// the steps shown under 할 일 in src/data/vuln-howto.json. A row with "hidden": true is kept off the site and its flaw
// is never added again; a row without "auto" is hand-made and the collector only adds outlets to it.
import fs from 'node:fs';
import { hangul } from './security-news-lib.mjs';
import { googleNews, naverNews, kisaNotices } from './news-sources.mjs';
import { isVulnStory, mergeVulns, windows, addPageFields } from './vuln-news-lib.mjs';

const DATA = new URL('../src/data/vuln-news.json', import.meta.url);
const cfg = JSON.parse(fs.readFileSync(new URL('./vuln-news.config.json', import.meta.url), 'utf8'));
const howto = JSON.parse(fs.readFileSync(new URL('../src/data/vuln-howto.json', import.meta.url), 'utf8'));
const args = process.argv.slice(2);
const dry = args.includes('--dry');
const from = args.includes('--backfill') ? args[args.indexOf('--backfill') + 1] ?? '2026-01-01' : '';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const found = [];
const get = async (fn, ...a) => { try { found.push(...(await fn(...a))); } catch (e) { console.warn(String(e.message ?? e)); } };
for (const q of cfg.queries) {
  if (from) {
    for (const [after, before] of windows(from)) {
      const n = found.length;
      await get(googleNews, q, `after:${after} before:${before}`);
      await wait(400);
      if (found.length - n < 100) continue; // the feed stops at 100: ask that week again day by day
      found.length = n;
      for (const [a, b] of windows(after, before, 1).slice(0, 7)) { await get(googleNews, q, `after:${a} before:${b}`); await wait(400); }
    }
  } else {
    await get(googleNews, q);
    await get(naverNews, q);
  }
}
let notices = [];
try { notices = await kisaNotices(from ? 45 : 0); } catch (e) { console.warn(String(e.message ?? e)); }

for (const it of found) {
  it.title = hangul(it.title); // the site uses no hanja
  if (/^https?:/.test(it.source ?? '')) it.source = new URL(it.source).hostname.replace(/^www\./, ''); // some feeds name the outlet by its address
}
const vulns = found.filter((i) => i.date && (!from || i.date >= from) && isVulnStory(i.title, cfg, i.source));
const stored = fs.existsSync(DATA) ? JSON.parse(fs.readFileSync(DATA, 'utf8')) : [];
const { rows, added } = mergeVulns(stored, vulns, from ? { ...cfg, maxNewPerRun: 0 } : cfg, howto, notices);
addPageFields(rows); // every row gets its own page: /news/vulnerabilities/<slug>
console.log(`fetched ${found.length} headlines (${vulns.length} about a vulnerability) and ${notices.length} KISA notices; ${added.length} new stories`);
for (const r of added) console.log(`  + ${r.date} [${r.products[0] ?? r.name ?? '-'}${r.status ? ` · ${r.status}` : ''}] ${r.title} (${r.source}${r.sources.length ? ` +${r.sources.length}` : ''}) → /news/vulnerabilities/${r.slug}`);
if (!dry && JSON.stringify(rows) !== JSON.stringify(stored)) fs.writeFileSync(DATA, JSON.stringify(rows, null, 2) + '\n');

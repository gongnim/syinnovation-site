// Collect security incident news for 소식 > 언론보도 and add it to src/data/security-news.json.
// Runs once a day in GitHub Actions (.github/workflows/security-news.yml) or by hand:
//   node scripts/collect-security-news.mjs          add new stories (and make their pictures)
//   node scripts/collect-security-news.mjs --dry    only print what would be added
// Sources: Google News search feeds (no key), the Naver news search API (NAVER_CLIENT_ID / NAVER_CLIENT_SECRET) and
// YouTube news videos (YOUTUBE_API_KEY). Every card needs a picture: videos use their own thumbnail, and each new
// article gets a free photo from Pexels (PEXELS_API_KEY; free for commercial use, credited on the page) chosen by the
// field named in its headline or else the kind of incident, saved under public/images/security/auto/. Setting
// "pictures": "openai" in the config makes the picture with the image API instead (OPENAI_API_KEY, paid). Without
// either, the site falls back to a picture of the same kind of incident. News photos are never copied.
// Word lists live in scripts/security-news.config.json; a row with "hidden": true is kept off the site.
import fs from 'node:fs';
import crypto from 'node:crypto';
import { parseRss, isoDate, merge, pickVideos, photoQuery, hangul } from './security-news-lib.mjs';

const DATA = new URL('../src/data/security-news.json', import.meta.url);
const PICS = new URL('../public/images/security/auto/', import.meta.url);
const cfg = JSON.parse(fs.readFileSync(new URL('./security-news.config.json', import.meta.url), 'utf8'));
const dry = process.argv.includes('--dry');
const env = process.env;

async function googleNews({ q, lang, region }) {
  const loc = lang === 'ko' ? 'hl=ko&gl=KR&ceid=KR:ko' : 'hl=en-US&gl=US&ceid=US:en';
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(`(${q}) when:3d`)}&${loc}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (security-news collector)' } });
  if (!res.ok) throw new Error(`Google News ${region}: HTTP ${res.status}`);
  return parseRss(await res.text()).map((i) => ({ ...i, region }));
}

const strip = (s) => s.replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

async function naverNews({ q, region }) {
  if (!env.NAVER_CLIENT_ID || !env.NAVER_CLIENT_SECRET) return [];
  const query = q.split(' OR ').slice(0, 3).join(' '); // the API takes plain words
  const res = await fetch(`https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(query)}&display=100&sort=date`, {
    headers: { 'X-Naver-Client-Id': env.NAVER_CLIENT_ID, 'X-Naver-Client-Secret': env.NAVER_CLIENT_SECRET },
  });
  if (!res.ok) throw new Error(`Naver: HTTP ${res.status}`);
  const { items = [] } = await res.json();
  return items.map((i) => {
    const url = i.originallink || i.link;
    return { title: strip(i.title), url, source: new URL(url).hostname.replace(/^www\./, ''), date: isoDate(i.pubDate), region };
  });
}

async function youtubeNews({ q, lang, region }) {
  if (!env.YOUTUBE_API_KEY) return [];
  const after = new Date(Date.now() - 3 * 864e5).toISOString();
  const params = new URLSearchParams({
    part: 'snippet', type: 'video', videoEmbeddable: 'true', order: 'date', maxResults: '25', q: q.replaceAll(' OR ', '|'),
    publishedAfter: after, relevanceLanguage: lang, regionCode: lang === 'ko' ? 'KR' : 'US', key: env.YOUTUBE_API_KEY,
  });
  const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);
  if (!res.ok) throw new Error(`YouTube ${region}: HTTP ${res.status}`);
  const { items = [] } = await res.json();
  return items.map((i) => ({ id: i.id.videoId, title: strip(i.snippet.title), channel: strip(i.snippet.channelTitle), date: isoDate(i.snippet.publishedAt), region }));
}

const picName = (row, ext) => `${row.date}-${crypto.createHash('sha1').update(row.url).digest('hex').slice(0, 8)}.${ext}`;

// a free Pexels photo for one article: landscape, not used on another card yet; returns { image, credit }
async function pexelsPhoto(row, used) {
  if (!env.PEXELS_API_KEY) return {};
  const query = photoQuery(row.title, row.type);
  const res = await fetch(`https://api.pexels.com/v1/search?${new URLSearchParams({ query, orientation: 'landscape', per_page: '30' })}`, {
    headers: { Authorization: env.PEXELS_API_KEY },
  });
  if (!res.ok) { console.warn(`Pexels "${query}": HTTP ${res.status}`); return {}; }
  const { photos = [] } = await res.json();
  const photo = photos.find((p) => !used.has(p.id));
  if (!photo) return {};
  used.add(photo.id);
  const img = await fetch(photo.src.large);
  if (!img.ok) return {};
  const name = picName(row, 'jpg');
  fs.mkdirSync(PICS, { recursive: true });
  fs.writeFileSync(new URL(name, PICS), Buffer.from(await img.arrayBuffer()));
  return { image: `/images/security/auto/${name}`, credit: { name: photo.photographer.replace(/\s+/g, ' ').trim(), url: photo.url, id: photo.id } };
}

// a picture made for one article with the image API (only when the config asks for it: it is paid)
async function makePicture(row) {
  if (!env.OPENAI_API_KEY) return undefined;
  const prompt = `A realistic editorial documentary photograph illustrating this cybersecurity news story: "${row.title}" (${row.type}). `
    + 'Show a calm, believable scene that fits the field of the organisation and the kind of incident. Natural light, true-to-life colours, '
    + 'slight film grain, shallow depth of field, wide composition with quiet space in the lower half. No logos, no brand names, '
    + 'no readable text, numbers or signs, no identifiable faces (people only from behind, blurred or as hands).';
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST', headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'gpt-image-2', prompt, size: '1536x1024', quality: 'medium', output_format: 'webp', output_compression: 80 }),
  });
  const j = await res.json();
  if (j.error || !j.data?.[0]?.b64_json) { console.warn(`picture failed for "${row.title}": ${j.error?.message ?? 'no image'}`); return undefined; }
  const name = picName(row, 'webp');
  fs.mkdirSync(PICS, { recursive: true });
  fs.writeFileSync(new URL(name, PICS), Buffer.from(j.data[0].b64_json, 'base64'));
  return `/images/security/auto/${name}`;
}

const found = [], videos = [];
for (const q of cfg.queries) {
  for (const get of [googleNews, ...(q.lang === 'ko' ? [naverNews] : [])]) {
    try { found.push(...(await get(q))); } catch (e) { console.warn(String(e.message ?? e)); }
  }
  // videos: Korean media only, so they are searched in Korean (their reports on incidents abroad come up too)
  if (q.lang === 'ko') try { videos.push(...(await youtubeNews(q))); } catch (e) { console.warn(String(e.message ?? e)); }
}

for (const it of [...found, ...videos]) it.title = hangul(it.title); // the site uses no hanja
const stored = JSON.parse(fs.readFileSync(DATA, 'utf8'));
const { rows, added } = merge(stored, found, cfg);
const newVideos = pickVideos(rows, videos, cfg);
const fresh = [...newVideos, ...rows.slice(0, added)];
console.log(`fetched ${found.length} headlines and ${videos.length} videos; ${added} new articles, ${newVideos.length} new videos`);
for (const r of fresh) console.log(`  + ${r.date} [${r.region} · ${r.youtube ? '영상' : r.type}] ${r.title} (${r.source})`);
if (dry) process.exit(0);

const used = new Set(rows.map((r) => r.credit?.id).filter(Boolean)); // Pexels photos already on a card
for (const r of rows.slice(0, added)) {
  if (cfg.pictures === 'openai') r.image = await makePicture(r);
  else Object.assign(r, await pexelsPhoto(r, used));
}
const all = [...newVideos, ...rows];
if (fresh.length || all.length !== stored.length) fs.writeFileSync(DATA, JSON.stringify(all, null, 2) + '\n');

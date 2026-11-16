// Korean is the site's main language at /; the English twin of every page lives under /en/ (user, 2026-11-16).
// Pages that exist in both languages sit in src/pages/[...locale]/ and are built twice (locale undefined = Korean,
// 'en' = English); they read the language from the URL. Words follow docs/i18n-terms.md.
export type Lang = 'ko' | 'en';

export const langOf = (url: URL): Lang => (url.pathname === '/en' || url.pathname.startsWith('/en/') ? 'en' : 'ko');

/** a site path in the given language: '/trust-gateway' → '/en/trust-gateway' (links outside the site stay as they are) */
export const href = (path: string, lang: Lang): string => {
  if (lang === 'ko' || !path.startsWith('/') || path.startsWith('//') || path === '/en' || path.startsWith('/en/')) return path;
  return path === '/' ? '/en' : `/en${path}`;
};

/** the same page in the other language (no trailing slash: the site's one address per page, see astro.config) */
export const twin = (url: URL): string => {
  const p = url.pathname.length > 1 ? url.pathname.replace(/\/$/, '') : url.pathname;
  if (langOf(url) === 'en') return p.replace(/^\/en(?=\/|$)/, '') || '/';
  return p === '/' ? '/en' : `/en${p}`;
};

/** getStaticPaths for a page in src/pages/[...locale]/ that has no other parameters */
export const bothLangs = () => [{ params: { locale: undefined } }, { params: { locale: 'en' } }];

/** dates: "2026.11.16" in Korean, "Nov 16, 2026" in English; a month-only date ("2026-10") gives "2026.10" / "Oct 2026" */
export const dateText = (iso: string, lang: Lang): string => {
  const [y, m, d] = iso.split('-').map(Number);
  if (lang === 'ko') return [y, m && String(m).padStart(2, '0'), d && String(d).padStart(2, '0')].filter(Boolean).join('.');
  const month = m ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m - 1] : '';
  return d ? `${month} ${d}, ${y}` : m ? `${month} ${y}` : String(y);
};

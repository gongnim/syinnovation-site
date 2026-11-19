// schema.org data for article pages, added to the graph src/layouts/Base.astro writes (its ld prop). Every builder
// goes through clean(), so no field is ever undefined, null, empty or an empty list. URLs passed in are absolute.

const filled = (v) => v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0)
  && !(typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0);
/** The value without empty fields, at every depth. */
export const clean = (x) => (Array.isArray(x)
  ? x.map(clean).filter(filled)
  : x && typeof x === 'object' ? Object.fromEntries(Object.entries(x).map(([k, v]) => [k, clean(v)]).filter(([, v]) => filled(v))) : x);

/** Our company as author and publisher (the full Organization node, @id /#org, is on the home page). */
export const org = (site, en) => ({
  '@type': 'Organization', '@id': new URL('/#org', site).href, name: en ? 'SYINNOVATION' : '신영이노베이션',
  logo: { '@type': 'ImageObject', url: new URL('/images/og/logo-512.png', site).href },
});

/** Where the page sits: [{ name, url }], the page itself last. */
export const breadcrumb = (items) => clean({
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
});

/** A news article we wrote: date as YYYY-MM-DD (or YYYY-MM), the reports it is based on as URLs. */
export const newsArticle = ({ url, headline, description, date, lang, image, basedOn = [], publisher }) => clean({
  '@type': 'NewsArticle', '@id': `${url}#article`, mainEntityOfPage: url, url,
  headline: headline.length > 110 ? `${headline.slice(0, 109)}…` : headline, description,
  datePublished: date, dateModified: date, inLanguage: lang, image: image ? [image] : [],
  author: publisher, publisher, isBasedOn: basedOn,
});

/** Steps to follow: [{ name, text }]. */
export const howTo = ({ url, name, description, lang, steps }) => clean({
  '@type': 'HowTo', '@id': `${url}#howto`, name, description, inLanguage: lang,
  step: steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.name, text: s.text })),
});

/** A YouTube Short on the page; uploadDate only when we know it. */
export const video = ({ id, name, description, uploadDate }) => clean({
  '@type': 'VideoObject', name, description, uploadDate,
  thumbnailUrl: [`https://i.ytimg.com/vi/${id}/hqdefault.jpg`],
  embedUrl: `https://www.youtube-nocookie.com/embed/${id}`, contentUrl: `https://www.youtube.com/shorts/${id}`,
});

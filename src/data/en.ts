// English text for the data files: src/data/i18n/*.en.json, translated from the Korean data with docs/i18n-terms.md.
// A file that is not there yet gives an empty map, and every caller falls back to the Korean text. News that the bot
// collects after the translation has no English yet: it shows in Korean, marked as such, until it is translated.
type Map = Record<string, any>;
const files = import.meta.glob<Map>('./i18n/*.en.json', { eager: true, import: 'default' });
const get = (name: string): Map => files[`./i18n/${name}.en.json`] ?? {};

/** keyed by the item's url: { title, summary?, org? }; _labels: type, region and outlet names */
export const securityNewsEn = get('security-news');
/** keyed by slug: the same fields as security-stories.json */
export const storiesEn = get('security-stories');
/** keyed by slug: { title, source?, body? }; _labels: the news kinds */
export const ownNewsEn = get('news');
/** keyed by incident type (해킹, 개인정보 유출, ...) */
export const lessonsEn = get('security-lessons');
/** { cats, terms: { id: { t, s, b, tg?, aka? } } } */
export const glossaryEn = get('glossary');

/** an English label for a Korean type, region, outlet or kind; the Korean when there is none */
export const labelEn = (ko: string): string => securityNewsEn._labels?.[ko] ?? ownNewsEn._labels?.[ko] ?? ko;

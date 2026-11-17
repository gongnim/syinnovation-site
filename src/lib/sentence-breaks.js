// House style for body copy, applied to every page by src/middleware.ts.
// 1. A new sentence starts on a new line: inside each <p>, text is split after a Korean sentence end ("다." "요?" "지." ...).
//    List items (<li>) and description details (<dd>) get the same, unless they hold blocks, icons or form parts.
//    Plain-text paragraphs get one <span class="sb"> block per sentence (balanced separately); paragraphs with inline
//    tags get <br class="sb" /> instead. Class "sb" lets mobile CSS that hides hand-placed <br> keep these.
//    Inside a plain-text paragraph, each comma clause is also kept on one line (<span class="cl">, inline-block),
//    so a sentence that has to wrap breaks after its comma, not in the middle of a phrase.
// 2. Names never split across lines: the spaces inside them become non-breaking spaces, and a line never ends at
//    a middle dot ("PC·태블릿" stays together).
// 3. Short words never dangle: a one-syllable word ("새", "한", "할", "수") stays with the word after it ("새 시스템",
//    "한 번"), and a one-syllable bound noun ("수", "것", "곳", "때"), alone or with one particle, stays with the word
//    before it ("할 수", "맡길 곳이"). Non-breaking spaces again, text only.
// Only text between tags is touched, never attribute values, scripts or styles.
// a sentence ends after Hangul, or after a Korean note in brackets: "유출됐습니다(회사 발표 기준). 다음"
const END = '(?:[가-힣]|\\([^()]*[가-힣][^()]*\\))[.?!]';
const SENTENCE_END = new RegExp(`(${END})[ \\t]+(?=\\S)`, 'g');
const SENTENCE_GAP = new RegExp(`(?<=${END})[ \\t]+(?=\\S)`);
// a comma after a word, followed by a space: "결제까지, 사람들이" (but not "1,000")
const CLAUSE = /(?<=[가-힣A-Za-z0-9)],)[ \t]+(?=\S)/;
const NAMES = ['Trust Gateway', 'Trust Auth', 'Never Trust', 'Always Verify', 'Face ID', 'AI 프로세스 혁신', 'PI by AI', '사전 컨설팅'];
const NAME_RE = new RegExp(NAMES.map((n) => n.replaceAll(' ', '[ \\t]+')).join('|'), 'g');
// a middle dot between two words ("PC·태블릿", "인증·인가"); word joiners (U+2060) on both sides forbid a break there
const MIDDOT = /(?<=[가-힣A-Za-z0-9])·(?=[가-힣A-Za-z0-9])/g;
const NBSP = '\u00A0';
// a one-syllable Hangul word (at the start of a text run, after a space or an opening mark), then a space
const SHORT_WORD = /(?<=^|[\s\u00A0(「“"'])([가-힣])[ \t]+(?=\S)/g;
// a space before a one-syllable bound noun, with at most one particle, that ends there
const BOUND_NOUN = /[ \t]+(?=(?:수|것|곳|때|줄|뿐|데)(?:이|가|을|를|은|는|도|에|만|과|와|로)?(?:[\s\u00A0.,!?)」”]|$))/g;
const WJ = String.fromCharCode(0x2060);
const JOINED_DOT = `${WJ}·${WJ}`;

/** @param {string} text  @param {(t: string) => string} fn */
const eachText = (text, fn) => text.replace(/(^|>)([^<]+)/g, (_m, open, t) => open + fn(t));

/** @param {string} s */
const clauses = (s) => {
  const pieces = s.split(CLAUSE);
  if (pieces.length < 2) return s;
  // short list items ("Web, iOS, Android,") ride along with what follows; only a real clause ends a group
  const groups = [];
  let buf = '';
  pieces.forEach((piece, i) => {
    buf = buf ? buf + ' ' + piece : piece;
    // a comma inside 「quotes」 is part of the quote, never a clause end
    const inQuote = (buf.match(/[「“]/g) ?? []).length > (buf.match(/[」”]/g) ?? []).length;
    if (i === pieces.length - 1 || (!inQuote && piece.length >= 9)) { groups.push(buf); buf = ''; }
  });
  return groups.length > 1 ? groups.map((g) => `<span class="cl">${g}</span>`).join(' ') : s;
};

/** @param {string} html */
export function breakSentences(html) {
  const one = (tag) => (_m, attrs, body) => {
    if (!body.includes('<')) {
      // plain text: each sentence becomes its own block, so the browser balances every sentence on its own
      const parts = body.split(SENTENCE_GAP);
      if (parts.length > 1) return `<${tag}${attrs}>${parts.map((s) => `<span class="sb">${clauses(s)}</span>`).join('')}</${tag}>`;
      return `<${tag}${attrs}>${clauses(body)}</${tag}>`;
    }
    // items holding blocks, icons or form parts keep their layout; their inner <p>s were handled in the first pass
    if (tag !== 'p' && BLOCKISH.test(body)) return `<${tag}${attrs}>${body}</${tag}>`;
    // inline tags: a line break between sentences, text segments only
    return `<${tag}${attrs}>${eachText(body, (t) => t.replace(SENTENCE_END, '$1<br class="sb" />'))}</${tag}>`;
  };
  return html
    .replace(/<p\b([^>]*)>([\s\S]*?)<\/p>/g, one('p'))
    .replace(/<li\b([^>]*)>([\s\S]*?)<\/li>/g, one('li'))
    .replace(/<dd\b([^>]*)>([\s\S]*?)<\/dd>/g, one('dd'));
}
// tags that make a list item more than a line of text
const BLOCKISH = /<(p|div|ul|ol|li|dl|dt|dd|h[1-6]|svg|img|figure|table|section|article|button|input|select|textarea|span class="(?:sb|cl)")\b/;

/** @param {string} html */
export function keepNamesTogether(html) {
  const start = html.search(/<body\b/i);
  if (start < 0) return html;
  const head = html.slice(0, start);
  // leave <script> and <style> blocks alone; transform the text between tags everywhere else in <body>
  const body = html.slice(start).split(/(<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>)/i)
    .map((part, i) => (i % 2 ? part : eachText(part, (t) => t.replace(NAME_RE, (m) => m.replace(/[ \t]+/g, ' ')).replace(MIDDOT, JOINED_DOT).replace(SHORT_WORD, `$1${NBSP}`).replace(BOUND_NOUN, NBSP))))
    .join('');
  return head + body;
}

// House style for body copy, applied to every page by src/middleware.ts.
// 1. A new sentence starts on a new line: inside each <p>, text is split after a Korean sentence end ("다." "요?" "지." ...).
//    Plain-text paragraphs get one <span class="sb"> block per sentence (balanced separately); paragraphs with inline
//    tags get <br class="sb" /> instead. Class "sb" lets mobile CSS that hides hand-placed <br> keep these.
//    Inside a plain-text paragraph, each comma clause is also kept on one line (<span class="cl">, inline-block),
//    so a sentence that has to wrap breaks after its comma, not in the middle of a phrase.
// 2. Names never split across lines: the spaces inside them become non-breaking spaces, and a line never ends at
//    a middle dot ("PC·태블릿" stays together).
// Only text between tags is touched, never attribute values, scripts or styles.
const SENTENCE_END = /([가-힣][.?!])[ \t]+(?=\S)/g;
// a comma after a word, followed by a space: "결제까지, 사람들이" (but not "1,000")
const CLAUSE = /(?<=[가-힣A-Za-z0-9)],)[ \t]+(?=\S)/;
const NAMES = ['Trust Gateway', 'Trust Auth', 'Never Trust', 'Always Verify', 'Face ID'];
const NAME_RE = new RegExp(NAMES.map((n) => n.replace(' ', '[ \\t]+')).join('|'), 'g');
// a middle dot between two words ("PC·태블릿", "인증·인가"); word joiners (U+2060) on both sides forbid a break there
const MIDDOT = /(?<=[가-힣A-Za-z0-9])·(?=[가-힣A-Za-z0-9])/g;
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
  return html.replace(/<p\b([^>]*)>([\s\S]*?)<\/p>/g, (_m, attrs, body) => {
    if (!body.includes('<')) {
      // plain text: each sentence becomes its own block, so the browser balances every sentence on its own
      const parts = body.split(/(?<=[가-힣][.?!])[ \t]+(?=\S)/);
      if (parts.length > 1) return `<p${attrs}>${parts.map((s) => `<span class="sb">${clauses(s)}</span>`).join('')}</p>`;
      return `<p${attrs}>${clauses(body)}</p>`;
    }
    // paragraphs with inline tags: a line break between sentences, text segments only
    return `<p${attrs}>${eachText(body, (t) => t.replace(SENTENCE_END, '$1<br class="sb" />'))}</p>`;
  });
}

/** @param {string} html */
export function keepNamesTogether(html) {
  const start = html.search(/<body\b/i);
  if (start < 0) return html;
  const head = html.slice(0, start);
  // leave <script> and <style> blocks alone; transform the text between tags everywhere else in <body>
  const body = html.slice(start).split(/(<script\b[\s\S]*?<\/script>|<style\b[\s\S]*?<\/style>)/i)
    .map((part, i) => (i % 2 ? part : eachText(part, (t) => t.replace(NAME_RE, (m) => m.replace(/[ \t]+/g, ' ')).replace(MIDDOT, JOINED_DOT))))
    .join('');
  return head + body;
}

// House style for body copy, applied to every page by src/middleware.ts.
// 1. A new sentence starts on a new line: inside each <p>, text is split after a Korean sentence end ("다." "요?" "지." ...).
//    Plain-text paragraphs get one <span class="sb"> block per sentence (balanced separately); paragraphs with inline
//    tags get <br class="sb" /> instead. Class "sb" lets mobile CSS that hides hand-placed <br> keep these.
// 2. Names never split across lines: the spaces inside them become non-breaking spaces.
// Only text between tags is touched, never attribute values, scripts or styles.
const SENTENCE_END = /([가-힣][.?!])[ \t]+(?=\S)/g;
const NAMES = ['Trust Gateway', 'Trust Auth', 'Never Trust', 'Always Verify', 'Face ID'];
const NAME_RE = new RegExp(NAMES.map((n) => n.replace(' ', '[ \\t]+')).join('|'), 'g');

/** @param {string} text  @param {(t: string) => string} fn */
const eachText = (text, fn) => text.replace(/(^|>)([^<]+)/g, (_m, open, t) => open + fn(t));

/** @param {string} html */
export function breakSentences(html) {
  return html.replace(/<p\b([^>]*)>([\s\S]*?)<\/p>/g, (_m, attrs, body) => {
    if (!body.includes('<')) {
      // plain text: each sentence becomes its own block, so the browser balances every sentence on its own
      const parts = body.split(/(?<=[가-힣][.?!])[ \t]+(?=\S)/);
      if (parts.length > 1) return `<p${attrs}>${parts.map((s) => `<span class="sb">${s}</span>`).join('')}</p>`;
      return `<p${attrs}>${body}</p>`;
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
    .map((part, i) => (i % 2 ? part : eachText(part, (t) => t.replace(NAME_RE, (m) => m.replace(/[ \t]+/g, ' ')))))
    .join('');
  return head + body;
}

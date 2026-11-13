import { test } from 'node:test';
import assert from 'node:assert/strict';
import { breakSentences, keepNamesTogether } from '../src/lib/sentence-breaks.js';

const NB = ' ';

test('product names never split, in any element', () => {
  assert.equal(
    keepNamesTogether('<html><head><title>Trust Gateway</title></head><body><p>계속 확인하는 Trust Gateway를 만들었습니다.</p><a>Trust Gateway</a></body></html>'),
    `<html><head><title>Trust Gateway</title></head><body><p>계속 확인하는 Trust${NB}Gateway를 만들었습니다.</p><a>Trust${NB}Gateway</a></body></html>`,
  );
});

test('a middle dot between words never ends a line, in text only', () => {
  const WJ = String.fromCharCode(0x2060);
  assert.equal(
    keepNamesTogether('<body><p>PC·태블릿과 휴대폰</p><a title="PC·태블릿">인증·인가</a><p>A · B</p></body>'),
    `<body><p>PC${WJ}·${WJ}태블릿과 휴대폰</p><a title="PC·태블릿">인증${WJ}·${WJ}인가</a><p>A · B</p></body>`,
  );
});

test('names in attributes, scripts and styles are left alone', () => {
  const html = '<body><img alt="Trust Gateway"><script>const a = "Trust Gateway";</script><style>/* Trust Gateway */</style></body>';
  assert.equal(keepNamesTogether(html), html);
});

test('each sentence of a plain paragraph becomes its own line block', () => {
  assert.equal(
    breakSentences('<p class="lead">결제까지. 하나의 엔진입니다.</p>'),
    '<p class="lead"><span class="sb">결제까지.</span><span class="sb">하나의 엔진입니다.</span></p>',
  );
});

test('a one-sentence paragraph is left as it is', () => {
  const html = '<p>하나의 엔진이 각 자리에 맞게 들어갑니다.</p>';
  assert.equal(breakSentences(html), html);
});

test('an existing hand-placed <br> is left alone', () => {
  const html = '<p>알 수 없습니다. <br />Trust Gateway는</p>';
  assert.equal(breakSentences(html), html);
});

test('attribute values are never touched', () => {
  assert.equal(
    breakSentences('<p>문의 <a aria-label="메일 보내기. 새 창">여기</a>로 주세요. 감사합니다.</p>'),
    '<p>문의 <a aria-label="메일 보내기. 새 창">여기</a>로 주세요.<br class="sb" />감사합니다.</p>',
  );
});

test('headings, English periods and numbers stay as they are', () => {
  const html = '<h2>제목입니다. 다음</h2><p>v1.5 and Inc. stay</p><p>© 2026 SYINNOVATION. All rights reserved.</p>';
  assert.equal(breakSentences(html), html);
});

test('a comma clause stays on one line, so a wrap falls after the comma', () => {
  assert.equal(
    breakSentences('<p class="hi">전자여권부터 모바일 결제까지, 사람들이 매일 쓰는 보안을 만들어 왔습니다. 공격자에게는 빈틈이 없습니다.</p>'),
    '<p class="hi"><span class="sb"><span class="cl">전자여권부터 모바일 결제까지,</span> <span class="cl">사람들이 매일 쓰는 보안을 만들어 왔습니다.</span></span><span class="sb">공격자에게는 빈틈이 없습니다.</span></p>',
  );
});

test('a one-sentence paragraph with a comma gets clause spans; numbers like 1,000 do not', () => {
  assert.equal(
    breakSentences('<p>그 경험을 바탕으로, 1,000곳에 쓰는 엔진을 만들었습니다.</p>'),
    '<p><span class="cl">그 경험을 바탕으로,</span> <span class="cl">1,000곳에 쓰는 엔진을 만들었습니다.</span></p>',
  );
});

test('short list items stay with the clause after them', () => {
  const html = '<p>Web, iOS, Android, 백엔드를 AI 개발 도구와 함께 빠르게 만듭니다.</p>';
  assert.equal(breakSentences(html), html);
  assert.equal(
    breakSentences('<p>인증 기술, 금융 시스템, 전략 컨설팅까지 각자의 현장에서 일해 온 사람들이 모였습니다, 그리고 함께 만듭니다.</p>'),
    '<p><span class="cl">인증 기술, 금융 시스템, 전략 컨설팅까지 각자의 현장에서 일해 온 사람들이 모였습니다,</span> <span class="cl">그리고 함께 만듭니다.</span></p>',
  );
});

test('a comma inside 「quotes」 does not end a clause', () => {
  assert.equal(
    breakSentences('<p>매번 확인합니다. 「Never Trust, Always Verify」라는 말로 요약됩니다.</p>'),
    '<p><span class="sb">매번 확인합니다.</span><span class="sb">「Never Trust, Always Verify」라는 말로 요약됩니다.</span></p>',
  );
});

test('list items and description details break per sentence too, unless they hold blocks or icons', () => {
  assert.equal(
    breakSentences('<ul><li>첫 문장입니다. 둘째 문장입니다.</li><li><svg></svg>아이콘 줄입니다. 그대로 둡니다.</li></ul><dl><dd>설명입니다. 이어집니다.</dd></dl>'),
    '<ul><li><span class="sb">첫 문장입니다.</span><span class="sb">둘째 문장입니다.</span></li><li><svg></svg>아이콘 줄입니다. 그대로 둡니다.</li></ul><dl><dd><span class="sb">설명입니다.</span><span class="sb">이어집니다.</span></dd></dl>',
  );
  assert.equal(breakSentences('<li><p>안쪽 문단입니다. 이미 나뉩니다.</p></li>'), '<li><p><span class="sb">안쪽 문단입니다.</span><span class="sb">이미 나뉩니다.</span></p></li>');
});

test('one-syllable words stay with the next word, bound nouns with the one before', () => {
  const N = String.fromCharCode(0xa0);
  assert.equal(keepNamesTogether('<body><p>단계적으로 새 시스템으로 옮깁니다.</p></body>'), `<body><p>단계적으로 새${N}시스템으로 옮깁니다.</p></body>`);
  assert.equal(keepNamesTogether('<body><p>기본을 지키면 막을 수 있습니다</p></body>'), `<body><p>기본을 지키면 막을${N}수${N}있습니다</p></body>`);
  assert.equal(keepNamesTogether('<body><p>맡길 곳이 없습니다</p></body>'), `<body><p>맡길${N}곳이 없습니다</p></body>`);
  // whole words only: 데이터, 수정, 때문에 are not bound nouns
  assert.equal(keepNamesTogether('<body><p>고객 데이터를 수정하는 때문에</p></body>'), '<body><p>고객 데이터를 수정하는 때문에</p></body>');
});

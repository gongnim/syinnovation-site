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

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pageNumbers } from '../src/lib/pager.js';

test('up to 7 pages: every number', () => {
  assert.deepEqual(pageNumbers(1, 1), [1]);
  assert.deepEqual(pageNumbers(3, 7), [1, 2, 3, 4, 5, 6, 7]);
});

test('more pages: first, last, current and neighbours, … for gaps', () => {
  assert.deepEqual(pageNumbers(1, 9), [1, 2, '…', 9]);
  assert.deepEqual(pageNumbers(2, 9), [1, 2, 3, '…', 9]);
  assert.deepEqual(pageNumbers(3, 9), [1, 2, 3, 4, '…', 9]);
  assert.deepEqual(pageNumbers(5, 9), [1, '…', 4, 5, 6, '…', 9]);
  assert.deepEqual(pageNumbers(8, 9), [1, '…', 7, 8, 9]);
  assert.deepEqual(pageNumbers(9, 9), [1, '…', 8, 9]);
});

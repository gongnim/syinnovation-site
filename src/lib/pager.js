/** Page numbers for a pager: all of them up to 7 pages, else the first, the last and the current page with its
 *  neighbours, with '…' where numbers are skipped. pageNumbers(5, 9) → [1, '…', 4, 5, 6, '…', 9] */
export const pageNumbers = (page, pages) => {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const keep = [...new Set([1, page - 1, page, page + 1, pages])].filter((p) => p >= 1 && p <= pages).sort((a, b) => a - b);
  return keep.flatMap((p, i) => (i > 0 && p - keep[i - 1] > 1 ? ['…', p] : [p]));
};

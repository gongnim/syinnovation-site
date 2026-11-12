// Path helpers for the hand-drawn hero stages (SketchHero and the heroes built on it).

/** A rounded box drawn the way a hand does: it starts on the top edge and runs a little past its own start. */
export const rr = (x: number, y: number, w: number, h: number, r = 10) => {
  const o = Math.min(8, w / 6);
  return `M${x + r + o} ${y} H${x + w - r} Q${x + w} ${y} ${x + w} ${y + r} V${y + h - r} Q${x + w} ${y + h} ${x + w - r} ${y + h} H${x + r} Q${x} ${y + h} ${x} ${y + h - r} V${y + r} Q${x} ${y} ${x + r} ${y} L${x + r + o * 2.2} ${y + 1.2}`;
};

/** Construction lines: each edge of a box extended past its corners, like a draughtsman's guides. */
export const guide = ([x, y, w, h]: number[], e = 14) =>
  `M${x - e} ${y} H${x + w + e} M${x - e} ${y + h} H${x + w + e} M${x} ${y - e} V${y + h + e} M${x + w} ${y - e} V${y + h + e}`;

/** A small check mark starting at (x, y). */
export const tick = (x: number, y: number) => `M${x} ${y} l5 6 l11 -12`;

/** A short arrow pointing down from (x, y1) to (x, y2). */
export const down = (x: number, y1: number, y2: number) => `M${x} ${y1} V${y2} M${x - 6} ${y2 - 7} L${x} ${y2} L${x + 6} ${y2 - 7}`;

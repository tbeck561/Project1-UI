// this file knows what each posture looks like to the chairs sensors
// the seat has a six by six grid of pressure squares and the backrest has eight rows with a left and right sensor in each
// the chair uses this to record where the persons weight and back have been so the touch panel can show it later

// the seat grid is six squares wide and six squares deep the backrest has eight rows
export const N = 6;
export const ROWS = 8;

// where the weight sits on the seat for each posture zero to one across and from front to back
// the front edge of the seat is the top of the grid for example leaning forward puts weight near the front edge
const SHAPE = {
  good: { cx: 0.5, cy: 0.55, sx: 0.26, sy: 0.3 },
  slouch: { cx: 0.5, cy: 0.35, sx: 0.28, sy: 0.3 },
  forward: { cx: 0.5, cy: 0.15, sx: 0.26, sy: 0.2 },
  leanL: { cx: 0.28, cy: 0.5, sx: 0.2, sy: 0.3 },
  leanR: { cx: 0.72, cy: 0.5, sx: 0.2, sy: 0.3 },
};

// how hard each of the thirty six seat squares is pressed for a posture from zero none to one a lot
// it fades out smoothly from the middle of the weight
export function seatPressure(posture) {
  const s = SHAPE[posture];
  return Array.from({ length: N * N }, (_, i) => {
    const x = ((i % N) + 0.5) / N;
    const y = (Math.floor(i / N) + 0.5) / N;
    return Math.exp(-((x - s.cx) ** 2) / (2 * s.sx ** 2) - ((y - s.cy) ** 2) / (2 * s.sy ** 2));
  });
}

// which of the sixteen backrest sensors eight rows left then right are touching the persons back for a posture
// slouching only touches the lower back leaning forward only the very bottom
// leaning left or right touches one side and sitting upright touches everything
export function backContact(posture) {
  const rows = [0, 1, 2, 3, 4, 5, 6, 7];
  const pairs = rows.map((r) => {
    if (posture === 'slouch') return r >= 4 ? [1, 1] : [0, 0];
    if (posture === 'forward') return r === 7 ? [1, 1] : [0, 0];
    if (posture === 'leanL') return [1, r >= 5 ? 1 : 0];
    if (posture === 'leanR') return [r >= 5 ? 1 : 0, 1];
    return [1, 1];
  });
  return pairs.flat();
}

// a list of zeros for when nobody is sitting or nothing has been recorded
export const zeros = (n) => Array.from({ length: n }, () => 0);

// turns an amount from zero to one into a color none is dark a little is green and a lot goes toward red
// the same colors are used for live pressure and for the history so they are easy to compare
export const heatColor = (v) => (v < 0.04 ? '#23262d' : `hsl(${150 - 150 * v} 62% ${30 + 20 * v}%)`);

// the share of weight on the left and right halves of the seat like forty eight fifty two null if there is nothing to measure
export function balanceOf(cells) {
  const l = cells.filter((_, i) => i % N < N / 2).reduce((a, b) => a + b, 0);
  const r = cells.filter((_, i) => i % N >= N / 2).reduce((a, b) => a + b, 0);
  const t = l + r;
  return t < 0.001 ? null : [Math.round((l / t) * 100), Math.round((r / t) * 100)];
}

// describes in words where most of the weight has been like centered toward the front
export function describeSeat(cells) {
  const t = cells.reduce((a, b) => a + b, 0);
  if (t < 0.001) return 'Nothing recorded yet.';
  let cx = 0;
  let cy = 0;
  cells.forEach((v, i) => {
    cx += (v * (((i % N) + 0.5) / N)) / t;
    cy += (v * ((Math.floor(i / N) + 0.5) / N)) / t;
  });
  const side = cx < 0.46 ? 'to the left' : cx > 0.54 ? 'to the right' : 'centered';
  const depth = cy < 0.4 ? 'toward the front' : cy > 0.6 ? 'toward the back' : 'mid-seat';
  return `Most weight is ${side}, ${depth}.`;
}

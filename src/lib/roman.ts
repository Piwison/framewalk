/**
 * Roman numerals for plate numbers (Monograph direction): the diary and the
 * day's mission are presented as numbered plates in a body of work.
 * Domain is small (mission library, diary keepers) so no bounds gymnastics —
 * anything below 1 renders as an em dash rather than lying.
 */
const NUMERALS: readonly [number, string][] = [
  [1000, "M"],
  [900, "CM"],
  [500, "D"],
  [400, "CD"],
  [100, "C"],
  [90, "XC"],
  [50, "L"],
  [40, "XL"],
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
];

export function roman(n: number): string {
  if (!Number.isFinite(n) || n < 1) return "—";
  let rest = Math.floor(n);
  let out = "";
  for (const [value, glyph] of NUMERALS) {
    while (rest >= value) {
      out += glyph;
      rest -= value;
    }
  }
  return out;
}

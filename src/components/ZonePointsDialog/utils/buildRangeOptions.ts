// Inclusive integer range, e.g. buildRangeOptions(1, 4) -> [1, 2, 3, 4] —
// used to build each zone type's own row/column NumberPickerField options,
// since the maximum differs per type (see data/zones.ts's ZONE_MAX_GRID).
export function buildRangeOptions(min: number, max: number): number[] {
  return Array.from({ length: max - min + 1 }, (_, index) => index + min);
}

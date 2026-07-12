import { ZoneGridConfig, ZonePointCounts, ZoneType } from "../../types";
import { DEFAULT_ZONE_POINT_COUNTS, ZONE_MAX_GRID } from "../../data";
import { MIN_ZONE_COLS, MIN_ZONE_ROWS } from "../../constants";

function clampRows(rows: number, type: ZoneType): number {
  return Math.min(ZONE_MAX_GRID[type].rows, Math.max(MIN_ZONE_ROWS, rows));
}

function clampCols(cols: number, type: ZoneType): number {
  return Math.min(ZONE_MAX_GRID[type].cols, Math.max(MIN_ZONE_COLS, cols));
}

export function clampZonePointCounts(
  input: Partial<Record<ZoneType, Partial<ZoneGridConfig>>> | undefined,
): ZonePointCounts {
  const result = {} as ZonePointCounts;
  for (const type of Object.values(ZoneType)) {
    const defaults = DEFAULT_ZONE_POINT_COUNTS[type];
    const candidate = input?.[type];
    result[type] = {
      rows: clampRows(candidate?.rows ?? defaults.rows, type),
      cols: clampCols(candidate?.cols ?? defaults.cols, type),
    };
  }
  return result;
}

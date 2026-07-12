import { ZoneGridConfig, ZonePointCounts, ZoneType } from "../../types";
import { ZONE_MAX_GRID } from "../../data";
import { MIN_ZONE_COLS, MIN_ZONE_ROWS } from "../../constants";

const ZONE_TYPES: ZoneType[] = Object.values(ZoneType);

export function isValidZonePointCounts(value: unknown): value is ZonePointCounts {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<Record<ZoneType, unknown>>;
  return ZONE_TYPES.every((type) => {
    const config = candidate[type];
    if (!config || typeof config !== "object") return false;
    const { rows, cols } = config as Partial<ZoneGridConfig>;
    return (
      typeof rows === "number" &&
      rows >= MIN_ZONE_ROWS &&
      rows <= ZONE_MAX_GRID[type].rows &&
      typeof cols === "number" &&
      cols >= MIN_ZONE_COLS &&
      cols <= ZONE_MAX_GRID[type].cols
    );
  });
}

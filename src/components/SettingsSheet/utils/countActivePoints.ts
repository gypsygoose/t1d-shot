import { ZONE_TYPE } from "../../../data";
import { EnabledZones, ZoneId, ZonePointCounts } from "../../../types";

// Total number of points across every enabled zone — a disabled zone's own
// row/col grid never renders, so it doesn't count toward the total (unlike
// buildZonePointsSummary.ts's per-type lines, which stay keyed by ZoneType
// regardless of which individual side is enabled).
export function countActivePoints(
  zonePointCounts: ZonePointCounts,
  enabledZones: EnabledZones,
): number {
  return Object.values(ZoneId).reduce((total, zoneId) => {
    if (!enabledZones[zoneId]) return total;
    const { rows, cols } = zonePointCounts[ZONE_TYPE[zoneId]];
    return total + rows * cols;
  }, 0);
}

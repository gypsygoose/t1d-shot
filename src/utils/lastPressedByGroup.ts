import { PointDefinition, PointStatesMap, ZoneGroup } from "../types";
import { ZONE_MAP } from "../data";

// Derive checked pointId per group: the point with the latest press date
// (lastInjectionAt or blackoutStartedAt, whichever is more recent) in that
// group. Based on actual timestamps rather than event-log order, so a
// backdated entry (via markPointAt) never wins over a genuinely more recent
// press just because it was recorded later. `pointMap` is the current
// ZonePointCounts-derived map (see data/zones.ts's buildZoneData), passed in
// rather than imported since it's no longer a static constant.
export function lastPressedByGroup(
  pointStates: PointStatesMap,
  pointMap: Record<string, PointDefinition>,
): Record<ZoneGroup, string | null> {
  const result: Record<ZoneGroup, string | null> = {
    [ZoneGroup.Thighs]: null,
    [ZoneGroup.ShouldersAndBelly]: null,
  };
  const bestTime: Record<ZoneGroup, number> = {
    [ZoneGroup.Thighs]: -Infinity,
    [ZoneGroup.ShouldersAndBelly]: -Infinity,
  };
  for (const [pointId, pointState] of pointStates) {
    const point = pointMap[pointId];
    if (!point) continue;
    const zone = ZONE_MAP[point.zoneId];
    if (!zone) continue;
    const time = Math.max(
      pointState.lastInjectionAt ?? -Infinity,
      pointState.blackoutStartedAt ?? -Infinity,
    );
    if (time === -Infinity) continue;
    if (time > bestTime[zone.group]) {
      bestTime[zone.group] = time;
      result[zone.group] = pointId;
    }
  }
  return result;
}

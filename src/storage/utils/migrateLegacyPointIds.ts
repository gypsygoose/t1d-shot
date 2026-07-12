import { AppEvent, StoredPointState, ZoneId } from "../../types";
import { DEFAULT_ZONE_POINT_COUNTS, ZONE_TYPE, isZoneLeftOfMidline } from "../../data";

const LEGACY_PREFIX_ZONE: Record<string, ZoneId> = {
  sr: ZoneId.ShoulderRight,
  sl: ZoneId.ShoulderLeft,
  br: ZoneId.BellyRight,
  bl: ZoneId.BellyLeft,
  tr: ZoneId.ThighRight,
  tl: ZoneId.ThighLeft,
};

const LEGACY_ID_PATTERN = /^(sr|sl|br|bl|tr|tl)-(\d+)$/;

// Reinterprets a pre-setting flat-index id ("sr-0") as a row/col-keyed one
// ("sr-r1c1"), using DEFAULT_ZONE_POINT_COUNTS — the fixed grid shape every
// legacy id was originally generated under (row-major: row = index / cols,
// raw column = index % cols, left-to-right, matching the pre-setting
// generation order). The new scheme's `column` is body-relative (1 =
// closest to the midline, see data/zones.ts's buildZoneData), so the same
// center-relative flip the original address computation applied is
// reapplied here to land on the same column number the point always had.
function migrateLegacyPointId(id: string): string | null {
  const match = LEGACY_ID_PATTERN.exec(id);
  if (!match) return null;
  const [, prefix, indexString] = match;
  const zoneId = LEGACY_PREFIX_ZONE[prefix];
  const oldCols = DEFAULT_ZONE_POINT_COUNTS[ZONE_TYPE[zoneId]].cols;
  const index = Number(indexString);
  const row = Math.floor(index / oldCols) + 1;
  const rawColumn = index % oldCols;
  const column = isZoneLeftOfMidline(zoneId) ? oldCols - rawColumn : rawColumn + 1;
  return `${prefix}-r${row}c${column}`;
}

// One-time migration for installs saved before the configurable per-zone
// point grid existed: point ids used to be a flat sequential index, and are
// now keyed by (row, column) within the zone's grid so a point's identity
// survives a grid resize (see data/zones.ts's buildZoneData). Rewrites every
// reference to a migrated id: the pointStates key itself, its own `pointId`
// field, and every AppEvent (undo history) naming it.
export function migrateLegacyPointIds(
  pointStates: Record<string, StoredPointState>,
  events: AppEvent[],
): { pointStates: Record<string, StoredPointState>; events: AppEvent[] } {
  const idMap: Record<string, string> = {};
  for (const id of Object.keys(pointStates)) {
    const migratedId = migrateLegacyPointId(id);
    if (migratedId) idMap[id] = migratedId;
  }
  if (Object.keys(idMap).length === 0) return { pointStates, events };

  const nextPointStates: Record<string, StoredPointState> = {};
  for (const [id, state] of Object.entries(pointStates)) {
    const nextId = idMap[id] ?? id;
    nextPointStates[nextId] = { ...state, pointId: nextId };
  }

  const nextEvents = events.map((event) => ({
    ...event,
    pointId: idMap[event.pointId] ?? event.pointId,
    prevPointState: {
      ...event.prevPointState,
      pointId: idMap[event.prevPointState.pointId] ?? event.prevPointState.pointId,
    },
  }));

  return { pointStates: nextPointStates, events: nextEvents };
}

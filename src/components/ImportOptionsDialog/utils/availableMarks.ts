import { ExportedAppData, ZoneType } from "../../../types";
import { ZONE_TYPES } from "../../../data";

// The parsed file carries a single pointStates/events pair, covering every
// zone type together (there's no per-zone-type split on the export side) —
// so every ZoneType is available together whenever the pair is present at
// all.
export function availableMarks(data: ExportedAppData): Record<ZoneType, boolean> {
  const available = data.pointStates !== undefined && data.events !== undefined;
  return Object.fromEntries(
    ZONE_TYPES.map((zoneType) => [zoneType, available]),
  ) as Record<ZoneType, boolean>;
}

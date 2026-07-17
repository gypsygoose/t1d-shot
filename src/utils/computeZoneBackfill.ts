import { AppStorage, EnabledZones, ZonePointCounts } from "../types";
import { buildZoneData } from "../data";
import { normalizeStorage } from "../storage";

interface ComputeZoneBackfillParams {
  zonePointCounts: ZonePointCounts;
  enabledZones: EnabledZones;
  storage: AppStorage;
}

// Backfills default states for any point newly brought into range by a
// zonePointCounts/enabledZones change, leaving every other point's history —
// including now out-of-range/disabled slots — untouched (see CLAUDE.md's
// "Zones and points"). Shared by three of src/hooks/useAppStore.ts's own
// sub-hooks that can change either setting: useZoneSettings's
// setZonePointCounts/setEnabledZones, useClearSelected, and
// useImportExport's applyImport.
export function computeZoneBackfill({
  zonePointCounts,
  enabledZones,
  storage,
}: ComputeZoneBackfillParams): AppStorage {
  const activePoints = buildZoneData(zonePointCounts, enabledZones).points;
  return normalizeStorage(storage, activePoints);
}

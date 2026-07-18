import { MutableRefObject, useCallback, useMemo, useRef } from "react";
import { EnabledZones, ZonePointCounts, ZoneRuntimeData } from "../types";
import { StorageService } from "../storage";
import { buildZoneData } from "../data";
import { computeZoneBackfill } from "../utils";
import { ScheduleSave } from "./useDebouncedSave";
import { SetAppState } from "./types";

interface UseZoneSettingsParams {
  zonePointCounts: ZonePointCounts;
  enabledZones: EnabledZones;
  setState: SetAppState;
  scheduleSave: ScheduleSave;
}

interface ZoneSettings {
  zoneData: ZoneRuntimeData;
  // Read by usePointActions/useImportExport so their useCallbacks can stay
  // stable ([] or setState-only deps) instead of needing zoneData itself as
  // a dependency.
  zoneDataRef: MutableRefObject<ZoneRuntimeData>;
  setZonePointCounts(next: ZonePointCounts): void;
  setEnabledZones(next: EnabledZones): void;
}

export function useZoneSettings({
  zonePointCounts,
  enabledZones,
  setState,
  scheduleSave,
}: UseZoneSettingsParams): ZoneSettings {
  // Recomputed only when zonePointCounts/enabledZones changes, not on every
  // render — see data/zones.ts's buildZoneData.
  const zoneData = useMemo(
    () => buildZoneData(zonePointCounts, enabledZones),
    [zonePointCounts, enabledZones],
  );
  const zoneDataRef = useRef(zoneData);
  zoneDataRef.current = zoneData;

  // Backfills default states for any slot newly brought into range by the
  // grid change, while leaving every other point's history — including
  // slots now outside the grid — untouched, so shrinking then re-growing a
  // zone's grid restores its old history (see CLAUDE.md's "Zones and
  // points").
  const setZonePointCounts = useCallback(
    (next: ZonePointCounts) => {
      setState((prev) => {
        const normalized = computeZoneBackfill({
          zonePointCounts: next,
          enabledZones: prev.enabledZones,
          pointStates: prev.pointStates,
        });
        scheduleSave(normalized, prev.events);
        return { ...prev, zonePointCounts: next, pointStates: normalized };
      });
      StorageService.saveZonePointCounts(next);
    },
    [setState, scheduleSave],
  );

  // Same backfill-defaults treatment as setZonePointCounts — re-enabling a
  // zone reveals its points (and their history) again, since a disabled
  // zone's points are simply excluded from buildZoneData's active-points
  // list (see CLAUDE.md's "Zones and points") rather than deleted.
  const setEnabledZones = useCallback(
    (next: EnabledZones) => {
      setState((prev) => {
        const normalized = computeZoneBackfill({
          zonePointCounts: prev.zonePointCounts,
          enabledZones: next,
          pointStates: prev.pointStates,
        });
        scheduleSave(normalized, prev.events);
        return { ...prev, enabledZones: next, pointStates: normalized };
      });
      StorageService.saveEnabledZones(next);
    },
    [setState, scheduleSave],
  );

  return { zoneData, zoneDataRef, setZonePointCounts, setEnabledZones };
}

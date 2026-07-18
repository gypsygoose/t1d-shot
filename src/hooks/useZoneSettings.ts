import { MutableRefObject, useCallback, useMemo, useRef } from "react";
import { EnabledZones, ZonePointCounts, ZoneRuntimeData } from "../types";
import { StorageService } from "../storage";
import { buildZoneData } from "../data";
import { SetAppState } from "./types";

interface UseZoneSettingsParams {
  zonePointCounts: ZonePointCounts;
  enabledZones: EnabledZones;
  setState: SetAppState;
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
}: UseZoneSettingsParams): ZoneSettings {
  // Recomputed only when zonePointCounts/enabledZones changes, not on every
  // render — see data/zones.ts's buildZoneData.
  const zoneData = useMemo(
    () => buildZoneData(zonePointCounts, enabledZones),
    [zonePointCounts, enabledZones],
  );
  const zoneDataRef = useRef(zoneData);
  zoneDataRef.current = zoneData;

  // Point states are sparse, so a grid/zone change touches no point data at
  // all: a slot newly brought into range simply has no entry (a fresh, White
  // point), and a slot taken out of range keeps its untouched entry as a
  // harmless orphan — shrinking then re-growing a zone restores its history
  // for free, with no backfill step (see CLAUDE.md's "Zones and points").
  const setZonePointCounts = useCallback(
    (next: ZonePointCounts) => {
      setState((prev) => ({ ...prev, zonePointCounts: next }));
      StorageService.saveZonePointCounts(next);
    },
    [setState],
  );

  const setEnabledZones = useCallback(
    (next: EnabledZones) => {
      setState((prev) => ({ ...prev, enabledZones: next }));
      StorageService.saveEnabledZones(next);
    },
    [setState],
  );

  return { zoneData, zoneDataRef, setZonePointCounts, setEnabledZones };
}

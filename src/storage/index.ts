export * from "./StorageService";
export * from "./types";
// Reused outside storage/ by useAppStore.ts, which needs to backfill default
// point states for newly-active slots after a ZonePointCounts change —
// StorageService.ts's other utils/ helpers stay internal to it.
export { normalizeStorage } from "./utils";

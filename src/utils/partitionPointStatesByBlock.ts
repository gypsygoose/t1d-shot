import { StoredPointState } from "../types";

export interface PartitionedPointStates {
  active: Record<string, StoredPointState>;
  blocked: Record<string, StoredPointState>;
}

// Splits pointStates into the two ExportMarksKey categories by each point's
// current isManuallyBlocked flag — used by exportData/buildImportData to
// filter the marks accordion's sub-selection.
export function partitionPointStatesByBlock(
  pointStates: Record<string, StoredPointState>,
): PartitionedPointStates {
  const active: Record<string, StoredPointState> = {};
  const blocked: Record<string, StoredPointState> = {};
  for (const [pointId, pointState] of Object.entries(pointStates)) {
    if (pointState.isManuallyBlocked) {
      blocked[pointId] = pointState;
    } else {
      active[pointId] = pointState;
    }
  }
  return { active, blocked };
}

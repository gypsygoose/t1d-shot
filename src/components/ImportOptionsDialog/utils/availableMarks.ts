import { ExportedAppData, ExportMarksKey } from "../../../types";

// The parsed file carries a single pointStates/events pair — an export made
// with only one marks sub-category selected already narrowed that pair down
// on the way out (see useAppStore's exportData), so both sub-categories are
// available together whenever the pair is present at all.
export function availableMarks(
  data: ExportedAppData,
): Record<ExportMarksKey, boolean> {
  const available = data.pointStates !== undefined && data.events !== undefined;
  return {
    [ExportMarksKey.ActivePoints]: available,
    [ExportMarksKey.BlockedPoints]: available,
  };
}

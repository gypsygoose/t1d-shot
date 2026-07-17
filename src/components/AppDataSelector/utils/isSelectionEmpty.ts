import { ExportSelection } from "../../../types";
import { SETTING_KEYS } from "../constants";

export function isSelectionEmpty(selection: ExportSelection): boolean {
  return (
    Object.values(selection.marks).every((checked) => !checked) &&
    SETTING_KEYS.every((key) => !selection.settings[key])
  );
}

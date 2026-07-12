import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog } from "../common";
import { ImportExportOptions, isSelectionEmpty } from "../ImportExportOptions";
import { ExportSelection } from "../../types";
import { allMarks, allSettings } from "./utils";

const DEFAULT_SELECTION: ExportSelection = {
  marks: allMarks(true),
  settings: allSettings(true),
};
const DEFAULT_MARKS_EXPANDED = false;
const DEFAULT_SETTINGS_EXPANDED = false;

interface Props {
  visible: boolean;
  onConfirm: (selection: ExportSelection) => void;
  onCancel: () => void;
}

export function ExportOptionsDialog({ visible, onConfirm, onCancel }: Props) {
  const { t } = useTranslation();
  const [selection, setSelection] =
    useState<ExportSelection>(DEFAULT_SELECTION);
  const [marksExpanded, setMarksExpanded] = useState(DEFAULT_MARKS_EXPANDED);
  const [settingsExpanded, setSettingsExpanded] = useState(
    DEFAULT_SETTINGS_EXPANDED,
  );

  useEffect(() => {
    if (!visible) return;
    setSelection(DEFAULT_SELECTION);
    setMarksExpanded(DEFAULT_MARKS_EXPANDED);
    setSettingsExpanded(DEFAULT_SETTINGS_EXPANDED);
  }, [visible]);

  return (
    <Dialog
      visible={visible}
      title={t("menu.exportOptionsDialog.title")}
      message={t("menu.exportOptionsDialog.message")}
      confirmLabel={t("menu.exportOptionsDialog.confirmLabel")}
      confirmDisabled={isSelectionEmpty(selection)}
      onConfirm={() => onConfirm(selection)}
      onCancel={onCancel}
      scrollable
    >
      <ImportExportOptions
        selection={selection}
        onSelectionChange={setSelection}
        marksExpanded={marksExpanded}
        onToggleMarksExpanded={() => setMarksExpanded((v) => !v)}
        settingsExpanded={settingsExpanded}
        onToggleSettingsExpanded={() => setSettingsExpanded((v) => !v)}
      />
    </Dialog>
  );
}

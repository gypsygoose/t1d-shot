import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, RadioGroup } from "./common";
import { PointRestoreMode } from "../types";
import { POINT_RESTORE_MODE_KEY } from "./SettingsSheet";

const POINT_RESTORE_MODE_OPTIONS: PointRestoreMode[] = [
  PointRestoreMode.Auto,
  PointRestoreMode.Manual,
];

interface Props {
  visible: boolean;
  initialPointRestoreMode: PointRestoreMode;
  onConfirm: (mode: PointRestoreMode) => void;
  onCancel: () => void;
}

export function PointRestoreModeDialog({
  visible,
  initialPointRestoreMode,
  onConfirm,
  onCancel,
}: Props) {
  const { t } = useTranslation();
  const [mode, setMode] = useState(initialPointRestoreMode);

  useEffect(() => {
    if (!visible) return;
    setMode(initialPointRestoreMode);
  }, [visible, initialPointRestoreMode]);

  return (
    <Dialog
      visible={visible}
      title={t("menu.pointRestoreModeRow")}
      message={t("menu.pointRestoreModeDialog.message")}
      confirmLabel={t("common.save")}
      onConfirm={() => onConfirm(mode)}
      onCancel={onCancel}
    >
      <RadioGroup
        options={POINT_RESTORE_MODE_OPTIONS.map((option) => ({
          value: option,
          label: t(POINT_RESTORE_MODE_KEY[option]),
        }))}
        selectedValue={mode}
        onSelect={(value) => setMode(value as PointRestoreMode)}
      />
    </Dialog>
  );
}

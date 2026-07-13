import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, NumberPickerField } from "./common";
import { MIN_DAYS_TO_AVAILABLE } from "../constants";

interface Props {
  visible: boolean;
  initialDays: number;
  // Upper bound is the current daysToWhite value, not a fixed constant — see
  // CLAUDE.md's "Point colour state machine".
  maxDays: number;
  onConfirm: (days: number) => void;
  onCancel: () => void;
}

export function DaysToAvailableDialog({
  visible,
  initialDays,
  maxDays,
  onConfirm,
  onCancel,
}: Props) {
  const { t } = useTranslation();
  const [days, setDays] = useState(initialDays);
  const options = Array.from(
    { length: maxDays - MIN_DAYS_TO_AVAILABLE + 1 },
    (_, index) => index + MIN_DAYS_TO_AVAILABLE,
  );

  useEffect(() => {
    if (!visible) return;
    setDays(Math.min(initialDays, maxDays));
  }, [visible, initialDays, maxDays]);

  return (
    <Dialog
      visible={visible}
      title={t("menu.daysToAvailableRow")}
      message={t("menu.daysToAvailableDialog.message")}
      confirmLabel={t("common.save")}
      onConfirm={() => onConfirm(days)}
      onCancel={onCancel}
    >
      <NumberPickerField
        label={t("menu.daysToAvailableDialog.fieldLabel")}
        value={days}
        options={options}
        onChange={setDays}
      />
    </Dialog>
  );
}

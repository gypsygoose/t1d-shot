import { useEffect, useState } from "react";
import { Dialog } from "./common/Dialog";
import { NumberPickerField } from "./common/NumberPickerField";
import {
  DAYS_TO_WHITE_ROW_LABEL,
  MAX_DAYS_TO_WHITE,
  MIN_DAYS_TO_WHITE,
  SAVE_LABEL,
} from "../constants";
import { pluralDays } from "../format";

const DAYS_OPTIONS = Array.from(
  { length: MAX_DAYS_TO_WHITE - MIN_DAYS_TO_WHITE + 1 },
  (_, i) => i + MIN_DAYS_TO_WHITE,
);

const DIALOG_MESSAGE =
  "Через сколько дней место укола снова считается полностью свободным (белым). При меньшем значении цвета цикла сжимаются в этот срок.";

interface Props {
  visible: boolean;
  initialDays: number;
  onConfirm: (days: number) => void;
  onCancel: () => void;
}

export function DaysToWhiteDialog({
  visible,
  initialDays,
  onConfirm,
  onCancel,
}: Props) {
  const [days, setDays] = useState(initialDays);

  useEffect(() => {
    if (!visible) return;
    setDays(initialDays);
  }, [visible, initialDays]);

  return (
    <Dialog
      visible={visible}
      title={DAYS_TO_WHITE_ROW_LABEL}
      message={DIALOG_MESSAGE}
      confirmLabel={SAVE_LABEL}
      onConfirm={() => onConfirm(days)}
      onCancel={onCancel}
    >
      <NumberPickerField
        label={DAYS_TO_WHITE_ROW_LABEL}
        value={days}
        options={DAYS_OPTIONS}
        onChange={setDays}
      />
    </Dialog>
  );
}

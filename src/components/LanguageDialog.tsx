import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, RadioGroup } from "./common";
import { LanguageMode } from "../types";
import { LANGUAGE_MODE_KEY } from "./SettingsSheet";

const LANGUAGE_MODE_OPTIONS: LanguageMode[] = [
  LanguageMode.System,
  LanguageMode.English,
  LanguageMode.Russian,
  LanguageMode.German,
  LanguageMode.Spanish,
  LanguageMode.French,
  LanguageMode.Turkish,
  LanguageMode.Portuguese,
];

interface Props {
  visible: boolean;
  initialLanguageMode: LanguageMode;
  onConfirm: (mode: LanguageMode) => void;
  onCancel: () => void;
}

export function LanguageDialog({
  visible,
  initialLanguageMode,
  onConfirm,
  onCancel,
}: Props) {
  const { t } = useTranslation();
  const [mode, setMode] = useState(initialLanguageMode);

  useEffect(() => {
    if (!visible) return;
    setMode(initialLanguageMode);
  }, [visible, initialLanguageMode]);

  return (
    <Dialog
      visible={visible}
      title={t("menu.languageRow")}
      message={t("menu.languageDialog.message")}
      confirmLabel={t("common.save")}
      onConfirm={() => onConfirm(mode)}
      onCancel={onCancel}
    >
      <RadioGroup
        options={LANGUAGE_MODE_OPTIONS.map((option) => ({
          value: option,
          label: t(LANGUAGE_MODE_KEY[option]),
        }))}
        selectedValue={mode}
        onSelect={(value) => setMode(value as LanguageMode)}
      />
    </Dialog>
  );
}

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, RadioGroup } from "./common";
import { ThemeMode } from "../types";
import { THEME_MODE_KEY } from "./SettingsSheet";

const THEME_MODE_OPTIONS: ThemeMode[] = [
  ThemeMode.System,
  ThemeMode.Light,
  ThemeMode.Dark,
];

interface Props {
  visible: boolean;
  initialThemeMode: ThemeMode;
  onConfirm: (mode: ThemeMode) => void;
  onCancel: () => void;
}

export function ThemeDialog({
  visible,
  initialThemeMode,
  onConfirm,
  onCancel,
}: Props) {
  const { t } = useTranslation();
  const [mode, setMode] = useState(initialThemeMode);

  useEffect(() => {
    if (!visible) return;
    setMode(initialThemeMode);
  }, [visible, initialThemeMode]);

  return (
    <Dialog
      visible={visible}
      title={t("menu.themeRow")}
      message={t("menu.themeDialog.message")}
      confirmLabel={t("common.save")}
      onConfirm={() => onConfirm(mode)}
      onCancel={onCancel}
    >
      <RadioGroup
        options={THEME_MODE_OPTIONS.map((option) => ({
          value: option,
          label: t(THEME_MODE_KEY[option]),
        }))}
        selectedValue={mode}
        onSelect={(value) => setMode(value as ThemeMode)}
      />
    </Dialog>
  );
}

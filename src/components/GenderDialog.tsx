import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, RadioGroup } from "./common";
import { Gender } from "../types";
import { GENDER_KEY } from "./SettingsSheet";

const GENDER_OPTIONS: Gender[] = [Gender.Male, Gender.Female];

interface Props {
  visible: boolean;
  initialGender: Gender;
  onConfirm: (gender: Gender) => void;
  onCancel: () => void;
}

export function GenderDialog({
  visible,
  initialGender,
  onConfirm,
  onCancel,
}: Props) {
  const { t } = useTranslation();
  const [gender, setGender] = useState(initialGender);

  useEffect(() => {
    if (!visible) return;
    setGender(initialGender);
  }, [visible, initialGender]);

  return (
    <Dialog
      visible={visible}
      title={t("menu.genderRow")}
      message={t("menu.genderDialog.message")}
      confirmLabel={t("common.save")}
      onConfirm={() => onConfirm(gender)}
      onCancel={onCancel}
    >
      <RadioGroup
        options={GENDER_OPTIONS.map((option) => ({
          value: option,
          label: t(GENDER_KEY[option]),
        }))}
        selectedValue={gender}
        onSelect={(value) => setGender(value as Gender)}
      />
    </Dialog>
  );
}

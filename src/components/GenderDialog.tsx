import { useEffect, useState } from "react";
import { Platform, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useTranslation } from "react-i18next";
import { Dialog } from "./common";
import { useTheme } from "../theme";
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
  const { colors } = useTheme();
  const [gender, setGender] = useState(initialGender);
  const pickerItemColor = Platform.OS === "android" ? colors.primaryText : undefined;

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
      <Picker
        style={[styles.picker, { color: colors.primaryText }]}
        itemStyle={[styles.pickerItem, { color: colors.primaryText }]}
        selectedValue={gender}
        onValueChange={(value) => setGender(value as Gender)}
        dropdownIconColor={colors.primaryText}
      >
        {GENDER_OPTIONS.map((option) => (
          <Picker.Item
            key={option}
            label={t(GENDER_KEY[option])}
            value={option}
            color={pickerItemColor}
          />
        ))}
      </Picker>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  picker: {
    width: "100%",
  },
  pickerItem: {
    fontSize: 18,
    height: 120,
  },
});

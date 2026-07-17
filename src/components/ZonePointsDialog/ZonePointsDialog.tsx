import { useEffect, useState } from "react";
import { Text, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";
import { Dialog, NumberPickerField, Accordion } from "../common";
import { ZONE_MAX_GRID, ZONE_TYPE_LABEL_KEY, ZONE_TYPES } from "../../data";
import { ZoneGridConfig, ZonePointCounts, ZoneType } from "../../types";
import { useTheme } from "../../theme";
import { MIN_ZONE_COLS, MIN_ZONE_ROWS } from "../../constants";
import { buildRangeOptions } from "./utils";

const COLLAPSED_ALL: Record<ZoneType, boolean> = {
  [ZoneType.Shoulder]: false,
  [ZoneType.Belly]: false,
  [ZoneType.Thigh]: false,
};

interface Props {
  visible: boolean;
  initialZonePointCounts: ZonePointCounts;
  onConfirm: (next: ZonePointCounts) => void;
  onCancel: () => void;
}

// One collapsed-by-default accordion per zone type (Плечи/Живот/Бёдра), each
// with two NumberPickerField selectors (rows, columns) — same picker
// pattern as DaysToWhiteDialog, generalized to a per-type record.
export function ZonePointsDialog({
  visible,
  initialZonePointCounts,
  onConfirm,
  onCancel,
}: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [draft, setDraft] = useState<ZonePointCounts>(initialZonePointCounts);
  const [expanded, setExpanded] =
    useState<Record<ZoneType, boolean>>(COLLAPSED_ALL);

  useEffect(() => {
    if (!visible) return;
    setDraft(initialZonePointCounts);
    setExpanded(COLLAPSED_ALL);
  }, [visible, initialZonePointCounts]);

  const updateConfig = (type: ZoneType, config: Partial<ZoneGridConfig>) => {
    setDraft((prev) => ({ ...prev, [type]: { ...prev[type], ...config } }));
  };

  return (
    <Dialog
      visible={visible}
      title={t("menu.zonePointsRow")}
      message={t("menu.zonePointsDialog.message")}
      confirmLabel={t("common.save")}
      onConfirm={() => onConfirm(draft)}
      onCancel={onCancel}
      scrollable
    >
      {ZONE_TYPES.map((type) => (
        <Accordion
          key={type}
          label={
            <Text style={[styles.label, { color: colors.primaryText }]}>
              {t(ZONE_TYPE_LABEL_KEY[type])}
            </Text>
          }
          expanded={expanded[type]}
          onToggleExpanded={() =>
            setExpanded((prev) => ({ ...prev, [type]: !prev[type] }))
          }
        >
          <View style={styles.content}>
            <NumberPickerField
              label={t("menu.zonePointsDialog.rowsLabel")}
              value={draft[type].rows}
              options={buildRangeOptions(MIN_ZONE_ROWS, ZONE_MAX_GRID[type].rows)}
              onChange={(rows) => updateConfig(type, { rows })}
            />
            <NumberPickerField
              label={t("menu.zonePointsDialog.colsLabel")}
              value={draft[type].cols}
              options={buildRangeOptions(MIN_ZONE_COLS, ZONE_MAX_GRID[type].cols)}
              onChange={(cols) => updateConfig(type, { cols })}
            />
          </View>
        </Accordion>
      ))}
    </Dialog>
  );
}

const styles = StyleSheet.create({
  label: {
    paddingVertical: 8,
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    paddingTop: 8,
  },
});

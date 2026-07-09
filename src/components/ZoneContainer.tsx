import { View, StyleSheet, DimensionValue } from "react-native";
import { InjectionButton } from "./InjectionButton";
import { ZONE_LAYOUT, ZONE_MIRROR_MAP, ZONE_TYPE, BUTTONS_BY_ZONE } from "../data/zones";
import { ButtonColor, ThemeMode, ZoneId } from "../types";
import { useTheme } from "../theme/ThemeContext";

// Combined fill/stroke opacity baked into the colour (matches the
// fill-opacity 0.22 / stroke-opacity 0.88, both under a 0.78 group opacity,
// from the Figma "with buttons" frame, node 27:744, file grYg39698ogy0nEBd88Fup).
// Used with ThemeColors.zoneColors in dark theme.
const DARK_FILL_ALPHA = "2C"; // ~17%
const DARK_BORDER_ALPHA = "AF"; // ~69%
// Light theme pairs these with LIGHT_COLORS.zoneColors' darker shades and
// also raises the alpha itself, since the same faint wash reads even less
// visibly against the light app background.
const LIGHT_FILL_ALPHA = "4D"; // ~30%
const LIGHT_BORDER_ALPHA = "CC"; // ~80%

function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}

interface Props {
  zoneId: ZoneId;
  mirrored: boolean;
  getColor: (buttonId: string) => ButtonColor;
  isCheckmarked: (buttonId: string) => boolean;
  onPress: (buttonId: string) => void;
  onLongPress: (buttonId: string) => void;
}

// A zone is an absolutely positioned block matching its region on the body
// image (same position/size/colours as the source Figma design). The buttons
// inside are laid out on a flex grid relative to that block, not by global
// (x, y) coordinates — same row/column counts as the source design.
export function ZoneContainer({
  zoneId,
  mirrored,
  getColor,
  isCheckmarked,
  onPress,
  onLongPress,
}: Props) {
  // Mirror mode swaps a zone into its left/right counterpart's screen
  // position (button identity/colour stays tied to zoneId), and flips the
  // left-to-right order of buttons within each row to match.
  const layout = ZONE_LAYOUT[mirrored ? ZONE_MIRROR_MAP[zoneId] : zoneId];
  const { colors, resolvedScheme } = useTheme();
  const isLight = resolvedScheme === ThemeMode.Light;
  const zoneColors = colors.zoneColors[ZONE_TYPE[zoneId]];
  const fillAlpha = isLight ? LIGHT_FILL_ALPHA : DARK_FILL_ALPHA;
  const borderAlpha = isLight ? LIGHT_BORDER_ALPHA : DARK_BORDER_ALPHA;
  const rows = chunk(BUTTONS_BY_ZONE[zoneId], layout.cols).map((row) =>
    mirrored ? [...row].reverse() : row,
  );

  return (
    <View
      style={[
        styles.zone,
        {
          left: `${(layout.x * 100).toFixed(2)}%` as DimensionValue,
          top: `${(layout.y * 100).toFixed(2)}%` as DimensionValue,
          width: `${(layout.width * 100).toFixed(2)}%` as DimensionValue,
          height: `${(layout.height * 100).toFixed(2)}%` as DimensionValue,
          backgroundColor: `${zoneColors.accent}${fillAlpha}`,
          borderColor: `${zoneColors.accent}${borderAlpha}`,
        },
      ]}
    >
      {rows.map((row, i) => (
        <View key={i} style={styles.row}>
          {row.map((btn) => (
            <InjectionButton
              key={btn.id}
              id={btn.id}
              color={getColor(btn.id)}
              glowColor={zoneColors.glow}
              showCheckmark={isCheckmarked(btn.id)}
              onPress={() => onPress(btn.id)}
              onLongPress={() => onLongPress(btn.id)}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  zone: {
    position: "absolute",
    borderWidth: 1.5,
    borderRadius: 14,
    flexDirection: "column",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    width: "100%",
  },
});

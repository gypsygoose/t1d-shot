import Svg, { Path } from "react-native-svg";
import { ICON_SIZE } from "../../constants";
import { useTheme } from "../../theme";

const ICON_STROKE_WIDTH = 2;

export function BackIcon() {
  const { colors } = useTheme();
  return (
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 12H5M5 12L12 19M5 12L12 5"
        stroke={colors.icon}
        strokeWidth={ICON_STROKE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

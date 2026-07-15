import { StyleProp, ViewStyle } from "react-native";
import { Gender } from "../../types";
import { MaleBodyImage } from "./MaleBodyImage";
import { FemaleBodyImage } from "./FemaleBodyImage";

interface BodyImageProps {
  gender: Gender;
  style?: StyleProp<ViewStyle>;
}

// Picks which body silhouette renders behind the injection points, based on
// the gender setting — see CLAUDE.md's "Gender".
export function BodyImage({ gender, style }: BodyImageProps) {
  return gender === Gender.Female ? (
    <FemaleBodyImage style={style} />
  ) : (
    <MaleBodyImage style={style} />
  );
}

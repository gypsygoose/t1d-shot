import { ReactNode } from "react";

// A drill-down page that slides in from the right over the primary page's
// content (e.g. MenuSheet's Settings page sliding over its menu rows) —
// see CLAUDE.md's MenuSheet folder-structure entry.
export interface BottomSheetSecondaryPage {
  visible: boolean;
  title: string;
  onBack: () => void;
  children: ReactNode;
}

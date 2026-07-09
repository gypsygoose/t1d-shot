// Theme-dependent chrome colors — everything that visually differs between
// light and dark mode. Domain/status colors (ButtonColor cycle, per-zone
// accent/glow, toast status colors) are deliberately NOT here: they carry
// fixed semantic meaning and read fine on either background (see CLAUDE.md's
// "Toast statuses" / "Button colour state machine" sections).
export interface ThemeColors {
  background: string; // root screen / bottom bar background
  icon: string; // bottom-menu icon default fill/stroke
  iconDisabled: string; // bottom-menu icon disabled fill/stroke
  surface: string; // card/sheet/toast background
  primaryText: string; // title/label/value text on a surface
  secondaryText: string; // message/info body text
  mutedText: string; // field labels/descriptions
  sectionLabel: string; // faint uppercase section titles
  cardBorder: string; // hairline border on a surface
  divider: string; // hairline row/section divider
  modalOverlay: string; // full-screen modal backdrop scrim
  primaryAction: string; // confirm/primary button background
  destructive: string; // destructive action background/label
  // Label color for text sitting directly on primaryAction/destructive
  // buttons — those backgrounds are fixed, saturated colors in both themes
  // (see DARK_COLORS/LIGHT_COLORS below), so their label needs a fixed
  // high-contrast color too, independent of primaryText.
  actionLabel: string;
  cancelButtonBorder: string;
  cancelButtonText: string;
  cancelButtonBackground: string;
  switchThumb: string;
  switchTrackOn: string;
  switchTrackOff: string;
  screenTitle: string; // app title text — sits directly on the root background
  bottomSheetBackdrop: string; // lighter than modalOverlay, content stays legible while dragged
  bottomSheetHandle: string; // sheet drag-handle pill
}

export const DARK_COLORS: ThemeColors = {
  background: "#080C18",
  icon: "#FFFFFF",
  iconDisabled: "#4A5568",
  surface: "#141824",
  primaryText: "#FFFFFF",
  secondaryText: "rgba(255,255,255,0.6)",
  mutedText: "rgba(255,255,255,0.5)",
  sectionLabel: "rgba(255,255,255,0.4)",
  cardBorder: "rgba(255,255,255,0.1)",
  divider: "rgba(255,255,255,0.08)",
  modalOverlay: "rgba(0,0,0,0.7)",
  primaryAction: "#2563EB",
  destructive: "#DC2626",
  actionLabel: "#FFFFFF",
  cancelButtonBorder: "rgba(255,255,255,0.2)",
  cancelButtonText: "rgba(255,255,255,0.7)",
  cancelButtonBackground: "rgba(255,255,255,0.06)",
  switchThumb: "#FFFFFF",
  switchTrackOn: "#16A34A",
  switchTrackOff: "rgba(255,255,255,0.15)",
  screenTitle: "rgba(255,255,255,0.26)",
  bottomSheetBackdrop: "rgba(0,0,0,0.6)",
  bottomSheetHandle: "rgba(255,255,255,0.2)",
};

export const LIGHT_COLORS: ThemeColors = {
  background: "#F1F3F8",
  icon: "#1F2937",
  iconDisabled: "#B0B8C4",
  surface: "#FFFFFF",
  primaryText: "#0F172A",
  secondaryText: "rgba(15,23,42,0.85)",
  mutedText: "rgba(15,23,42,0.75)",
  sectionLabel: "rgba(15,23,42,0.65)",
  cardBorder: "rgba(15,23,42,0.1)",
  divider: "rgba(15,23,42,0.08)",
  modalOverlay: "rgba(0,0,0,0.35)",
  primaryAction: "#2563EB",
  destructive: "#DC2626",
  actionLabel: "#FFFFFF",
  cancelButtonBorder: "rgba(15,23,42,0.15)",
  cancelButtonText: "rgba(15,23,42,0.65)",
  cancelButtonBackground: "rgba(15,23,42,0.05)",
  switchThumb: "#FFFFFF",
  switchTrackOn: "#16A34A",
  switchTrackOff: "rgba(15,23,42,0.12)",
  screenTitle: "rgba(15,23,42,0.55)",
  bottomSheetBackdrop: "rgba(0,0,0,0.3)",
  bottomSheetHandle: "rgba(15,23,42,0.2)",
};

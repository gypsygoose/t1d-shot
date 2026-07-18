import { TranslationKey } from "../../i18n";
import { AppEventType } from "../../types";

export const UNDO_TOAST_KEY: Record<AppEventType, TranslationKey> = {
  [AppEventType.Injection]: "toast.undo.injection",
  [AppEventType.Blackout]: "toast.undo.blackout",
  [AppEventType.ManualBlock]: "toast.undo.manualBlock",
  [AppEventType.ManualUnblock]: "toast.undo.manualUnblock",
  [AppEventType.ManualClear]: "toast.undo.manualClear",
  [AppEventType.ClearSelected]: "toast.undo.clearSelected",
  [AppEventType.Import]: "toast.undo.import",
};

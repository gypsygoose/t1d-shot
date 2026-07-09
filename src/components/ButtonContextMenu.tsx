import { ButtonColor, StoredButtonState } from "../types";
import { getBlackoutEndAt } from "../logic/stateMachine";
import { ContextMenu, ContextMenuItem } from "./common/ContextMenu";
import { BUTTON_ADDRESS } from "../data/zones";
import { CLEAR_LABEL, MARK_LABEL, MINUTES_PER_DAY } from "../constants";
import { formatDateTime } from "../format";

interface Props {
  visible: boolean;
  buttonId?: string;
  zoneLabel?: string;
  color?: ButtonColor;
  buttonState?: StoredButtonState;
  now: number;
  onBlock: () => void;
  onUnblock: () => void;
  onMark: () => void;
  onClear: () => void;
  onCancel: () => void;
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "0 мин";
  const totalMinutes = Math.ceil(ms / 60_000);
  const days = Math.floor(totalMinutes / MINUTES_PER_DAY);
  const hours = Math.floor((totalMinutes % MINUTES_PER_DAY) / 60);
  const minutes = totalMinutes % 60;
  const parts: string[] = [];
  if (days > 0) parts.push(`${days} дн`);
  if (days > 0 || hours > 0) parts.push(`${hours} ч`);
  parts.push(`${minutes} мин`);
  return parts.join(" ");
}

export function ButtonContextMenu({
  visible,
  buttonId,
  zoneLabel,
  color,
  buttonState,
  now,
  onBlock,
  onUnblock,
  onMark,
  onClear,
  onCancel,
}: Props) {
  const isGray = color === ButtonColor.Gray;
  const isBlack = color === ButtonColor.Black;
  const blackoutEndAt = buttonState ? getBlackoutEndAt(buttonState) : undefined;
  const address = buttonId ? BUTTON_ADDRESS[buttonId] : undefined;

  const infoLines: string[] = [];
  if (buttonState?.lastInjectionAt !== undefined) {
    infoLines.push(
      `Последняя отметка: ${formatDateTime(buttonState.lastInjectionAt)}`,
    );
  }
  if (isGray && buttonState?.manuallyBlockedAt !== undefined) {
    infoLines.push(
      `Заблокировано вручную: ${formatDateTime(buttonState.manuallyBlockedAt)}`,
    );
  }
  if (isBlack && blackoutEndAt !== undefined) {
    infoLines.push(
      `Заблокировано системой.\nДо разблокировки: ${formatCountdown(blackoutEndAt - now)}`,
    );
  }

  const items: ContextMenuItem[] = [];
  if (isGray) {
    items.push({ key: "unblock", label: "Разблокировать", onPress: onUnblock });
  }
  if (!isGray && !isBlack) {
    items.push({ key: "block", label: "Заблокировать", onPress: onBlock });
    items.push({ key: "mark", label: MARK_LABEL, onPress: onMark });
  }
  items.push({
    key: "clear",
    label: CLEAR_LABEL,
    onPress: onClear,
    destructive: true,
  });

  return (
    <ContextMenu
      visible={visible}
      title={zoneLabel ? `Точка · ${zoneLabel}` : "Действия с точкой"}
      subtitle={
        address
          ? `РЯД ${address.row}, МЕСТО ${address.column} (от центра тела)`
          : undefined
      }
      infoLines={infoLines}
      items={items}
      onCancel={onCancel}
    />
  );
}

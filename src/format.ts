export const SECONDS_PER_MINUTE = 60;

export function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

// Russian pluralization for "день/дня/дней" (day/days), e.g. 1 → "день",
// 2 → "дня", 5 → "дней".
export function pluralDays(n: number): string {
  const mod100 = n % 100;
  const mod10 = n % 10;
  if (mod10 === 1 && mod100 !== 11) return "день";
  if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return "дня";
  return "дней";
}

export function splitSeconds(totalSeconds: number): {
  minutes: number;
  seconds: number;
} {
  return {
    minutes: Math.floor(totalSeconds / SECONDS_PER_MINUTE),
    seconds: totalSeconds % SECONDS_PER_MINUTE,
  };
}

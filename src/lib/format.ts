import type { OpeningHours } from "@/types";

export const TIME_ZONE = "Asia/Kolkata";

const MONTHS = [
  "જાન્યુ",
  "ફેબ્રુ",
  "માર્ચ",
  "એપ્રિલ",
  "મે",
  "જૂન",
  "જુલાઈ",
  "ઓગ",
  "સપ્ટે",
  "ઓક્ટો",
  "નવે",
  "ડિસે",
];

export const DAYS = ["સોમવાર", "મંગળવાર", "બુધવાર", "ગુરુવાર", "શુક્રવાર", "શનિવાર", "રવિવાર"];

/** "YYYY-MM-DD" for a date in Rajkot's time zone. */
export function toIsoDay(date: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(date);
}

export function addDays(isoDay: string, days: number) {
  const date = new Date(`${isoDay}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function daysBetween(fromIso: string, toIso: string) {
  const ms = Date.parse(`${toIso}T00:00:00Z`) - Date.parse(`${fromIso}T00:00:00Z`);
  return Math.round(ms / 86_400_000);
}

function parts(isoDay: string) {
  const [year, month, day] = isoDay.split("-").map(Number);
  return { year, month, day };
}

/** "20 ઓક્ટો" */
export function formatShortDate(isoDay: string) {
  const { month, day } = parts(isoDay);
  return `${day} ${MONTHS[month - 1]}`;
}

/** "20 ઓક્ટો સુધી" */
export function formatUntil(isoDay: string) {
  return `${formatShortDate(isoDay)} સુધી`;
}

/** "10 ઓક્ટો – 20 ઓક્ટો 2026" */
export function formatRange(fromIso: string, toIso: string) {
  return `${formatShortDate(fromIso)} – ${formatShortDate(toIso)} ${parts(toIso).year}`;
}

/** "2 દિવસમાં પૂરી થશે" */
export function formatEndsIn(daysLeft: number) {
  if (daysLeft <= 0) return "આજે પૂરી થશે";
  return `${daysLeft} દિવસમાં પૂરી થશે`;
}

export const ENDING_SOON_DAYS = 3;

/** "21:00" → "રાત્રે 9" */
export function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  const period = h < 12 ? "સવારે" : h < 16 ? "બપોરે" : h < 20 ? "સાંજે" : "રાત્રે";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${period} ${hour12}${m ? `:${String(m).padStart(2, "0")}` : ""}`;
}

export function formatHours(hours: OpeningHours) {
  if (!hours.opens || !hours.closes) return "બંધ";
  return `${formatTime(hours.opens)} – ${formatTime(hours.closes)}`;
}

/** Day index (0 = Monday) and minutes since midnight in Rajkot. */
export function rajkotClock(now: Date) {
  const formatted = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => formatted.find((p) => p.type === type)?.value ?? "";
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return {
    day: weekdays.indexOf(get("weekday")),
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

function toMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export interface OpenStatus {
  open: boolean;
  text: string;
}

export function getOpenStatus(hours: OpeningHours[], now: Date): OpenStatus {
  const { day, minutes } = rajkotClock(now);
  const today = hours.find((h) => h.day === day);

  if (today?.opens && today.closes) {
    if (minutes >= toMinutes(today.opens) && minutes < toMinutes(today.closes)) {
      return { open: true, text: `હમણાં ખુલ્લું • ${formatTime(today.closes)} સુધી` };
    }
    if (minutes < toMinutes(today.opens)) {
      return { open: false, text: `હમણાં બંધ • ${formatTime(today.opens)} વાગ્યે ખુલશે` };
    }
  }

  for (let i = 1; i <= 7; i++) {
    const next = hours.find((h) => h.day === (day + i) % 7);
    if (next?.opens) {
      const when = i === 1 ? "કાલે " : `${DAYS[next.day]} `;
      return { open: false, text: `હમણાં બંધ • ${when}${formatTime(next.opens)} વાગ્યે ખુલશે` };
    }
  }
  return { open: false, text: "હમણાં બંધ" };
}

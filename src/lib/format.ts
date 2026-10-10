import type { Locale } from "@/lib/i18n/config";
import type { T } from "@/lib/i18n/translate";
import type { OpeningHours } from "@/types";

export const TIME_ZONE = "Asia/Kolkata";

/** Words used when writing dates, times and opening status in each language. */
const WORDS = {
  en: {
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    until: (date: string) => `Until ${date}`,
    endsToday: "Ends today",
    endsTomorrow: "Ends tomorrow",
    endsIn: (days: number) => `Ends in ${days} days`,
    time: (hour12: string, h: number) => `${hour12} ${h < 12 ? "AM" : "PM"}`,
    closed: "Closed",
    openUntil: (time: string) => `Open now • until ${time}`,
    opensAt: (time: string) => `Closed now • opens at ${time}`,
    opensOn: (day: string | null, time: string) => `Closed now • opens ${day ?? "tomorrow"} at ${time}`,
    closedNow: "Closed now",
  },
  gu: {
    months: ["જાન્યુ", "ફેબ્રુ", "માર્ચ", "એપ્રિલ", "મે", "જૂન", "જુલાઈ", "ઓગ", "સપ્ટે", "ઓક્ટો", "નવે", "ડિસે"],
    days: ["સોમવાર", "મંગળવાર", "બુધવાર", "ગુરુવાર", "શુક્રવાર", "શનિવાર", "રવિવાર"],
    until: (date: string) => `${date} સુધી`,
    endsToday: "આજે પૂરી થશે",
    endsTomorrow: "કાલે પૂરી થશે",
    endsIn: (days: number) => `${days} દિવસમાં પૂરી થશે`,
    time: (hour12: string, h: number) =>
      `${h < 12 ? "સવારે" : h < 16 ? "બપોરે" : h < 20 ? "સાંજે" : "રાત્રે"} ${hour12}`,
    closed: "બંધ",
    openUntil: (time: string) => `હમણાં ખુલ્લું • ${time} સુધી`,
    opensAt: (time: string) => `હમણાં બંધ • ${time} વાગ્યે ખુલશે`,
    opensOn: (day: string | null, time: string) => `હમણાં બંધ • ${day ?? "કાલે"} ${time} વાગ્યે ખુલશે`,
    closedNow: "હમણાં બંધ",
  },
} satisfies Record<Locale, unknown>;

/** Day names, Monday first. */
export function dayNames(locale: Locale) {
  return WORDS[locale].days;
}

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

/** "20 Oct" */
export function formatShortDate(isoDay: string, locale: Locale) {
  const { month, day } = parts(isoDay);
  return `${day} ${WORDS[locale].months[month - 1]}`;
}

/** "Until 20 Oct" */
export function formatUntil(isoDay: string, locale: Locale) {
  return WORDS[locale].until(formatShortDate(isoDay, locale));
}

/** "10 Oct – 20 Oct 2026" */
export function formatRange(fromIso: string, toIso: string, locale: Locale) {
  return `${formatShortDate(fromIso, locale)} – ${formatShortDate(toIso, locale)} ${parts(toIso).year}`;
}

/** "Ends in 2 days" */
export function formatEndsIn(daysLeft: number, locale: Locale) {
  const words = WORDS[locale];
  if (daysLeft <= 0) return words.endsToday;
  if (daysLeft === 1) return words.endsTomorrow;
  return words.endsIn(daysLeft);
}

export const ENDING_SOON_DAYS = 3;

/** "1 offer", "5 offers" */
export function formatOfferCount(count: number, t: T) {
  return t(count === 1 ? "{count} offer" : "{count} offers", { count });
}

/** "21:00" → "9 PM", "09:30" → "9:30 AM" (Gujarati: "રાત્રે 9") */
export function formatTime(time: string, locale: Locale) {
  const [h, m] = time.split(":").map(Number);
  const hour12 = `${h % 12 === 0 ? 12 : h % 12}${m ? `:${String(m).padStart(2, "0")}` : ""}`;
  return WORDS[locale].time(hour12, h);
}

export function formatHours(hours: OpeningHours, locale: Locale) {
  if (!hours.opens || !hours.closes) return WORDS[locale].closed;
  return `${formatTime(hours.opens, locale)} – ${formatTime(hours.closes, locale)}`;
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

export function getOpenStatus(hours: OpeningHours[], now: Date, locale: Locale): OpenStatus {
  const words = WORDS[locale];
  const { day, minutes } = rajkotClock(now);
  const today = hours.find((h) => h.day === day);

  if (today?.opens && today.closes) {
    if (minutes >= toMinutes(today.opens) && minutes < toMinutes(today.closes)) {
      return { open: true, text: words.openUntil(formatTime(today.closes, locale)) };
    }
    if (minutes < toMinutes(today.opens)) {
      return { open: false, text: words.opensAt(formatTime(today.opens, locale)) };
    }
  }

  for (let i = 1; i <= 7; i++) {
    const next = hours.find((h) => h.day === (day + i) % 7);
    if (next?.opens) {
      return { open: false, text: words.opensOn(i === 1 ? null : words.days[next.day], formatTime(next.opens, locale)) };
    }
  }
  return { open: false, text: words.closedNow };
}

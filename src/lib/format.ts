import type { OpeningHours } from "@/types";

export const TIME_ZONE = "Asia/Kolkata";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

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
export function formatShortDate(isoDay: string) {
  const { month, day } = parts(isoDay);
  return `${day} ${MONTHS[month - 1]}`;
}

/** "Until 20 Oct" */
export function formatUntil(isoDay: string) {
  return `Until ${formatShortDate(isoDay)}`;
}

/** "10 Oct – 20 Oct 2026" */
export function formatRange(fromIso: string, toIso: string) {
  return `${formatShortDate(fromIso)} – ${formatShortDate(toIso)} ${parts(toIso).year}`;
}

/** "Ends in 2 days" */
export function formatEndsIn(daysLeft: number) {
  if (daysLeft <= 0) return "Ends today";
  if (daysLeft === 1) return "Ends tomorrow";
  return `Ends in ${daysLeft} days`;
}

export const ENDING_SOON_DAYS = 3;

/** "1 offer", "5 offers" */
export function formatOfferCount(count: number) {
  return `${count} ${count === 1 ? "offer" : "offers"}`;
}

/** "21:00" → "9 PM", "09:30" → "9:30 AM" */
export function formatTime(time: string) {
  const [h, m] = time.split(":").map(Number);
  const period = h < 12 ? "AM" : "PM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}${m ? `:${String(m).padStart(2, "0")}` : ""} ${period}`;
}

export function formatHours(hours: OpeningHours) {
  if (!hours.opens || !hours.closes) return "Closed";
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
      return { open: true, text: `Open now • until ${formatTime(today.closes)}` };
    }
    if (minutes < toMinutes(today.opens)) {
      return { open: false, text: `Closed now • opens at ${formatTime(today.opens)}` };
    }
  }

  for (let i = 1; i <= 7; i++) {
    const next = hours.find((h) => h.day === (day + i) % 7);
    if (next?.opens) {
      const when = i === 1 ? "tomorrow " : `${DAYS[next.day]} `;
      return { open: false, text: `Closed now • opens ${when}at ${formatTime(next.opens)}` };
    }
  }
  return { open: false, text: "Closed now" };
}

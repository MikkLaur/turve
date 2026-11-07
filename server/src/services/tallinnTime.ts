// Tallinn wall-clock helpers (ported from kamblakoda's businessTime.ts). Dates are 'YYYY-MM-DD' strings, times 'HH:MM'.
export const TALLINN_TZ = 'Europe/Tallinn';

const YMD_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const partsFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: TALLINN_TZ,
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

const ymdFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TALLINN_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

function ymdParts(ymd: string): [number, number, number] {
  const [y, m, d] = ymd.split('-').map(Number);
  return [y ?? NaN, m ?? NaN, d ?? NaN];
}

/** Tallinn's offset from UTC at an instant, in minutes (120 in winter, 180 in summer). */
function offsetMinutes(instant: Date): number {
  const parts = partsFormatter.formatToParts(instant);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
  return (asUtc - instant.getTime()) / 60_000;
}

/** Tallinn wall-clock time on a Tallinn date ('YYYY-MM-DD', 'HH:MM') → UTC instant. */
export function tallinnLocalToUtc(ymd: string, time: string): Date {
  const [y, m, d] = ymdParts(ymd);
  const [hh = NaN, mm = NaN] = time.split(':').map(Number);
  const naive = Date.UTC(y, m - 1, d, hh, mm, 0);
  const first = offsetMinutes(new Date(naive));
  const candidate = naive - first * 60_000;
  const second = offsetMinutes(new Date(candidate));
  return new Date(second === first ? candidate : naive - second * 60_000);
}

/** UTC instant → Tallinn calendar date 'YYYY-MM-DD'. */
export function tallinnYmd(instant: Date): string {
  return ymdFormatter.format(instant);
}

export function addDaysYmd(ymd: string, days: number): string {
  const [y, m, d] = ymdParts(ymd);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** ISO weekday of a date: 1 = Monday … 7 = Sunday. */
export function isoWeekdayOfYmd(ymd: string): number {
  const [y, m, d] = ymdParts(ymd);
  return ((new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7) + 1;
}

/** A real calendar date in 'YYYY-MM-DD' form (2026-02-30 is not). */
export function isValidYmd(value: string): boolean {
  return YMD_PATTERN.test(value) && addDaysYmd(value, 0) === value;
}

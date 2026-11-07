// Free consultation times. Pure (no DB): the controllers pass in the hours, blocked days, taken starts and the DB's "now".
import { addDaysYmd, isoWeekdayOfYmd, tallinnLocalToUtc, tallinnYmd } from '../services/tallinnTime';

/** A call lasts 20 minutes; starts are 30 minutes apart, which leaves a buffer between calls. */
export const CALL_MINUTES = 20;
export const SLOT_STEP_MINUTES = 30;
/** There are no notifications, so the owner must have time to see a booking in kapsaaed first. */
export const LEAD_HOURS = 16;
/** Today plus 20 more Tallinn dates. */
export const HORIZON_DAYS = 21;

export interface HoursRow {
  /** ISO weekday: 1 = Monday … 7 = Sunday */
  weekday: number;
  /** 'HH:MM', Tallinn time */
  startTime: string;
  endTime: string;
}

export interface DaySlots {
  /** Tallinn date 'YYYY-MM-DD' */
  date: string;
  /** Start times as UTC ISO strings (Date#toISOString()) */
  slots: string[];
}

/**
 * Free consultation start times. A slot is offered when:
 *  - it lies on a date from tallinnYmd(now) through HORIZON_DAYS - 1 days later, which is not blocked;
 *  - it starts at a window's startTime + k × SLOT_STEP_MINUTES and the call (CALL_MINUTES) ends by the window's endTime;
 *  - it starts at or after now + LEAD_HOURS;
 *  - no taken start is less than SLOT_STEP_MINUTES away from it.
 * Days without slots are left out. Slots within a day are sorted and unique (overlapping windows don't duplicate).
 */
export function freeSlots(input: { hours: readonly HoursRow[]; blockedDays: ReadonlySet<string>; takenStarts: readonly Date[]; now: Date }): DaySlots[] {
  const stepMs = SLOT_STEP_MINUTES * 60_000;
  const callMs = CALL_MINUTES * 60_000;
  const earliest = input.now.getTime() + LEAD_HOURS * 3_600_000;
  const taken = input.takenStarts.map((date) => date.getTime());
  const today = tallinnYmd(input.now);

  const days: DaySlots[] = [];
  for (let offset = 0; offset < HORIZON_DAYS; offset++) {
    const date = addDaysYmd(today, offset);
    if (input.blockedDays.has(date)) continue;
    const weekday = isoWeekdayOfYmd(date);
    const starts = new Set<number>();
    for (const window of input.hours) {
      if (window.weekday !== weekday) continue;
      const windowEnd = tallinnLocalToUtc(date, window.endTime).getTime();
      for (let start = tallinnLocalToUtc(date, window.startTime).getTime(); start + callMs <= windowEnd; start += stepMs) {
        if (start < earliest) continue;
        if (taken.some((t) => Math.abs(t - start) < stepMs)) continue;
        starts.add(start);
      }
    }
    if (starts.size) {
      days.push({ date, slots: [...starts].sort((a, b) => a - b).map((ms) => new Date(ms).toISOString()) });
    }
  }
  return days;
}

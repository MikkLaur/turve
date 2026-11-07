import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { freeSlots, HoursRow } from '../src/consultation/slots';

// 2026-11-09 is a Monday; Tallinn is UTC+2 until 28.03.2027, then UTC+3.
const MONDAY_EVENING: HoursRow[] = [{ weekday: 1, startTime: '17:00', endTime: '19:00' }];
const NOW = new Date('2026-11-08T10:00:00Z');
const none = new Set<string>();
const times = (date: string) => ['15:00', '15:30', '16:00', '16:30'].map((t) => `${date}T${t}:00.000Z`);

describe('freeSlots', () => {
  it('offers every 30 minutes in the window, while the 20-minute call still fits, for 21 days', () => {
    const days = freeSlots({ hours: MONDAY_EVENING, blockedDays: none, takenStarts: [], now: NOW });
    assert.deepEqual(
      days.map((d) => d.date),
      ['2026-11-09', '2026-11-16', '2026-11-23'],
    );
    // 18:30 + 20 min ends 18:50 ≤ 19:00, so it is offered; 19:00 is not.
    assert.deepEqual(days[0]!.slots, times('2026-11-09'));
    assert.deepEqual(days[2]!.slots, times('2026-11-23'));
  });

  it('skips blocked days', () => {
    const days = freeSlots({ hours: MONDAY_EVENING, blockedDays: new Set(['2026-11-16']), takenStarts: [], now: NOW });
    assert.deepEqual(
      days.map((d) => d.date),
      ['2026-11-09', '2026-11-23'],
    );
  });

  it('leaves out slots less than 30 minutes from a taken start', () => {
    const days = freeSlots({ hours: MONDAY_EVENING, blockedDays: none, takenStarts: [new Date('2026-11-09T15:10:00Z')], now: NOW });
    assert.deepEqual(days[0]!.slots, ['2026-11-09T16:00:00.000Z', '2026-11-09T16:30:00.000Z']);
  });

  it('keeps 16 hours of lead time', () => {
    const days = freeSlots({ hours: MONDAY_EVENING, blockedDays: none, takenStarts: [], now: new Date('2026-11-09T00:00:00Z') });
    assert.equal(days[0]!.date, '2026-11-09');
    assert.deepEqual(days[0]!.slots, ['2026-11-09T16:00:00.000Z', '2026-11-09T16:30:00.000Z']);
  });

  it('follows the change to summer time', () => {
    const days = freeSlots({
      hours: [{ weekday: 1, startTime: '17:00', endTime: '17:30' }],
      blockedDays: none,
      takenStarts: [],
      now: new Date('2027-03-20T10:00:00Z'),
    });
    assert.deepEqual(days, [
      { date: '2027-03-22', slots: ['2027-03-22T15:00:00.000Z'] },
      { date: '2027-03-29', slots: ['2027-03-29T14:00:00.000Z'] },
      { date: '2027-04-05', slots: ['2027-04-05T14:00:00.000Z'] },
    ]);
  });

  it('does not duplicate slots from overlapping windows', () => {
    const days = freeSlots({ hours: [...MONDAY_EVENING, ...MONDAY_EVENING], blockedDays: none, takenStarts: [], now: NOW });
    assert.deepEqual(days[0]!.slots, times('2026-11-09'));
  });

  it('offers nothing without opening hours', () => {
    assert.deepEqual(freeSlots({ hours: [], blockedDays: none, takenStarts: [], now: NOW }), []);
  });
});

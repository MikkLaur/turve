import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { addDaysYmd, isValidYmd, isoWeekdayOfYmd, tallinnLocalToUtc, tallinnYmd } from '../src/services/tallinnTime';

describe('tallinnTime', () => {
  it('converts Tallinn wall-clock time to UTC in winter and summer', () => {
    assert.equal(tallinnLocalToUtc('2026-11-09', '17:00').toISOString(), '2026-11-09T15:00:00.000Z');
    // Summer time from 28.03.2027
    assert.equal(tallinnLocalToUtc('2027-03-29', '17:00').toISOString(), '2027-03-29T14:00:00.000Z');
  });

  it('gives the Tallinn calendar date of an instant', () => {
    assert.equal(tallinnYmd(new Date('2026-11-08T22:30:00Z')), '2026-11-09');
    assert.equal(tallinnYmd(new Date('2026-11-08T21:59:00Z')), '2026-11-08');
  });

  it('knows ISO weekdays, adds days and validates dates', () => {
    assert.equal(isoWeekdayOfYmd('2026-11-09'), 1);
    assert.equal(isoWeekdayOfYmd('2026-11-08'), 7);
    assert.equal(addDaysYmd('2026-12-31', 1), '2027-01-01');
    assert.equal(isValidYmd('2026-02-28'), true);
    assert.equal(isValidYmd('2026-02-30'), false);
    assert.equal(isValidYmd('2026-2-3'), false);
  });
});

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BILLING_STEP_MINUTES, GROUPS, PACKAGES, RATES, priceCents } from '../src/catalog/catalog';
import { parseSelection, priceSelection, SelectionError } from '../src/catalog/pricing';

describe('catalog', () => {
  it('has unique package ids with valid groups and rates', () => {
    const ids = PACKAGES.map((p) => p.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const pkg of PACKAGES) {
      assert.ok(GROUPS.some((g) => g.id === pkg.group), pkg.id);
      assert.ok(RATES.some((r) => r.id === pkg.rate), pkg.id);
      assert.ok(pkg.maxQty >= 1, pkg.id);
      assert.ok(pkg.includes.et.length === pkg.includes.en.length, `${pkg.id}: et/en includes differ in length`);
    }
  });

  it('bills whole 15-minute steps and whole cents', () => {
    for (const pkg of PACKAGES) {
      if (pkg.minutes !== null) {
        assert.equal(pkg.minutes % BILLING_STEP_MINUTES, 0, pkg.id);
        const exact = (pkg.minutes * RATES.find((r) => r.id === pkg.rate)!.centsPerHour) / 60;
        assert.equal(exact, priceCents(pkg.minutes, pkg.rate), `${pkg.id} is not a whole number of cents`);
      }
    }
  });
});

describe('parseSelection', () => {
  it('reads the no-JS form string and the JSON list', () => {
    assert.deepEqual(parseSelection('web-company:1, web-extra-page:3'), [
      { id: 'web-company', qty: 1 },
      { id: 'web-extra-page', qty: 3 },
    ]);
    assert.deepEqual(parseSelection([{ id: 'sec-checkup' }]), [{ id: 'sec-checkup', qty: 1 }]);
    assert.deepEqual(parseSelection(''), []);
    assert.deepEqual(parseSelection(undefined), []);
  });

  it('refuses unknown ids, duplicates and quantities out of range', () => {
    assert.throws(() => parseSelection('nope'), SelectionError);
    assert.throws(() => parseSelection('sec-checkup,sec-checkup'), SelectionError);
    assert.throws(() => parseSelection('sec-checkup:2'), SelectionError);
    assert.throws(() => parseSelection('web-extra-page:0'), SelectionError);
    assert.throws(() => parseSelection('web-extra-page:1.5'), SelectionError);
    assert.throws(() => parseSelection([{ id: 'web-company', qty: -1 }]), SelectionError);
    assert.throws(() => parseSelection({ id: 'web-company' }), SelectionError);
    assert.throws(() => parseSelection(Array.from({ length: 31 }, () => ({ id: 'web-company' }))), SelectionError);
  });
});

describe('priceSelection', () => {
  it('prices on the server, separating one-off and monthly', () => {
    const priced = priceSelection(parseSelection('web-company,web-extra-page:3,care-s,sec-partner,mod-new-feature'));
    // 28 h + 3 × 2 h web work at 55 €/h
    assert.equal(priced.onceMinutes, 34 * 60);
    assert.equal(priced.onceCents, 34 * 5500);
    // 1 h web + 4 h security per month
    assert.equal(priced.monthlyMinutes, 5 * 60);
    assert.equal(priced.monthlyCents, 5500 + 4 * 7500);
    assert.equal(priced.needsEstimate, true);
    assert.equal(priced.lines.find((l) => l.id === 'web-extra-page')?.cents, 3 * 2 * 5500);
  });
});

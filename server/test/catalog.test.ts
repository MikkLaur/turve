import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { GROUPS, LAUNCH_OFFER, PACKAGES, RATES, findPackage, priceCents } from '../src/catalog/catalog';
import { offerStatus } from '../src/catalog/launchOffer';
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

  it('has fixed prices in whole euros', () => {
    for (const pkg of PACKAGES) {
      if (pkg.cents !== null) {
        assert.ok(Number.isInteger(pkg.cents) && pkg.cents > 0, pkg.id);
        assert.equal(pkg.cents % 100, 0, `${pkg.id} is not a whole number of euros`);
      }
    }
  });

  it('has exactly one launch offer package, with a priced regular package', () => {
    const offers = PACKAGES.filter((p) => p.offer);
    assert.equal(offers.length, 1);
    assert.equal(offers[0]!.id, LAUNCH_OFFER.packageId);
    assert.equal(typeof findPackage(LAUNCH_OFFER.regularPackageId)?.cents, 'number');
  });

  it('prices hourly work in 15-minute steps', () => {
    assert.equal(priceCents(90, 'web'), 8250);
    assert.equal(priceCents(15, 'security'), 1875);
  });
});

describe('offerStatus', () => {
  it('is open while spots are left and the end date has not passed', () => {
    assert.deepEqual(
      [offerStatus(0, '2026-11-10').left, offerStatus(0, '2026-11-10').open],
      [10, true],
    );
    assert.equal(offerStatus(3, '2026-12-31').open, true);
  });

  it('closes when the spots are taken or the date has passed', () => {
    assert.deepEqual([offerStatus(10, '2026-11-10').left, offerStatus(10, '2026-11-10').open], [0, false]);
    assert.equal(offerStatus(12, '2026-11-10').left, 0);
    assert.deepEqual([offerStatus(3, '2027-01-01').left, offerStatus(3, '2027-01-01').open], [7, false]);
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
    // 790 € + 3 × 49 €
    assert.equal(priced.onceCents, 79000 + 3 * 4900);
    // 39 € + 249 € per month
    assert.equal(priced.monthlyCents, 3900 + 24900);
    assert.equal(priced.needsEstimate, true);
    assert.equal(priced.lines.find((l) => l.id === 'web-extra-page')?.cents, 14700);
    assert.equal(priced.lines.find((l) => l.id === 'mod-new-feature')?.unitCents, null);
  });

  it('needs an estimate for the security fixing service', () => {
    assert.equal(priceSelection(parseSelection('sec-checkup,sec-fix')).needsEstimate, true);
    assert.equal(priceSelection(parseSelection('sec-checkup')).needsEstimate, false);
  });
});

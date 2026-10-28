import { BILLING_STEP_MINUTES, CATALOG_VERSION, PACKAGES, priceCents } from '../../../server/src/catalog/catalog';
import type { PageContext } from '../context';

/** What estimator.js and contact.js need, in the page's language. Prices are display-only; the API re-prices. */
export function catalogForScripts(ctx: PageContext) {
  return {
    version: CATALOG_VERSION,
    step: BILLING_STEP_MINUTES,
    lang: ctx.lang,
    packages: PACKAGES.map((pkg) => ({
      id: pkg.id,
      name: pkg.name[ctx.lang],
      billing: pkg.billing,
      minutes: pkg.minutes,
      maxQty: pkg.maxQty,
      cents: pkg.minutes === null ? null : priceCents(pkg.minutes, pkg.rate),
      note: pkg.priceNote?.[ctx.lang] ?? null,
    })),
    labels: {
      ...ctx.t.estimatorJs,
      perMonth: ctx.t.common.perMonth,
      estimateAfterReview: ctx.t.common.estimateAfterReview,
      summaryEmpty: ctx.t.pricing.summaryEmpty,
      summaryOnce: ctx.t.pricing.summaryOnce,
      summaryMonthly: ctx.t.pricing.summaryMonthly,
      summaryEstimate: ctx.t.pricing.summaryEstimate,
    },
  };
}

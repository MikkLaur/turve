import { CATALOG_VERSION, PACKAGES } from '../../../server/src/catalog/catalog';
import type { PageContext } from '../context';

/** What estimator.js and contact.js need, in the page's language. Prices are display-only; the API re-prices. */
export function catalogForScripts(ctx: PageContext) {
  return {
    version: CATALOG_VERSION,
    lang: ctx.lang,
    packages: PACKAGES.map((pkg) => ({
      id: pkg.id,
      name: pkg.name[ctx.lang],
      billing: pkg.billing,
      maxQty: pkg.maxQty,
      cents: pkg.cents,
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

import { GROUPS, RATES } from '../../../server/src/catalog/catalog';
import { groupSection, pageHead } from '../components';
import type { PageContext, PageOutput } from '../context';
import { euros } from '../format';
import { html, jsonBlock } from '../html';
import { href } from '../routes';
import { catalogForScripts } from './catalogData';

export function pricingPage(ctx: PageContext): PageOutput {
  const { t, lang } = ctx;
  const p = t.pricing;
  const body = html`
    ${pageHead(p.heading, p.lead)}
    <section class="section tight" aria-labelledby="h-rates">
      <div class="wrap">
        <h2 id="h-rates">${p.ratesTitle}</h2>
        <ul class="rates">${RATES.map((rate) => html`<li><span>${rate.name[lang]}</span><strong>${euros(rate.centsPerHour, lang)} / h</strong></li>`)}</ul>
        <p class="muted">${t.common.finalPrices}</p>
        <noscript><p class="notice">${p.noScript}</p></noscript>
        <p class="notice" data-estimator-hint hidden>${p.estimatorHint}</p>
      </div>
    </section>
    ${GROUPS.map((group) => groupSection(group.id, ctx, { selectable: true }))}
    <section class="section alt" aria-labelledby="h-terms">
      <div class="wrap">
        <h2 id="h-terms">${p.termsTitle}</h2>
        <ul class="checklist">${p.terms.map((term) => html`<li>${term}</li>`)}</ul>
        <p class="muted">${t.common.finalPrices}</p>
      </div>
    </section>
    <aside class="estimator-summary" id="estimator-summary" aria-labelledby="h-summary" aria-live="polite" hidden>
      <div class="wrap summary-inner">
        <div>
          <h2 id="h-summary">${p.summaryTitle}</h2>
          <div data-summary-body></div>
        </div>
        <div class="summary-actions">
          <a class="button" data-summary-link href="${href('contact', lang)}">${p.summaryButton}</a>
          <button type="button" class="button ghost" data-summary-clear>${p.summaryClear}</button>
        </div>
      </div>
    </aside>
    ${jsonBlock('catalog', catalogForScripts(ctx))}`;
  return { id: 'pricing', title: p.title, description: p.description, body, scripts: ['js/common.js', 'js/estimator.js'] };
}

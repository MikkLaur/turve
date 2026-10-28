import { GroupId, GROUPS, Package, PACKAGES, priceCents, RATES } from '../../server/src/catalog/catalog';
import type { PageContext } from './context';
import { euros, hours } from './format';
import { html, Raw } from './html';

export function priceLine(pkg: Package, ctx: PageContext): Raw {
  const { lang, t } = ctx;
  if (pkg.minutes === null) {
    const rate = RATES.find((r) => r.id === pkg.rate)!;
    return html`<p class="price"><span class="price-hours">${t.common.estimateAfterReview}</span><span class="price-sum">${t.common.hourlyRate} ${euros(rate.centsPerHour, lang)}</span></p>`;
  }
  const monthly = pkg.billing === 'monthly' ? ` ${t.common.perMonth}` : '';
  return html`<p class="price">
      <span class="price-hours">${hours(pkg.minutes, lang)}${monthly}${pkg.maxQty > 1 ? ` ${t.common.perUnit}` : ''}</span>
      <span class="price-sum">${euros(priceCents(pkg.minutes, pkg.rate), lang)}${monthly}${pkg.maxQty > 1 ? ` ${t.common.perUnit}` : ''}</span>
      ${pkg.priceNote ? html`<span class="price-note">${pkg.priceNote[lang]}</span>` : ''}
    </p>`;
}

/** Selection controls are hidden until estimator.js runs (progressive enhancement). */
function picker(pkg: Package, ctx: PageContext): Raw {
  const { t } = ctx;
  return html`<div class="pick" data-pick="${pkg.id}" hidden>
      <label class="pick-toggle"><input type="checkbox" data-pkg="${pkg.id}"> ${t.pricing.addLabel}</label>
      ${pkg.maxQty > 1 ? html`<label class="pick-qty">${t.pricing.qtyLabel} <input type="number" inputmode="numeric" min="1" max="${pkg.maxQty}" value="1" data-qty="${pkg.id}"></label>` : ''}
    </div>`;
}

export function packageCard(pkg: Package, ctx: PageContext, options: { selectable?: boolean } = {}): Raw {
  const { lang, t } = ctx;
  return html`<article class="package" id="pkg-${pkg.id}" data-package="${pkg.id}">
      <h3>${pkg.name[lang]}</h3>
      <p class="package-summary">${pkg.summary[lang]}</p>
      <details class="package-includes">
        <summary>${t.common.includes}</summary>
        <ul>${pkg.includes[lang].map((item) => html`<li>${item}</li>`)}</ul>
      </details>
      ${priceLine(pkg, ctx)}
      ${options.selectable ? picker(pkg, ctx) : ''}
    </article>`;
}

export function packagesOf(group: GroupId, filter?: (pkg: Package) => boolean): Package[] {
  return PACKAGES.filter((pkg) => pkg.group === group && (!filter || filter(pkg)));
}

export function groupSection(group: GroupId, ctx: PageContext, options: { selectable?: boolean; heading?: string; filter?: (pkg: Package) => boolean } = {}): Raw {
  const info = GROUPS.find((g) => g.id === group)!;
  return html`<section class="section" id="${group}" aria-labelledby="h-${group}">
      <div class="wrap">
        <h2 id="h-${group}">${options.heading ?? info.name[ctx.lang]}</h2>
        <p class="section-lead">${info.intro[ctx.lang]}</p>
        <div class="package-grid">${packagesOf(group, options.filter).map((pkg) => packageCard(pkg, ctx, options))}</div>
      </div>
    </section>`;
}

export function ctaBand(ctx: PageContext, title: string, text: string, buttons: { href: string; label: string; primary?: boolean }[]): Raw {
  return html`<section class="cta-band">
      <div class="wrap">
        <h2>${title}</h2>
        <p>${text}</p>
        <p class="button-row">${buttons.map((b) => html`<a class="button${b.primary ? '' : ' ghost'}" href="${b.href}">${b.label}</a>`)}</p>
      </div>
    </section>`;
}

export function pageHead(heading: string, lead: string): Raw {
  return html`<section class="page-head">
      <div class="wrap">
        <h1>${heading}</h1>
        <p class="lead">${lead}</p>
      </div>
    </section>`;
}

import { findPackage, GroupId, GROUPS, LAUNCH_OFFER, Package, PACKAGES } from '../../server/src/catalog/catalog';
import type { PageContext } from './context';
import { euros } from './format';
import { html, jsonBlock, raw, Raw } from './html';
import type { Lang } from './routes';

/** The launch offer's last day as shown on the site: 31.12.2026 / 31 Dec 2026. */
function offerDate(lang: Lang): string {
  const date = new Date(`${LAUNCH_OFFER.endsOn}T12:00:00Z`);
  return lang === 'et'
    ? new Intl.DateTimeFormat('et-EE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'UTC' }).format(date)
    : new Intl.DateTimeFormat('en-IE', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(date);
}

function regularPrice(lang: Lang): string {
  return euros(findPackage(LAUNCH_OFFER.regularPackageId)!.cents!, lang);
}

/** "For our first 10 clients until 31.12.2026": shown as is without JS; offer.js replaces it with the live count. */
export function offerStatusLine(ctx: PageContext): Raw {
  const text = ctx.t.common.offerStatic.replace('{spots}', String(LAUNCH_OFFER.spots)).replace('{date}', offerDate(ctx.lang));
  return html`<p class="offer-status" data-offer-status>${text}</p>`;
}

/** Texts for offer.js; {left} and {spots} are filled in the browser from /api/launch-offer. */
export function offerScriptData(ctx: PageContext): Raw {
  const { common } = ctx.t;
  return jsonBlock('offer-labels', {
    left: common.offerLeft,
    full: common.offerFull.replace('{price}', regularPrice(ctx.lang)),
    ended: common.offerEnded.replace('{price}', regularPrice(ctx.lang)),
  });
}

/** The package's fixed price; the launch offer also shows the regular price it replaces. */
export function priceLine(pkg: Package, ctx: PageContext): Raw {
  const { lang, t } = ctx;
  if (pkg.cents === null) {
    return html`<p class="price"><span class="price-sum">${t.common.estimateAfterReview}</span></p>`;
  }
  const suffix = `${pkg.billing === 'monthly' ? ` ${t.common.perMonth}` : ''}${pkg.maxQty > 1 ? ` ${t.common.perUnit}` : ''}`;
  const regular = pkg.offer ? findPackage(LAUNCH_OFFER.regularPackageId) : undefined;
  return html`<p class="price">
      ${regular && regular.cents !== null ? html`<span class="price-was">${t.common.offerRegular} ${euros(regular.cents, lang)}</span>` : ''}
      <span class="price-sum">${euros(pkg.cents, lang)}${suffix}</span>
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
  return html`<article class="package${pkg.offer ? ' offer' : ''}" id="pkg-${pkg.id}" data-package="${pkg.id}"${pkg.offer ? raw(' data-offer-card') : ''}>
      <h3>${pkg.name[lang]}</h3>
      <p class="package-summary">${pkg.summary[lang]}</p>
      ${pkg.offer ? offerStatusLine(ctx) : ''}
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

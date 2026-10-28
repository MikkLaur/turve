import { ctaBand, groupSection, pageHead } from '../components';
import type { PageContext, PageOutput } from '../context';
import { html } from '../html';
import { href } from '../routes';

export function websitesPage(ctx: PageContext): PageOutput {
  const { t, lang } = ctx;
  const w = t.websites;
  const body = html`
    ${pageHead(w.heading, w.lead)}
    ${groupSection('websites', ctx)}
    <section class="section alt" aria-labelledby="h-secure">
      <div class="wrap">
        <h2 id="h-secure">${w.secureTitle}</h2>
        <div class="card-grid two">${w.secure.map((item) => html`<article class="point"><h3>${item.title}</h3><p>${item.text}</p></article>`)}</div>
      </div>
    </section>
    ${groupSection('modernising', ctx, { heading: w.modernHeading })}
    ${groupSection('monthly', ctx, { heading: w.careHeading, filter: (pkg) => pkg.rate === 'web' })}
    ${ctaBand(ctx, w.ctaTitle, w.ctaText, [
      { href: href('check', lang), label: t.common.freeCheck, primary: true },
      { href: href('pricing', lang), label: t.common.seePrices },
    ])}`;
  return { id: 'websites', title: w.title, description: w.description, body };
}

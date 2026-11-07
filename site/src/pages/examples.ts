import { LAUNCH_OFFER } from '../../../server/src/catalog/catalog';
import { ctaBand, pageHead } from '../components';
import type { PageContext, PageOutput } from '../context';
import { html } from '../html';
import { GUIDE } from '../onepager/guide';
import { THEMES } from '../onepager/themes';
import { href } from '../routes';

/** /naidised/ and /en/examples/: the four one-pager demos and what the client needs to send us. */
export function examplesPage(ctx: PageContext): PageOutput {
  const { t, lang } = ctx;
  const e = t.examples;
  const offerContact = `${href('contact', lang)}?p=${LAUNCH_OFFER.packageId}`;
  const body = html`
    ${pageHead(e.heading, e.lead)}
    <section class="section" aria-labelledby="h-designs">
      <div class="wrap">
        <h2 id="h-designs">${e.designsTitle}</h2>
        <div class="card-grid">
          ${THEMES.map(
            (theme) => html`<article class="card">
              <h3>${theme.name[lang]}</h3>
              <p>${theme.description[lang]}</p>
              <div class="button-row">
                <a class="button small" href="/naidised/${theme.id}/">${e.open}</a>
                <a class="button small ghost" href="${offerContact}&teema=${theme.id}">${e.choose}</a>
              </div>
            </article>`,
          )}
        </div>
        <p class="muted examples-note">${e.langNote}</p>
      </div>
    </section>
    <section class="section alt" aria-labelledby="h-need">
      <div class="wrap">
        <h2 id="h-need">${e.needTitle}</h2>
        <p class="section-lead">${e.needLead}</p>
        <ul class="checklist">${GUIDE.map((g) => html`<li><strong>${g.title[lang]}</strong> – ${g.text[lang]}</li>`)}</ul>
      </div>
    </section>
    ${ctaBand(ctx, e.ctaTitle, e.ctaText, [{ href: offerContact, label: t.common.askOffer, primary: true }])}`;
  return { id: 'examples', title: e.title, description: e.description, body };
}

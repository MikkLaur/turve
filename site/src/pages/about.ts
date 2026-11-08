import { COMPANY, PERSON, phoneHref } from '../config';
import { ctaBand, pageHead } from '../components';
import type { PageContext, PageOutput } from '../context';
import { html, type Raw } from '../html';
import { href } from '../routes';

/** /meist/: the person behind Turve – why the company exists, what it means for the client, a reference and direct contact links. */
export function aboutPage(ctx: PageContext): PageOutput {
  const { t, lang, asset, cfg } = ctx;
  const a = t.about;

  const contactLinks: Raw[] = [];
  if (PERSON.linkedin) contactLinks.push(html`<a href="${PERSON.linkedin}" rel="me noopener">${a.linkedin}</a>`);
  if (COMPANY.phone) contactLinks.push(html`<a href="${phoneHref(COMPANY.phone)}">${COMPANY.phone}</a>`);

  const body = html`
    ${pageHead(a.heading, a.lead)}
    <section class="section" aria-labelledby="h-person">
      <div class="wrap person">
        ${PERSON.photo
          ? html`<img class="person-photo" src="${asset(PERSON.photo)}" alt="${PERSON.name ? `${PERSON.name}, ${a.photoAlt}` : a.photoAlt.charAt(0).toUpperCase() + a.photoAlt.slice(1)}" width="320" height="320">`
          : html`<div class="person-photo placeholder" role="img" aria-label="${a.photoAlt}"><span>turve</span></div>`}
        <div>
          <h2 id="h-person">${PERSON.name || a.personTitle}</h2>
          <p class="person-role">${PERSON.role[lang]}</p>
          ${a.personBio.map((paragraph) => html`<p>${paragraph}</p>`)}
          ${contactLinks.length ? html`<p class="person-links">${contactLinks}</p>` : ''}
        </div>
      </div>
    </section>
    <section class="section alt" aria-labelledby="h-for-you">
      <div class="wrap">
        <h2 id="h-for-you">${a.forYouTitle}</h2>
        <div class="card-grid two">${a.forYou.map((point) => html`<article class="point"><h3>${point.title}</h3><p>${point.text}</p></article>`)}</div>
      </div>
    </section>
    <section class="section" aria-labelledby="h-reference">
      <div class="wrap">
        <h2 id="h-reference">${t.home.referenceTitle}</h2>
        <article class="reference">
          <h3>${t.home.referenceName}</h3>
          <p>${t.home.referenceText}</p>
          <p><a href="https://www.kamblakoda.ee/" rel="noopener">${t.home.referenceLink}</a></p>
        </article>
      </div>
    </section>
    ${ctaBand(ctx, t.home.finalTitle, t.home.finalText, [
      { href: href('contact', lang), label: t.common.askOffer, primary: true },
      { href: href('consultation', lang), label: t.common.bookCall },
    ])}`;

  return {
    id: 'about',
    title: a.title,
    description: a.description,
    body,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      mainEntity: {
        '@type': 'Person',
        name: PERSON.name,
        description: a.description,
        ...(PERSON.photo ? { image: new URL(asset(PERSON.photo), cfg.siteOrigin).href } : {}),
        ...(PERSON.linkedin ? { sameAs: [PERSON.linkedin] } : {}),
        ...(COMPANY.phone ? { telephone: COMPANY.phone } : {}),
      },
    },
  };
}

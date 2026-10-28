import { PERSON } from '../config';
import { ctaBand, pageHead } from '../components';
import type { PageContext, PageOutput } from '../context';
import { html } from '../html';
import { href } from '../routes';

export function aboutPage(ctx: PageContext): PageOutput {
  const { t, lang, asset } = ctx;
  const a = t.about;
  const body = html`
    ${pageHead(a.heading, a.lead)}
    <section class="section" aria-labelledby="h-person">
      <div class="wrap person">
        ${PERSON.photo
          ? html`<img class="person-photo" src="${asset(PERSON.photo)}" alt="${a.photoAlt}" width="320" height="320">`
          : html`<div class="person-photo placeholder" role="img" aria-label="${a.photoAlt}"><span>turve</span></div>`}
        <div>
          <h2 id="h-person">${PERSON.name || a.personTitle}</h2>
          <p class="person-role">${PERSON.role[lang]}</p>
          ${a.personBio.map((paragraph) => html`<p>${paragraph}</p>`)}
          ${PERSON.linkedin ? html`<p><a href="${PERSON.linkedin}" rel="noopener">LinkedIn</a></p>` : ''}
        </div>
      </div>
    </section>
    <section class="section alt" aria-labelledby="h-values">
      <div class="wrap">
        <h2 id="h-values">${a.valuesTitle}</h2>
        <div class="card-grid three">${a.values.map((value) => html`<article class="point"><h3>${value.title}</h3><p>${value.text}</p></article>`)}</div>
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
    ${ctaBand(ctx, t.home.finalTitle, t.home.finalText, [{ href: href('contact', lang), label: t.common.askOffer, primary: true }])}`;
  return { id: 'about', title: a.title, description: a.description, body };
}

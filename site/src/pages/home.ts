import { findPackage, priceCents } from '../../../server/src/catalog/catalog';
import { COMPANY } from '../config';
import { ctaBand } from '../components';
import { euros, hours } from '../format';
import type { PageContext, PageOutput } from '../context';
import { html } from '../html';
import { href } from '../routes';

export function homePage(ctx: PageContext): PageOutput {
  const { t, lang, cfg } = ctx;
  const h = t.home;
  const fix = findPackage('mod-security-update')!;
  const marks = { ok: '✓', bad: '✕', warn: '!' } as const;
  const serviceLinks = [href('websites', lang), `${href('websites', lang)}#modernising`, href('security', lang), `${href('pricing', lang)}#monthly`];

  const body = html`
    <section class="hero">
      <div class="wrap hero-inner">
        <div class="hero-text">
        <p class="eyebrow">${h.eyebrow}</p>
        <h1>${h.heroTitle}</h1>
        <p class="lead">${h.heroLead}</p>
        <form class="hero-check" action="${href('check', lang)}" method="get" role="search">
          <label for="hero-domain">${h.heroCheckLabel}</label>
          <div class="input-row">
            <input id="hero-domain" name="domain" type="text" inputmode="url" autocomplete="url" placeholder="${h.heroCheckPlaceholder}" required maxlength="253" spellcheck="false" autocapitalize="off">
            <button class="button" type="submit">${h.heroCheckButton}</button>
          </div>
        </form>
        <p class="button-row"><a class="button ghost on-dark" href="${href('pricing', lang)}">${t.common.seePrices}</a></p>
        </div>
        <div class="terminal" aria-hidden="true">
          <p class="terminal-bar"><span></span><span></span><span></span></p>
          <pre><span class="t-prompt">$</span> ${h.terminalCommand}
${h.terminalLines.map((line) => html`<span class="t-${line.status}">${marks[line.status as keyof typeof marks]}</span> ${line.name.padEnd(12)} ${line.value}
`)}
<span class="t-grade">${h.terminalGrade}</span>
<span class="t-prompt">→</span> ${fix.name[lang]} · ${hours(fix.minutes!, lang)} · ${euros(priceCents(fix.minutes!, fix.rate), lang)}</pre>
        </div>
      </div>
    </section>

    <section class="section" aria-labelledby="h-services">
      <div class="wrap">
        <h2 id="h-services">${h.servicesTitle}</h2>
        <div class="card-grid four">
          ${h.services.map(
            (service, i) => html`<article class="card">
              <h3>${service.title}</h3>
              <p>${service.text}</p>
              <a class="card-link" href="${serviceLinks[i]}">${t.common.readMore}<span aria-hidden="true"> →</span></a>
            </article>`,
          )}
        </div>
      </div>
    </section>

    <section class="section alt" aria-labelledby="h-modern">
      <div class="wrap split">
        <div>
          <h2 id="h-modern">${h.modernTitle}</h2>
          <p>${h.modernText}</p>
          <p><a class="button" href="${href('websites', lang)}#modernising">${t.common.readMore}</a></p>
        </div>
        <ul class="checklist">${h.modernPoints.map((point) => html`<li>${point}</li>`)}</ul>
      </div>
    </section>

    <section class="section" aria-labelledby="h-why">
      <div class="wrap">
        <h2 id="h-why">${h.whyTitle}</h2>
        <div class="card-grid two">
          ${h.why.map((point) => html`<article class="point"><h3>${point.title}</h3><p>${point.text}</p></article>`)}
        </div>
      </div>
    </section>

    <section class="section alt" aria-labelledby="h-process">
      <div class="wrap">
        <h2 id="h-process">${h.processTitle}</h2>
        <ol class="steps">${h.process.map((step) => html`<li><h3>${step.title}</h3><p>${step.text}</p></li>`)}</ol>
      </div>
    </section>

    <section class="section" aria-labelledby="h-reference">
      <div class="wrap">
        <h2 id="h-reference">${h.referenceTitle}</h2>
        <article class="reference">
          <h3>${h.referenceName}</h3>
          <p>${h.referenceText}</p>
          <p><a href="https://www.kamblakoda.ee/" rel="noopener">${h.referenceLink}</a></p>
        </article>
      </div>
    </section>

    ${ctaBand(ctx, h.finalTitle, h.finalText, [
      { href: href('contact', lang), label: t.common.askOffer, primary: true },
      { href: href('pricing', lang), label: t.common.seePrices },
    ])}`;

  return {
    id: 'home',
    title: h.title,
    description: h.description,
    body,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      name: 'Turve',
      ...(COMPANY.legalName ? { legalName: COMPANY.legalName } : {}),
      url: `${cfg.siteOrigin}/`,
      description: h.description,
      areaServed: { '@type': 'Country', name: 'Estonia' },
      knowsLanguage: ['et', 'en'],
      ...(COMPANY.email ? { email: COMPANY.email } : {}),
    },
  };
}

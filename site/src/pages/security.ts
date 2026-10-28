import { ctaBand, groupSection, pageHead } from '../components';
import type { PageContext, PageOutput } from '../context';
import { html } from '../html';
import { href } from '../routes';

export function securityPage(ctx: PageContext): PageOutput {
  const { t, lang } = ctx;
  const s = t.security;
  const body = html`
    ${pageHead(s.heading, s.lead)}
    ${groupSection('security', ctx)}
    ${groupSection('monthly', ctx, { heading: s.partnerHeading, filter: (pkg) => pkg.rate === 'security' })}
    <section class="section alt" aria-labelledby="h-process">
      <div class="wrap">
        <h2 id="h-process">${s.processTitle}</h2>
        <ol class="steps five">${s.process.map((step) => html`<li><h3>${step.title}</h3><p>${step.text}</p></li>`)}</ol>
      </div>
    </section>
    <section class="section" aria-labelledby="h-compliance">
      <div class="wrap">
        <h2 id="h-compliance">${s.complianceTitle}</h2>
        <dl class="definitions">${s.compliance.map((item) => html`<div><dt>${item.name}</dt><dd>${item.text}</dd></div>`)}</dl>
      </div>
    </section>
    <section class="section alt" aria-labelledby="h-principles">
      <div class="wrap">
        <h2 id="h-principles">${s.principlesTitle}</h2>
        <ul class="checklist">${s.principles.map((item) => html`<li>${item}</li>`)}</ul>
      </div>
    </section>
    ${ctaBand(ctx, s.ctaTitle, s.ctaText, [
      { href: href('check', lang), label: t.common.freeCheck, primary: true },
      { href: href('contact', lang), label: t.common.askOffer },
    ])}`;
  return { id: 'security', title: s.title, description: s.description, body };
}

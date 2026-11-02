import { ctaBand, pageHead } from '../components';
import type { PageContext, PageOutput } from '../context';
import { html, jsonBlock } from '../html';
import { href } from '../routes';

/** Browser fingerprint demo. All work happens in assets/js/fingerprint.js, in the visitor's browser; nothing is sent. */
export function fingerprintPage(ctx: PageContext): PageOutput {
  const { t, lang } = ctx;
  const f = t.fingerprint;
  const body = html`
    ${pageHead(f.heading, f.lead)}
    <section class="section tight">
      <div class="wrap">
        <noscript><p class="notice">${f.noScript}</p></noscript>
        <p class="notice" id="fp-status" role="status" hidden></p>
        <div class="fp-top" id="fp-root" hidden>
          <div class="fp-id-card">
            <h2 class="fp-id-title">${f.idTitle}</h2>
            <p class="fp-id" id="fp-id"></p>
            <p class="muted">${f.idText}</p>
            <h3>${f.tryTitle}</h3>
            <ol class="fp-steps">${f.trySteps.map((step) => html`<li>${step}</li>`)}</ol>
            <p class="muted fp-small">${f.changedNote}</p>
          </div>
          <div class="terminal">
            <p class="terminal-bar" aria-hidden="true"><span></span><span></span><span></span></p>
            <h2 class="fp-terminal-title"><span class="t-prompt" aria-hidden="true">$</span> ${f.inferTitle}</h2>
            <ul class="fp-facts" id="fp-facts"></ul>
          </div>
        </div>
      </div>
    </section>

    <section class="section alt" id="fp-signals-section" aria-labelledby="h-fp-signals" hidden>
      <div class="wrap">
        <h2 id="h-fp-signals">${f.signalsTitle}</h2>
        <p class="section-lead">${f.signalsLead}</p>
        <div class="fp-table-wrap">
          <table class="fp-table">
            <thead><tr><th scope="col">${f.columns.signal}</th><th scope="col">${f.columns.value}</th><th scope="col">${f.columns.power}</th></tr></thead>
            <tbody id="fp-signals"></tbody>
          </table>
        </div>
        <p class="muted fp-small">${f.volatileNote}</p>
        <figure class="fp-canvas">
          <div id="fp-canvas"></div>
          <figcaption>${f.canvasCaption}</figcaption>
        </figure>
        <p class="notice">${f.privacyNote}</p>
      </div>
    </section>

    <section class="section" aria-labelledby="h-fp-unique">
      <div class="wrap card-grid two">
        <div>
          <h2 id="h-fp-unique">${f.uniqueTitle}</h2>
          ${f.unique.map((paragraph) => html`<p>${paragraph}</p>`)}
        </div>
        <div>
          <h2>${f.protectTitle}</h2>
          <ul class="checklist">${f.protect.map((tip) => html`<li>${tip}</li>`)}</ul>
        </div>
      </div>
    </section>

    <section class="section alt" aria-labelledby="h-fp-business">
      <div class="wrap">
        <h2 id="h-fp-business">${f.businessTitle}</h2>
        <div class="card-grid two">
          ${f.business.map((point) => html`<article class="point"><h3>${point.title}</h3><p>${point.text}</p></article>`)}
        </div>
      </div>
    </section>

    ${ctaBand(ctx, f.ctaTitle, f.ctaText, [
      { href: href('contact', lang), label: t.common.askOffer, primary: true },
      { href: href('security', lang), label: f.ctaSecurity },
    ])}
    ${jsonBlock('fp-labels', {
      labels: {
        running: f.running,
        failed: f.failed,
        infer: f.infer,
        signals: f.signals,
        power: f.power,
        prefs: f.prefs,
        unavailable: f.unavailable,
        noneFound: f.noneFound,
        yes: f.yes,
        no: f.no,
        charging: f.charging,
        discharging: f.discharging,
        noise: f.noise,
      },
    })}`;
  return { id: 'fingerprint', title: f.title, description: f.description, body, scripts: ['js/common.js', 'js/fingerprint.js'] };
}

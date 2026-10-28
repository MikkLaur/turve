import type { PageContext, PageOutput } from '../context';
import { pageHead } from '../components';
import { html, jsonBlock } from '../html';
import { href } from '../routes';
import { catalogForScripts } from './catalogData';

function field(id: string, label: string, input: ReturnType<typeof html>, hint?: string, optional?: string) {
  return html`<div class="field">
      <label for="f-${id}">${label}${optional ? html` <span class="optional">(${optional})</span>` : ''}</label>
      ${hint ? html`<p class="hint" id="h-${id}">${hint}</p>` : ''}
      ${input}
    </div>`;
}

export function contactPage(ctx: PageContext): PageOutput {
  const { t, lang, cfg } = ctx;
  const c = t.contact;
  const body = html`
    ${pageHead(c.heading, c.lead)}
    <section class="section tight">
      <div class="wrap narrow">
        <div class="selection" id="contact-selection" hidden>
          <h2>${c.selectionTitle}</h2>
          <div data-selection-body></div>
          <p><a data-selection-change href="${href('pricing', lang)}">${c.selectionChange}</a></p>
        </div>
        <p class="notice" id="contact-check" hidden>${c.checkAttached} <strong data-check-domain></strong></p>

        <form class="contact-form" id="contact-form" action="${cfg.apiOrigin}/api/inquiries" method="post" novalidate>
          <p class="notice error" id="contact-error" role="alert" tabindex="-1" hidden></p>
          <input type="hidden" name="lang" value="${lang}">
          <input type="hidden" name="packages" value="">
          <input type="hidden" name="check" value="">
          <input type="hidden" name="token" value="">
          ${field('name', c.name, html`<input id="f-name" name="name" type="text" autocomplete="name" required minlength="2" maxlength="200">`)}
          ${field('company', c.company, html`<input id="f-company" name="company" type="text" autocomplete="organization" maxlength="200">`, undefined, c.optional)}
          ${field('email', c.email, html`<input id="f-email" name="email" type="email" autocomplete="email" required maxlength="254">`)}
          ${field('phone', c.phone, html`<input id="f-phone" name="phone" type="tel" autocomplete="tel" maxlength="40">`, undefined, c.optional)}
          ${field('website', c.website, html`<input id="f-website" name="website" type="text" inputmode="url" maxlength="255" aria-describedby="h-website" spellcheck="false" autocapitalize="off">`, c.websiteHint, c.optional)}
          ${field('message', c.message, html`<textarea id="f-message" name="message" rows="6" maxlength="5000" aria-describedby="h-message"></textarea>`, c.messageHint)}
          <div class="hp" aria-hidden="true">
            <label for="f-hp">${c.honeypot}</label>
            <input id="f-hp" name="hp" type="text" tabindex="-1" autocomplete="off">
          </div>
          <div class="field consent">
            <label><input id="f-consent" name="consent" type="checkbox" value="on" required> ${c.consentBefore}<a href="${href('privacy', lang)}">${c.consentLink}</a>.</label>
          </div>
          <p><button class="button" type="submit" data-label="${c.submit}" data-sending="${c.sending}">${c.submit}</button></p>
        </form>
      </div>
    </section>
    ${jsonBlock('catalog', catalogForScripts(ctx))}
    ${jsonBlock('contact-labels', { thanksPath: href('thanks', lang), errors: c.errors, ...ctx.t.estimatorJs })}`;
  return { id: 'contact', title: c.title, description: c.description, body, scripts: ['js/common.js', 'js/contact.js'] };
}

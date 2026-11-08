import { COMPANY } from '../config';
import { formField as field, pageHead } from '../components';
import type { PageContext, PageOutput } from '../context';
import { html, jsonBlock } from '../html';
import { href } from '../routes';

const TOPICS = ['website', 'modernising', 'security', 'other'] as const;

/** /konsultatsioon/: pick a free time (booking.js, from /api/consultations/slots) and book a 20-minute phone call. */
export function consultationPage(ctx: PageContext): PageOutput {
  const { t, lang } = ctx;
  const k = t.consultation;
  const c = t.contact;
  const contactLink = html`<a href="${href('contact', lang)}">${k.writeUs}</a>`;
  const body = html`
    ${pageHead(k.heading, k.lead)}
    <section class="section tight">
      <div class="wrap narrow">
        <h2>${k.whatTitle}</h2>
        <ul class="checklist">${k.what.map((item) => html`<li>${item}</li>`)}</ul>
        <noscript><p class="notice">${k.noScript} ${contactLink}</p></noscript>

        <div class="booking" id="booking" hidden>
          <h2>${k.pickDay}</h2>
          <p class="notice error" data-picker-error role="alert" hidden></p>
          <p class="muted" data-booking-status>${k.loading}</p>
          <p data-booking-fallback hidden>${contactLink}</p>
          <div class="slot-grid" data-days role="group" aria-label="${k.pickDay}"></div>
          <h2 data-times-title hidden>${k.pickTime}</h2>
          <div class="slot-grid" data-times role="group" aria-label="${k.pickTime}"></div>
          <p class="muted" data-times-note hidden>${k.timesNote}</p>
        </div>

        <form class="contact-form" id="booking-form" novalidate hidden>
          <h2>${k.formTitle}</h2>
          <p class="notice">${k.chosen} <strong data-chosen></strong> <button type="button" class="button ghost small" data-change>${k.change}</button></p>
          <p class="notice error" id="booking-error" role="alert" tabindex="-1" hidden></p>
          <input type="hidden" name="lang" value="${lang}">
          <input type="hidden" name="startsAt" value="">
          <input type="hidden" name="token" value="">
          ${field('name', c.name, html`<input id="f-name" name="name" type="text" autocomplete="name" required minlength="2" maxlength="200">`)}
          ${field('company', c.company, html`<input id="f-company" name="company" type="text" autocomplete="organization" maxlength="200">`, undefined, c.optional)}
          ${field('phone', c.phone, html`<input id="f-phone" name="phone" type="tel" autocomplete="tel" required minlength="5" maxlength="40" aria-describedby="h-phone">`, k.phoneHint)}
          ${field('email', c.email, html`<input id="f-email" name="email" type="email" autocomplete="email" required maxlength="254">`)}
          ${field(
            'topic',
            k.topic,
            html`<select id="f-topic" name="topic">
              <option value="">—</option>
              ${TOPICS.map((topic) => html`<option value="${topic}">${k.topics[topic]}</option>`)}
            </select>`,
            undefined,
            c.optional,
          )}
          ${field('message', k.message, html`<textarea id="f-message" name="message" rows="4" maxlength="2000"></textarea>`, undefined, c.optional)}
          <div class="hp" aria-hidden="true">
            <label for="f-hp">${c.honeypot}</label>
            <input id="f-hp" name="hp" type="text" tabindex="-1" autocomplete="off">
          </div>
          <div class="field consent">
            <label><input id="f-consent" name="consent" type="checkbox" value="on" required> ${c.consentBefore}<a href="${href('privacy', lang)}">${c.consentLink}</a>.</label>
          </div>
          <p><button class="button" type="submit" data-label="${k.submit}" data-sending="${k.sending}">${k.submit}</button></p>
        </form>

        <div id="booking-done" hidden>
          <h2>${k.doneTitle}</h2>
          <p data-done-text></p>
          <p><button type="button" class="button" data-ics>${k.addToCalendar}</button></p>
        </div>
      </div>
    </section>
    ${jsonBlock('booking-labels', {
      loading: k.loading,
      noSlots: k.noSlots,
      loadError: k.loadError,
      doneText: k.doneText,
      icsSummary: k.icsSummary,
      email: COMPANY.email,
      errors: { ...k.errors, fields: c.errors.fields, network: c.errors.network },
    })}`;
  return { id: 'consultation', title: k.title, description: k.description, body, scripts: ['js/common.js', 'js/booking.js'] };
}

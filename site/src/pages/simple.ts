import { COMPANY } from '../config';
import { pageHead } from '../components';
import type { PageContext, PageOutput } from '../context';
import { html } from '../html';
import { href } from '../routes';
import { en } from '../i18n/en';
import { et } from '../i18n/et';

export function thanksPage(ctx: PageContext): PageOutput {
  const { t, lang } = ctx;
  const body = html`
    <section class="page-head">
      <div class="wrap narrow">
        <h1>${t.thanks.heading}</h1>
        <p class="lead">${t.thanks.text}</p>
        <p><a class="button" href="${href('home', lang)}">${t.thanks.back}</a></p>
      </div>
    </section>`;
  return { id: 'thanks', title: t.thanks.title, description: t.thanks.description, body, noindex: true };
}

/** Fills {legalName}-style tokens from COMPANY; missing values stay visible as [legalName] so they get noticed. */
function fillCompany(text: string): string {
  return text.replace(/\{(legalName|regCode|address|email)\}/g, (_m, key: keyof typeof COMPANY) => COMPANY[key] || `[${key}]`);
}

export function privacyPage(ctx: PageContext): PageOutput {
  const p = ctx.t.privacy;
  const body = html`
    ${pageHead(p.heading, p.description)}
    <section class="section tight">
      <div class="wrap narrow prose">
        ${p.sections.map(
          (section) => html`<h2>${section.title}</h2>${section.paragraphs.map((paragraph) => html`<p>${fillCompany(paragraph)}</p>`)}`,
        )}
      </div>
    </section>`;
  return { id: 'privacy', title: p.title, description: p.description, body };
}

/** One bilingual 404 page (Apache ErrorDocument serves it for any language). */
export function notFoundPage(_ctx: PageContext): PageOutput {
  const body = html`
    <section class="page-head">
      <div class="wrap narrow">
        <h1>${et.notFound.heading}</h1>
        <p class="lead">${et.notFound.text}</p>
        <p><a class="button" href="${href('home', 'et')}">${et.notFound.back}</a></p>
        <div lang="en">
          <h2>${en.notFound.heading}</h2>
          <p>${en.notFound.text}</p>
          <p><a class="button ghost" href="${href('home', 'en')}">${en.notFound.back}</a></p>
        </div>
      </div>
    </section>`;
  return { id: null, title: `${et.notFound.title} · ${en.notFound.heading}`, description: et.notFound.text, body, noindex: true };
}

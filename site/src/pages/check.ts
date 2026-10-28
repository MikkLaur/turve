import { pageHead } from '../components';
import type { PageContext, PageOutput } from '../context';
import { html, jsonBlock } from '../html';
import { href } from '../routes';

export function checkPage(ctx: PageContext): PageOutput {
  const { t, lang } = ctx;
  const c = t.check;
  const body = html`
    ${pageHead(c.heading, c.lead)}
    <section class="section tight">
      <div class="wrap narrow">
        <form class="check-form" id="check-form" action="${href('check', lang)}" method="get" role="search" novalidate>
          <label for="check-domain">${c.label}</label>
          <div class="input-row">
            <input id="check-domain" name="domain" type="text" inputmode="url" autocomplete="url" placeholder="${c.placeholder}" required maxlength="253" spellcheck="false" autocapitalize="off">
            <button class="button" type="submit">${c.button}</button>
          </div>
        </form>
        <noscript><p class="notice">${c.noScript}</p></noscript>
        <p class="notice" id="check-status" role="status" hidden></p>
        <div id="check-result" aria-live="polite"></div>
      </div>
    </section>
    <section class="section alt">
      <div class="wrap card-grid two">
        <div><h2>${c.whatTitle}</h2><ul class="checklist">${c.what.map((item) => html`<li>${item}</li>`)}</ul></div>
        <div><h2>${c.notTitle}</h2><ul class="checklist cross">${c.not.map((item) => html`<li>${item}</li>`)}</ul></div>
      </div>
    </section>
    ${jsonBlock('check-labels', {
      lang,
      contactPath: href('contact', lang),
      labels: {
        running: c.running,
        errors: c.errors,
        resultFor: c.resultFor,
        grade: c.grade,
        score: c.score,
        status: c.status,
        fix: c.fix,
        evidence: c.evidence,
        problemsTitle: c.problemsTitle,
        okTitle: c.okTitle,
        noProblems: c.noProblems,
        suggestionsTitle: c.suggestionsTitle,
        suggestionsText: c.suggestionsText,
        askOffer: c.askOffer,
        checkedAt: c.checkedAt,
        estimateAfterReview: t.common.estimateAfterReview,
      },
    })}`;
  return { id: 'check', title: c.title, description: c.description, body, scripts: ['js/common.js', 'js/check.js'] };
}

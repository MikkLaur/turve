import { findPackage } from '../../../server/src/catalog/catalog';
import { fillCompany } from '../config';
import { offerBand, offerScriptData } from '../components';
import type { PageContext, PageOutput } from '../context';
import { euros } from '../format';
import { GIVEAWAY, utcIso, WINNER_PATH } from '../giveaway';
import { html, jsonBlock, type Raw } from '../html';
import { href } from '../routes';

/** The rules' anchor: the Facebook post links to https://www.turve.ee/loos/#reeglid. */
const RULES_ID = 'reeglid';
const UNITS = ['days', 'hours', 'minutes', 'seconds'] as const;

/** A rule's text: `backticks` become code and {privacy} a link to the privacy page (the full address, as in the post). */
function ruleText(text: string, ctx: PageContext): Raw[] {
  const privacy = href('privacy', ctx.lang);
  return text.split(/(`[^`]+`|\{privacy\})/).map((part) => {
    if (part === '{privacy}') return html`<a href="${privacy}">${ctx.cfg.siteOrigin}${privacy}</a>`;
    if (/^`[^`]+`$/.test(part)) return html`<code>${part.slice(1, -1)}</code>`;
    return html`${part}`;
  });
}

/**
 * The winner, behind a "Näita võitjat" button (<details>: works without JS). Empty fields make the <template> that
 * giveaway.js fills when the winner is published while the page is open. giveaway.js plays the reveal on top.
 */
function winnerReveal(ctx: PageContext, winner?: { company: string; business: string }): Raw {
  const g = ctx.t.giveaway;
  return html`<details class="winner" data-winner>
            <summary class="button winner-button">${g.showWinner}</summary>
            <div class="winner-card">
              <p class="terminal-bar" aria-hidden="true"><span></span><span></span><span></span></p>
              <div class="winner-body">
                <p class="winner-cmd"><span class="t-prompt" aria-hidden="true">$</span> ${g.drawCommand}</p>
                <p class="winner-title">${g.winnerTitle}</p>
                <p class="winner-company" data-winner-company>${winner?.company ?? ''}</p>
                <p class="winner-business" data-winner-business>${winner?.business ?? ''}</p>
                <p class="winner-congrats">${g.congrats}</p>
              </div>
            </div>
          </details>`;
}

/**
 * The page head's draw block, by phase: countdown to the deadline, countdown to the reveal, waiting for the winner, the
 * winner. Without JS only the text line (or the <details> winner) shows. giveaway.js moves through the states on the
 * visitor's clock. Screen readers get the text line; the digits are hidden from them, so nothing ticks.
 */
function drawBlock(ctx: PageContext): Raw {
  const g = ctx.t.giveaway;
  const phase = ctx.giveaway;
  const winner = phase === 'drawn' || phase === 'ended' ? GIVEAWAY.winner : undefined;
  const state = phase === 'open' ? 'entries' : phase === 'closed' ? 'waiting' : winner ? 'winner' : 'drawing';
  const text = state === 'entries' ? g.when : state === 'waiting' ? g.closed : g.drawing;
  return html`<div class="draw" data-draw data-state="${state}">
          ${winner
            ? ''
            : html`<div class="countdown" role="timer" aria-live="off" data-countdown>
            <p class="countdown-when" data-countdown-when>${text}</p>
            <div class="countdown-digits" aria-hidden="true" data-countdown-digits hidden>
              ${UNITS.map((unit) => html`<span class="countdown-box"><span class="countdown-num" data-unit="${unit}"></span><span class="countdown-unit">${g.units[unit]}</span></span>`)}
            </div>
          </div>`}
          <div data-reveal>${winner ? winnerReveal(ctx, winner) : html`<template data-winner-template>${winnerReveal(ctx)}</template>`}</div>
          <p class="visually-hidden" aria-live="polite" data-reveal-announce></p>
        </div>`;
}

/** /loos/ (EN /en/giveaway/): the Facebook giveaway, TURVE-014. Entry is a comment under the post; nothing is sent from here. */
export function giveawayPage(ctx: PageContext): PageOutput {
  const { t, lang } = ctx;
  const g = t.giveaway;
  const open = ctx.giveaway === 'open';
  const ended = ctx.giveaway === 'ended';
  const pkg = findPackage(GIVEAWAY.packageId)!;
  const fill = (text: string) => fillCompany(text).replace('{price}', euros(pkg.cents!, lang)).replace('{package}', pkg.name[lang]);
  // An empty postUrl is a build TODO (--strict refuses); a dev build simply leaves the button out.
  const enter = open && GIVEAWAY.postUrl
    ? html`<a class="button" href="${GIVEAWAY.postUrl}" rel="noopener noreferrer" data-giveaway-enter>${g.enter}</a>`
    : '';
  const consult = (primary: boolean) => html`<a class="button${primary ? '' : ' ghost on-dark'}" href="${href('contact', lang)}">${g.consult}</a>`;

  // Until tabUntil the head keeps the giveaway's title and runs the draw block; after it, "Loos on lõppenud".
  const head = html`<section class="page-head">
      <div class="wrap">
        <p class="eyebrow giveaway-eyebrow">${g.eyebrow}</p>
        <h1>${ended ? g.endedHeading : g.heading}</h1>
        <p class="lead">${ended ? g.drawn : fill(g.lead)}</p>
        ${ended && !GIVEAWAY.winner ? '' : drawBlock(ctx)}
        <p class="button-row">${enter}${consult(ended)}</p>
      </div>
    </section>`;

  const body = html`
    ${head}
    <section class="section${open ? '' : ' alt'}" aria-labelledby="h-prize">
      <div class="wrap">
        <h2 id="h-prize">${g.prizeTitle}</h2>
        <ul class="checklist">${g.prize.map((item) => html`<li>${item}</li>`)}</ul>
        <p class="giveaway-note">${g.prizeNote}</p>
      </div>
    </section>
    ${open
      ? html`<section class="section alt" aria-labelledby="h-how">
      <div class="wrap">
        <h2 id="h-how">${g.howTitle}</h2>
        <ol class="steps">${g.how.map((step) => html`<li><p class="step-text">${step}</p></li>`)}</ol>
        <p class="giveaway-note">${g.howNote}</p>
        ${enter ? html`<p class="giveaway-cta">${enter}</p>` : ''}
      </div>
    </section>`
      : ''}
    <section class="section" id="${RULES_ID}" aria-labelledby="h-rules">
      <div class="wrap narrow">
        <h2 id="h-rules">${g.rulesTitle}</h2>
        <ol class="rules">${g.rules.map((rule) => html`<li><strong>${rule.title}:</strong> ${ruleText(fill(rule.text), ctx)}</li>`)}</ol>
      </div>
    </section>
    ${offerBand(ctx, g.offerText)}
    ${offerScriptData(ctx)}
    ${jsonBlock('giveaway-data', {
      endsAt: utcIso(GIVEAWAY.endsAt),
      drawAt: utcIso(GIVEAWAY.drawAt),
      closed: g.closed,
      drawing: g.drawing,
      announce: g.winnerAnnounce,
      winnerUrl: WINNER_PATH,
    })}`;

  return {
    id: 'giveaway',
    title: ended ? g.endedTitle : g.title,
    description: fill(g.description),
    body,
    scripts: ['js/common.js', 'js/offer.js', 'js/giveaway.js'],
    // Once it has ended the page stays up for the rules but leaves search and the sitemap (build.ts).
    noindex: ended,
  };
}

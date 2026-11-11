import { findPackage } from '../../server/src/catalog/catalog';

/**
 * The Facebook giveaway (TURVE-014): a gold "Loos" tab first in the nav and the page /loos/ (EN /en/giveaway/) with a
 * countdown, the prize and the rules. Static only: people enter with a comment under the Facebook post, and nothing
 * about the giveaway is sent to the API or stored.
 *
 * Timeline: entries close at endsAt, then a second countdown runs to drawAt, when the winner is revealed on /loos/.
 * The owner draws at drawAt, sets `winner` and deploys the site: the build then writes /loos/voitja.json. Pages that
 * were open while the file didn't exist yet play the reveal live (giveaway.js polls for it); later visitors get a
 * "Näita võitjat" button. The tab and the indexed page stay until tabUntil; the first build after that drops the tab
 * and shows the ended page (noindex, out of the sitemap). Older builds hide the tab in the browser (common.js).
 *
 * The copy names the dates in words too (i18n giveaway.*, rules point 5): change them together with these. The build
 * lists a TODO when the countdown label or the closed text no longer match endsAt and drawAt.
 */
export interface Giveaway {
  /** Entries close. ISO 8601 with the Tallinn offset (+02:00 in winter, +03:00 in summer). */
  endsAt: string;
  /** The draw and the reveal on /loos/, same format. */
  drawAt: string;
  /** The tab and the indexed page stay until then (people come back to see the winner). */
  tabUntil: string;
  /** The Facebook post people comment under. While it is empty, a --strict (deploy) build refuses. */
  postUrl: string;
  /** The prize package in the catalog; its price is the "value over" figure. */
  packageId: string;
  /**
   * Set after the draw, as the entrant wrote it in the comment (rule 9: company name and line of business, no
   * person's name). The build refuses it before drawAt, so the winner can't leak in the page source early.
   */
  winner?: { company: string; business: string };
}

export const GIVEAWAY: Giveaway = {
  endsAt: '2026-11-11T12:00:00+02:00',
  drawAt: '2026-11-11T18:00:00+02:00',
  tabUntil: '2026-11-13T00:00:00+02:00',
  postUrl: 'https://www.facebook.com/permalink.php?story_fbid=122106008649533983&id=61596019515203',
  packageId: 'web-onepage',
};

/**
 * open: entries accepted · closed: countdown to the reveal · drawn: reveal (or waiting for the winner to be published)
 * · ended: after tabUntil, no tab, noindex. The tab is shown in every phase but 'ended'.
 */
export type GiveawayPhase = 'open' | 'closed' | 'drawn' | 'ended';

export function giveawayPhase(now: number): GiveawayPhase {
  if (now < Date.parse(GIVEAWAY.endsAt)) return 'open';
  if (now < Date.parse(GIVEAWAY.drawAt)) return 'closed';
  return now < Date.parse(GIVEAWAY.tabUntil) ? 'drawn' : 'ended';
}

/** Where the published winner lives (both languages read the same file). */
export const WINNER_PATH = '/loos/voitja.json';

/** An unambiguous UTC timestamp for the browser scripts, e.g. 2026-11-11T10:00:00.000Z. */
export function utcIso(iso: string): string {
  return new Date(iso).toISOString();
}

function isFacebookLink(text: string): boolean {
  try {
    const url = new URL(text);
    return url.protocol === 'https:' && (url.hostname === 'facebook.com' || url.hostname.endsWith('.facebook.com'));
  } catch {
    return false;
  }
}

/** Mistakes in GIVEAWAY fail the build: they would put a wrong date, a broken link or an early winner on the page. */
export function checkGiveaway(now: number): void {
  const endsAt = Date.parse(GIVEAWAY.endsAt);
  const drawAt = Date.parse(GIVEAWAY.drawAt);
  const tabUntil = Date.parse(GIVEAWAY.tabUntil);
  if ([endsAt, drawAt, tabUntil].some(Number.isNaN) || drawAt < endsAt || tabUntil < drawAt) {
    throw new Error('GIVEAWAY.endsAt, drawAt and tabUntil must be ISO dates with an offset, in that order (site/src/giveaway.ts).');
  }
  if (GIVEAWAY.winner && now < drawAt) {
    throw new Error('GIVEAWAY.winner is set before the draw: it would be in the page source early. Set it after drawAt (site/src/giveaway.ts).');
  }
  if (GIVEAWAY.winner && (!GIVEAWAY.winner.company.trim() || !GIVEAWAY.winner.business.trim())) {
    throw new Error('GIVEAWAY.winner needs both company and business (site/src/giveaway.ts).');
  }
  if (GIVEAWAY.postUrl && !isFacebookLink(GIVEAWAY.postUrl)) {
    throw new Error('GIVEAWAY.postUrl must be the https://www.facebook.com/… link of the post (site/src/giveaway.ts).');
  }
  const pkg = findPackage(GIVEAWAY.packageId);
  if (!pkg || pkg.cents === null) {
    throw new Error(`GIVEAWAY.packageId ${GIVEAWAY.packageId} is not a catalog package with a fixed price (site/src/giveaway.ts).`);
  }
}

/** How a time reads in the copy, in Tallinn time: et "11.11", en "11 Nov", both "12:00". */
export function tallinnWords(iso: string): { et: string; en: string; time: string } {
  const date = new Date(iso);
  const format = (locale: string, options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale, { timeZone: 'Europe/Tallinn', ...options }).format(date);
  return {
    et: format('et-EE', { day: 'numeric', month: 'numeric' }),
    en: format('en-IE', { day: 'numeric', month: 'short' }),
    time: format('et-EE', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }),
  };
}

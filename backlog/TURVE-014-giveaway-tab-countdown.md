---
status: doing
area: site
created: 2026-11-08
due: 2026-11-09
blocked-by:
---

# TURVE-014: "Loos" tab with a countdown, page `/loos/`

Marketing request. We run a Facebook giveaway (one free one-page site) until **Wednesday 11.11.2026 12:00 Tallinn time**; the draw is the same day at 18:00. The site needs a golden, slightly pulsing nav tab **"Loos"** that leads to a page with a live countdown, the prize, how to enter and the rules. The Facebook post and its ad send people to this page for the rules; the site gives the campaign a place to land, but entry happens only as a comment under the Facebook post.

Marketing source of truth (texts, plan, rules): `reklaamikampaania/material/2026-11-08-kodulehe-loos/` (`README.md`, `copy.md`, `rules.md`). The copy below is final unless the owner changes it.

**Needs to be live by Monday 9.11 morning** (the ad starts running then). A deploy needs the owner's go (CLAUDE.md): ask before it.

## Rules (from CLAUDE.md, unchanged)
- Markup only through the escaping `html` tag. **No inline JS or CSS** (CSP). Browser JS uses `textContent` only. `en.ts` is typed against `et.ts`: every key in both.
- No third-party scripts, embeds, analytics, pixels, fonts. **No Facebook plugin or iframe**: the Facebook link is a plain outbound link.
- The giveaway has no API and no DB: it is a static page plus one small JS file. Do not touch the catalog, `Inquiries` or the launch-offer counter.
- turve.ee must still score A on its own check (headers unchanged).
- Estonian formal "teie", no exclamation marks, "üheleheline" (not "ühelehine").

## 1. Config (single source)
One constant in `site/src/config.ts` (or a small `giveaway.ts`), used by build, page and JS data block:

```ts
export const GIVEAWAY = {
  endsAt: '2026-11-11T12:00:00+02:00', // entries close (Tallinn winter time, UTC+2)
  drawAt: '2026-11-11T18:00:00+02:00',
  postUrl: 'https://www.facebook.com/permalink.php?story_fbid=122106008649533983&id=61596019515203', // the live Facebook post (public, published 2026-11-08)
};
```
- An empty `postUrl` must show up in the build's **content TODO list** and make `--strict` fail (same mechanism as `COMPANY`/`PERSON`), so it can't ship without the link. The page's anchor `#reeglid` must work independently of it.
- Build **after** `endsAt` (build time): the nav tab is not rendered at all and the page shows the "ended" state (below). So the tab disappears on the first redeploy after the deadline.

## 2. The tab
- New page id `giveaway`: ET `/loos/`, EN `/en/giveaway/`. Nav labels: ET **"Loos"**, EN **"Giveaway"**.
- Shown in the header nav **and** the footer nav, as the **first** item (on mobile the nav scrolls sideways, so the last item would be hidden).
- Style: **gold**, modest. A gold pill: background `#f2c14e`, text ink `#0d1b2a`, 0.35 rem 0.8 rem padding, radius 0.5 rem, weight 600. Same in light and dark mode. Define `--gold: #f2c14e` and `--gold-glow: rgba(242, 193, 78, 0.55)` in the `:root` of `site.css`. Verify the contrast of text on gold is at least 4.5:1 (it is about 10:1 with ink) and the focus outline stays visible.
- **Gold is only for this tab, the countdown digits and the page's eyebrow.** The offer red (`--offer`) is not used here and gold must not appear on the other pages.
- **Slight reverberation:** a soft ring that expands and fades from the pill, looped, using `box-shadow` (no layout shift), about 2.4 s, `ease-out`: from `0 0 0 0 var(--gold-glow)` to `0 0 0 0.6rem rgba(242,193,78,0)`. Subtle, not blinking. Wrapped in `@media (prefers-reduced-motion: no-preference)`; with reduced motion the tab is static gold. It must not animate while the page is the current one (`aria-current="page"` gets a solid ring instead).
- A small live hint inside the tab is **not** wanted (no counter in the nav); the tab is only the word.

## 3. The page `/loos/` (EN `/en/giveaway/`)
Layout: use the existing `page-head` dark band, then normal sections; no new components except the countdown block.

**Page head**
- Eyebrow (mono, gold): `LOOS` / `GIVEAWAY`
- H1 ET: `Loosime välja ühelehelise kodulehe` · EN: `We are giving away a one-page website`
- Lead ET: `Kui teie ettevõttel pole veebilehte või see on vana, saate uue meilt kingituseks, koos domeeni ja majutusega. Väärtus üle 290 €.` · EN: `If your business has no website, or an old one, you can win a new one from us, with the domain and hosting included. Value over €290.`
- Primary button ET: `Osale Facebookis` (link to `GIVEAWAY.postUrl`, `rel="noopener noreferrer"`, opens normally, no `target`) · EN: `Enter on Facebook`
- Ghost button: `Küsi tasuta konsultatsiooni` → contact page (as elsewhere).

**Countdown block** (in the head, under the lead)
- Label ET `Osalemine lõpeb kolmapäeval, 11.11 kell 12:00` · EN `Entries close Wednesday 11 Nov at 12:00 (Estonian time)`
- Digits in IBM Plex Mono, gold, four boxes: ET `päeva · tundi · minutit · sekundit`, EN `days · hours · minutes · seconds`. Numbers zero-padded to two digits.
- **Without JS** the block shows only the static label and date (no fake numbers).
- JS (`site/assets/js/giveaway.js`, loaded only on this page): reads `endsAt` from a `jsonBlock()` data block, updates every second with `textContent`, **no `innerHTML`**. Compute from the visitor's clock; accept that a wrong device clock shows a wrong number (the static date line is the truth).
- Accessibility: the digits container is `role="timer"` and `aria-live="off"`; screen readers get one static sentence ("Osalemine lõpeb 11.11.2026 kell 12:00"). No ticking announcements.
- At zero the block swaps (still by `textContent`) to the closed text, and the primary button is removed:
  ET `Osalemine on lõppenud. Võitja loosime täna kell 18:00 ja teatame Facebookis.` · EN `Entries are closed. We draw the winner today at 18:00 and announce it on Facebook.`

**Sections**
1. **Mida võitja saab / What the winner gets** (checklist, same as `rules.md` point 2): ready design picked together in the free consultation, with the winner's logo and colours · up to 6 content blocks · fast, mobile-friendly, HTTPS and security headers in place · one revision round · small "Kodulehe tegi turve.ee" credit in the footer · **domain and hosting for the first year, bought and set up by us** (ET `Domeen ja majutus esimeseks aastaks: need ostame ja seadistame meie`). Below it: `Tekstid ja pildid annate teie; ütleme täpselt, mida kuhu vaja on.`
2. **Kuidas osaleda / How to enter** (3 steps, existing `.steps`): 1. Avage Facebooki postitus. 2. Kirjutage kommentaaridesse oma ettevõtte nimi ja tegevusala. 3. Oodake kolmapäeva 18:00: võitja saab vastuse kommentaarina ja Messengeris. Underneath: `Üks kommentaar inimese kohta. Jagama ega sõpru märkima ei pea.`
3. **Reeglid / Rules**, `id="reeglid"`: the ten points of `material/2026-11-08-kodulehe-loos/rules.md`, rendered as an ordered list, Estonian text as written there (point 2 now includes domain and hosting; copy it exactly), plus an English translation in `en.ts`. Link to the privacy page inside point 9.
4. **Aastalõpu pakkumine** reminder, using the existing offer band component (so the live counter works): the 99 € one-pager for the first 10 clients stays open regardless of the giveaway.

Page meta: title `Loos: võida ühelehelise kodulehe | Turve`, EN `Giveaway: win a one-page website | Turve`; include in the sitemap and hreflang like the other pages while running.

## 4. After the deadline
- First build after `endsAt`: tab not rendered; page title H1 becomes `Loos on lõppenud` / `The giveaway has ended`, no countdown, no entry button; the rules stay. Winner announcement is **not** on the site unless the owner adds `GIVEAWAY.winnerNote` later (optional ET/EN string shown under the H1; must not name anyone without the owner's go).
- Mark the ended page `noindex` and drop it from the sitemap in that build. A later ticket can remove the page and add a 301 to the home page.
- While the old build is still deployed past the deadline, the JS hides every `[data-giveaway-tab]` link on every page (needs a tiny shared hook in `common.js` or load `giveaway.js` on all pages with `defer`; the developer picks the lighter way; no extra request on pages if it can be avoided, e.g. inline the end time in the existing `common.js` data).

## 5. Done when
- [x] `GIVEAWAY` config: the empty `postUrl` appears in the content TODO list and `--strict` blocks the deploy until it is filled.
- [x] Gold "Loos" / "Giveaway" tab first in the header and footer nav, both languages; subtle pulse only without `prefers-reduced-motion`; contrast checked.
- [x] `/loos/` and `/en/giveaway/` per section 3; countdown ticks without errors, shows static text without JS, flips to the closed text at zero.
- [x] After-deadline behaviour works (test by building with a past `endsAt`, and by faking the clock in the browser).
- [x] No inline JS/CSS, no `innerHTML`, no new third-party requests; `cd site && npm run typecheck && npm run build` pass. Security headers unchanged; run the site's own check on turve.ee again after the deploy.
- [x] Screenshots of the tab and page in light, dark and at 375 px width attached for the owner (look at them yourself first).
- [x] Owner gives the go and `postUrl`; deploy site only; then `https://www.turve.ee/loos/` returns 200 and the nav shows the tab.
- [ ] `reklaamikampaania/material/2026-11-08-kodulehe-loos/copy.md`: the first comment's rules link is `https://www.turve.ee/loos/#reeglid` (marketing updates this once the page is live).

## Out of scope
- Entry forms, entry storage, draw logic, e-mail or notifications on the site. Entries live only in Facebook comments.
- Facebook embed, share buttons, analytics.
- Changes to the catalog, launch offer, kapsaaed or the API.

## Log
- 2026-11-08: Deployed (`DEPLOY_STATIC='site'`; the API was restarted with unchanged code). `postUrl` set (without `&ref=embed_post`). Live: `/loos/` and `/en/giveaway/` 200, tab in the nav, countdown ticks, offer counter live (9 / 10), no console errors, CSP `connect-src 'self' https://api.turve.ee`, admin login with a foreign Origin 403. Still to do: the site's own check, Observatory and SSL Labs on www.turve.ee; marketing points the first comment to `https://www.turve.ee/loos/#reeglid`.
- 2026-11-08: Facebook post is live. `postUrl` = https://www.facebook.com/permalink.php?story_fbid=122106008649533983&id=61596019515203 . The post's first comment currently has no link to /loos/#reeglid; marketing adds it once the page is live.
- 2026-11-08: Owner decided: the winner is revealed on /loos/ at 18:00 (company name and line of business, no person's name); rule 9 changed to say so (site and `rules.md`). Typo "kommentaarisse" → "kommentaaridesse". Built: at 12:00 a second countdown to 18:00; then the page polls `/loos/voitja.json` (written by the build once `GIVEAWAY.winner` is set; the build refuses it before `drawAt`). Pages open when the file appears play the reveal (terminal card, the name decodes in gold); later visitors get a "Näita võitjat" button (`<details>`, works without JS). The tab stays until `GIVEAWAY.tabUntil` (13.11 00:00). CSP `connect-src` now includes `'self'`; `.json` is served no-cache. Tested in headless Chromium incl. a winner published while the page was open.
- 2026-11-08: Built, not deployed. Config `GIVEAWAY` in `site/src/giveaway.ts` (also `packageId`, the prize's price comes from the catalog; optional `winnerNote`). Page `site/src/pages/giveaway.ts`, countdown `site/assets/js/giveaway.js`, tab in `layout.ts`, deadline hook in `common.js` (every page loads `common.js` while the tab is shown: one cached file, no data request). `build(dev, strict, now)` takes a time to preview other phases. Tested in headless Chromium: ticking, no-JS, reduced motion, focus, 375 px, light/dark, fake clocks (11:59:57 → closed text; after 12:00 the tab goes on every page; after 18:00 the drawn text), builds after the deadline (no tab, noindex, out of the sitemap), header on one row from 960 px in both languages. Estonian rules match `rules.md` word for word (with „“ quotes).
- 2026-11-08: Decisions while building: only the header tab pulses (the footer tab is static gold); a second "Osale Facebookis" button under "Kuidas osaleda"; builds after the deadline drop "Kuidas osaleda" and make the consultation button primary. New copy for the owner to check: the meta description, the offer band text on this page ("Ka ilma loosita…"), the after-draw text (`giveaway.drawn`) and the English rules. Side effect: on narrow screens the nav got 0.5 rem room inside its scroll box, so focus rings and the current page's underline are no longer clipped.
- 2026-11-08: Waiting for the owner: the Facebook post URL (`GIVEAWAY.postUrl`; `--strict` refuses without it) and the go to deploy the site. Redeploy after the draw: TURVE-015.
- 2026-11-08: Owner decided: domain and hosting are part of the prize (first year, bought and set up by the owner). Value shown as "over €290"; no domain/hosting TODO any more.
- 2026-11-08: Created from marketing (giveaway plan in `reklaamikampaania/material/2026-11-08-kodulehe-loos/`).

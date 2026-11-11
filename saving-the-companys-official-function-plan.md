# Saving the company's official function: turve.ee launch campaign and site revamp

Handover spec for the implementing model (Sonnet 5.5). Written by Opus on 2026-11-08 for the owner of turve.ee,
revised the same day with the owner's corrections (rates unchanged, no "how did you hear" field, domain-specific demos,
no calendar feed).

### Not in scope (owner decisions, do not add)
- **No "Kust te meist kuulsite?" (how did you hear about us) field** on any form. The owner wants as little on the pages as possible.
- **No calendar feed** or any other notification mechanism.
- **Hourly rates stay as they are** (55 €/h web, 75 €/h security). They only move to the end of /hinnad/.

---

## 0. Read this first

### Why this work exists
- turve.ee is the brand of **Lõvikonserv OÜ** (registry code 16869757). Its main EMTAK activity is Programming (62101). Most of its revenue so far is rent: 90 €/month, 1,080 € a year.
- The Business Register sets the main activity **only from the revenue split in the annual report**: the activity with the most revenue becomes the main one.
- To keep Programming as the main activity, the company must **deliver and invoice more than 1,080 € of web development work by 31.12.2026**. The target is 1,200 €.
- The plan:
  - a **99 € one-pager launch offer for the first 10 clients**;
  - **lower, fixed prices** everywhere;
  - a **free 20-minute consultation** that visitors book in a time slot themselves;
  - a **security fixing service** for companies with no engineer of their own;
  - **template demo sites** that show the client the design and tell them what text to write.

### Business plan (context only, nothing to implement here)
- **Two tracks:** the owner contacts their own network now, and paid ads start once the demos are live (target around 20.11).
- **Launch-offer conditions:**
  - the client supplies texts and photos, guided by the demo;
  - one round of revisions;
  - a small "Kodulehe tegi turve.ee" (site made by turve.ee) footer credit;
  - a template design, with colours and logo adjustable.
- **Last launch-offer orders:** about 14.12, so delivery and invoicing finish by 22.12. Invoice lines say "veebiarendus" (web development).
- **Budget:** Google Ads 300–500 €, Meta 200–400 €, a portrait photo; the rest stays in reserve.
- **Measuring:** there is no analytics and no extra form field. The owner asks each new client how they found turve.ee (on the call or in the reply) and writes it in the inquiry's notes in kapsaaed.

### Project rules you MUST follow (from `CLAUDE.md`, read it fully before starting)
- All site markup goes through the escaping `html` tag in `site/src/html.ts`.
- **No inline JS or CSS** anywhere: CSP is `script-src 'self'; style-src 'self'`, so no `style=""` attributes and no `<script>` with code. JSON data blocks via `jsonBlock()` are fine.
- Browser JS builds the DOM with `textContent` / `createElement` only. Never use `innerHTML`.
- `site/src/i18n/en.ts` is typed against `et.ts`: **every new key goes into both files**, or the typecheck fails.
- Estonian copy uses the formal "teie" form. Keep the existing voice: short, plain, no hype.
- **Never edit an applied migration** (001–004). Add new numbered migrations and append them to `server/src/db/migrations/index.ts`.
- The catalog (`server/src/catalog/catalog.ts`) is the single source of prices.
  - Bump `CATALOG_VERSION` when prices change.
  - **Never reuse a package id.**
- The site build fails on broken internal links. Only link to pages that exist at that step; the steps below say when each link may be added.
- No third-party scripts, fonts, analytics, captcha or embeds (not even a Google Maps iframe).
- Do not touch the SSRF guard (`server/src/check/*`).
- **Ask the owner before:** any real deploy, PM2 restart, live DB write, deleting files on the VM, `git push`.
- Never print values from `.env` or `deployment/deployment.config`.
- **Git:**
  - Commit after each step on the current branch (`turve-ja-arendus`).
  - Short commit messages, **no `Co-Authored-By` trailer** (owner preference).
  - Do not push.

### How to work
- Do the steps **in order**. Each step ends in a working, building, testable state.
- After each step, run:
  - `cd server && npm run typecheck && npm test`
  - `cd site && npm run typecheck && npm run build`
- Fix everything before moving on.
- For local runs, see "Local development" in `CLAUDE.md`. A MariaDB runs at 127.0.0.1:3306 (`turve`/`turve`, db `turve_dev`). Commands: `cd server && npm run migrate:dev && npm run dev`, then `cd site && npm run dev` (site :8080, kapsaaed :8081).
- **STOP and ask the owner** wherever this spec says **OWNER CHECKPOINT**.

### Steps overview
1. Fixed prices; no hours on the site; new packages (including security fixing); rates moved to the end of /hinnad/.
2. Launch offer (99 € × 10) with a live counter and admin toggle.
3. One-pager template kit: 4 demos at `/naidised/<id>/` (concrete works, welding workshop, manicure salon, universal), the `/naidised/` page, and a CLI for client builds.
4. Free 20-minute consultation booking (`/konsultatsioon/`) with admin views.
5. Docs updates.
6. Deploy (OWNER CHECKPOINT).

---

## 1. Decisions already made (do not re-open)

### 1.1 Prices (cents in the catalog, all whole euros)
**OWNER CHECKPOINT (light):** show this table to the owner before committing step 1, and apply any changes they make. If they say "go", use it as is.

| id | group | rate | billing | price (€) | maxQty | status |
|---|---|---|---|---|---|---|
| `web-onepage-launch` | websites | web | once | **99** | 1 | NEW (launch offer) |
| `web-onepage` | websites | web | once | 290 | 1 | |
| `web-company` | websites | web | once | 790 | 1 | |
| `web-extra-page` | websites | web | once | 49 | 20 | |
| `web-extra-language` | websites | web | once | 99 | 3 | |
| `web-texts` | websites | web | once | 69 | 20 | NEW |
| `web-payment-link` | websites | web | once | 79 | 1 | NEW |
| `web-inquiry-admin` | websites | web | once | 490 | 1 | |
| `web-booking` | websites | web | once | 1290 | 1 | |
| `mod-review` | modernising | web | once | 99 | 1 | |
| `mod-security-update` | modernising | web | once | 290 | 1 | |
| `mod-speed-seo` | modernising | web | once | 190 | 1 | |
| `mod-new-look` | modernising | web | once | 890 | 1 | |
| `mod-new-feature` | modernising | web | once | quote (`null`) | 1 | |
| `sec-checkup` | security | security | once | 290 | 1 | |
| `sec-fix` | security | security | once | quote (`null`) | 1 | NEW |
| `sec-pentest-site` | security | security | once | 890 | 1 | |
| `sec-pentest-app` | security | security | once | 1890 | 1 | |
| `sec-retest` | security | security | once | 190 | 1 | |
| `sec-compliance` | security | security | once | 690 | 1 | |
| `care-s` | monthly | web | monthly | 39 / month | 1 | |
| `care-m` | monthly | web | monthly | 99 / month | 1 | |
| `sec-partner` | monthly | security | monthly | 249 / month | 1 | |

- **Hourly rates** (`RATES`) are **unchanged**: web **55 €/h** (`5500`), security **75 €/h** (`7500`). They are shown only in the last section of /hinnad/.
- **Order inside `PACKAGES`:** exactly the order of the table, so the launch offer is the first card in "websites" and `sec-fix` comes right after `sec-checkup`.

### 1.2 Launch offer
```ts
export const LAUNCH_OFFER = {
  packageId: 'web-onepage-launch',
  regularPackageId: 'web-onepage',
  spots: 10,
  /** Last day (Tallinn date) on which an inquiry can take a spot. */
  endsOn: '2026-12-31',
} as const;
```
- An inquiry **takes a spot** when all of these hold:
  - its selection contains `web-onepage-launch`;
  - it is not a honeypot hit;
  - the offer is still open at that moment: fewer than 10 taken, and today (Tallinn) ≤ `endsOn`.
- The DB column is `countsForOffer = 1`.
- **Counter value** = `COUNT(*) FROM Inquiries WHERE countsForOffer = 1 AND status <> 'spam'`. Marking an inquiry spam frees its spot automatically.
- The owner can switch `countsForOffer` on or off for **any** inquiry in kapsaaed, for example to count a client who phoned.
- If the offer is closed when an inquiry with the package arrives, the inquiry **is still stored**, with flag `offer-full` (spots taken) or `offer-ended` (date passed), and `countsForOffer = 0`.
- Two simultaneous inquiries could make the count 11. That's acceptable; the owner fixes it with the toggle. No locking.

### 1.3 Consultation booking
- **Call:**
  - 20 minutes, by phone; the owner calls the visitor.
  - Slots are on a 30-minute grid starting at each availability window's start time.
- **Booking window:**
  - earliest bookable start = DB "now" + **16 h**, because there are no notifications and the owner must see the booking first;
  - horizon **21 days** (today plus 20 more Tallinn dates).
- **Availability:** the owner sets weekly windows (ISO weekday 1 = Monday … 7 = Sunday, `HH:MM`–`HH:MM` Tallinn time) and blocked days in kapsaaed. Nothing is seeded, so with no windows the page shows "no free times".
- **Free slot:** a slot is free when no non-cancelled booking starts less than 30 minutes before or after it.
- **No double booking:** a DB unique index on the active start time prevents exact duplicates.
- **One booking per person:** at most **1 upcoming `booked` consultation per e-mail**.
- **Email and notifications:** no mail is sent and there is no calendar feed. The visitor sees a confirmation and can download an `.ics` file generated in the browser. The owner sees bookings in kapsaaed.
- **Time:** "now" always comes from the DB clock (`SELECT UTC_TIMESTAMP()`), never from `Date.now()` (see `CLAUDE.md`: the DB clock may differ).

### 1.4 Demo templates
- 4 demos, each a specific line of business with its own design:
  - `betoon` "Betoonitööd": concrete laying (foundations, floors, yards); a light concrete-grey design with construction yellow;
  - `keevitus` "Keevitustöökoda": a welder's workshop (gates, railings, repairs); dark steel with spark orange;
  - `manikuur` "Maniküürisalong": a manicure salon; soft and cosy, with rose and serif headings;
  - `universaalne` "Universaalne": an agnostic one for any line of business; calm and neutral.
- Any client can pick any design. Their own logo and colours override the demo's.
- Each demo reads like a **real site for that trade**, with realistic example texts, services and prices.
  - The business name is a clear placeholder: "Teie Betoonitööd", "Teie Keevitustöökoda", "Teie Maniküürisalong", "Teie Ettevõte". Never a made-up real-sounding brand.
  - Testimonial authors are always "Näide: kliendi eesnimi" (example: client's first name), never invented people.
  - **In demo mode** each section also shows a dashed outline, a label chip with the section name, and a short **guide note** saying what the client should write or send for that section, e.g. "✎ 2–3 lauset: mida teete, kellele ja mis teeb teid eriliseks."
  - Demo pages are clearly labelled as examples (a top bar) and have `noindex`.
- No stock photos. Photo spots are CSS placeholder boxes with a caption saying what photo goes there.
- Fonts: system font stacks only, so nothing needs licensing or hosting in client builds.

---

## STEP 1: Fixed prices, no hours on the site, new packages

### 1.1 `server/src/catalog/catalog.ts`
1. Change the `Package` interface:
   ```ts
   export interface Package {
     id: string;
     group: GroupId;
     /** Line of business; also which hourly rate applies to work outside the package. */
     rate: RateId;
     billing: 'once' | 'monthly';
     /** Fixed price per unit in cents (per month for monthly packages). null = price is set after a review or report. */
     cents: number | null;
     /** Highest quantity the estimator offers; 1 = on/off. */
     maxQty: number;
     name: Localized;
     summary: Localized;
     includes: LocalizedList;
     /** Shown next to the price, e.g. costs billed at cost on top. */
     priceNote?: Localized;
     /** true only for the launch offer package (see LAUNCH_OFFER). */
     offer?: true;
   }
   ```
2. In every package, replace `minutes: …` with `cents: …` from table 1.1. `mod-new-feature` and `sec-fix` get `cents: null`.
3. Leave `RATES` unchanged (5500 / 7500).
4. Keep `BILLING_STEP_MINUTES` and `priceCents()`; they remain correct for hourly project work and future time entries. Update the doc comment of `priceCents` to "Price of hourly work…". No page may use `priceCents` for packages any more.
5. Add `LAUNCH_OFFER` (section 1.2) after `CATALOG_VERSION`. Set `CATALOG_VERSION = '2026-11-08.1'`.
6. Text changes in existing packages (et / en):
   - `mod-review.includes[2]`: `'Kirjalik plaan koos hindadega'` / `'Written plan with prices'`.
   - `mod-new-feature.summary`:
     - et `'Broneerimine, päringuvorm, uus keel, liidestus vms teie praegusele lehele. Hind selgub ülevaatusel.'`
     - en `'Booking, an inquiry form, a new language, an integration or similar, added to your current site. The price is set in the review.'`
   - `mod-new-feature.includes`: et `['Fikseeritud hind enne töö algust', 'Töö algab ainult teie kinnitusel']` / en `['A fixed price before work starts', 'Work starts only once you approve']`.
   - `sec-compliance.includes[2]`: `'Tegevuskava koos hindadega'` / `'Action plan with prices'`.
   - Leave `care-s`, `care-m` and `sec-partner` includes as they are. Hours there describe what the client gets, which is fine.
7. New packages. Copy the texts exactly.

```ts
{
  id: 'web-onepage-launch', group: 'websites', rate: 'web', billing: 'once', cents: 9900, maxQty: 1, offer: true,
  name: { et: 'Ühelehine koduleht – avamispakkumine', en: 'One-page site – launch offer' },
  summary: {
    et: 'Ühelehine koduleht avamishinnaga meie esimesele 10 kliendile. Valite kujunduse meie näidiste hulgast.',
    en: 'A one-page site at a launch price for our first 10 clients. You pick a design from our examples.',
  },
  includes: {
    et: [
      'Valmis kujundus meie näidiste hulgast, teie logo ja värvidega',
      'Kuni 6 sisuplokki (teenused, meist, kontakt jne)',
      'Mobiilisõbralik ja kiire, HTTPS ja turvapäised paigas',
      'Tekstid ja pildid annate teie: näidis näitab, mida kuhu kirjutada',
      'Üks parandusring',
      'Lehe jaluses väike viide turve.ee-le',
    ],
    en: [
      'A ready-made design from our examples, in your logo and colours',
      'Up to 6 content sections (services, about, contact, …)',
      'Mobile-friendly and fast, with HTTPS and security headers',
      'You supply the texts and photos: the example shows what goes where',
      'One round of revisions',
      'A small turve.ee credit in the footer',
    ],
  },
  priceNote: { et: 'Esimesele 10 kliendile, kuni 31.12.2026', en: 'For our first 10 clients, until 31 Dec 2026' },
},
{
  id: 'web-texts', group: 'websites', rate: 'web', billing: 'once', cents: 6900, maxQty: 20,
  name: { et: 'Tekstide kirjutamine', en: 'Copywriting' },
  summary: {
    et: 'Kirjutame lehe tekstid teie eest lühikese vestluse põhjal. Hind on lehe kohta.',
    en: 'We write the texts for you after a short conversation. Priced per page.',
  },
  includes: {
    et: ['20-minutiline vestlus teie ettevõttest', 'Selged ja lühikesed tekstid ühes keeles', 'Üks parandusring'],
    en: ['A 20-minute conversation about your business', 'Clear, short texts in one language', 'One round of revisions'],
  },
},
{
  id: 'web-payment-link', group: 'websites', rate: 'web', billing: 'once', cents: 7900, maxQty: 1,
  name: { et: 'Maksenupp', en: 'Payment button' },
  summary: {
    et: 'Nupp, millega klient saab teenuse või ettemaksu kohe ära maksta. Makse käib Montonio või Stripe’i lehel, nii et teie lehele ei lisandu võõrast koodi.',
    en: "A button your customers use to pay for a service or a deposit straight away. Payment happens on Montonio's or Stripe's page, so no third-party code is added to your site.",
  },
  includes: {
    et: ['Makselingi seadistamine teie Montonio või Stripe’i kontol', 'Nupp ja selgitus teie lehel', 'Proovimakse enne üleandmist'],
    en: ['Setting up the payment link in your Montonio or Stripe account', 'Button and explanation on your site', 'A test payment before handover'],
  },
  priceNote: { et: '+ makseteenuse tasud', en: '+ payment provider fees' },
},
{
  id: 'sec-fix', group: 'security', rate: 'security', billing: 'once', cents: null, maxQty: 1,
  name: { et: 'Leitud vigade parandamine', en: 'Fixing what we found' },
  summary: {
    et: 'Kui teil pole oma arendajat ega IT-inimest, parandame tervisekontrolli või läbistustesti leitud vead ise.',
    en: "If you don't have a developer or IT person of your own, we fix the issues found in the health check or pentest ourselves.",
  },
  includes: {
    et: [
      'Fikseeritud hind aruande põhjal enne töö algust',
      'Veebileht, domeen ja e-post (SPF, DKIM, DMARC), Microsoft 365 või Google Workspace',
      'Iga parandus kontrollitakse pärast tööd üle',
      'Töö algab ainult teie kinnitusel',
    ],
    en: [
      'A fixed price based on the report, before work starts',
      'Website, domain and e-mail (SPF, DKIM, DMARC), Microsoft 365 or Google Workspace',
      'Every fix is checked afterwards',
      'Work starts only once you approve',
    ],
  },
},
```

### 1.2 `server/src/catalog/launchOffer.ts` (new, pure; no DB, no Node APIs, because the site build imports the catalog folder)
```ts
import { LAUNCH_OFFER } from './catalog';

export interface OfferStatus { spots: number; taken: number; left: number; open: boolean; endsOn: string }

/** taken = inquiries counted for the offer; todayYmd = today's Tallinn date 'YYYY-MM-DD'. */
export function offerStatus(taken: number, todayYmd: string): OfferStatus {
  const left = Math.max(0, LAUNCH_OFFER.spots - taken);
  return { spots: LAUNCH_OFFER.spots, taken, left, open: left > 0 && todayYmd <= LAUNCH_OFFER.endsOn, endsOn: LAUNCH_OFFER.endsOn };
}
```
This is used from step 2 on, but create it now along with its tests.

### 1.3 `server/src/catalog/pricing.ts`
- New shapes:
  ```ts
  export interface PricedLine { id: string; name: Localized; group: GroupId; billing: Package['billing']; unitCents: number | null; qty: number; cents: number }
  export interface PricedSelection { catalogVersion: string; lines: PricedLine[]; onceCents: number; monthlyCents: number; needsEstimate: boolean }
  ```
- `priceSelection`:
  - `cents = pkg.cents === null ? 0 : pkg.cents * qty`;
  - `needsEstimate = lines.some(l => l.unitCents === null)`;
  - totals by billing.
- Remove the `RateId`/`findRate`/`priceCents` imports if they're unused.
- `parseSelection` is unchanged.

### 1.4 `server/src/repositories/inquiries.ts`
- In `insertInquiry`, stop writing `onceMinutes`/`monthlyMinutes`: drop them from the column list and values, and the DB default 0 applies. Keep them in the `SELECT`s and in the `Inquiry` type; old rows have them.

### 1.5 `server/test/catalog.test.ts` (rewrite the catalog and priceSelection parts; keep the parseSelection tests)
- Unique ids, valid groups and rates, `includes.et.length === includes.en.length`.
- Every non-null `cents` is a positive integer and a multiple of 100.
- Exactly one package has `offer: true`, its id is `LAUNCH_OFFER.packageId`, and `findPackage(LAUNCH_OFFER.regularPackageId)?.cents` is a number.
- `priceSelection(parseSelection('web-company,web-extra-page:3,care-s,sec-partner,mod-new-feature'))`:
  - `onceCents === 79000 + 3 * 4900` (93700);
  - `monthlyCents === 3900 + 24900` (28800);
  - `needsEstimate === true`;
  - the line `web-extra-page` has `cents === 14700`.
- New `describe('offerStatus')`:
  - `offerStatus(0, '2026-11-10')` → `{left: 10, open: true}`;
  - `offerStatus(10, '2026-11-10')` → `{left: 0, open: false}`;
  - `offerStatus(12, '2026-11-10').left === 0`;
  - `offerStatus(3, '2027-01-01')` → `{left: 7, open: false}`;
  - `offerStatus(3, '2026-12-31').open === true`.

### 1.6 Site: package cards and estimator
- **`site/src/components.ts` `priceLine()`**: replace it entirely:
  ```ts
  export function priceLine(pkg: Package, ctx: PageContext): Raw {
    const { lang, t } = ctx;
    if (pkg.cents === null) {
      return html`<p class="price"><span class="price-sum">${t.common.estimateAfterReview}</span></p>`;
    }
    const suffix = `${pkg.billing === 'monthly' ? ` ${t.common.perMonth}` : ''}${pkg.maxQty > 1 ? ` ${t.common.perUnit}` : ''}`;
    const regular = pkg.offer ? findPackage(LAUNCH_OFFER.regularPackageId) : undefined;
    return html`<p class="price">
        ${regular && regular.cents !== null ? html`<span class="price-was">${t.common.offerRegular} ${euros(regular.cents, lang)}</span>` : ''}
        <span class="price-sum">${euros(pkg.cents, lang)}${suffix}</span>
        ${pkg.priceNote ? html`<span class="price-note">${pkg.priceNote[lang]}</span>` : ''}
      </p>`;
  }
  ```
  Remove the `hours`, `priceCents` and `RATES` imports that are no longer used. `packageCard()`: if `pkg.offer`, the article gets `class="package offer"` and the attribute `data-offer-card`. The offer status line comes in step 2.
- **`site/src/format.ts`**: delete `hours()`.
- **`site/src/pages/catalogData.ts`**: packages become `{ id, name, billing, maxQty, cents: pkg.cents, note }`; remove `step`, `minutes`, `BILLING_STEP_MINUTES` and `priceCents`.
- **`site/assets/js/common.js`**:
  - Delete `hours()` and remove it from the returned object.
  - `priceItems` returns `{ lines: [{pkg, qty, cents}], onceCents, monthlyCents, needsEstimate }` with `cents = pkg.cents === null ? 0 : pkg.cents * qty`, and `needsEstimate` true if any `pkg.cents === null`.
  - `renderTotals(priced, labels)`: let `hasMonthly = priced.lines.some(l => l.pkg.billing === 'monthly')` and `hasOnce = priced.lines.some(l => l.pkg.billing !== 'monthly')`.
    - If `hasOnce || !hasMonthly`, append `summaryOnce: <strong>euros(onceCents)</strong>`.
    - If `hasMonthly`, append `summaryMonthly: <strong>euros(monthlyCents) perMonth</strong>`.
  - `lineText(line, labels)`: if `line.pkg.cents === null`, value = `labels.estimateAfterReview`; otherwise `euros(line.cents)` + `' ' + labels.perMonth` for monthly.
- `estimator.js` and `contact.js` need no logic changes beyond what follows from `common.js`. Check that they don't use `hours`.
- **`site/src/pages/home.ts`**: terminal line becomes `${fix.name[lang]} · ${euros(fix.cents!, lang)}`. Remove the `hours`/`priceCents` imports.
- **`site/src/pages/styletile.ts`**:
  - `'Juhatus: iga tund on näha enne, kui tellite.'` → `'Juhatus: hind on enne tellimist teada.'`;
  - `<code>12 h · 660 €</code>` → `<code>290 €</code>`;
  - "IBM Plex Mono (tunnid, hinnad, tehnilised väärtused)" → "IBM Plex Mono (hinnad, tehnilised väärtused)".
- **`site/assets/css/site.css`**: delete the `.price-hours` rule. Add:
  ```css
  .price-was { flex-basis: 100%; color: var(--muted); font-size: 0.9rem; }
  .package.offer { border: 2px solid var(--accent); padding: calc(1.5rem - 1px); }
  ```

### 1.7 `site/src/pages/pricing.ts`
New structure:
1. `pageHead`.
2. A tight section containing:
   - `<p class="muted">${t.common.finalPrices}</p>`;
   - the `<noscript>` notice;
   - the hidden `data-estimator-hint` notice.

   The rates list is no longer here.
3. The group sections, unchanged.
4. The terms section, unchanged markup.
5. **NEW, last section** before the summary aside:
   ```ts
   <section class="section" aria-labelledby="h-project">
     <div class="wrap">
       <h2 id="h-project">${p.projectTitle}</h2>
       <p class="section-lead">${p.projectText}</p>
       <ul class="rates">${RATES.map((rate) => html`<li><span>${rate.name[lang]}</span><strong>${euros(rate.centsPerHour, lang)} / h</strong></li>`)}</ul>
     </div>
   </section>
   ```
6. The summary aside and the catalog `jsonBlock`, unchanged.

### 1.8 Copy changes (`site/src/i18n/et.ts` and `en.ts`)
**Delete** `common.hourlyRate`, `estimatorJs.hoursShort` and `pricing.ratesTitle`. Then make these changes:

| key | et | en |
|---|---|---|
| `common.estimateAfterReview` | `'hind pärast ülevaatust'` | `'price after review'` |
| `common.offerRegular` (new) | `'Tavahind'` | `'Regular price'` |
| `home.description` | replace the last sentence with `'Hind on enne tellimist teada.'` | replace the last sentence with `'You know the price before you order.'` |
| `home.heroLead` | replace the last sentence with `'Hind on teada enne, kui tellite.'` | replace the last sentence with `'You know the price before you order.'` |
| `home.modernPoints[0]` | `'Ülevaatus ja kirjalik plaan koos hindadega'` | `'Review and a written plan with prices'` |
| `home.why[1]` | `{ title: 'Hind on enne teada', text: 'Iga paketi hind ja sisu on kirjas. Teate enne tellimist, mida saate ja mida maksate.' }` | `{ title: 'You know the price up front', text: 'Every package lists its price and what it includes. You know what you get and what you pay before you order.' }` |
| `home.process[1]` | `{ title: 'Saate täpse pakkumise', text: 'Fikseeritud hinnaga, kahe tööpäeva jooksul.' }` | `{ title: 'Get an exact quote', text: 'At a fixed price, within two working days.' }` |
| `home.process[3]` | `{ title: 'Arve pärast tööd', text: 'Arve tuleb pärast töö üleandmist, maksetähtaeg on 14 päeva.' }` | `{ title: 'Invoice after the work', text: 'The invoice comes after handover and is payable within 14 days.' }` |
| `websites.description` | `'… uued funktsioonid. Fikseeritud hinnad.'` (replace `'Hinnad tundides.'`) | replace `'Prices in hours.'` with `'Fixed prices.'` |
| `security.description` | replace `'Hinnad tundides.'` with `'Fikseeritud hinnad.'` | replace `'Prices in hours.'` with `'Fixed prices.'` |
| `security.lead` | append `' Kui teil pole kedagi, kes leitud vead parandaks, parandame need ise.'` | append `' If you have no one to fix what we find, we fix it ourselves.'` |
| `pricing.description` | `'Kõik paketid koos hindadega. Valige vajalik ja küsige pakkumist otse kalkulaatorist.'` | `'Every package with its price. Pick what you need and ask for a quote straight from the calculator.'` |
| `pricing.lead` | `'Iga paketi hind on fikseeritud. Valige, mida vajate, ja näete kohe kogusummat. Pakkumise küsimine ei kohusta teid millekski.'` | `"Every package has a fixed price. Pick what you need and see the total straight away. Asking for a quote doesn't commit you to anything."` |
| `pricing.projectTitle` (new) | `'Konsultatsioon ja projektitöö'` | `'Consulting and project work'` |
| `pricing.projectText` (new) | `'Töö, mis ühtegi paketti ei mahu, teeme fikseeritud hinnaga pakkumise alusel või tunnitööna. Tunnitööd arvestame 15-minutilise täpsusega ja arvega tuleb kaasa ajalogi.'` | `"Work that doesn't fit a package is done on a fixed-price quote or by the hour. Hourly work is logged to the quarter hour and the invoice comes with a time log."` |
| `pricing.terms[0..2]` | replace the first three items with: `'Paketi hind on fikseeritud: maksate kokkulepitud summa, mitte rohkem.'`, `'Paketist välja jäävat tööd teeme ainult teie eelneval nõusolekul.'`, `'Igakuiste pakettide kasutamata tunnid järgmisse kuusse ei kandu.'` | `'Package prices are fixed: you pay the agreed amount, no more.'`, `'Work outside a package is done only with your prior consent.'`, `'Unused hours in monthly plans do not carry over to the next month.'` |
| `about.values[1]` | `{ title: 'Selgus', text: 'Hind ja töö sisu on enne kirjas. Üllatusi arvel ei ole.' }` | `{ title: 'Clarity', text: 'The price and the scope are written down up front. No surprises on the invoice.' }` |

- After the first three, `pricing.terms` keeps its remaining items: hosting at cost, 14 days, pentest permission. The old 4th item ("unused hours…") is now item 3, so make sure it isn't duplicated.
- Finally, grep both i18n files for `tund`, `hour`, `ajalog`, `time log` and `15-min`. The only remaining hits should be:
  - `pricing.projectText`;
  - care/partner contents in the catalog;
  - rate-limit messages ("tunni aja pärast" / "in an hour");
  - the check page's "kord tunnis" / "once an hour";
  - `fingerprint` texts.

### 1.9 `kapsaaed/app.js`
- Delete the `hours` helper.
- `selectionTable(selection)`:
  - columns `Pakett | Arveldus | Summa`;
  - a line is a quote if `line.unitCents === null || line.unitMinutes === null`, which also covers old snapshots that have `unitMinutes`. Show `'pakkumine'`, otherwise `euros(line.cents)`;
  - footer rows `'Ühekordne kokku'` when `Number(selection.onceCents) > 0` and `'Kuus kokku'` when `Number(selection.monthlyCents) > 0`, with only the euro column (`colSpan: 2` on the label).

### 1.10 Verify step 1
- Server typecheck and tests pass; the site typecheck and build pass.
- `grep -nE "[0-9] h<| h ·|tunnid|Tunnihinnad" site/dist/hinnad/index.html` → no hits. The project section's `€ / h` is expected.
- Locally, the /hinnad/ estimator totals show euros only. Selecting `mod-new-feature` shows "hind pärast ülevaatust" and the summary estimate note. The contact page shows the same lines. Submitting creates an inquiry, and kapsaaed shows the new table.
- **Commit:** `Fixed package prices, rates moved to the end of the price list`.

---

## STEP 2: Launch offer with live counter

### 2.1 Shared Tallinn time helpers: `server/src/services/tallinnTime.ts` (new)
Port these from `/home/mikk/engineering/kamblakoda/server/src/utils/businessTime.ts`, keeping the logic but renaming:
- `TALLINN_TZ = 'Europe/Tallinn'`
- `tallinnLocalToUtc(ymd: string, time: 'HH:MM'): Date` (= `businessLocalToUtc`)
- `tallinnYmd(instant: Date): string` (= `businessYmd`)
- `addDaysYmd(ymd, days): string`
- `isoWeekdayOfYmd(ymd): number`: 1 = Monday … 7 = Sunday, computed as `((new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7) + 1`.

Add `server/test/tallinnTime.test.ts`:
- `tallinnLocalToUtc('2026-11-09', '17:00').toISOString() === '2026-11-09T15:00:00.000Z'`;
- `tallinnLocalToUtc('2027-03-29', '17:00').toISOString() === '2027-03-29T14:00:00.000Z'` (summer time from 28.03.2027);
- `tallinnYmd(new Date('2026-11-08T22:30:00Z')) === '2026-11-09'`;
- `isoWeekdayOfYmd('2026-11-09') === 1` and `isoWeekdayOfYmd('2026-11-08') === 7`.

### 2.2 DB clock helper
In `server/src/db/pool.ts`, add:
```ts
/** The DB server's current UTC time. Use this, not Date.now(), for anything compared with stored times. */
export async function dbNow(): Promise<Date> {
  const rows: { now: Date }[] = await getPool().query('SELECT UTC_TIMESTAMP() AS now');
  return rows[0]!.now;
}
```

### 2.3 Migration `server/src/db/migrations/005-launch-offer.ts`
```ts
const migration: Migration = {
  id: '005-launch-offer',
  async up(pool) {
    await pool.query('ALTER TABLE Inquiries ADD COLUMN countsForOffer TINYINT(1) NOT NULL DEFAULT 0 AFTER flags');
  },
  async down(pool) {
    await pool.query('ALTER TABLE Inquiries DROP COLUMN countsForOffer');
  },
};
```
Append it to `migrations/index.ts`. Run `npm run migrate:dev`.

### 2.4 `server/src/repositories/inquiries.ts`
- `NewInquiry` gets `countsForOffer: boolean`, and the INSERT writes it (`countsForOffer ? 1 : 0`).
- `InquirySummary` gets `countsForOffer: number`. Add it to the SELECTs in `listInquiries` and `getInquiry`.
- New:
  ```ts
  /** Spots taken in the launch offer, with the DB's clock read in the same query. */
  export async function offerTaken(): Promise<{ taken: number; now: Date }> {
    const rows: { n: number; now: Date }[] = await getPool().query(
      "SELECT COUNT(*) AS n, UTC_TIMESTAMP() AS now FROM Inquiries WHERE countsForOffer = 1 AND status <> 'spam'");
    return { taken: Number(rows[0]!.n), now: rows[0]!.now };
  }
  export async function setCountsForOffer(id: number, counts: boolean): Promise<boolean> {
    const result = await getPool().query('UPDATE Inquiries SET countsForOffer = ? WHERE id = ?', [counts ? 1 : 0, id]);
    return Number(result.affectedRows) === 1;
  }
  ```

### 2.5 Public endpoint: `server/src/controllers/offerController.ts` (new)
```ts
let cache: { at: number; body: OfferStatus } | null = null;
const CACHE_MS = 30_000;

export async function getLaunchOffer(_req: Request, res: Response): Promise<void> {
  if (!cache || Date.now() - cache.at > CACHE_MS) {
    const { taken, now } = await offerTaken();
    cache = { at: Date.now(), body: offerStatus(taken, tallinnYmd(now)) };
  }
  res.set('Cache-Control', 'public, max-age=30').json(cache.body);
}
/** Call after anything that changes the count. */
export function clearOfferCache(): void { cache = null; }
```
- `Date.now()` is fine here: it only measures this process's own cache age.
- In `publicRoutes.ts`: `router.get('/launch-offer', limiter(15, 120, 'Too many requests'), getLaunchOffer);`.

### 2.6 `server/src/controllers/inquiryController.ts`
- After `flags` are computed and before the insert:
  ```ts
  let countsForOffer = false;
  const wantsOffer = selection?.lines.some((line) => line.id === LAUNCH_OFFER.packageId) ?? false;
  if (wantsOffer && !honeypot) {
    const { taken, now } = await offerTaken();
    const status = offerStatus(taken, tallinnYmd(now));
    if (status.open) countsForOffer = true;
    else flags.push(status.left === 0 ? 'offer-full' : 'offer-ended');
  }
  ```
- Pass `countsForOffer` to `insertInquiry`.
- After the insert, call `clearOfferCache()` when `countsForOffer` is true.

### 2.7 Admin API
- `repositories/audit.ts`: add `'inquiry.offer'` to `AuditAction`.
- `adminInquiryController.ts`:
  - `getOverview` returns `{ counts, offer }`, where `offer = offerStatus(taken, tallinnYmd(now))` from `offerTaken()`.
  - New `setOfferHandler`: body `{ counts: boolean }` (400 if not a boolean) → `setCountsForOffer` → 404 if missing → `audit('inquiry.offer', { userId, detail: \`#${id} → ${counts ? 'arvesse' : 'välja'}\`, ip })` → `clearOfferCache()` → `{ ok: true }`.
  - `setStatusHandler` also calls `clearOfferCache()`, since spam changes the count.
- `adminRoutes.ts`: `router.post('/inquiries/:id/offer', setOfferHandler);`.

### 2.8 kapsaaed (`kapsaaed/app.js`)
- `FLAGS` add `'offer-full': 'avamispakkumise kohad olid täis'` and `'offer-ended': 'avamispakkumine oli lõppenud'`.
- `AUDIT` add `'inquiry.offer': 'Avamispakkumise loendur'`.
- `viewList`: under the counts row, add `h('p', { class: 'muted' }, \`Avamispakkumine: ${offer.taken}/${offer.spots} kohta võetud${offer.open ? '' : ' (suletud)'}\`)`, using `offer` from `/overview`.
- `inquiryCard`: when `Number(inquiry.countsForOffer) === 1`, append `h('span', { class: 'tag' }, 'avamispakkumine')`.
- `viewInquiry`:
  - Add a section `h('h2', null, 'Avamispakkumine')` with a status text (`'Arvestatud loendurisse.'` / `'Loendurisse ei arvestata.'`) and one button: `'Eemalda loendurist'` / `'Arvesta loendurisse'`. It POSTs `/inquiries/${id}/offer` `{ counts: !current }`, refreshes and shows a message.

### 2.9 Site
**`common` keys** (et / en):

| key | et | en |
|---|---|---|
| `offerStatic` | `'Esimesele {spots} kliendile kuni {date}'` | `'For our first {spots} clients until {date}'` |
| `offerLeft` | `'Kohti alles: {left} / {spots}'` | `'Spots left: {left} of {spots}'` |
| `offerFull` | `'Kõik avamispakkumise kohad on täis. Tavahind {price}.'` | `'All launch offer spots are taken. Regular price {price}.'` |
| `offerEnded` | `'Avamispakkumine on lõppenud. Tavahind {price}.'` | `'The launch offer has ended. Regular price {price}.'` |

**Build-time helper** in `components.ts`:
```ts
/** Date as shown on the site: 31.12.2026 / 31 Dec 2026. */
function offerDate(lang: Lang): string { /* format LAUNCH_OFFER.endsOn with Intl.DateTimeFormat(et-EE {day:'2-digit',month:'2-digit',year:'numeric'} | en-IE {day:'numeric',month:'short',year:'numeric'}, timeZone UTC) */ }
export function offerStaticText(ctx): string  // offerStatic with {spots} and {date} filled
export function offerStatusLine(ctx): Raw     // html`<p class="offer-status" data-offer-status>${offerStaticText(ctx)}</p>`
export function offerScriptData(ctx): Raw     // jsonBlock('offer-labels', { left: offerLeft, full: offerFull with {price} filled, ended: offerEnded with {price} filled })
```
`{price}` = `euros(findPackage(LAUNCH_OFFER.regularPackageId)!.cents!, lang)`; the `{left}`/`{spots}` placeholders stay for the JS.

**`packageCard`**: for `pkg.offer`, render `offerStatusLine(ctx)` right after the summary.

**Home offer band**, new keys `home.offerEyebrow`, `home.offerTitle`, `home.offerText`:
- et:
  - `'Avamispakkumine'`
  - `'Ühelehine koduleht {price}'`
  - `'Turve on uus ja kogub esimesi kliente. Esimesed 10 saavad kiire ja turvalise ühelehise kodulehe avamishinnaga. Valite kujunduse, meie teeme ülejäänu.'`
- en:
  - `'Launch offer'`
  - `'A one-page site for {price}'`
  - `'Turve is new and looking for its first clients. The first 10 get a fast, secure one-page site at a launch price. You pick a design and we do the rest.'`

Here `{price}` = the offer price. Insert the band in `home.ts` directly after the hero section:
```ts
<section class="section offer-band" aria-labelledby="h-offer">
  <div class="wrap split">
    <div>
      <p class="eyebrow">${h.offerEyebrow}</p>
      <h2 id="h-offer">${offerTitle}</h2>
      <p>${h.offerText}</p>
      ${offerStatusLine(ctx)}
      <p class="button-row"><a class="button" href="${href('contact', lang)}?p=web-onepage-launch">${t.common.askOffer}</a></p>
    </div>
    <ul class="checklist">${offer.includes[lang].map((item) => html`<li>${item}</li>`)}</ul>
  </div>
</section>
```
The "See design examples" button is added in step 3.

**`site/assets/js/offer.js`** (new, loaded on home, websites and pricing):
```js
'use strict';
// Launch offer counter: fills [data-offer-status] from the API. Without JS or on error the static text stays.
(() => {
  const T = window.Turve;
  const labels = T && T.json('offer-labels');
  const targets = document.querySelectorAll('[data-offer-status]');
  if (!labels || !targets.length) return;
  T.api('/api/launch-offer')
    .then((res) => {
      if (!res.ok || !res.data) return;
      const { left, spots, open } = res.data;
      const text = open
        ? labels.left.replace('{left}', String(left)).replace('{spots}', String(spots))
        : left === 0 ? labels.full : labels.ended;
      targets.forEach((el) => {
        el.textContent = text;
        el.classList.toggle('closed', !open);
      });
      if (!open) document.querySelectorAll('[data-offer-card] [data-pick]').forEach((el) => el.remove());
    })
    .catch(() => {});
})();
```
- Add `'js/offer.js'` after `'js/common.js'` in the `scripts` of `home.ts`, `websites.ts` and `pricing.ts`. On pricing it goes before `estimator.js`; order doesn't matter, because the picker removal happens after the fetch.
- Add `${offerScriptData(ctx)}` to those three pages' bodies.
- Check that `home.ts` and `websites.ts` currently have no `scripts`. If not, add `scripts: ['js/common.js', 'js/offer.js']`.

**CSS:**
```css
.offer-status { font-family: var(--mono); color: var(--accent); margin: 0.25rem 0 0; }
.offer-status.closed { color: var(--muted); }
.offer-band { background: var(--paper-2); }
```

### 2.10 Verify step 2
- Tests pass, including the new time tests.
- Locally:
  - `curl -s localhost:3000/api/launch-offer` → `{"spots":10,"taken":0,"left":10,"open":true,…}`.
  - Submit an inquiry with `?p=web-onepage-launch` → the counter shows 9/10 (within 30 s, or at once because the cache is cleared).
  - In kapsaaed, "Eemalda loendurist" → 10/10 left again. Marking it spam also frees the spot.
  - Temporarily set `spots: 1` locally, submit 2 offer inquiries → the second has the flag `offer-full`, the page says "täis" and the offer card's "Lisa" checkbox is gone. **Revert to 10.**
  - With the API stopped, the page shows the static text and no console error is thrown.
- **Commit:** `Launch offer with live counter`.

---

## STEP 3: One-pager template kit and demos

### 3.1 Files
```
site/src/onepager/types.ts     content schema
site/src/onepager/themes.ts    THEMES
site/src/onepager/guide.ts     GUIDE (what the client must provide), et + en
site/src/onepager/render.ts    renderOnePager()
site/src/onepager/demos.ts     demo content per design (Estonian)
site/src/onepager/htaccess.ts  clientHtaccess()
site/src/onepager/cli.ts       client build CLI
site/src/pages/examples.ts     /naidised/ and /en/examples/
site/assets/css/onepager-base.css
site/assets/css/onepager-betoon.css
site/assets/css/onepager-keevitus.css
site/assets/css/onepager-manikuur.css
site/assets/css/onepager-universaalne.css
```
These CSS files live in `assets/css`, so `copyAssets()` hashes them automatically and `asset('css/onepager-base.css')` works.

### 3.2 `types.ts`
```ts
export type ThemeId = 'betoon' | 'keevitus' | 'manikuur' | 'universaalne';
/** Content sections: intro, services, about and contact are required; gallery and testimonials are optional (at most 6 in all). */
export interface OnePagerContent {
  lang: 'et' | 'en';
  businessName: string;
  tagline: string;
  cta: { label: string; href: string };          // href must start with tel:, mailto: or https://
  intro: { title: string; text: string };
  services: { title: string; items: { name: string; text: string; price?: string }[] };   // 1–6 items
  gallery?: { title: string; items: { caption: string; photo?: string }[] };             // 1–6 items
  about: { title: string; text: string; photo?: string; photoAlt: string };
  testimonials?: { title: string; items: { quote: string; author: string }[] };          // 1–3 items
  contact: { title: string; phone?: string; email?: string; address?: string; mapUrl?: string; hours?: { days: string; time: string }[] };
  credit: boolean;                               // "Kodulehe tegi turve.ee" in the footer
}
// All `photo` fields are file names in the client's img/ folder; without one, a captioned placeholder box is shown.
export interface ClientSite {
  theme: ThemeId;
  content: OnePagerContent;
  /** Optional colour overrides, '#rrggbb' only. */
  colors?: { accent?: string; accentText?: string; link?: string };
}
```

### 3.3 `themes.ts`
```ts
export const THEMES: readonly { id: ThemeId; name: Localized; description: Localized }[] = [
  { id: 'betoon', name: { et: 'Betoonitööd', en: 'Concrete works' }, description: { et: 'Tugev ja selge, ehitusvärvides. Sobib ka teistele ehitus- ja välitöödele: katused, haljastus, teedeehitus.', en: 'Strong and clear, in construction colours. Also suits other building and outdoor trades: roofing, landscaping, paving.' } },
  { id: 'keevitus', name: { et: 'Keevitustöökoda', en: 'Welding workshop' }, description: { et: 'Tume ja kontrastne, sädemeoranžiga. Sobib ka teistele töökodadele: autoremont, puusepad, metallitööd.', en: 'Dark and high-contrast, with spark orange. Also suits other workshops: car repair, carpentry, metalwork.' } },
  { id: 'manikuur', name: { et: 'Maniküürisalong', en: 'Manicure salon' }, description: { et: 'Pehme ja hubane. Sobib ka teistele ilu- ja heaoluteenustele: juuksur, kosmeetik, massaaž.', en: 'Soft and cosy. Also suits other beauty and wellbeing services: hair, skincare, massage.' } },
  { id: 'universaalne', name: { et: 'Universaalne', en: 'Universal' }, description: { et: 'Rahulik ja neutraalne. Sobib igale valdkonnale, kui ükski teine ei tundu õige.', en: 'Calm and neutral. Suits any line of business when none of the others feels right.' } },
];
```
`Localized` is imported from `server/src/catalog/catalog` (already allowed by the site tsconfig).

### 3.4 `guide.ts`: one list used by both the demos and the "what we need from you" checklist
```ts
export const GUIDE: readonly { key: string; title: Localized; text: Localized }[] = [
  { key: 'name', title: { et: 'Nimi ja lööklause', en: 'Name and tagline' }, text: { et: 'Ettevõtte nimi ja üks lause, mis ütleb, mida teete.', en: 'Your business name and one sentence on what you do.' } },
  { key: 'cta', title: { et: 'Peamine nupp', en: 'Main button' }, text: { et: 'Mida peaks külastaja kõigepealt tegema: helistama, kirjutama või aja broneerima?', en: 'What should a visitor do first: call, write, or book a time?' } },
  { key: 'intro', title: { et: 'Tutvustus', en: 'Introduction' }, text: { et: '2–3 lauset: mida teete, kellele ja mis teeb teid eriliseks.', en: '2–3 sentences: what you do, for whom, and what makes you different.' } },
  { key: 'services', title: { et: 'Teenused', en: 'Services' }, text: { et: '3–6 teenust, igaühe kohta üks-kaks lauset. Hinnad, kui soovite neid näidata.', en: '3–6 services with a sentence or two each. Prices, if you want to show them.' } },
  { key: 'about', title: { et: 'Teie või meeskond', en: 'You or your team' }, text: { et: 'Foto ja 2–3 lauset teist või meeskonnast. Inimesed ostavad inimestelt.', en: 'A photo and 2–3 sentences about you or your team. People buy from people.' } },
  { key: 'testimonials', title: { et: 'Klientide tagasiside (valikuline)', en: 'Customer quotes (optional)' }, text: { et: '2–3 lühikest tsitaati päris klientidelt, nende loal.', en: '2–3 short quotes from real customers, with their permission.' } },
  { key: 'contact', title: { et: 'Kontakt', en: 'Contact' }, text: { et: 'Telefon, e-post, aadress ja lahtiolekuajad.', en: 'Phone, e-mail, address and opening hours.' } },
  { key: 'brand', title: { et: 'Logo ja värvid', en: 'Logo and colours' }, text: { et: 'Logo (kui on) ja 1–2 värvi, mis teile sobivad.', en: 'Your logo (if you have one) and 1–2 colours you like.' } },
  { key: 'gallery', title: { et: 'Tehtud tööd', en: 'Your work' }, text: { et: '3–6 pilti teie tööst, ruumidest või toodetest, igaühe juurde lühike allkiri. Telefoniga tehtud pildid sobivad, kui neil on hea valgus.', en: '3–6 photos of your work, premises or products, each with a short caption. Phone photos are fine if the light is good.' } },
];

/** Looks up a guide entry; throws on an unknown key so typos fail the build. */
export function guide(key: string) { /* GUIDE.find(...) or throw */ }
```
The "Mida teilt vajame" (what we need from you) checklist on `/naidised/` lists all entries in exactly this order.

### 3.5 `demos.ts`
- `export const DEMOS: Record<ThemeId, OnePagerContent>`, all `lang: 'et'` and `credit: true`.
- The texts read like a real site for that trade; the per-section guide notes (section 3.6) tell the client what to write. Use the four contents below **verbatim**.
- Placeholder contact details only: phone `'+372 555 0000'` (`tel:+3725550000`), email `'info@teieettevote.ee'`, no `mapUrl`, no real-sounding brand names or people.
```ts
const PHONE = '+372 555 0000';
const EMAIL = 'info@teieettevote.ee';
const EXAMPLE_QUOTES = { title: 'Kliendid ütlevad', items: [
  { quote: 'Siia tuleb lühike tsitaat päris kliendilt, tema loal.', author: 'Näide: kliendi eesnimi' },
  { quote: 'Kaks-kolm tsitaati on piisav. Kui neid veel pole, jätame selle osa ära.', author: 'Näide: kliendi eesnimi' },
] };

export const DEMOS: Record<ThemeId, OnePagerContent> = {
  betoon: {
    lang: 'et', businessName: 'Teie Betoonitööd', credit: true,
    tagline: 'Vundamendid, põrandad ja platsid, mis peavad vastu aastakümneid.',
    cta: { label: 'Helista ja küsi pakkumist', href: 'tel:+3725550000' },
    intro: { title: 'Meist lühidalt', text: 'Valame vundamente, põrandaid ja õuealasid juba üle kümne aasta. Tuleme objektile, mõõdame üle ja saadame kirjaliku hinnapakkumise kahe tööpäeva jooksul.' },
    services: { title: 'Teenused', items: [
      { name: 'Vundamendid', text: 'Lint- ja plaatvundamendid elamutele, saunadele ja garaažidele.', price: 'hind objekti järgi' },
      { name: 'Betoonpõrandad', text: 'Põrand koos soojustuse ja põrandakütte torustikuga, siluritud või lihvitud pinnaga.', price: 'alates 25 € / m²' },
      { name: 'Õuealad ja platsid', text: 'Parkimisplatsid, terrassialused ja kõnniteed, mis kannatavad nii autot kui ka külma.' },
      { name: 'Betooni lihvimine', text: 'Vana betoonpinna lihvimine ja immutamine, et see oleks sile ja tolmuvaba.', price: 'alates 12 € / m²' },
    ] },
    gallery: { title: 'Tehtud tööd', items: [
      { caption: 'Plaatvundament eramule' },
      { caption: 'Lihvitud betoonpõrand garaažis' },
      { caption: 'Parkimisplats kortermaja ees' },
    ] },
    about: { title: 'Kes me oleme', text: 'Oleme kolmeliikmeline meeskond. Teeme töö ise, mitte alltöövõtjatega, ja jätame objekti korda. Tehtud tööle anname kirjaliku garantii.', photoAlt: 'Meeskonna foto objektil' },
    contact: { title: 'Kontakt', phone: PHONE, email: EMAIL, address: 'Tänava 1, Linn',
      hours: [{ days: 'E–R', time: '8–18' }, { days: 'L', time: 'kokkuleppel' }] },
  },
  keevitus: {
    lang: 'et', businessName: 'Teie Keevitustöökoda', credit: true,
    tagline: 'Keevitus ja metallitööd – väravast trepipiirdeni.',
    cta: { label: 'Helista meile', href: 'tel:+3725550000' },
    intro: { title: 'Meist lühidalt', text: 'Oleme väike töökoda, kus metalli keevitatakse, painutatakse ja värvitakse. Teeme töid nii eraisikutele kui ka ettevõtetele, väikesest parandusest kuni terve väravani.' },
    services: { title: 'Teenused', items: [
      { name: 'Väravad ja piirded', text: 'Lükand- ja tiibväravad, aiapiirded ning trepi- ja rõdupiirded teie mõõtude järgi.', price: 'hind joonise järgi' },
      { name: 'Keevitus ja remont', text: 'Keevitame terast, roostevaba ja alumiiniumi. Parandame ka katkised detailid ja masinaosad.', price: 'alates 45 € / h' },
      { name: 'Metallkonstruktsioonid', text: 'Varikatused, trepi kandekonstruktsioonid, riiulid ja raamid.' },
      { name: 'Viimistlus', text: 'Liivapritsitud ja pulbervärvitud pind, mis peab vastu Eesti ilmale.' },
    ] },
    gallery: { title: 'Tehtud tööd', items: [
      { caption: 'Lükandvärav eramu juurde' },
      { caption: 'Trepipiire roostevabast terasest' },
      { caption: 'Varikatuse raam' },
    ] },
    about: { title: 'Töökoda', text: 'Töökojas töötab kaks kogenud keevitajat. Tulge läbi, vaadake näidiseid ja räägime, mida teil vaja on.', photoAlt: 'Foto töökojast või keevitajast tööhoos' },
    contact: { title: 'Kontakt', phone: PHONE, email: EMAIL, address: 'Tööstuse 1, Linn',
      hours: [{ days: 'E–R', time: '8–17' }, { days: 'L–P', time: 'suletud' }] },
  },
  manikuur: {
    lang: 'et', businessName: 'Teie Maniküürisalong', credit: true,
    tagline: 'Hoolitsetud käed ja küüned rahulikus salongis.',
    cta: { label: 'Helista ja broneeri aeg', href: 'tel:+3725550000' },
    intro: { title: 'Tere tulemast', text: 'Oleme hubane salong kesklinnas, kus saate maniküüri ja pediküüri rahulikus õhkkonnas. Kasutame kvaliteetseid tooteid ja steriliseerime kõik tööriistad pärast iga klienti.' },
    services: { title: 'Teenused ja hinnad', items: [
      { name: 'Klassikaline maniküür', text: 'Küünte kujundamine, küünenahkade hooldus ja kätekreem.', price: '25 €' },
      { name: 'Geellakk', text: 'Läikiv ja vastupidav lakk, mis püsib 2–3 nädalat.', price: '35 €' },
      { name: 'Geelküüned', text: 'Pikendus või tugevdus koos kuju ja lakiga.', price: 'alates 45 €' },
      { name: 'Pediküür', text: 'Jalgade ja küünte hooldus koos lakkimisega.', price: '40 €' },
    ] },
    gallery: { title: 'Tööd', items: [
      { caption: 'Prantsuse maniküür' },
      { caption: 'Geellakk sügistoonides' },
      { caption: 'Küünekunst' },
    ] },
    about: { title: 'Teie meister', text: 'Olen maniküürimeister kaheksa aastat. Mulle meeldivad puhtad jooned ja see, kui klient lahkub hea tujuga.', photoAlt: 'Meistri foto' },
    testimonials: EXAMPLE_QUOTES,
    contact: { title: 'Kontakt', phone: PHONE, email: EMAIL, address: 'Tänava 1, Linn',
      hours: [{ days: 'E–R', time: '10–19' }, { days: 'L', time: '10–15' }, { days: 'P', time: 'suletud' }] },
  },
  universaalne: {
    lang: 'et', businessName: 'Teie Ettevõte', credit: true,
    tagline: 'Üks lause, mis ütleb, mida teete ja kellele.',
    cta: { label: 'Võta ühendust', href: 'mailto:info@teieettevote.ee' },
    intro: { title: 'Meist', text: 'Siia tulevad 2–3 lauset: mida teete, kellele ja mis teeb teid eriliseks. Kirjutage nii, nagu räägiksite kliendiga telefonis.' },
    services: { title: 'Teenused', items: [
      { name: 'Teie esimene teenus', text: 'Üks-kaks lauset sellest, mida see teenus kliendile annab.', price: 'alates 50 €' },
      { name: 'Teie teine teenus', text: 'Kirjeldage lühidalt ja kliendi keeles, ilma erialaterminiteta.' },
      { name: 'Teie kolmas teenus', text: 'Hinna võite näidata või jätta näitamata – otsustate teie.' },
    ] },
    gallery: { title: 'Pildid', items: [
      { caption: 'Teie töö, toode või ruum' },
      { caption: 'Veel üks hea pilt' },
      { caption: 'Ja kolmas' },
    ] },
    about: { title: 'Kes me oleme', text: 'Foto ja paar lauset teist või meeskonnast: kes te olete, kui kaua olete seda tööd teinud ja miks see teile meeldib.', photoAlt: 'Teie või meeskonna foto' },
    testimonials: EXAMPLE_QUOTES,
    contact: { title: 'Kontakt', phone: PHONE, email: EMAIL, address: 'Tänava 1, Linn',
      hours: [{ days: 'E–R', time: '9–17' }, { days: 'L–P', time: 'suletud' }] },
  },
};
```

### 3.6 `render.ts`
`export function renderOnePager(content: OnePagerContent, opts: RenderOptions): string`, with:
```ts
interface RenderOptions {
  css: string[];                       // stylesheet URLs, in order (base, theme, optional colors)
  imgBase: string;                     // URL prefix for content photos, e.g. 'img/'
  demo?: { themeName: string; chooseHref: string; examplesHref: string };
}
```

**Safety:**
- Use the `html` tag for everything.
- Validate at render time and **throw** with a clear message when:
  - `cta.href` or `mapUrl` doesn't match `/^(tel:\+?[0-9 ]+|mailto:[^\s"<>]+|https:\/\/[^\s"<>]+)$/`;
  - `services.items` or `gallery.items` is empty or has more than 6 items, or `testimonials.items` is empty or has more than 3;
  - any `photo` (about or gallery) doesn't match `/^[a-z0-9-]+\.(jpg|jpeg|png|webp)$/`.

**Document:**
- `<!doctype html><html lang>`, `meta charset`, viewport, `<title>${businessName}</title>`.
- `<meta name="robots" content="noindex">` **only in demo mode**.
- The stylesheet `<link>`s. No scripts, no inline styles.

**Body**, with `class="op op-demo"` in demo mode, otherwise `class="op"`:
1. **Demo mode only**, `<div class="op-demobar">`: `Näidis · kujundus „${themeName}” · ` + `<a href=chooseHref>Vali see kujundus →</a>` + ` · ` + `<a href=examplesHref>Kõik näidised</a>`.
2. `<header class="op-header">`: business name, plus a nav with anchors to `#intro`, `#services`, `#work` (only if gallery), `#about` and `#contact`, labelled with each section's title.
3. `<section class="op-hero" data-guide="…">`: h1 businessName, p tagline, `<a class="op-cta" href>`.
4. `<section id="intro" data-guide="…">`: h2 title, p text.
5. `<section id="services" data-guide="…">`: h2, then a grid of cards (h3 name, p text, optional `<p class="op-price">`).
6. If `gallery`: `<section id="work" data-guide="…">`: h2, then a grid of `<figure>`s. Each has the photo (`<img src="${imgBase}${photo}" alt="${caption}" loading="lazy">`) or a placeholder `<div class="op-photo-placeholder" role="img" aria-label="${caption}">Foto</div>`, then `<figcaption>${caption}</figcaption>`.
7. `<section id="about" data-guide="…">`: the photo, or a placeholder `<div class="op-photo-placeholder" role="img" aria-label="${photoAlt}">${photoAlt}</div>`, plus h2 and the text.
8. If `testimonials`: `<section id="reviews" data-guide="…">` with `<blockquote><p>quote</p><footer>author</footer></blockquote>`s.
9. `<section id="contact" data-guide="…">`:
   - phone as `tel:` (digits and + only in the href);
   - email as `mailto:`;
   - address;
   - if `mapUrl`, `<a href=mapUrl>Vaata kaardil</a>`;
   - hours as a `<table>`.
10. `<footer class="op-footer">`: `© ${year} ${businessName}`, and if `credit`, ` · Kodulehe tegi <a href="https://www.turve.ee/">turve.ee</a>`.

**Guides (demo mode only):**

| section | `data-guide` (chip) | guide note text |
|---|---|---|
| hero | `guide('name').title` | `guide('name').text + ' ' + guide('cta').text` |
| intro | `guide('intro').title` | `guide('intro').text` |
| services | `guide('services').title` | `guide('services').text` |
| work | `guide('gallery').title` | `guide('gallery').text` |
| about | `guide('about').title` | `guide('about').text` |
| reviews | `guide('testimonials').title` | `guide('testimonials').text` |
| contact | `guide('contact').title` | `guide('contact').text` |

- Use the language of `content.lang` (`.et` for all demos).
- In demo mode, put `<p class="op-guide">✎ ${note}</p>` directly after each section's heading (after the h1 in the hero).
- **Outside demo mode, render neither `data-guide` nor `.op-guide`**, so client sites carry no demo markup.
- Year: `new Date().getUTCFullYear()` at build time.

### 3.7 CSS
**`onepager-base.css`:** layout only, using variables.
- Mobile first; `max-width: 64rem` content; generous section padding.
- `.op-header`: flex, wraps on mobile.
- `.op-hero`: large heading, CTA button.
- Services and gallery: `display: grid; grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr))`. Gallery images: `width: 100%; aspect-ratio: 4/3; object-fit: cover`.
- About: two columns from 48rem up.
- `.op-photo-placeholder`: `aspect-ratio: 4/3`, dashed border, centred muted text.
- Contact hours table.
- Visible focus styles; `prefers-reduced-motion` respected (no animations needed).
- Variables: `--op-bg --op-surface --op-text --op-muted --op-accent --op-accent-text --op-link --op-line --op-radius --op-font-body --op-font-head`.
  - Text links use `--op-link`, not `--op-accent`: a bright accent such as yellow is unreadable as link text on a light background.
  - `.op-cta` and other filled buttons use `--op-accent` with `--op-accent-text`.
- Demo styles:
  ```css
  .op-demo [data-guide] { position: relative; outline: 2px dashed var(--op-accent); outline-offset: -0.5rem; }
  .op-demo [data-guide]::before { content: attr(data-guide); position: absolute; top: 0.75rem; right: 0.75rem; font: 600 0.75rem/1 var(--op-font-body); background: var(--op-accent); color: var(--op-accent-text); padding: 0.3rem 0.5rem; border-radius: 0.25rem; }
  .op-demobar { position: sticky; top: 0; z-index: 10; background: #0d1b2a; color: #f6f5f1; padding: 0.6rem 1rem; font: 500 0.9rem/1.4 system-ui, sans-serif; text-align: center; }
  .op-demobar a { color: #2dd4bf; }
  .op-guide { font: 500 0.9rem/1.45 var(--op-font-body); color: var(--op-text); background: var(--op-surface); border-left: 4px solid var(--op-accent); padding: 0.5rem 0.75rem; margin: 0.5rem 0 1.25rem; max-width: 40rem; }
  ```

**Designs** (each file sets only the variables plus a few signature details). Sans stack = `system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`.

| design | bg | surface | text | muted | accent | accent-text | link | line | radius | fonts and details |
|---|---|---|---|---|---|---|---|---|---|---|
| `betoon` | `#f1f0ed` | `#ffffff` | `#1d2125` | `#555c63` | `#e0a100` | `#1d2125` | `#7a4f00` | `#d9d6d0` | `2px` | sans; headings `font-weight: 800; text-transform: uppercase; letter-spacing: 0.02em`; a thick accent bar (`border-top: 6px solid var(--op-accent)`) on the header; concrete feel: flat surfaces, no shadows |
| `keevitus` | `#121417` | `#1b1f24` | `#f1f1ec` | `#b4b9bf` | `#ff7a1a` | `#121417` | `#ff9a4d` | `#2b3138` | `0` | sans; headings 800 weight; the hero gets a subtle diagonal stripe pattern with `repeating-linear-gradient` in surface/bg tones (no images) |
| `manikuur` | `#fdf7f5` | `#ffffff` | `#3a2a2e` | `#6e5a60` | `#b23a6a` | `#ffffff` | `#a3355f` | `#f0dfe2` | `18px` | headings `Georgia, "Times New Roman", serif`, body sans; cards get a soft shadow; placeholders are rounded |
| `universaalne` | `#ffffff` | `#f4f6f9` | `#13213a` | `#4a5568` | `#1d5fbf` | `#ffffff` | `#1d5fbf` | `#dfe3ea` | `6px` | sans; clean and quiet |

Check contrast: text, muted and link on bg and surface ≥ 4.5:1, accent-text on accent ≥ 4.5:1. Adjust the hex values slightly if any pair fails, and say so in your report.

### 3.8 Wiring into the site build
- `routes.ts`: add `'examples'` to `PageId` and `ROUTES.examples = { et: '/naidised/', en: '/en/examples/' }`. Don't add it to `NAV`.
- **i18n** `examples` block (et / en):
  - `title`: `'Kodulehe kujundusnäidised | Turve'` / `'Website design examples | Turve'`
  - `description`: `'Vaadake ühelehise kodulehe näidiseid. Iga näidis näitab, mis tekst ja pilt kuhu käib.'` / `'See examples of one-page sites. Each one shows which text and picture goes where.'`
  - `heading`: `'Kujundusnäidised'` / `'Design examples'`
  - `lead`: `'Valige kujundus, mis teile meeldib. Näidises on iga osa juures kirjas, mida sinna kirjutada, nii et teate täpselt, mida meile saata.'` / `'Pick the design you like. Each part of the example says what to write there, so you know exactly what to send us.'`
  - `open`: `'Ava näidis'` / `'Open example'`
  - `choose`: `'Vali see kujundus'` / `'Choose this design'`
  - `langNote`: `'Näidised on eesti keeles. Teie leht võib olla mis tahes keeles.'` / `'The examples are in Estonian. Your site can be in any language.'`
  - `needTitle`: `'Mida teilt vajame'` / `'What we need from you'`
  - `needLead`: `'Kui need on olemas, saame lehe valmis teha umbes nädalaga.'` / `'Once we have these, your site is usually ready in about a week.'`
  - footer link label `footer.examples`: `'Kujundusnäidised'` / `'Design examples'`
- **`pages/examples.ts`:**
  - `pageHead`.
  - A section with a `card-grid` (4 cards): per design, a card with name, description and two links:
    - `open` → `/naidised/${id}/`, which is the same URL for both languages;
    - `choose` → `${href('contact', lang)}?p=web-onepage-launch&teema=${id}`.
  - `<p class="muted">${langNote}</p>`.
  - An alt section `needTitle`/`needLead` + `<ul class="checklist">` of `GUIDE.map(g => html`<li><strong>${g.title[lang]}</strong> – ${g.text[lang]}</li>`)`.
  - `ctaBand` with `askOffer` → `contact?p=web-onepage-launch`.
- **`build.ts`:**
  - Add `['examples', examplesPage]` to `PAGES`.
  - After the page loop, render the demos:
    ```ts
    for (const theme of THEMES) {
      write(`/naidised/${theme.id}/index.html`, renderOnePager(DEMOS[theme.id], {
        css: [asset('css/onepager-base.css'), asset(`css/onepager-${theme.id}.css`)],
        imgBase: '/assets/img/',
        demo: { themeName: theme.name.et, chooseHref: `${ROUTES.contact.et}?p=web-onepage-launch&teema=${theme.id}`, examplesHref: ROUTES.examples.et },
      }));
    }
    ```
  - Update the "Built N pages" count to include the demos.
- **`layout.ts` footer:** add `<li><a href="${href('examples', lang)}">${t.footer.examples}</a></li>` before the contact link.
- **Home offer band** (from step 2): add a second button `<a class="button ghost" href="${href('examples', lang)}">${t.common.seeExamples}</a>`, with new `common.seeExamples` = `'Vaata kujundusnäidiseid'` / `'See design examples'`.
- **Contact prefill of the chosen design:**
  - `contact.ts` adds `themes: Object.fromEntries(THEMES.map((th) => [th.id, th.name[lang]]))` and `themePrefix` (new key `contact.themePrefix`: `'Kujundus'` / `'Design'`) to the `contact-labels` JSON block.
  - In `contact.js`, after the selection code:
    ```js
    const theme = params.get('teema');
    if (theme && labels.themes && Object.prototype.hasOwnProperty.call(labels.themes, theme) && !form.elements.message.value) {
      form.elements.message.value = `${labels.themePrefix}: ${labels.themes[theme]}\n\n`;
    }
    ```

### 3.9 Client build CLI: `site/src/onepager/cli.ts` and `htaccess.ts`
**Usage:** `cd site && npx tsx src/onepager/cli.ts <client-dir> --origin https://www.client.ee`.
- `<client-dir>` contains `site.ts`, which does `export default { theme, content, colors } satisfies ClientSite`, and optionally `img/`.
- Output goes to `<client-dir>/dist/`, which is wiped first.

**Writes:**
- `index.html`, rendered with `css: ['assets/base.css', 'assets/theme.css', 'assets/colors.css']` and `imgBase: 'img/'`, no demo.
- `assets/base.css` and `assets/theme.css`, copied from `site/assets/css/onepager-*.css`.
- `assets/colors.css`: `:root { --op-accent: …; --op-accent-text: …; --op-link: … }` for the given colours only (empty file if none). **Validate each colour with `/^#[0-9a-fA-F]{6}$/`, else throw.**
- `img/*`: copy only files matching `/^[a-z0-9-]+\.(jpg|jpeg|png|webp)$/`.
- `robots.txt`: `User-agent: *\nAllow: /\n`.
- `.htaccess` from `clientHtaccess(origin)`:
  - HTTPS + canonical-host redirect, the same pattern as `site/src/headers.ts` `htaccess()` but for the given origin;
  - `Options -Indexes`;
  - headers:
    - `Content-Security-Policy "default-src 'none'; style-src 'self'; img-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'; upgrade-insecure-requests"`
    - `Strict-Transport-Security "max-age=31536000"`
    - `X-Content-Type-Options "nosniff"`
    - `X-Frame-Options "DENY"`
    - `Referrer-Policy "strict-origin-when-cross-origin"`
    - `Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()"`
    - `Cross-Origin-Opener-Policy "same-origin"`
  - Cache-Control `no-cache` for `.html` and 30 days for images and CSS.
  - Validate `origin` with `new URL()`; it must be `https:`.

Also:
- Add `"onepager": "tsx src/onepager/cli.ts"` to `site/package.json` scripts.
- Add `clients/` to the root `.gitignore`. Client sites (their texts, photos and builds) then don't end up in the turve.ee repository. The owner can `git init` inside `clients/` to keep them in a separate repository of their own. **Tell the owner** you did this.
- Make a throwaway test client in the scratchpad, never in the repo, and build it once to prove the CLI works.

### 3.10 Verify step 3
- The site builds; `dist/naidised/{betoon,keevitus,manikuur,universaalne}/index.html` exist; the link check passes.
- Open each demo locally (`npm run dev`, then e.g. http://localhost:8080/naidised/betoon/):
  - no CSP errors in the console;
  - every section shows its dashed outline, label chip and ✎ guide note;
  - mobile width (375 px) looks right.
- "Vali see kujundus" opens the contact form with the launch package selected and "Kujundus: Betoonitööd" prefilled.
- The CLI test client builds, and its `index.html` has no `op-demo`, no `data-guide`, no `op-guide` and no `noindex`.
- **Show the owner screenshots of the 4 demos** (OWNER CHECKPOINT, light: apply their feedback on colours/look before committing).
- **Commit:** `One-page template kit with four demos`.

---

## STEP 4: Free 20-minute consultation booking

### 4.1 Migration `server/src/db/migrations/006-consultations.ts`
```sql
CREATE TABLE IF NOT EXISTS ConsultationHours (
  id INT AUTO_INCREMENT PRIMARY KEY,
  weekday TINYINT NOT NULL,            -- ISO: 1 = Monday … 7 = Sunday
  startTime CHAR(5) NOT NULL,          -- 'HH:MM', Tallinn time
  endTime CHAR(5) NOT NULL,
  CONSTRAINT chk_consultation_hours_weekday CHECK (weekday BETWEEN 1 AND 7)
) ${TABLE_OPTIONS};

CREATE TABLE IF NOT EXISTS ConsultationBlocks (
  day DATE PRIMARY KEY,                -- Tallinn date with no consultations
  note VARCHAR(200) NULL
) ${TABLE_OPTIONS};

CREATE TABLE IF NOT EXISTS Consultations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  startsAt DATETIME NOT NULL,          -- UTC
  status ENUM('booked', 'done', 'no_show', 'cancelled') NOT NULL DEFAULT 'booked',
  lang ENUM('et', 'en') NOT NULL,
  name VARCHAR(200) NOT NULL,
  company VARCHAR(200) NULL,
  email VARCHAR(254) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  topic ENUM('website', 'modernising', 'security', 'other') NOT NULL DEFAULT 'other',
  message TEXT NULL,
  flags VARCHAR(100) NULL,
  adminNotes TEXT NULL,
  consentAt DATETIME NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  -- NULL for cancelled rows, so a cancelled time can be booked again; UNIQUE blocks two active bookings at one start.
  activeStart DATETIME AS (IF(status = 'cancelled', NULL, startsAt)) PERSISTENT,
  UNIQUE KEY uq_consultations_active_start (activeStart),
  INDEX idx_consultations_starts (startsAt),
  INDEX idx_consultations_email (email, status)
) ${TABLE_OPTIONS};
```
- Run each `CREATE` as a separate `pool.query`.
- `down` drops the three tables in reverse order.
- Append the migration to the index and run `migrate:dev`.

### 4.2 `server/src/consultation/slots.ts` (pure, no DB)
```ts
export const CALL_MINUTES = 20;
export const SLOT_STEP_MINUTES = 30;
export const LEAD_HOURS = 16;
export const HORIZON_DAYS = 21;

export interface HoursRow { weekday: number; startTime: string; endTime: string }
export interface DaySlots { date: string; slots: string[] }   // slots: UTC ISO strings (toISOString())

/**
 * Free consultation start times. A slot is offered when:
 *  - it lies on a date from tallinnYmd(now) through HORIZON_DAYS - 1 days later, which is not blocked;
 *  - it starts at a window's startTime + k × SLOT_STEP_MINUTES and the call (CALL_MINUTES) ends by the window's endTime;
 *  - it starts at or after now + LEAD_HOURS;
 *  - no taken start is less than SLOT_STEP_MINUTES away from it.
 * Days without slots are left out. Slots within a day are sorted and unique (overlapping windows don't duplicate).
 */
export function freeSlots(input: { hours: HoursRow[]; blockedDays: ReadonlySet<string>; takenStarts: readonly Date[]; now: Date }): DaySlots[]
```
Use `tallinnLocalToUtc`, `tallinnYmd`, `addDaysYmd` and `isoWeekdayOfYmd` from `services/tallinnTime.ts`.

**Tests**, `server/test/consultationSlots.test.ts` (2026-11-09 is a Monday, Tallinn is UTC+2 until 28.03.2027):
1. hours `[{weekday: 1, startTime: '17:00', endTime: '19:00'}]`, now `2026-11-08T10:00:00Z`, no blocks or taken:
   - 3 days: `2026-11-09`, `2026-11-16`, `2026-11-23`;
   - each with `['T15:00:00.000Z', 'T15:30:00.000Z', 'T16:00:00.000Z', 'T16:30:00.000Z']` on that date;
   - 18:30 + 20 min ends 18:50 ≤ 19:00, so it's included, and 19:00 is not.
2. The same, with `blockedDays` = `{'2026-11-16'}` → that date is missing.
3. The same, with taken `2026-11-09T15:10:00Z` → 15:00 and 15:30 are gone on 11-09; 16:00 and 16:30 remain.
4. The same, with now `2026-11-09T00:00:00Z` (lead → earliest 16:00Z) → on 11-09 only 16:00 and 16:30.
5. DST: hours Monday 17:00–17:30, now `2027-03-20T10:00:00Z` → 2027-03-22 has `T15:00:00.000Z` and 2027-03-29 has `T14:00:00.000Z`.
6. Overlapping windows (two identical rows) → no duplicate slots.

### 4.3 `server/src/repositories/consultations.ts`
Functions:
- `listHours(): Promise<HoursRow[]>`, ordered by weekday and startTime.
- `replaceHours(rows: HoursRow[])`: inside `withTransaction` (from `db/pool.ts`), `DELETE FROM ConsultationHours`, then insert each row.
- `listBlocks(fromYmd: string)`: returns `{ day: string; note: string | null }[]` with `day >= fromYmd`, ordered by day.
  - Return `day` as `'YYYY-MM-DD'`: select `DATE_FORMAT(day, '%Y-%m-%d') AS day`.
- `addBlock(day, note)` uses `INSERT … ON DUPLICATE KEY UPDATE note = VALUES(note)`; `deleteBlock(day)`.
- `takenStarts(fromUtc: Date, toUtc: Date): Promise<Date[]>`: `status <> 'cancelled'` and `startsAt` in the range.
- `countUpcomingByEmail(email: string)`: `status = 'booked' AND startsAt > UTC_TIMESTAMP()`.
- `insertConsultation(input)`: `consentAt = UTC_TIMESTAMP()`; returns the id.
- `listConsultations(scope: 'upcoming' | 'past')`:
  - upcoming = `status = 'booked' AND startsAt >= UTC_TIMESTAMP() - INTERVAL 2 HOUR`, ascending;
  - past = everything else, descending, `LIMIT 200`.
- `getConsultation(id)`, `setConsultationStatus(id, status)`, `setConsultationNotes(id, notes)`, `deleteConsultation(id)`.
- `countUpcoming()`, for the overview.

### 4.4 Public controller `server/src/controllers/consultationController.ts`
**`GET /api/consultations/slots`:**
- `now = await dbNow()`;
- `hours = await listHours()`;
- `blocks = new Set((await listBlocks(tallinnYmd(now))).map(b => b.day))`;
- `taken = await takenStarts(new Date(now.getTime() - 3_600_000), new Date(now.getTime() + (HORIZON_DAYS + 1) * 86_400_000))`;
- respond `res.set('Cache-Control', 'no-store').json({ days: freeSlots({ hours, blockedDays: blocks, takenStarts: taken, now }), callMinutes: CALL_MINUTES })`.

**`POST /api/consultations`** (JSON only).

Validation, written like `inquiryValidation`:
```ts
body('lang').optional().isIn(['et', 'en']),
body('name').isString().trim().isLength({ min: 2, max: 200 }),
body('company').optional({ values: 'falsy' }).isString().trim().isLength({ max: 200 }),
body('email').isString().trim().isLength({ max: 254 }).isEmail(),
body('phone').isString().trim().isLength({ min: 5, max: 40 }).matches(/^[0-9+()\-.\s]*$/),
body('topic').optional({ values: 'falsy' }).isIn(['website', 'modernising', 'security', 'other']),
body('message').optional({ values: 'falsy' }).isString().trim().isLength({ max: 2000 }),
body('startsAt').isString().isISO8601(),
body('consent').custom((v) => v === true || v === 'on' || v === 'true' || v === '1'),
body('hp').optional(),
body('token').optional(),
```

Flow:
1. Validation errors → `400 { code: 'fields', fields }`.
2. `const start = new Date(data.startsAt); const startIso = start.toISOString();`
3. Flags: `honeypot` if `hp` is non-empty; `token-<verdict>` from `checkFormToken` unless `ok`.
4. **Honeypot:** insert with `status: 'cancelled'`, so no slot is taken, then answer `201 { ok: true, startsAt: startIso }` like a success. Stop.
5. If `countUpcomingByEmail(email) >= 1` → `409 { code: 'already_booked' }`.
6. Recompute the free slots exactly as in GET. If no day contains `startIso` → `409 { code: 'slot_taken' }`.
7. Insert with `status 'booked'`. If the insert throws with `errno === 1062` (duplicate key) → `409 { code: 'slot_taken' }`.
8. Answer `201 { ok: true, startsAt: startIso }`.

**Routes** in `publicRoutes.ts`:
```ts
router.get('/consultations/slots', limiter(15, 120, 'Too many requests'), getSlots);
router.post('/consultations', limiter(60, 3, 'Too many bookings, try again later'), consultationValidation, createConsultation);
```

### 4.5 Admin API (all behind the existing session and origin guards)
**`AuditAction`** gets `'consultation.status' | 'consultation.notes' | 'consultation.delete' | 'consultation.hours' | 'consultation.block'`.

**`adminConsultationController.ts`:**
- `GET /consultations?scope=upcoming|past` (default upcoming) → `{ consultations }`.
- `GET /consultations/:id` → `{ consultation }`, or 404.
- `POST /consultations/:id/status { status }`, one of `booked|done|no_show|cancelled` → audit.
- `POST /consultations/:id/notes { notes }`: string or null, max 10,000 → audit.
- `DELETE /consultations/:id` → 204 + audit (GDPR erasure).
- `GET /consultation-hours` → `{ hours, blocks }` (blocks from today's Tallinn date, via `dbNow()`).
- `PUT /consultation-hours { hours: HoursRow[] }`:
  - validate it is an array of ≤ 30 rows;
  - each `weekday` an integer 1–7;
  - times match `/^([01]\d|2[0-3]):[0-5]\d$/` and `startTime < endTime` (a string compare works for HH:MM);
  - else 400. Then `replaceHours` + audit.
- `POST /consultation-blocks { day, note? }`:
  - day matches `/^\d{4}-\d{2}-\d{2}$/` and is a real date: `new Date(day + 'T00:00:00Z')` isn't NaN and `toISOString().slice(0, 10) === day`;
  - note ≤ 200;
  - then audit.
- `DELETE /consultation-blocks/:day` → same day validation → audit.

`getOverview` (in `adminInquiryController.ts`) also returns `consultations: { upcoming: await countUpcoming() }`.

### 4.6 kapsaaed
**`index.html` nav:** add after "Kõik päringud":
```html
<a href="#/konsultatsioonid" class="nav-link">Konsultatsioonid</a>
<a href="#/ajad" class="nav-link">Ajad</a>
```

**`app.js`:**
- Labels:
  - `CONSULT_STATUS = { booked: 'Broneeritud', done: 'Tehtud', no_show: 'Ei vastanud', cancelled: 'Tühistatud' }`
  - `TOPIC = { website: 'Uus veebileht', modernising: 'Vana lehe uuendamine', security: 'Turvalisus', other: 'Muu' }`
  - `WEEKDAY = ['', 'Esmaspäev', 'Teisipäev', 'Kolmapäev', 'Neljapäev', 'Reede', 'Laupäev', 'Pühapäev']`
  - AUDIT labels for the 5 new actions: `'Konsultatsiooni olek'`, `'Konsultatsiooni märkmed'`, `'Konsultatsioon kustutatud'`, `'Konsultatsiooniajad'`, `'Vaba päev'`.
- **`viewConsultations(scope)`:**
  - title `'Konsultatsioonid'`;
  - links "Tulevased" (`#/konsultatsioonid`) and "Varasemad" (`#/konsultatsioonid/varasemad`);
  - a card list in the inquiry style: `fmtDateTime(startsAt)` · name (· company) · phone · `TOPIC[topic]` · `CONSULT_STATUS[status]` · flags;
  - each card links to `#/konsultatsioon/<id>`.
- **`viewConsultation(id)`:**
  - status buttons in the inquiry pattern;
  - facts: aeg (time), nimi, ettevõte, telefon (`tel:` link like inquiries), e-post (`mailto:`), teema, märkused (flags), nõusolek (consent);
  - message as text; notes textarea + save; delete with `confirm()`, then back to the list.
- **`viewHours()`:**
  - title `'Konsultatsiooniajad'`;
  - muted help text: `'Iganädalased ajad, millal saab tasuta konsultatsiooni broneerida (Eesti aeg). Kõne kestab 20 minutit, ajad algavad iga 30 minuti järel. Varaseim broneeritav aeg on 16 tundi ette.'`;
  - an editable list of rows: weekday `<select>`, `<input type="time" step="1800">` start/end, a "Eemalda" button;
  - "Lisa rida" adds a row (default Monday 17:00–19:00); "Salvesta ajad" PUTs the whole list;
  - below, **"Vabad päevad"** (blocked days): a list of upcoming blocks with "Eemalda", plus a form `<input type="date">` + note + "Lisa vaba päev".
- **Router:** `'konsultatsioonid'` (param `'varasemad'` → past), `'konsultatsioon'` + id, `'ajad'`.
- **`render()` nav highlight:** treat `#/konsultatsioon/…` as current for the "Konsultatsioonid" link.
- **`viewList`** header: add `· Tulevasi konsultatsioone: ${consultations.upcoming}` to the offer line.

### 4.7 Site page `/konsultatsioon/` and `/en/consultation/`
- `routes.ts`: add `'consultation'`, `ROUTES.consultation = { et: '/konsultatsioon/', en: '/en/consultation/' }`. Not in `NAV`.
- **Move** the `field()` helper from `contact.ts` to `components.ts` as `export function formField(...)`, same signature, and use it from both pages.
- **i18n `consultation` block** (et / en). Copy exactly:

| key | et | en |
|---|---|---|
| title | `'Tasuta 20-minutiline konsultatsioon \| Turve'` | `'Free 20-minute consultation \| Turve'` |
| description | `'Broneerige tasuta 20-minutiline telefonikõne turvainseneriga: uus veebileht, vana lehe uuendamine või ettevõtte turvalisus.'` | `"Book a free 20-minute phone call with a security engineer: a new website, modernising an old one, or your company's security."` |
| heading | `'Tasuta 20-minutiline konsultatsioon'` | `'Free 20-minute consultation'` |
| lead | `'Valige sobiv aeg ja me helistame teile. Räägime, mida teie ettevõte vajab, ja ütleme ausalt, mis on päriselt oluline. Kõne ei kohusta teid millekski.'` | `"Pick a time and we'll call you. We talk about what your business needs and tell you honestly what really matters. The call doesn't commit you to anything."` |
| whatTitle | `'Millest saame rääkida'` | `'What we can talk about'` |
| what | `['Uus koduleht ja mida sinna kirjutada', 'Vana lehe uuendamine või turvaliseks tegemine', 'Teie ettevõtte e-posti, paroolide ja varunduse turvalisus', 'Turvakontrolli tulemus ja mida sellega teha']` | `['A new website and what to put on it', 'Modernising an old site or making it secure', "Your company's e-mail, passwords and backups", 'Your security check result and what to do about it']` |
| pickDay | `'Valige päev'` | `'Choose a day'` |
| pickTime | `'Valige kellaaeg'` | `'Choose a time'` |
| timesNote | `'Kellaajad on Eesti aja järgi.'` | `'Times are Estonian time.'` |
| loading | `'Laadin vabu aegu…'` | `'Loading free times…'` |
| noSlots | `'Praegu vabu aegu pole. Kirjutage meile ja leiame sobiva aja.'` | `"There are no free times right now. Write to us and we'll find a time."` |
| loadError | `'Vabu aegu ei õnnestunud laadida. Proovige hiljem uuesti või kirjutage meile.'` | `"Couldn't load the free times. Try again later or write to us."` |
| writeUs | `'Kirjuta meile'` | `'Write to us'` |
| chosen | `'Valitud aeg:'` | `'Chosen time:'` |
| change | `'Muuda aega'` | `'Change time'` |
| phoneHint | `'Helistame sellel numbril.'` | `'We call this number.'` |
| topic | `'Teema'` | `'Topic'` |
| topics | `{ website: 'Uus veebileht', modernising: 'Vana lehe uuendamine', security: 'Turvalisus', other: 'Muu' }` | `{ website: 'A new website', modernising: 'Modernising an old site', security: 'Security', other: 'Something else' }` |
| message | `'Mida peaksime enne kõnet teadma?'` | `'Anything we should know before the call?'` |
| submit | `'Broneeri aeg'` | `'Book this time'` |
| sending | `'Broneerin…'` | `'Booking…'` |
| doneTitle | `'Aeg on broneeritud'` | `'Your time is booked'` |
| doneText | `'Helistame teile {time} numbril {phone}. Kui aeg ei sobi enam, kirjutage {email}.'` | `"We'll call you on {phone} at {time}. If the time no longer suits you, write to {email}."` |
| addToCalendar | `'Lisa kalendrisse'` | `'Add to calendar'` |
| icsSummary | `'Turve: tasuta konsultatsioon'` | `'Turve: free consultation'` |
| noScript | `'Aja valimiseks on vaja JavaScripti. Võite ka kirjutada meile ja leppida aja kokku.'` | `'Choosing a time needs JavaScript. You can also write to us and agree on a time.'` |
| errors.slot_taken | `'Keegi jõudis selle aja just enne teid broneerida. Valige palun teine aeg.'` | `'Someone booked this time just before you. Please pick another.'` |
| errors.already_booked | `'Teil on juba üks broneeritud aeg. Selle muutmiseks kirjutage meile.'` | `'You already have a booked time. To change it, write to us.'` |
| errors.rate_limited | `'Liiga palju broneeringuid järjest. Proovige hiljem uuesti.'` | `'Too many bookings in a row. Please try again later.'` |

- Reuse `contact.name`, `company`, `email`, `phone`, `optional`, `consentBefore`, `consentLink`, `honeypot`, `errors.fields` and `errors.network` from the `contact` block.
- New `common.bookCall`: `'Broneeri tasuta konsultatsioon'` / `'Book a free consultation'`.
- New `footer.consultation`: `'Tasuta konsultatsioon'` / `'Free consultation'`.

**`pages/consultation.ts`** markup (classes reuse existing CSS where possible):
```
pageHead(heading, lead)
<section class="section tight"><div class="wrap narrow">
  <h2>whatTitle</h2> <ul class="checklist">what…</ul>
  <noscript><p class="notice">noScript <a href=contact>writeUs</a></p></noscript>
  <div class="booking" id="booking" hidden>
    <h2>pickDay</h2>
    <p class="muted" data-booking-status>loading</p>
    <div class="slot-grid" data-days role="group" aria-label=pickDay></div>
    <h2 data-times-title hidden>pickTime</h2>
    <div class="slot-grid" data-times role="group" aria-label=pickTime></div>
    <p class="muted">timesNote</p>
  </div>
  <form class="contact-form" id="booking-form" novalidate hidden>
    <p class="notice">chosen <strong data-chosen></strong> <button type="button" class="button ghost small" data-change>change</button></p>
    <p class="notice error" id="booking-error" role="alert" tabindex="-1" hidden></p>
    hidden inputs: lang, startsAt, token
    formField name (required), company (optional), phone (required, hint phoneHint, type tel), email (required)
    select topic (options in the topics order), textarea message (optional, maxlength 2000)
    honeypot block (copy from contact.ts), consent checkbox (copy from contact.ts)
    <p><button class="button" type="submit" data-label=submit data-sending=sending>submit</button></p>
  </form>
  <div id="booking-done" hidden>
    <h2>doneTitle</h2><p data-done-text></p>
    <p><button type="button" class="button" data-ics>addToCalendar</button></p>
  </div>
</div></section>
jsonBlock('booking-labels', { loading, noSlots, loadError, doneText, icsSummary, email: COMPANY.email, errors: { …consultation.errors, fields: contact.errors.fields, network: contact.errors.network } })
scripts: ['js/common.js', 'js/booking.js']
```

**`site/assets/js/booking.js`** (new; `textContent` only):
1. Show `#booking` (remove `hidden`) and fetch the form token as in `contact.js`.
2. `T.api('/api/consultations/slots')`:
   - on error → status = loadError;
   - if `days` is empty → status = noSlots;
   - otherwise clear the status text.
3. Day buttons: `<button type="button" class="slot" aria-pressed="false">`. Label = `Intl.DateTimeFormat(locale, { timeZone: 'Europe/Tallinn', weekday: 'short', day: 'numeric', month: 'numeric' })` of the first slot of that day.
4. Clicking a day:
   - mark it pressed and unpress the others;
   - show the times title;
   - render time buttons labelled `Intl.DateTimeFormat(locale, { timeZone: 'Europe/Tallinn', hour: '2-digit', minute: '2-digit' })`.
5. Clicking a time:
   - set `form.elements.startsAt.value` to the slot ISO string **exactly as received**;
   - set `[data-chosen]` to a long format: weekday long, day, month long, hour:minute, Tallinn;
   - hide `#booking`, show the form and focus the name field.
6. "Muuda aega" → hide the form, show `#booking`.
7. Submit:
   - client checks: name ≥ 2, email regex as in `contact.js`, phone ≥ 5 characters, consent; mark `aria-invalid` and show `errors.fields`;
   - `data = Object.fromEntries(new FormData(form))` with `data.consent = checkbox.checked`;
   - `T.api('/api/consultations', data)`.
   - **201** → hide the form; fill `doneText` (`{time}` = chosen label, `{phone}` = typed phone, `{email}` = labels.email); show `#booking-done`.
   - **409 `slot_taken`** → show that error, reload the slots, and go back to the picker (hide the form, show booking).
   - **409 `already_booked`** → show that error.
   - **429** → `rate_limited`. **400** → mark `fields`, show `errors.fields`. Anything else → `errors.network`.
   - Disable the button while sending, as in `contact.js`.
8. The ICS button builds this text (CRLF line endings; DTSTAMP = now in UTC; UID = `crypto.randomUUID() + '@turve.ee'`):
   ```
   BEGIN:VCALENDAR
   VERSION:2.0
   PRODID:-//Turve//Konsultatsioon//ET
   BEGIN:VEVENT
   UID:…
   DTSTAMP:20261108T120000Z
   DTSTART:<start as YYYYMMDDTHHMMSSZ>
   DTEND:<start + 20 min>
   SUMMARY:<icsSummary>
   END:VEVENT
   END:VCALENDAR
   ```
   Then: `new Blob([text], { type: 'text/calendar' })`, `URL.createObjectURL`, a temporary `<a download="turve-konsultatsioon.ics">`, `.click()`, and `revokeObjectURL`.

**CSS:**
```css
.slot-grid { display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 0.75rem 0 1.5rem; }
.slot { font: 500 0.95rem/1.2 var(--mono); background: var(--card); color: var(--ink); border: 1px solid var(--line); border-radius: 0.5rem; padding: 0.55rem 0.85rem; cursor: pointer; }
.slot:hover { border-color: var(--accent); }
.slot[aria-pressed="true"] { border: 2px solid var(--accent); padding: calc(0.55rem - 1px) calc(0.85rem - 1px); }
```
Check that `--mono`, `--ink`, `--card`, `--line` and `--accent` exist in `site.css` (they do in the style tile palette); use the right variable names.

**CTAs** (now that the page exists):
- `home.ts` final `ctaBand`, `websites.ts` and `security.ts` `ctaBand`s: add `{ href: href('consultation', lang), label: t.common.bookCall }` as an extra (ghost) button.
- `pricing.ts`: in the tight top section, add `<p class="notice">${p.consultNotice} <a href="${href('consultation', lang)}">${t.common.bookCall}</a></p>`, with new `pricing.consultNotice` = `'Pole kindel, mida valida?'` / `'Not sure what to pick?'`.
- `contact.ts`: below the `pageHead`, add `<p class="notice">${c.consultHint} <a href=consultation>${t.common.bookCall}</a></p>`, with new `contact.consultHint` = `'Eelistate rääkida?'` / `'Prefer to talk?'`.
- `layout.ts` footer links: add `consultation` after `examples`.

**Privacy policy** (`privacy.sections`, et + en):
- In "Milliseid andmeid kogume" / "What data we collect", add a paragraph:
  - et `'Tasuta konsultatsiooni broneering: nimi, ettevõte, telefon, e-post, teema, sõnum ja valitud aeg. Kasutame neid ainult kokkulepitud kõneks (lepingueelsed toimingud, isikuandmete kaitse üldmääruse art 6 lg 1 p b).'`
  - en `'Free consultation booking: name, company, phone, e-mail, topic, message and the chosen time. We use them only for the agreed call (steps prior to a contract, GDPR Art. 6(1)(b)).'`
- In the retention section, append:
  - et `' Konsultatsioonide broneeringud kustutame hiljemalt 12 kuu jooksul.'`
  - en `' Consultation bookings are deleted within 12 months.'`

### 4.8 Verify step 4
- Tests pass (slots and Tallinn time).
- Locally, in kapsaaed → Ajad, add Monday–Friday 17:00–19:00 and block one day. On `/konsultatsioon/`:
  - the times appear (16 h lead respected) and the blocked day is missing;
  - book one → confirmation shown, and the `.ics` downloads and opens in a calendar app;
  - kapsaaed lists the booking; the time disappears from the page;
  - book again with the same e-mail → "already booked";
  - cancel it in kapsaaed → the time is bookable again.
- **Race:** run two simultaneous `curl` POSTs with different e-mails and the same `startsAt`. One gets 201, the other 409 `slot_taken`. Get a valid token first from `/api/form-token`, or just let the token flag be set.
- A honeypot POST (`hp` filled) → 201, but the slot stays free and kapsaaed shows the booking as cancelled with the flag.
- A foreign-Origin admin PUT → 403 (existing guard).
- **Commit:** `Free 20-minute consultation booking`.

---

## STEP 5: Docs

**`CLAUDE.md`:**
- Intro: `without its mail server or booking code` → `without its mail server; the free consultation booking is a small module of its own (server/src/consultation/)`.
- System table: add rows for:
  - **Launch offer** (`LAUNCH_OFFER` in the catalog, `/api/launch-offer`, `Inquiries.countsForOffer`);
  - **Consultation booking** (`/konsultatsioon/`, `server/src/consultation/`, tables `ConsultationHours`/`ConsultationBlocks`/`Consultations`, kapsaaed "Konsultatsioonid"/"Ajad");
  - **One-pager kit** (`site/src/onepager/`, demos at `/naidised/<id>/` for betoon, keevitus, manikuur and universaalne, `npm run onepager -- <client-dir> --origin …`, `clients/` git-ignored).
- Owner decisions:
  - Replace the bullet "Prices are public and every hour is billable…" with: `Prices are public and fixed: each package shows what the client pays and gets. Hourly rates appear only at the end of /hinnad/, for consultation and project work (billed in 15-minute steps with a time log).`
  - Add: `Launch offer: web-onepage-launch at 99 € for the first 10 clients until 31.12.2026. The counter counts inquiries with countsForOffer = 1 that aren't spam; the owner toggles it per inquiry in kapsaaed.`
  - Add to the "No mail sending…" bullet: `Free 20-minute consultations are booked on the site and seen in kapsaaed; bookable times are set under "Ajad".`
- Follow-ups: in the retention bullet, add `Consultations older than 12 months`.

**Memory:** the owner's Claude memory is maintained by Opus; skip it unless you're told otherwise.

**Commit:** `Docs for fixed prices, launch offer, demos and consultations`.

---

## STEP 6: Deploy (OWNER CHECKPOINT: ask before each real deploy)

1. `./deployment/deploy.sh --preflight`, then `DEPLOY_STATIC='site kapsaaed' ./deployment/deploy.sh --dry-run`. Read the rsync output: **list any `*deleting` lines to the owner**.
2. Ask the owner for the go-ahead. The deploy migrates the live DB (005, 006) and restarts `turve-api`.
3. `DEPLOY_STATIC='site kapsaaed' ./deployment/deploy.sh` (it asks for confirmation unless `--yes`).
4. After the deploy:
   - `curl -s -o /dev/null -w '%{http_code}' https://api.turve.ee/api/health` → 200;
   - `curl -s https://api.turve.ee/api/launch-offer` → JSON with `"left":10`;
   - `curl -s https://api.turve.ee/api/consultations/slots` → `{"days":[]…}` until hours are set;
   - `POST https://api.turve.ee/api/admin/login` with a foreign Origin → 403.
5. Remind the owner to set consultation times in kapsaaed → **Ajad**.
6. Run www.turve.ee through the site's own check (`/turvakontroll/`): it must still be grade A. Open `https://www.turve.ee/naidised/betoon/` and check that the browser console has no CSP errors.

Each step can be deployed on its own (1+2 together is a good first deploy: new prices and the offer). Ask the owner which grouping they want.

---

## Final acceptance checklist
- [ ] No package price on the site is shown in hours. Hourly rates (unchanged, 55 / 75 €/h) appear only in the last section of /hinnad/ (et + en).
- [ ] All prices match table 1.1 (or the owner's edits). `CATALOG_VERSION` is bumped.
- [ ] The 99 € offer card is first under "Uued veebilehed" and in the home band, showing the regular price and the live "Kohti alles: X / 10".
- [ ] The counter excludes spam and toggled-off inquiries, and refuses spots after 10 or after 31.12.2026 (with flags).
- [ ] No form has a "how did you hear about us" field, and there is no calendar feed.
- [ ] `sec-fix` is shown under security services, and the security lead mentions fixing.
- [ ] 4 demos (betoon, keevitus, manikuur, universaalne) with guide chips and notes at `/naidised/<id>/`, plus the `/naidised/` page with the "Mida teilt vajame" checklist. "Vali see kujundus" prefills the contact form.
- [ ] The client CLI builds a site with a strict `.htaccess`.
- [ ] Consultation booking works end to end, with no double bookings, and the owner manages times in kapsaaed.
- [ ] Privacy policy updated (consultations, retention).
- [ ] `npm run typecheck && npm test` (server) and `npm run typecheck && npm run build` (site) are green.
- [ ] No inline JS/CSS, no `innerHTML`, no third-party requests (check DevTools → Network on each new page).
- [ ] `CLAUDE.md` updated; one commit per step; nothing pushed.

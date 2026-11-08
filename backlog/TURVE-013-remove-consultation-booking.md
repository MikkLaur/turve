---
status: doing
area: site
created: 2026-11-08
---

# TURVE-013: Remove the consultation booking; arrange the free call by contact form or phone

The free 20-minute consultation stays, but visitors no longer book a time slot on the site. Instead they say in the contact form that they want the free consultation (and we call them), or they simply call +372 5192 8421. Booking is removed **everywhere**: the `/konsultatsioon/` page, `booking.js`, the API module and routes, kapsaaed's **Konsultatsioonid** and **Ajad** tabs, and the three DB tables. Old links (including ads) are redirected to the contact page.

This ticket is a **handover spec**: follow it step by step. Every decision is already made and the copy below is final.

## Decisions (made by the owner on 2026-11-08, do not re-open)
- **Remove everything**, with no dead code left. A new migration drops `Consultations`, `ConsultationBlocks` and `ConsultationHours`. Migration 006 stays untouched (never edit an applied migration).
- **Every "Broneeri tasuta konsultatsioon" button becomes a call button:** "Helista +372 5192 8421" (`tel:` link), in the same place and style (secondary/ghost). The main "Küsi pakkumist" / free-check buttons stay.
- **The free consultation is still "20 minutes"** and still free. Any copy that says the design is picked "in the free consultation" (home offer text, catalog) stays as it is: the call still happens.
- **Contact form: no new fields** (lean pages). The notice above the form tells visitors to mention the consultation in their message and add a phone number, or to just call.
- **Redirects:** `/konsultatsioon/` → `/kontakt/` and `/en/consultation/` → `/en/contact/` (301), so old links and the Facebook ad keep working.
- **Keep:** `server/src/services/tallinnTime.ts` and its test (the launch offer uses it), `dbNow()` in `server/src/db/pool.ts` (the documented DB-clock helper), and the `consultation.*` labels in kapsaaed's `AUDIT` map (old log entries still show them).

## Rules (from CLAUDE.md)
- All markup goes through the `html` tag; no inline JS or CSS. `en.ts` is typed against `et.ts`: change both files the same way.
- API: GET and POST only (Zone's proxy).
- Never edit an applied migration; add a new one.
- Do not deploy without the owner's go-ahead (step 8). The deploy migrates the live DB and **deletes any stored bookings**.

---

## Step 1: API (`server/`)

### 1.1 Delete these files
```
server/src/consultation/slots.ts            (and the now-empty server/src/consultation/ folder)
server/src/controllers/consultationController.ts
server/src/controllers/adminConsultationController.ts
server/src/repositories/consultations.ts
server/test/consultationSlots.test.ts
```

### 1.2 `server/src/routes/publicRoutes.ts`
- Remove the line `import { consultationValidation, createConsultation, getSlots } from '../controllers/consultationController';`
- Remove both routes:
  ```ts
  router.get('/consultations/slots', limiter(15, 120, 'Too many requests'), getSlots);
  router.post('/consultations', limiter(60, 3, 'Too many bookings, try again later'), consultationValidation, createConsultation);
  ```

### 1.3 `server/src/routes/adminRoutes.ts`
- Remove the whole `import { addBlockHandler, … setConsultationStatusHandler } from '../controllers/adminConsultationController';` block.
- Remove the nine routes from `router.get('/consultations', …)` through `router.post('/consultation-blocks/:day/delete', …)`.

### 1.4 `server/src/controllers/adminInquiryController.ts`
- Remove `import { countUpcoming } from '../repositories/consultations';`
- Replace `getOverview` with:
  ```ts
  export async function getOverview(_req: Request, res: Response): Promise<void> {
    const [counts, offer] = await Promise.all([countByStatus(), currentOfferStatus()]);
    res.json({ counts, offer });
  }
  ```

### 1.5 `server/src/repositories/audit.ts`
Remove the five members `'consultation.status'`, `'consultation.notes'`, `'consultation.delete'`, `'consultation.hours'` and `'consultation.block'` from `AuditAction`. (Old rows in `AuditLog` keep their text; kapsaaed still labels them.)

### 1.6 New migration `server/src/db/migrations/007-drop-consultations.ts`
```ts
import { Migration } from './types';

const migration: Migration = {
  id: '007-drop-consultations',
  async up(pool) {
    // The free consultation is no longer booked on the site (TURVE-013): visitors ask for it in the contact form or call.
    await pool.query('DROP TABLE IF EXISTS Consultations');
    await pool.query('DROP TABLE IF EXISTS ConsultationBlocks');
    await pool.query('DROP TABLE IF EXISTS ConsultationHours');
  },
  async down() {
    // Nothing to restore: 006-consultations holds the schema if booking ever comes back.
  },
};

export default migration;
```
In `server/src/db/migrations/index.ts`, add `import migration007 from './007-drop-consultations';` after the 006 import and append `migration007` to the `migrations` array.

### 1.7 `server/test/routes.test.ts`
In the list under "has the POST replacements for the old PUT/DELETE admin routes", remove `'POST /consultation-hours'`, `'POST /consultation-blocks/:day/delete'` and `'POST /consultations/:id/delete'`. Keep the inquiry entries.

### 1.8 Check
```sh
cd server && npm run typecheck && npm test
grep -rn -i 'consultation' src test        # only src/db/migrations/006-consultations.ts, 007-drop-consultations.ts and index.ts
npm run migrate:dev                         # applies 007 locally
mariadb -h 127.0.0.1 -u turve -pturve turve_dev -e "SHOW TABLES LIKE 'Consultation%'"   # empty
```

## Step 2: site copy (`site/src/i18n/et.ts` and `en.ts`)

### 2.1 Remove
- The whole top-level `consultation: { … }` object (title through `errors`) in both files.
- `footer.consultation`.
- `common.bookCall`.

### 2.2 `common`: add one key where `bookCall` was
- et: `call: 'Helista',`
- en: `call: 'Call',`

### 2.3 `pricing`: keep `consultNotice`, add four keys right after it
et:
```ts
    consultNotice: 'Pole kindel, mida valida?',
    consultCall: 'Helistage',
    consultOr: 'või',
    consultWrite: 'kirjutage meile',
    consultFree: '20-minutiline konsultatsioon on tasuta.',
```
en:
```ts
    consultNotice: 'Not sure what to pick?',
    consultCall: 'Call',
    consultOr: 'or',
    consultWrite: 'write to us',
    consultFree: 'The 20-minute consultation is free.',
```

### 2.4 `contact`: replace `consultHint` and `callOr`
et:
```ts
    consultHint: 'Soovite enne rääkida? Kirjutage sõnumisse, et soovite tasuta 20-minutilist konsultatsiooni, ja lisage telefoninumber: helistame teile.',
    callOr: 'Või helistage ise:',
```
en:
```ts
    consultHint: "Want to talk first? Say in your message that you'd like the free 20-minute consultation and add your phone number: we'll call you.",
    callOr: 'Or just call us:',
```

### 2.5 `privacy`
- In "Milliseid andmeid kogume" / "What data we collect", delete the paragraph that starts `'Tasuta konsultatsiooni broneering: …'` / `'Free consultation booking: …'`.
- In "Kui kaua andmeid hoiame" / "How long we keep data", delete the last sentence `Konsultatsioonide broneeringud kustutame hiljemalt 12 kuu jooksul.` / `Consultation bookings are deleted within 12 months.` (and the space before it).

## Step 3: site code (`site/`)

### 3.1 Delete
```
site/src/pages/consultation.ts
site/assets/js/booking.js
```

### 3.2 `site/src/routes.ts`
Remove `| 'consultation'` from `PageId` and the `consultation: { et: '/konsultatsioon/', en: '/en/consultation/' },` line from `ROUTES`.

### 3.3 `site/src/build.ts`
Remove `import { consultationPage } from './pages/consultation';` and the `['consultation', consultationPage],` entry. Leave the demo comment that mentions the free consultation: it's still true.

### 3.4 `site/src/components.ts`: a shared call button
Add `import { COMPANY, phoneHref } from './config';` (merge with an existing `./config` import if there is one) and this function after `ctaBand`:
```ts
/** The secondary "Helista +372 …" button: a tel: link to the Turve phone. */
export function callButton(ctx: PageContext): { href: string; label: string } {
  return { href: phoneHref(COMPANY.phone), label: `${ctx.t.common.call} ${COMPANY.phone}` };
}
```

### 3.5 Replace every booking button with the call button
In each file, import `callButton` from `'../components'` (add it to the existing import).

- `site/src/pages/home.ts`, offer band: replace
  ```ts
  <a class="button ghost" href="${href('consultation', lang)}">${t.common.bookCall}</a>
  ```
  with
  ```ts
  <a class="button ghost" href="${callButton(ctx).href}">${callButton(ctx).label}</a>
  ```
- `home.ts` final `ctaBand`, `site/src/pages/websites.ts`, `site/src/pages/security.ts` and `site/src/pages/about.ts`: replace the array entry
  ```ts
  { href: href('consultation', lang), label: t.common.bookCall },
  ```
  with
  ```ts
  callButton(ctx),
  ```

### 3.6 `site/src/pages/pricing.ts`
Add `import { COMPANY, phoneHref } from '../config';` and replace the notice
```ts
<p class="notice">${p.consultNotice} <a href="${href('consultation', lang)}">${t.common.bookCall}</a></p>
```
with
```ts
<p class="notice">${p.consultNotice} ${p.consultCall} <a href="${phoneHref(COMPANY.phone)}">${COMPANY.phone}</a> ${p.consultOr} <a href="${href('contact', lang)}">${p.consultWrite}</a>. ${p.consultFree}</p>
```
Result: "Pole kindel, mida valida? Helistage +372 5192 8421 või kirjutage meile. 20-minutiline konsultatsioon on tasuta."

### 3.7 `site/src/pages/contact.ts`
Replace the notice
```ts
<p class="notice">${c.consultHint} <a href="${href('consultation', lang)}">${t.common.bookCall}</a>${COMPANY.phone ? html` ${c.callOr} <a href="${phoneHref(COMPANY.phone)}">${COMPANY.phone}</a>.` : ''}</p>
```
with
```ts
<p class="notice">${c.consultHint} ${c.callOr} <a href="${phoneHref(COMPANY.phone)}">${COMPANY.phone}</a>.</p>
```

### 3.8 `site/src/layout.ts`: footer
Remove `<li><a href="${href('consultation', lang)}">${t.footer.consultation}</a></li>`. The phone number is already in the footer.

### 3.9 `site/assets/css/site.css`
Delete the comment `/* ---------- consultation booking (/konsultatsioon/) ---------- */` and the seven rules under it, from `.booking, #booking-form, #booking-done { … }` through `.slot[aria-pressed="true"] { … }`. **Keep** the `.package.selected` and `.package.offer.selected` lines that follow them (they belong to the price list).

### 3.10 Redirects: `site/src/headers.ts`, function `htaccess`
Directly after the line `RewriteRule ^ ${cfg.siteOrigin}%{REQUEST_URI} [R=301,L]`, add:
```
# The free consultation is no longer booked on the site (TURVE-013): old links and ads go to the contact form.
RewriteRule ^konsultatsioon/?$ /kontakt/ [R=301,L]
RewriteRule ^en/consultation/?$ /en/contact/ [R=301,L]
```
(These are plain lines inside the template string; no escaping is needed.)

### 3.11 Check
```sh
cd site && npm run typecheck && npm run build                 # green, no broken links
grep -rn "consultation'\|bookCall\|footer.consultation\|booking" src assets/js   # nothing
ls dist/konsultatsioon dist/en/consultation 2>&1 | grep -c 'No such'           # 2
grep -c 'tel:+37251928421' dist/index.html dist/veebilehed/index.html dist/turvalisus/index.html dist/meist/index.html dist/hinnad/index.html dist/kontakt/index.html
#   index.html 3 (offer band, CTA, footer); the others 2 each (button or notice + footer)
grep -n 'konsultatsioon\|consultation' dist/.htaccess                           # the two RewriteRules
grep -rln 'href="/konsultatsioon/\|href="/en/consultation/' dist                 # nothing
```

## Step 4: kapsaaed

### 4.1 `kapsaaed/index.html`
Remove the two nav links `<a href="#/konsultatsioonid" …>Konsultatsioonid</a>` and `<a href="#/ajad" …>Ajad</a>`.

### 4.2 `kapsaaed/app.js`
- Remove the constants `CONSULT_STATUS`, `TOPIC` and `WEEKDAY` (lines 25–27). **Keep** the `'consultation.*'` entries in `AUDIT`, and add a comment above them: `// Booking was removed (TURVE-013); kept for older log entries.`
- In `render()`, simplify the current-link test to:
  ```js
  const current = target === '#/' ? hash === '#/' || hash === '#' || hash.startsWith('#/paring') : hash.startsWith(target);
  ```
- In the inquiry list view, change
  ```js
  const [{ counts, offer, consultations }, { inquiries }] = await Promise.all([…]);
  ```
  to `const [{ counts, offer }, { inquiries }] = …` (same `Promise.all`), and replace the muted paragraph with:
  ```js
  h('p', { class: 'muted' }, `Aastalõpu pakkumine: ${offer.taken}/${offer.spots} kohta võetud${offer.open ? '' : ' (suletud)'}`),
  ```
- Delete everything from the comment `/* ---------- consultations (free 20-minute calls booked on /konsultatsioon/) ---------- */` up to (not including) `/* ---------- router ---------- */`: `dayFmt`, `fmtDay`, `consultationCard`, `viewConsultations`, `viewConsultation` and `viewHours`.
- In `route()`, delete the three lines for `'konsultatsioonid'`, `'konsultatsioon'` and `'ajad'`.

### 4.3 `kapsaaed/app.css`
Delete `.status-booked`, `.status-done`, `.status-no_show`, `.status-cancelled`, `.hours-row` (both lines, including the `@media` one) and `li.card .line1 { align-items: center; }` (only the blocked-days list used it).

### 4.4 Check
```sh
grep -n 'konsultatsioon\|#/ajad\|consultations\|CONSULT_STATUS\|TOPIC\|WEEKDAY\|fmtDay' kapsaaed/app.js kapsaaed/index.html   # nothing
grep -n "'consultation\." kapsaaed/app.js                                                                     # the 5 AUDIT labels only
```
Then with the API running locally (`cd server && npm run dev`) and `cd site && npm run dev`: log in at `http://localhost:8081/`. The nav shows Päringud, Kõik päringud, Turvakontrollid, Logi. The inquiry list loads and shows the offer line, the Logi page loads, and the browser console shows no errors.

## Step 5: visual check
`cd site && npm run dev`, then check at desktop width and on a phone-sized window:
- `/` (offer band and final CTA): "Helista +372 5192 8421" ghost button next to the main button.
- `/veebilehed/`, `/turvalisus/`, `/meist/`: the call button in the end band.
- `/hinnad/`: the new notice with two links.
- `/kontakt/` and `/en/contact/`: the new notice.
- Footer: no "Tasuta konsultatsioon" link.
- No console errors or CSP errors on any of them.

## Step 6: docs and backlog
- `CLAUDE.md`:
  - Intro line: `without its mail server; the free consultation booking is a small module of its own (\`server/src/consultation/\`).` → `without its mail server.`
  - Intro line about the campaign: `(fixed prices, 99 € offer, demos, consultations)` stays (the plan file is history).
  - Delete the **Consultation booking** row of the System table.
  - Owner decisions, "No mail sending…" bullet: `inquiries and consultation bookings are seen in kapsaaed only. Free 20-minute consultations are booked on the site; bookable times are set under "Ajad".` → `inquiries are seen in kapsaaed only. The free 20-minute consultation is a phone call: visitors ask for it in the contact form or call +372 5192 8421.`
  - Verification, API line: remove `consultation slots and ` from the list of what the tests cover (keep "Tallinn time").
- `backlog/TURVE-001-deploy-launch-campaign.md`: change `- [ ] Consultation times set in kapsaaed → Ajad.` to `- [x] ~~Consultation times set in kapsaaed → Ajad.~~ (booking removed in TURVE-013)` and add a log line.
- `backlog/TURVE-008-data-retention-purge.md`: delete the `Consultations` line and add a log line `- YYYY-MM-DD: Consultations removed (TURVE-013); nothing to purge there.`
- This ticket: tick the checklist, `status: doing` until deployed, log lines.

## Step 7: commit
One commit (no Co-Authored-By trailer):
```
Remove consultation booking: ask in the contact form or call
```
Do not push.

## Step 8: deploy (OWNER CHECKPOINT)
1. **Owner:** open kapsaaed → Konsultatsioonid on the **live** site and write down any upcoming bookings (name, phone, time). Migration 007 deletes them; the calls themselves should still happen.
2. `./deployment/deploy.sh --preflight`, then `DEPLOY_STATIC='site kapsaaed' ./deployment/deploy.sh --dry-run`. Expected `*deleting` lines: `konsultatsioon/…`, `en/consultation/…`, `assets/js/booking.<hash>.js`, the old `assets/site.<hash>.css`, and in `server/` the deleted source files. Report anything else to the owner before going on.
3. With the owner's go-ahead: `DEPLOY_STATIC='site kapsaaed' ./deployment/deploy.sh --yes`. The log must show `007-drop-consultations` applied.
4. After the deploy:
   ```sh
   curl -s -o /dev/null -w '%{http_code}\n' https://api.turve.ee/api/health                                   # 200
   curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' https://www.turve.ee/konsultatsioon/              # 301 https://www.turve.ee/kontakt/
   curl -s -o /dev/null -w '%{http_code} %{redirect_url}\n' https://www.turve.ee/en/consultation/             # 301 https://www.turve.ee/en/contact/
   curl -s -o /dev/null -w '%{http_code}\n' https://api.turve.ee/api/consultations/slots                      # 404
   curl -s https://www.turve.ee/ | grep -c 'tel:+37251928421'                                                 # 3
   ```
   A foreign-Origin `POST https://api.turve.ee/api/admin/login` → 403. Run www.turve.ee through the site's own check: still grade A. Log in to kapsaaed: no Konsultatsioonid or Ajad tabs, and the overview loads.
5. Tell the owner: if the Facebook ad links to `/konsultatsioon/`, it now lands on the contact form; consider pointing it straight at `/kontakt/` or the home page.
6. Set this ticket to `status: done`.

## Done when
- [x] No booking page, booking script, booking API routes, kapsaaed booking tabs or consultation tables remain.
- [x] Every former booking button is a "Helista +372 5192 8421" button; the pricing and contact notices explain the free 20-minute call.
- [x] `/konsultatsioon/` and `/en/consultation/` redirect (301) to the contact page.
- [x] Privacy policy no longer mentions consultation bookings.
- [x] `server`: typecheck + tests green; `site`: typecheck + build green.
- [x] CLAUDE.md, TURVE-001 and TURVE-008 updated; committed.
- [ ] Deployed; checks in step 8.4 pass; still grade A.

## Log
- 2026-11-08: Created. Owner: a contact form is enough; visitors can ask for the free consultation there or just call.
- 2026-11-08: Built. API typecheck + 48 tests green; site typecheck + build green; checks in 3.11 and 4.4 pass. Not run locally: migration 007 and the kapsaaed login (no local MariaDB on this machine any more). Extra: `a[href^="tel:"] { white-space: nowrap; }` in site.css so the number never wraps. Waiting for the owner checkpoint (upcoming bookings) and deploy.

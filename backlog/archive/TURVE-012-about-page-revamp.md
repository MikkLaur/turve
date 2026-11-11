---
status: done
area: site
created: 2026-11-08
---

# TURVE-012: About page revamp: why Turve exists, LinkedIn and phone

The about page (`/meist/`, `/en/about/`) says almost nothing about the person behind Turve or why the company exists. The new page tells the owner's reason for starting Turve: companies have long treated cyber security as a cost to put off, the times no longer allow it, and small companies need security they can afford. It then says what that means for a client. The career is **not** repeated: it gets one sentence and a link to LinkedIn. The Turve phone number goes on the about page, the contact page and the site footer.

This ticket is a **handover spec**: follow it step by step. Every decision is already made; the copy below is final (the owner reviews it on the dev server in step 6).

## Decisions (made by the owner on 2026-11-08, do not re-open)
- **No copy of LinkedIn.** No career timeline, no job descriptions, no volunteering list. The page says what LinkedIn can't: why Turve exists and what it means for the client. The career is one sentence plus the LinkedIn link.
- **The message:** cyber security has to be accessible to every business, not only big ones. Companies have treated it as an expense and put it off; the times are rough and that is no longer an option; at least something must be invested. That is why Turve exists.
- **Bigbank is named once** ("By day I'm a security engineer at Bigbank"). Turve and Bigbank are not related, but the page must **not** say so outright. The separation is implied by "Turve on minu oma ettevõte" ("Turve is my own company") right after it. The role line under the name does not mention Bigbank.
- **LinkedIn:** `https://www.linkedin.com/in/mikk-laur/`, a plain link (no LinkedIn widget, badge or script: no third-party code anywhere).
- **Phone:** `+372 5192 8421` (the Turve business number). A `tel:` link on the about page, the contact page and in the footer of every page.
- **Voice:** the about page speaks in the first person ("I"). The rest of the site keeps "we".
- The old "Mida lubame" (honesty, clarity, confidentiality) section becomes "Mida see teile tähendab" (four points); its ideas are kept inside the new points.
- The Kämblakoda sentence leaves the bio: the reference section further down already shows that work.

## Rules (from CLAUDE.md)
- All markup goes through the escaping `html` tag (`site/src/html.ts`). No inline JS or CSS: no `style=""` attributes. JSON-LD via `page.jsonLd` is fine.
- `en.ts` is typed against `et.ts`: add every new key to **both** files with the same shape.
- Estonian: address the reader as "teie".
- Do not touch anything not listed here. Do not deploy without the owner's go-ahead (step 9).

---

## Step 1: `site/src/config.ts`

1. In `COMPANY`, set the phone:
   ```ts
   phone: '+372 5192 8421',
   ```
2. Add this function directly below `fillCompany`:
   ```ts
   /** A tel: link for a displayed phone number such as '+372 5192 8421'. */
   export function phoneHref(phone: string): string {
     return `tel:${phone.replace(/[^\d+]/g, '')}`;
   }
   ```
3. In `PERSON`, replace `role` and `linkedin`:
   ```ts
   role: { et: 'Turvainsener · Turve asutaja', en: 'Security engineer · founder of Turve' },
   ```
   ```ts
   linkedin: 'https://www.linkedin.com/in/mikk-laur/',
   ```
   Leave `name` and `photo` as they are.

## Step 2: copy in `site/src/i18n/et.ts` and `en.ts`

### 2.1 `about` (replace the whole `about: { … }` object in each file)

**et.ts:**
```ts
  about: {
    title: 'Meist | Turve',
    description:
      'Mikk Laur on turvainsener ja Turve asutaja. Küberturve peab olema jõukohane igale ettevõttele, mitte ainult suurtele.',
    heading: 'Kes on Turve taga',
    lead: 'Küberturve ei tohi olla ainult suurte ettevõtete pärusmaa.',
    personTitle: 'Inimene',
    personBio: [
      'Ettevõtted on küberturvet pikalt pidanud kuluks, mille võib edasi lükata. Need ajad on möödas: petukirjad, ülevõetud kontod ja häkitud kodulehed ei vali enam suuri ja rikkaid, vaid kõiki, kelle juurde on lihtne sisse saada.',
      'Väikeettevõttel pole oma turvainseneri ega suure firma eelarvet. Aga midagi tuleb teha, ja see midagi peab olema jõukohane. Selleks ongi Turve: turvateenused, mida saab endale lubada iga ettevõte.',
      'Päeval töötan turvainsenerina Bigbankis. Turve on minu oma ettevõte, kus teen väikeettevõtetele sama laadi tööd: leian nõrgad kohad enne ründajaid ja selgitan lihtsas keeles, mida nendega teha.',
    ],
    photoAlt: 'Turve asutaja',
    linkedin: 'Minu taust LinkedInis',
    forYouTitle: 'Mida see teile tähendab',
    forYou: [
      { title: 'Vaatan ründaja pilguga', text: 'Iga lehte, mille ehitan, kontrollin enne üleandmist nii, nagu seda teeks ründaja. Mida leian, selle parandan enne, kui keegi teine selle leiab.' },
      { title: 'Alustada saab väikselt', text: 'Turvalisus ei pea algama suurest projektist. Tasuta turvakontroll või üks turva-tervisekontroll näitab, kust alustada, ja hind on enne teada.' },
      { title: 'Ütlen, mis pole vajalik', text: 'Kõike ei pea parandama. Ütlen ausalt, mis on päriselt oluline, ka siis, kui see tähendab väiksemat arvet.' },
      { title: 'Teie andmed jäävad teile', text: 'Teie andmed ja turvaleiud ei lähe kellelegi edasi.' },
    ],
  },
```

**en.ts:**
```ts
  about: {
    title: 'About | Turve',
    description:
      'Mikk Laur, security engineer and founder of Turve. Cyber security has to be affordable for every business, not only the big ones.',
    heading: 'Who is behind Turve',
    lead: 'Cyber security can’t be something only big companies can afford.',
    personTitle: 'The person',
    personBio: [
      'For years, companies have treated cyber security as a cost they can put off. Those days are over: phishing, hijacked accounts and hacked websites no longer pick the big and the rich, but anyone who is easy to get into.',
      'A small company has no security engineer of its own and no big-company budget. But it has to do something, and that something has to be affordable. That’s why Turve exists: security services any company can afford.',
      'By day I’m a security engineer at Bigbank. Turve is my own company, where I do the same kind of work for small businesses: find the weak spots before attackers do, and explain in plain language what to do about them.',
    ],
    photoAlt: 'founder of Turve',
    linkedin: 'My background on LinkedIn',
    forYouTitle: 'What this means for you',
    forYou: [
      { title: 'I look at it like an attacker', text: 'Every site I build gets checked the way an attacker would check it, before handover. What I find, I fix before anyone else finds it.' },
      { title: 'You can start small', text: 'Security doesn’t have to start with a big project. A free security check or a single security health check shows where to begin, and you know the price up front.' },
      { title: 'I tell you what isn’t needed', text: 'Not everything needs fixing. I’ll tell you honestly what really matters, even if that means a smaller invoice.' },
      { title: 'Your data stays yours', text: 'Your data and security findings go to no one else.' },
    ],
  },
```

If the existing files use straight apostrophes inside double-quoted strings instead of `’`, either style is fine; keep the file consistent.

### 2.2 `contact`: one new key in each file (add it right after `consultHint`)
- et.ts: `callOr: 'või helistage',`
- en.ts: `callOr: 'or call',`

## Step 3: `site/src/pages/about.ts` (replace the whole file)

```ts
import { COMPANY, PERSON, phoneHref } from '../config';
import { ctaBand, pageHead } from '../components';
import type { PageContext, PageOutput } from '../context';
import { html, type Raw } from '../html';
import { href } from '../routes';

/** /meist/: the person behind Turve – why the company exists, what it means for the client, a reference and direct contact links. */
export function aboutPage(ctx: PageContext): PageOutput {
  const { t, lang, asset, cfg } = ctx;
  const a = t.about;

  const contactLinks: Raw[] = [];
  if (PERSON.linkedin) contactLinks.push(html`<a href="${PERSON.linkedin}" rel="me noopener">${a.linkedin}</a>`);
  if (COMPANY.phone) contactLinks.push(html`<a href="${phoneHref(COMPANY.phone)}">${COMPANY.phone}</a>`);

  const body = html`
    ${pageHead(a.heading, a.lead)}
    <section class="section" aria-labelledby="h-person">
      <div class="wrap person">
        ${PERSON.photo
          ? html`<img class="person-photo" src="${asset(PERSON.photo)}" alt="${PERSON.name ? `${PERSON.name}, ${a.photoAlt}` : a.photoAlt.charAt(0).toUpperCase() + a.photoAlt.slice(1)}" width="320" height="320">`
          : html`<div class="person-photo placeholder" role="img" aria-label="${a.photoAlt}"><span>turve</span></div>`}
        <div>
          <h2 id="h-person">${PERSON.name || a.personTitle}</h2>
          <p class="person-role">${PERSON.role[lang]}</p>
          ${a.personBio.map((paragraph) => html`<p>${paragraph}</p>`)}
          ${contactLinks.length ? html`<p class="person-links">${contactLinks}</p>` : ''}
        </div>
      </div>
    </section>
    <section class="section alt" aria-labelledby="h-for-you">
      <div class="wrap">
        <h2 id="h-for-you">${a.forYouTitle}</h2>
        <div class="card-grid two">${a.forYou.map((point) => html`<article class="point"><h3>${point.title}</h3><p>${point.text}</p></article>`)}</div>
      </div>
    </section>
    <section class="section" aria-labelledby="h-reference">
      <div class="wrap">
        <h2 id="h-reference">${t.home.referenceTitle}</h2>
        <article class="reference">
          <h3>${t.home.referenceName}</h3>
          <p>${t.home.referenceText}</p>
          <p><a href="https://www.kamblakoda.ee/" rel="noopener">${t.home.referenceLink}</a></p>
        </article>
      </div>
    </section>
    ${ctaBand(ctx, t.home.finalTitle, t.home.finalText, [
      { href: href('contact', lang), label: t.common.askOffer, primary: true },
      { href: href('consultation', lang), label: t.common.bookCall },
    ])}`;

  return {
    id: 'about',
    title: a.title,
    description: a.description,
    body,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      mainEntity: {
        '@type': 'Person',
        name: PERSON.name,
        description: a.description,
        ...(PERSON.photo ? { image: new URL(asset(PERSON.photo), cfg.siteOrigin).href } : {}),
        ...(PERSON.linkedin ? { sameAs: [PERSON.linkedin] } : {}),
        ...(COMPANY.phone ? { telephone: COMPANY.phone } : {}),
      },
    },
  };
}
```

What changed compared with the old file, so you can check your diff: the contact links (LinkedIn + phone instead of LinkedIn only), "Mida lubame" replaced by the four "Mida see teile tähendab" points in a two-column grid, a second CTA button for the consultation, and the JSON-LD. The section backgrounds stay as before: page head (dark), person (plain), points (alt), reference (plain), CTA band (dark).

If `import { html, type Raw }` is not accepted, use `import { html } from '../html'; import type { Raw } from '../html';`.

## Step 4: CSS in `site/assets/css/site.css`

Append this line to the end of the `/* ---------- about ---------- */` block (after `.person-role`):

```css
.person-links { display: flex; flex-wrap: wrap; gap: 0.5rem 1.5rem; font-weight: 600; }
```

## Step 5: phone on the contact page, in the footer and in the home JSON-LD

### 5.1 Footer: `site/src/layout.ts`, function `footer`
- Import `phoneHref` together with `COMPANY` from `./config` (extend the existing import).
- Directly after the e-mail line
  ```ts
  ${COMPANY.email ? html`<p><a href="mailto:${COMPANY.email}">${COMPANY.email}</a></p>` : ''}
  ```
  add:
  ```ts
  ${COMPANY.phone ? html`<p><a href="${phoneHref(COMPANY.phone)}">${COMPANY.phone}</a></p>` : ''}
  ```

### 5.2 Contact page: `site/src/pages/contact.ts`
- Add `import { COMPANY, phoneHref } from '../config';`.
- Replace the notice line
  ```ts
  <p class="notice">${c.consultHint} <a href="${href('consultation', lang)}">${t.common.bookCall}</a></p>
  ```
  with
  ```ts
  <p class="notice">${c.consultHint} <a href="${href('consultation', lang)}">${t.common.bookCall}</a>${COMPANY.phone ? html` ${c.callOr} <a href="${phoneHref(COMPANY.phone)}">${COMPANY.phone}</a>.` : ''}</p>
  ```
  Result: "Eelistate rääkida? Broneeri tasuta konsultatsioon või helistage +372 5192 8421." / "Prefer to talk? Book a free consultation or call +372 5192 8421."

### 5.3 Home JSON-LD: `site/src/pages/home.ts`
In the `jsonLd` object, directly after the `email` line, add:
```ts
...(COMPANY.phone ? { telephone: COMPANY.phone } : {}),
```

## Step 6: verify (OWNER CHECKPOINT at the end)

1. `cd site && npm run typecheck && npm run build`: both green, no broken links. The build's content TODO list must not grow.
2. The phone link is on every page (footer) and in the right extra places:
   ```sh
   cd site
   grep -L 'href="tel:+37251928421"' $(find dist -name index.html -not -path 'dist/naidised/*')   # prints nothing
   grep -c 'tel:+37251928421' dist/meist/index.html dist/en/about/index.html dist/kontakt/index.html   # 2 or more each (footer + page)
   grep -c 'linkedin.com/in/mikk-laur/' dist/meist/index.html dist/en/about/index.html   # 2 each (link + JSON-LD)
   grep -rn 'style="' dist --include=index.html | grep -v naidised   # prints nothing
   ```
   If the contact page is not at `dist/kontakt/index.html`, find it with `ls dist`.
   (`/naidised/` demos use their own footer; they are left out on purpose.)
3. `npm run dev`, open `http://localhost:8080/meist/` and `http://localhost:8080/en/about/`:
   - widths 375 px and 1280 px, light and dark mode (`prefers-color-scheme`);
   - sections alternate: page head (dark), person (plain), points (alt), reference (plain), CTA band (dark) with two buttons;
   - the four points form a 2 × 2 grid on desktop and one column on mobile;
   - the LinkedIn link opens `https://www.linkedin.com/in/mikk-laur/`, the phone link is `tel:+37251928421`;
   - DevTools console: no CSP errors; Network: no third-party requests.
4. Check `/kontakt/` (and `/en/` equivalent) and the footer on any page at 375 px.
5. **OWNER CHECKPOINT:** ask the owner to read both language versions of `/meist/` on the dev server and approve the copy before committing. Apply their wording changes to `et.ts`/`en.ts` exactly.

## Step 7: docs and backlog
- `CLAUDE.md`, section "Content still owed by the owner": remove "the bio in `about.personBio` (et/en), a photo in `site/assets/img/`," (both are done: the bio by this ticket, the photo is `site/assets/img/person.webp`).
- `backlog/TURVE-002-owner-content-for-strict-build.md`: tick "Bio in `about.personBio` (et + en)" and "Portrait photo in `site/assets/img/`", and add a log line `- YYYY-MM-DD: Bio and photo done (TURVE-012).` with the real date.
- This ticket: tick the checklist below, set `status: doing` until deployed, add log lines.

## Step 8: commit
One commit, message (no Co-Authored-By trailer):
```
About page: why Turve, LinkedIn and phone number
```
Do not push.

## Step 9: deploy (OWNER CHECKPOINT)
Ask the owner before deploying. Then follow CLAUDE.md "Deployment" with `DEPLOY_STATIC='site'` (`--dry-run` first; report any `*deleting` lines). After the deploy:
- `curl -s https://www.turve.ee/meist/ | grep -c 'tel:+37251928421'` → 2 or more;
- run www.turve.ee through the site's own check: still grade A.
Then set this ticket to `status: done`.

## Done when
- [x] `/meist/` and `/en/about/` show the "why Turve" bio, the four "Mida see teile tähendab" points, LinkedIn and phone links; no career timeline.
- [x] The phone number is a `tel:` link in the footer of every page and on the contact page.
- [x] Typecheck and build green; no inline styles, no third-party requests.
- [x] Owner approved the copy (step 6.5).
- [x] CLAUDE.md and TURVE-002 updated; committed.
- [x] Deployed and still grade A.

## Log
- 2026-11-08: Created. First draft copied the LinkedIn "About" text; the owner rejected that ("everything … can be read from LinkedIn"). Rewritten around why Turve exists.
- 2026-11-08: Owner approved the copy. Built: typecheck and build green, tel: link on every page, no inline styles, no console errors on /meist/ and /en/about/ (desktop checked; mobile not, the window manager kept the window full width). Waiting for deploy.
- 2026-11-08: Deployed (site + API restart, no pending migrations). health 200, foreign-Origin login 403, tel: links live, www.turve.ee grade A on its own check.

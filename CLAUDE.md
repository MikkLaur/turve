# turve.ee

Secure websites and affordable security services for small Estonian companies (B2B). The owner is a security engineer.
Built on the kamblakoda.ee setup (`/home/mikk/engineering/kamblakoda`), without its mail server or booking code.
The full plan, including Launch 2 (billing), is in `~/.claude/plans/i-am-about-to-nested-stream.md`.

## System

| Part | Path | Notes |
|---|---|---|
| Public site | `site/` → `site/dist/` → `htdocs/` (www.turve.ee) | A small TypeScript build (`site/src/build.ts`, no framework). ET at `/`, EN at `/en/`. Texts are in `site/src/i18n/et.ts`; `en.ts` is typed against it, so a missing translation fails the compile. All markup goes through the escaping `html` tag in `site/src/html.ts`. There is no inline JS or CSS (CSP). Browser JS in `site/assets/js/` builds the DOM with `textContent` only. |
| Catalog | `server/src/catalog/catalog.ts` | **The single source** of rates and packages. The site build bakes it into the pages and the API prices inquiries from it; client totals are never trusted. Bump `CATALOG_VERSION` and deploy API and site together. Never reuse a package id. |
| API | `server/` | Express 5 + TypeScript + `mariadb` driver. PM2 app `turve`, behind Apache at `api.turve.ee`. Its own deps are minimal: crypto (scrypt, TOTP, AES-GCM) is `node:crypto`. |
| Free security check | `server/src/check/` | Passive only: TLS handshakes, http:// and https:// GETs (≤3 redirects), `/.well-known/security.txt`, public DNS. **SSRF guard:** `hostname.ts` (hostnames only), `addressGuard.ts` (public unicast only, including all of 127/8) and `resolve.ts` (resolve via DNS, never /etc/hosts; refuse if any address is non-public; connect to the pinned IP). Every redirect hop is re-validated in `httpProbe.ts`. Results are cached per domain for 1 h; the visitor's IP is never stored. |
| Admin panel | `kapsaaed/` → kapsaaed.turve.ee | Plain JS, no build step, Estonian UI. Login is password + mandatory TOTP. Sessions are server-side (`Sessions` table holds the SHA-256 of the token) with a `__Host-turve_admin` cookie. Writes need `Origin: https://kapsaaed.turve.ee` and JSON (`middlewares/adminOrigin.ts`). Data is rendered as text only. |
| DB | Zone.eu MariaDB (turve.ee's own) | Schema via numbered migrations in `server/src/db/migrations/` recorded in `schema_migrations`. **Never** edit an applied migration; add a new one. |
| Deployment | `deployment/` | Runs on the **local machine** only. |

## Owner decisions (do not re-litigate)
- B2B, small companies. Two lines of business: websites (new builds **and modernising older sites**, the stand-out niche) and security (pentest, health check, compliance, retainer). Monthly care plans.
- Prices are public and every hour is billable: packages list exact hours, rates are public, work is billed in 15-minute steps, and the estimator carries the selection into the inquiry.
- OÜ, **not VAT registered**: prices are final and invoices carry no VAT.
- No mail sending and no notifications: inquiries are seen in kapsaaed only. turve.ee itself does receive mail (MX zonemx.eu), but that's outside this app.
- No third-party scripts, fonts, analytics or captcha anywhere. turve.ee must score A on its own check.
- One admin user now, but users live in the DB (`Users.role` admin/staff).
- Launch 1 = site + estimator + free check + inquiries. Launch 2 (before the first job is invoiced) = clients, projects, time entries, invoices (PDF + CSV for the accountant). Keep invoices 7 years.

## Local development
- A MariaDB runs on `127.0.0.1:3306` with user `turve`/`turve` and database `turve_dev` (the config's dev defaults). Its clock was 2 h behind this machine on 2026-10-28; session timing therefore uses the DB clock only (`UTC_TIMESTAMP()`), never `Date.now()`.
- `cd server && npm run migrate:dev`, then `npm run dev` (API on :3000).
- `cd site && npm run dev`: builds with `--dev`, serves the site on :8080 (style tile at `/stiil/`) and kapsaaed on :8081 with production-like headers, and rebuilds on change.
- Admin user locally: `cd server && NODE_ENV=development npx tsx src/scripts/createAdmin.ts`.

## Verification
- API: `cd server && npm run typecheck && npm test` (node:test via tsx; covers the SSRF guard, pricing, TOTP vectors, passwords, form tokens, header/mail analysis and the origin guard).
- Site: `cd site && npm run typecheck && npm run build`. The build fails on broken internal links and prints the content TODO list.
- After deploy: `curl -s -o /dev/null -w '%{http_code}' https://api.turve.ee/api/health` → 200; `POST https://api.turve.ee/api/admin/login` with a foreign Origin → 403; run www.turve.ee through the site's own check, Mozilla Observatory and SSL Labs.

## Deployment
- `./deployment/deploy.sh [--yes]` from the repo root. Reads `deployment/deployment.config` (mode 600, git-ignored; template in `deployment.config.dist`).
  - Writes `server/.env` in a temp dir and shows an `rsync --dry-run`. **Check for `*deleting` lines** before you confirm.
  - `DEPLOY_STATIC='site kapsaaed'` also builds and uploads the site (`--delete`, Let's Encrypt challenges protected) and the panel.
  - On the VM it runs `npm ci`, `npm run build`, `npm run migrate`, `pm2 restart turve`, then a health check on `HEALTH_HOST`.
- New config keys go in **three places**: the `write_env` list in `deploy.sh`, `deployment.config.dist` and the local `deployment.config`.
- A deploy restarts the live API and migrates the live DB: always confirm with the owner first.
- `security.txt` expires 6 months after each site build: redeploy the site at least twice a year.

## One-time Zone.eu setup (separate account from kamblakoda)
1. Panel: create `www.turve.ee` (htdocs), `kapsaaed.turve.ee` (folder `kapsaaed`) and `api.turve.ee` (Node.js/PM2 proxy to the app port). Let's Encrypt on all of them.
2. Panel: create the PM2 app `turve` with start script `~/domeenid/www.turve.ee/server/start.sh`.
3. Find the account's loopback IP for `HEALTH_HOST`: on the VM, `ss -ltnp | grep :3000` once the app runs (Zone binds apps to a 127.x.x.x address, not 127.0.0.1).
4. First deploy, then on the VM: `cd ~/domeenid/www.turve.ee/server && TZ=UTC npm run create-admin -- <username>` (sets the password and enrols the authenticator).
5. DNS for turve.ee: add CAA (`0 issue "letsencrypt.org"`) and enable DNSSEC. DMARC is `p=quarantine` today; move to `p=reject`. Once every subdomain is HTTPS-only, add `includeSubDomains; preload` to HSTS in `site/src/headers.ts`.

## Zone.eu quirks (from kamblakoda)
- `pm2`/`npm` are only on PATH in a **login shell** (`bash -l`). Cron is configured in the Zone panel, not crontab.
- Apache proxies from loopback; `trust proxy` is `loopback`, so rate limits see the client IP.
- `/etc/hosts` is huge: never dump it. The security check deliberately never uses it.

## Safety
- Never print or paste values from `.env` or `deployment/deployment.config`; key names and lengths only.
- Never weaken the SSRF guard or add a code path that connects to a user-supplied host without `resolvePublic()` pinning. Extend `test/ssrf.test.ts` with any new check.
- Ask before: real deploys, PM2 restarts, live DB writes, deleting files on the VM, `git push`.
- `TOTP_ENC_KEY` encrypts the TOTP secrets: rotating it means re-enrolling (`npm run reset-totp`).

## Content still owed by the owner (the build lists these)
`COMPANY` and `PERSON` in `site/src/config.ts`, the bio in `about.personBio` (et/en), a photo in `site/assets/img/`, a review of every page's copy and the privacy policy, and the final rates and packages in the catalog.

## Follow-ups
- Retention: a Zone cron job (or admin button) to purge `SecurityChecks` older than ~90 days, expired `Sessions`, and lost/spam inquiries after 12 months (the privacy policy promises the latter).
- Launch 2 billing (see the plan). Have the accountant confirm the e-invoice (e-arve) duty before building invoice export.
- kamblakoda.ee scores C on our check (missing HSTS/CSP/nosniff/framing headers): an easy fix in its `.htaccess`.

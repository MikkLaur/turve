---
status: doing
area: cicd
created: 2026-11-08
due: 2026-11-20
---

# TURVE-001: Deploy the launch campaign

Fixed prices, the 99 € year-end offer, demos and consultation booking are built and committed but need to go live before ads start (TURVE-004). Steps are in `saving-the-companys-official-function-plan.md`, STEP 6.

## Done when
- [x] `--preflight` and `--dry-run` clean; any `*deleting` lines reviewed.
- [x] Deployed with `DEPLOY_STATIC='site kapsaaed'` (migrates 005 and 006, restarts `turve-api`).
- [x] `/api/health` → 200, `/api/launch-offer` → `"left":10`, foreign-Origin admin login → 403.
- [x] ~~Consultation times set in kapsaaed → Ajad.~~ (booking removed in TURVE-013)
- [ ] www.turve.ee still grade A on its own check; no CSP errors on `/naidised/betoon/`.

## Log
- 2026-11-08: Created.
- 2026-11-08: Confirmed live: `/api/launch-offer` answers (9/10 spots left), `/konsultatsioon/` → 200.
- 2026-11-08: Consultation booking dropped (TURVE-013), so there are no times to set.

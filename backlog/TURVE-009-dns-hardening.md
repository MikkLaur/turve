---
status: todo
area: infra
created: 2026-11-08
---

# TURVE-009: Harden turve.ee DNS and HSTS

## Done when
- [ ] CAA record `0 issue "letsencrypt.org"`.
- [ ] DNSSEC enabled.
- [ ] DMARC moved from `p=quarantine` to `p=reject`.
- [ ] Every subdomain HTTPS-only, then `includeSubDomains; preload` in HSTS (`site/src/headers.ts`) and submitted to hstspreload.org.

## Log
- 2026-11-08: Created (from CLAUDE.md Zone setup).

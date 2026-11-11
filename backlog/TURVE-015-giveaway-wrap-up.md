---
status: todo
area: site
created: 2026-11-08
due: 2026-11-11
blocked-by: TURVE-014
---

# TURVE-015: Giveaway wrap-up: publish the winner, redeploy, later retire /loos/

The winner reveal and the ended page are decided at build time (TURVE-014): the reveal on /loos/ starts when a build with `GIVEAWAY.winner` is deployed.

## Done when
- [ ] Wed 11.11 18:00: draw (`shuf -n 1`, screenshot), set `GIVEAWAY.winner` (company and line of business as in the comment) and deploy the site right away (owner's go): open pages play the reveal. If the winner doesn't answer in 48 h, set the new one and deploy again.
- [ ] After `GIVEAWAY.tabUntil` (13.11): redeploy the site so the tab goes and `/loos/` becomes the noindex ended page.
- [ ] After the prize is delivered (rules point 8, work done before the end of the year): remove the page, the `GIVEAWAY` config, `giveaway.js` and the gold styles, and add 301s `/loos/` → `/` and `/en/giveaway/` → `/en/` in `site/src/headers.ts`.

## Log
- 2026-11-08: Created as the follow-up of TURVE-014.

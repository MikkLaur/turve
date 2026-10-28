import { Lang, findPackage, priceCents } from '../catalog/catalog';
import type { StoredCheck } from '../repositories/securityChecks';
import { localizeFinding } from './findings';

const ORDER = { fail: 0, warn: 1, info: 2, pass: 3 } as const;

/** The check as sent to the site: texts in the visitor's language, problems first, suggested packages priced. */
export function presentCheck(check: StoredCheck, lang: Lang) {
  const { result } = check;
  return {
    publicId: check.publicId,
    domain: result.domain,
    checkedAt: result.checkedAt,
    grade: result.grade,
    score: result.score,
    findings: result.findings
      .map((finding) => localizeFinding(finding, lang))
      .sort((a, b) => ORDER[a.status] - ORDER[b.status]),
    suggestions: result.suggestions.flatMap((id) => {
      const pkg = findPackage(id);
      return pkg
        ? [{ id, name: pkg.name[lang], summary: pkg.summary[lang], minutes: pkg.minutes, cents: pkg.minutes === null ? null : priceCents(pkg.minutes, pkg.rate) }]
        : [];
    }),
  };
}

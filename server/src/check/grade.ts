import { FINDINGS } from './findings';
import type { Finding, Grade } from './types';

export function scoreFindings(findings: readonly Finding[]): { score: number; grade: Grade } {
  const lost = findings.reduce((total, finding) => {
    const weight = FINDINGS[finding.id].weight;
    return total + (finding.status === 'fail' ? weight : finding.status === 'warn' ? weight / 2 : 0);
  }, 0);
  const score = Math.max(0, Math.round(100 - lost));
  let grade: Grade = score >= 90 ? 'A' : score >= 80 ? 'B' : score >= 65 ? 'C' : score >= 50 ? 'D' : 'F';

  const failed = (id: Finding['id']) => findings.some((f) => f.id === id && f.status === 'fail');
  if (failed('https.available')) {
    grade = 'F';
  } else if (failed('tls.certificate') && grade < 'D') {
    grade = 'D';
  }
  return { score, grade };
}

/** Catalog packages that fix what was found (ids from server/src/catalog/catalog.ts). */
export function suggestPackages(findings: readonly Finding[], score: number): string[] {
  const problem = (test: (f: Finding) => boolean) => findings.some((f) => test(f) && (f.status === 'fail' || f.status === 'warn'));
  const suggestions: string[] = [];
  if (problem((f) => FINDINGS[f.id].area === 'mail')) {
    suggestions.push('sec-checkup');
  }
  if (problem((f) => FINDINGS[f.id].area === 'web' || FINDINGS[f.id].area === 'tls')) {
    suggestions.push('mod-security-update');
  }
  if (score < 65 || problem((f) => f.id === 'disclosure.generator')) {
    suggestions.push('mod-review');
  }
  if (suggestions.length === 0) {
    suggestions.push('sec-pentest-site');
  }
  return suggestions.slice(0, 3);
}

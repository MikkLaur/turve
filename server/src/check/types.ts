export type FindingStatus = 'pass' | 'warn' | 'fail' | 'info';
export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

export type FindingId =
  | 'https.available'
  | 'tls.certificate'
  | 'tls.version'
  | 'tls.legacy'
  | 'http.redirect'
  | 'header.hsts'
  | 'header.csp'
  | 'header.nosniff'
  | 'header.framing'
  | 'header.referrer'
  | 'header.permissions'
  | 'cookies.flags'
  | 'disclosure.server'
  | 'disclosure.generator'
  | 'securitytxt'
  | 'mail.mx'
  | 'mail.spf'
  | 'mail.dmarc'
  | 'mail.dkim'
  | 'dns.caa';

export interface Finding {
  id: FindingId;
  status: FindingStatus;
  /** What was observed (header value, record, days left). Shown as plain text. */
  evidence?: string;
}

/** Language-neutral result, stored as JSON. Texts are added per language when it is sent out. */
export interface CheckResult {
  version: 1;
  domain: string;
  mailDomain: string;
  checkedAt: string;
  grade: Grade;
  score: number;
  findings: Finding[];
  /** Catalog package ids that fix what was found. */
  suggestions: string[];
}

export class CheckInputError extends Error {
  constructor(
    public readonly code: 'invalid_domain' | 'not_found' | 'not_public' | 'busy',
    message?: string,
  ) {
    super(message ?? code);
  }
}

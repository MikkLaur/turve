import type { DnsClient } from './resolve';
import type { Finding } from './types';

// Selectors used by common mail providers (Google Workspace, Microsoft 365, Zone.eu, Mailchimp, …).
const DKIM_SELECTORS = ['google', 'selector1', 'selector2', 'default', 'dkim', 'mail', 'k1', 'k2', 's1', 's2', 'zone', 'smtp', 'mxvault'];

async function txt(dns: DnsClient, name: string): Promise<string[]> {
  try {
    return (await dns.resolveTxt(name)).map((chunks) => chunks.join(''));
  } catch {
    return [];
  }
}

export function spfFinding(records: string[], receivesMail: boolean): Finding {
  const spf = records.filter((record) => /^v=spf1(\s|$)/i.test(record.trim()));
  if (spf.length === 0) {
    return { id: 'mail.spf', status: 'fail' };
  }
  if (spf.length > 1) {
    return { id: 'mail.spf', status: 'fail', evidence: `${spf.length} SPF records` };
  }
  const record = spf[0]!.trim();
  const all = /\s([+~?-]?)all(\s|$)/i.exec(` ${record}`);
  const evidence = record.slice(0, 200);
  if (!all) {
    return { id: 'mail.spf', status: /redirect=/i.test(record) ? 'pass' : 'warn', evidence };
  }
  const qualifier = all[1] || '+';
  if (qualifier === '+') {
    return { id: 'mail.spf', status: 'fail', evidence };
  }
  if (qualifier === '?' || (!receivesMail && qualifier !== '-')) {
    return { id: 'mail.spf', status: 'warn', evidence };
  }
  return { id: 'mail.spf', status: 'pass', evidence };
}

export function dmarcFinding(records: string[], receivesMail: boolean): Finding {
  const dmarc = records.find((record) => /^v=DMARC1\s*(;|$)/i.test(record.trim()));
  if (!dmarc) {
    return { id: 'mail.dmarc', status: 'fail' };
  }
  const policy = /(?:^|;)\s*p\s*=\s*(\w+)/i.exec(dmarc)?.[1]?.toLowerCase();
  const evidence = dmarc.slice(0, 200);
  if (policy === 'reject' || (policy === 'quarantine' && receivesMail)) {
    return { id: 'mail.dmarc', status: 'pass', evidence };
  }
  return { id: 'mail.dmarc', status: policy === 'quarantine' || policy === 'none' ? 'warn' : 'fail', evidence };
}

export async function mailFindings(mailDomain: string, dns: DnsClient): Promise<Finding[]> {
  const [mx, rootTxt, dmarcTxt, dkimHits] = await Promise.all([
    dns.resolveMx(mailDomain).catch(() => []),
    txt(dns, mailDomain),
    txt(dns, `_dmarc.${mailDomain}`),
    Promise.all(
      DKIM_SELECTORS.map(async (selector) =>
        (await txt(dns, `${selector}._domainkey.${mailDomain}`)).some((record) => /(^|;)\s*p=/i.test(record)) ? selector : null,
      ),
    ),
  ]);

  // "0 ." is a null MX: the domain explicitly receives no mail (RFC 7505).
  const realMx = mx.filter((record) => record.exchange && record.exchange !== '.');
  const receivesMail = realMx.length > 0;
  const selectors = dkimHits.filter((s): s is string => s !== null);

  return [
    receivesMail
      ? { id: 'mail.mx', status: 'pass', evidence: realMx.map((r) => r.exchange).slice(0, 3).join(', ') }
      : { id: 'mail.mx', status: 'info' },
    spfFinding(rootTxt, receivesMail),
    dmarcFinding(dmarcTxt, receivesMail),
    selectors.length ? { id: 'mail.dkim', status: 'pass', evidence: selectors.join(', ') } : { id: 'mail.dkim', status: 'info' },
  ];
}

export async function caaFinding(hostname: string, mailDomain: string, dns: DnsClient): Promise<Finding> {
  for (const name of hostname === mailDomain ? [hostname] : [hostname, mailDomain]) {
    const records = await dns.resolveCaa(name).catch(() => []);
    if (records.length) {
      return { id: 'dns.caa', status: 'pass' };
    }
  }
  return { id: 'dns.caa', status: 'info' };
}

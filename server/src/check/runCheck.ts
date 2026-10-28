import { scoreFindings, suggestPackages } from './grade';
import { mailDomainOf, normalizeHostname } from './hostname';
import { fetchFollowing, ProbeResponse, requestOnce } from './httpProbe';
import { caaFinding, mailFindings } from './mailFindings';
import { createResolver, DnsClient, PinnedAddress, resolvePublic } from './resolve';
import { acceptsLegacyTls, probeTls, TlsInfo } from './tlsProbe';
import { CheckInputError, CheckResult, Finding } from './types';
import { headerFindings, securityTxtFinding } from './webFindings';

const BUDGET_MS = 15_000;
const MAX_CONCURRENT = 2;
let running = 0;

export interface CheckDeps {
  dns: DnsClient;
  now: () => Date;
}

async function resolveWithWwwFallback(hostname: string, dns: DnsClient): Promise<{ hostname: string; pinned: PinnedAddress }> {
  try {
    return { hostname, pinned: await resolvePublic(hostname, dns) };
  } catch (error) {
    // "example.ee" without its own address but with a working www. is common.
    if (error instanceof CheckInputError && error.code === 'not_found' && !hostname.startsWith('www.')) {
      const www = `www.${hostname}`;
      return { hostname: www, pinned: await resolvePublic(www, dns) };
    }
    throw error;
  }
}

function tlsFindings(info: TlsInfo, legacy: boolean): Finding[] {
  const certOk = info.authorized && info.hostnameMatches && (info.daysLeft ?? -1) >= 0;
  const certificate: Finding = certOk
    ? {
        id: 'tls.certificate',
        status: (info.daysLeft ?? 0) < 14 ? 'warn' : 'pass',
        evidence: `${info.issuer ?? '?'}, ${info.daysLeft} d`,
      }
    : {
        id: 'tls.certificate',
        status: 'fail',
        evidence: !info.hostnameMatches ? 'hostname mismatch' : (info.authorizationError ?? 'expired'),
      };
  const modern = info.protocol === 'TLSv1.3' || info.protocol === 'TLSv1.2';
  return [
    certificate,
    { id: 'tls.version', status: modern ? 'pass' : 'fail', evidence: info.protocol ?? undefined },
    { id: 'tls.legacy', status: legacy ? 'warn' : 'pass' },
  ];
}

function redirectFinding(result: { response: ProbeResponse; chain: URL[] } | null): Finding {
  if (!result) {
    return { id: 'http.redirect', status: 'info' };
  }
  if (result.chain.some((url) => url.protocol === 'https:')) {
    return { id: 'http.redirect', status: 'pass' };
  }
  return { id: 'http.redirect', status: result.response.status >= 200 && result.response.status < 300 ? 'fail' : 'info' };
}

/**
 * Passive check of a public website: what one ordinary visitor's browser and public DNS lookups reveal.
 * At most a handful of requests: TLS handshakes, http://, https:// (≤3 redirects) and /.well-known/security.txt.
 */
export async function runSecurityCheck(input: unknown, deps: CheckDeps = { dns: createResolver(), now: () => new Date() }): Promise<CheckResult> {
  const requested = normalizeHostname(input);
  if (running >= MAX_CONCURRENT) {
    throw new CheckInputError('busy');
  }
  running++;
  try {
    const deadline = Date.now() + BUDGET_MS;
    const { hostname, pinned } = await resolveWithWwwFallback(requested, deps.dns);
    const mailDomain = mailDomainOf(hostname);
    const home = new URL(`https://${hostname}/`);

    const [tlsInfo, legacy, page, plain, mail, caa] = await Promise.all([
      probeTls(hostname, pinned, deps.now()).catch(() => null),
      acceptsLegacyTls(hostname, pinned),
      fetchFollowing(home, pinned, deps.dns, { deadline }).catch(() => null),
      fetchFollowing(new URL(`http://${hostname}/`), pinned, deps.dns, { deadline, stopAtHttps: true, maxBytes: 64 * 1024 }).catch(() => null),
      mailFindings(mailDomain, deps.dns),
      caaFinding(hostname, mailDomain, deps.dns),
    ]);

    const findings: Finding[] = [];
    if (!tlsInfo || !page) {
      findings.push({ id: 'https.available', status: 'fail' });
    } else {
      findings.push({ id: 'https.available', status: 'pass' });
      findings.push(...tlsFindings(tlsInfo, legacy));
    }
    findings.push(redirectFinding(plain));

    if (page && page.response.url.protocol === 'https:') {
      findings.push(...headerFindings(page.response.headers, page.response.body));
      // Only on the checked host itself: its pinned address is the one we vetted.
      findings.push(
        page.response.url.hostname === hostname
          ? await requestOnce(new URL('/.well-known/security.txt', home), pinned, { deadline, maxBytes: 32 * 1024 })
              .then((response) => securityTxtFinding(response.status, response.body))
              .catch(() => securityTxtFinding(null, ''))
          : { id: 'securitytxt', status: 'info' },
      );
    }
    findings.push(...mail, caa);

    const { score, grade } = scoreFindings(findings);
    return {
      version: 1,
      domain: hostname,
      mailDomain,
      checkedAt: deps.now().toISOString(),
      grade,
      score,
      findings,
      suggestions: suggestPackages(findings, score),
    };
  } finally {
    running--;
  }
}

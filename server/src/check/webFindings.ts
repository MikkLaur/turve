import type { IncomingHttpHeaders } from 'node:http';
import type { Finding } from './types';

const HALF_YEAR_SECONDS = 15_552_000;
const SESSION_COOKIE = /sess|sid|auth|token|login|logged_in|jwt/i;

function header(headers: IncomingHttpHeaders, name: string): string | undefined {
  const value = headers[name];
  return Array.isArray(value) ? value.join(', ') : value;
}

function clip(text: string, max = 160): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

function directive(csp: string, name: string): string | undefined {
  return csp
    .split(/[;,]/)
    .map((part) => part.trim())
    .find((part) => part.toLowerCase().startsWith(`${name} `) || part.toLowerCase() === name);
}

/** Security headers, cookies and version disclosure of the final HTTPS response. */
export function headerFindings(headers: IncomingHttpHeaders, body: string): Finding[] {
  const findings: Finding[] = [];

  const hsts = header(headers, 'strict-transport-security');
  const maxAge = Number(/max-age\s*=\s*"?(\d+)/i.exec(hsts ?? '')?.[1] ?? 0);
  findings.push(
    !hsts || maxAge === 0
      ? { id: 'header.hsts', status: 'fail' }
      : { id: 'header.hsts', status: maxAge >= HALF_YEAR_SECONDS ? 'pass' : 'warn', evidence: clip(hsts) },
  );

  const csp = header(headers, 'content-security-policy');
  if (!csp) {
    findings.push({ id: 'header.csp', status: header(headers, 'content-security-policy-report-only') ? 'warn' : 'fail' });
  } else {
    const scripts = directive(csp, 'script-src') ?? directive(csp, 'default-src') ?? '';
    const unsafeInline = /'unsafe-inline'/i.test(scripts) && !/'(nonce-|sha(256|384|512)-|strict-dynamic)/i.test(scripts);
    findings.push({ id: 'header.csp', status: scripts && !unsafeInline ? 'pass' : 'warn', evidence: clip(csp) });
  }

  findings.push({ id: 'header.nosniff', status: /nosniff/i.test(header(headers, 'x-content-type-options') ?? '') ? 'pass' : 'fail' });

  const xfo = header(headers, 'x-frame-options') ?? '';
  const frameAncestors = csp ? directive(csp, 'frame-ancestors') : undefined;
  findings.push({ id: 'header.framing', status: /deny|sameorigin/i.test(xfo) || frameAncestors ? 'pass' : 'fail' });

  const referrer = header(headers, 'referrer-policy');
  findings.push(referrer ? { id: 'header.referrer', status: 'pass', evidence: clip(referrer) } : { id: 'header.referrer', status: 'warn' });

  findings.push({ id: 'header.permissions', status: header(headers, 'permissions-policy') ? 'pass' : 'info' });

  const cookies = headers['set-cookie'] ?? [];
  const weak = cookies
    .map((cookie) => {
      const [pair = '', ...attributes] = cookie.split(';');
      const name = pair.split('=')[0]!.trim();
      const flags = attributes.map((a) => a.trim().toLowerCase());
      const missing = [
        ...(flags.includes('secure') ? [] : ['Secure']),
        ...(SESSION_COOKIE.test(name) && !flags.includes('httponly') ? ['HttpOnly'] : []),
      ];
      return missing.length ? `${name}: ${missing.join(', ')}` : null;
    })
    .filter((entry): entry is string => entry !== null);
  findings.push(weak.length ? { id: 'cookies.flags', status: 'warn', evidence: clip(weak.slice(0, 5).join('; ')) } : { id: 'cookies.flags', status: 'pass' });

  const disclosed = ['server', 'x-powered-by', 'x-aspnet-version']
    .map((name) => header(headers, name))
    .filter((value): value is string => !!value && /\d+\.\d+/.test(value));
  if (disclosed.length) {
    const php = /php\/(\d+)\.(\d+)/i.exec(disclosed.join(' '));
    // PHP below 8.2 gets no security fixes any more (8.1 ended 2025-12-31).
    const endOfLife = php ? Number(php[1]) < 8 || (Number(php[1]) === 8 && Number(php[2]) < 2) : false;
    findings.push({ id: 'disclosure.server', status: endOfLife ? 'fail' : 'warn', evidence: clip(disclosed.join('; ')) });
  } else {
    findings.push({ id: 'disclosure.server', status: 'pass' });
  }

  const generatorTag = /<meta[^>]+name\s*=\s*["']generator["'][^>]*>/i.exec(body)?.[0];
  const generator = generatorTag ? /content\s*=\s*["']([^"']*)["']/i.exec(generatorTag)?.[1] : undefined;
  findings.push(
    generator && /\d/.test(generator)
      ? { id: 'disclosure.generator', status: 'warn', evidence: clip(generator) }
      : { id: 'disclosure.generator', status: 'pass' },
  );

  return findings;
}

export function securityTxtFinding(status: number | null, body: string): Finding {
  return status === 200 && /^contact:/im.test(body) ? { id: 'securitytxt', status: 'pass' } : { id: 'securitytxt', status: 'info' };
}

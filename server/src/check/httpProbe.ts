import http, { IncomingHttpHeaders } from 'node:http';
import https from 'node:https';
import { assertPublicHostnameSyntax } from './hostname';
import { DnsClient, PinnedAddress, resolvePublic } from './resolve';

export interface ProbeResponse {
  url: URL;
  status: number;
  headers: IncomingHttpHeaders;
  /** At most maxBytes of the body, decoded as UTF-8. */
  body: string;
}

export interface ProbeOptions {
  /** Absolute time (ms) by which the whole check must be done. */
  deadline: number;
  maxBytes?: number;
  /** Tests only: connect to this port instead of 80/443. Never derived from user input. */
  testPort?: number;
}

const USER_AGENT = 'turve.ee-security-check/1.0 (+https://www.turve.ee/turvakontroll/)';
const MAX_REQUEST_MS = 6000;
const MAX_REDIRECTS = 3;
const DEFAULT_MAX_BYTES = 1024 * 1024;

export class ProbeError extends Error {}

function timeLeft(deadline: number): number {
  const left = Math.min(MAX_REQUEST_MS, deadline - Date.now());
  if (left <= 0) {
    throw new ProbeError('Check time budget used up.');
  }
  return left;
}

/** One GET to the vetted IP. Host header and SNI carry the hostname; no DNS lookup happens here. */
export function requestOnce(url: URL, pinned: PinnedAddress, options: ProbeOptions): Promise<ProbeResponse> {
  const timeoutMs = timeLeft(options.deadline);
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
  const isHttps = url.protocol === 'https:';

  return new Promise((resolve, reject) => {
    const request = (isHttps ? https : http).request(
      {
        protocol: url.protocol,
        hostname: pinned.address,
        family: pinned.family,
        port: options.testPort ?? (isHttps ? 443 : 80),
        path: `${url.pathname}${url.search}`,
        method: 'GET',
        headers: { host: url.hostname, 'user-agent': USER_AGENT, accept: 'text/html,*/*;q=0.5', 'accept-encoding': 'identity' },
        ...(isHttps ? { servername: url.hostname, rejectUnauthorized: false } : {}),
        agent: false,
        timeout: timeoutMs,
      },
      (response) => {
        const chunks: Buffer[] = [];
        let size = 0;
        const finish = () =>
          resolve({ url, status: response.statusCode ?? 0, headers: response.headers, body: Buffer.concat(chunks).toString('utf8') });
        response.on('data', (chunk: Buffer) => {
          size += chunk.length;
          if (size <= maxBytes) {
            chunks.push(chunk);
          } else {
            response.destroy();
          }
        });
        response.on('end', finish);
        response.on('close', finish);
        response.on('error', finish);
      },
    );
    const timer = setTimeout(() => request.destroy(new ProbeError('timeout')), timeoutMs);
    request.on('timeout', () => request.destroy(new ProbeError('timeout')));
    request.on('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
    request.on('close', () => clearTimeout(timer));
    request.end();
  });
}

/**
 * Follows up to 3 redirects. Every hop is re-validated: http(s) only, default ports only, a public hostname,
 * and a fresh vetted IP for a new host. A redirect that fails validation is not followed; the redirect
 * response itself is returned.
 */
export async function fetchFollowing(
  start: URL,
  startPinned: PinnedAddress,
  dns: DnsClient,
  options: ProbeOptions & { stopAtHttps?: boolean },
): Promise<{ response: ProbeResponse; chain: URL[] }> {
  let url = start;
  let pinned = startPinned;
  const chain: URL[] = [];

  for (let hop = 0; ; hop++) {
    const response = await requestOnce(url, pinned, options);
    chain.push(url);
    const location = response.headers.location;
    if (response.status < 300 || response.status >= 400 || !location || hop === MAX_REDIRECTS) {
      return { response, chain };
    }

    let next: URL;
    try {
      next = new URL(location, url);
      if ((next.protocol !== 'http:' && next.protocol !== 'https:') || next.username || next.password || next.port) {
        return { response, chain };
      }
      const nextHost = next.hostname.replace(/\.$/, '');
      if (nextHost !== url.hostname) {
        assertPublicHostnameSyntax(nextHost);
        pinned = await resolvePublic(nextHost, dns);
      }
    } catch {
      return { response, chain };
    }
    if (options.stopAtHttps && next.protocol === 'https:') {
      chain.push(next);
      return { response, chain };
    }
    url = next;
  }
}

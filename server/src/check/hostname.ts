import { isIP } from 'node:net';
import { CheckInputError } from './types';

// Only real public hostnames may be checked: no IP literals, ports, credentials or internal names.
const LABEL = /^(?!-)[a-z0-9-]{1,63}(?<!-)$/;
const TLD = /^(?:[a-z]{2,63}|xn--[a-z0-9-]{1,59})$/;
const RESERVED_SUFFIXES = [
  'localhost', 'local', 'localdomain', 'internal', 'intranet', 'lan', 'home', 'corp', 'private',
  'home.arpa', 'arpa', 'test', 'example', 'invalid', 'onion', 'alt',
];

/**
 * Accepts what a visitor types ("Example.ee", "https://www.example.ee/page") and returns the bare ASCII hostname.
 * The WHATWG URL parser lowercases, converts IDNs to punycode and normalises odd IPv4 forms
 * (2130706433, 0x7f.1, 127.1 → 127.0.0.1), so those are caught by the IP check below.
 */
export function normalizeHostname(input: unknown): string {
  if (typeof input !== 'string') {
    throw new CheckInputError('invalid_domain');
  }
  const text = input.trim();
  if (text === '' || text.length > 300 || /[\s\\]/.test(text)) {
    throw new CheckInputError('invalid_domain');
  }

  let url: URL;
  try {
    url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(text) ? text : `http://${text}`);
  } catch {
    throw new CheckInputError('invalid_domain');
  }
  if ((url.protocol !== 'http:' && url.protocol !== 'https:') || url.username || url.password || url.port) {
    throw new CheckInputError('invalid_domain');
  }

  const hostname = url.hostname.replace(/\.$/, '');
  if (hostname.startsWith('[') || isIP(hostname)) {
    throw new CheckInputError('invalid_domain');
  }
  assertPublicHostnameSyntax(hostname);
  return hostname;
}

export function assertPublicHostnameSyntax(hostname: string): void {
  if (hostname.length > 253 || isIP(hostname)) {
    throw new CheckInputError('invalid_domain');
  }
  const labels = hostname.split('.');
  if (labels.length < 2 || !labels.every((label) => LABEL.test(label)) || !TLD.test(labels.at(-1)!)) {
    throw new CheckInputError('invalid_domain');
  }
  if (RESERVED_SUFFIXES.some((suffix) => hostname === suffix || hostname.endsWith(`.${suffix}`))) {
    throw new CheckInputError('invalid_domain');
  }
}

/** Mail records live on the registrable domain: www.example.ee → example.ee. */
export function mailDomainOf(hostname: string): string {
  return hostname.startsWith('www.') && hostname.split('.').length > 2 ? hostname.slice(4) : hostname;
}

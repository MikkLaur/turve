import { createHmac, timingSafeEqual } from 'node:crypto';
import { config } from '../config/config';

// The contact page fetches a signed timestamp on load. Bots that post instantly, or without the page, are flagged.
const MIN_AGE_MS = 3_000;
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

function sign(issuedAt: string): string {
  return createHmac('sha256', config.formTokenSecret).update(`form:${issuedAt}`).digest('base64url');
}

export function issueFormToken(nowMs: number = Date.now()): string {
  const issuedAt = String(nowMs);
  return `${issuedAt}.${sign(issuedAt)}`;
}

export type FormTokenVerdict = 'ok' | 'missing' | 'invalid' | 'fast' | 'expired';

export function checkFormToken(token: unknown, nowMs: number = Date.now()): FormTokenVerdict {
  if (typeof token !== 'string' || token === '') {
    return 'missing';
  }
  const [issuedAt, signature] = token.split('.');
  if (!issuedAt || !signature || !/^\d{13}$/.test(issuedAt)) {
    return 'invalid';
  }
  const expected = Buffer.from(sign(issuedAt));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
    return 'invalid';
  }
  const age = nowMs - Number(issuedAt);
  if (age < MIN_AGE_MS) {
    return 'fast';
  }
  if (age > MAX_AGE_MS) {
    return 'expired';
  }
  return 'ok';
}

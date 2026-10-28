import { createHash, randomBytes } from 'node:crypto';
import { CookieOptions, Response } from 'express';

// __Host- prefix: the browser only accepts it with Secure, Path=/ and no Domain, so no subdomain can plant or read it.
export const SESSION_COOKIE = '__Host-turve_admin';

const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  path: '/',
};

/** A fresh 256-bit token for the cookie and its SHA-256, which is all the database stores. */
export function newSessionToken(): { token: string; id: string } {
  const token = randomBytes(32).toString('base64url');
  return { token, id: sessionIdFromToken(token) };
}

export function sessionIdFromToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function setSessionCookie(res: Response, token: string, maxAgeMs: number): void {
  res.cookie(SESSION_COOKIE, token, { ...COOKIE_OPTIONS, maxAge: maxAgeMs });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE, COOKIE_OPTIONS);
}

export function readCookie(header: string | undefined, name: string): string | undefined {
  if (!header) {
    return undefined;
  }
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) {
      continue;
    }
    if (part.slice(0, eq).trim() === name) {
      try {
        return decodeURIComponent(part.slice(eq + 1).trim());
      } catch {
        return undefined;
      }
    }
  }
  return undefined;
}

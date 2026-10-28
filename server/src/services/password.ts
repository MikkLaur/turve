import { randomBytes, scrypt as scryptCallback, timingSafeEqual, ScryptOptions } from 'node:crypto';

// scrypt from node:crypto, so no native bcrypt module is needed on the VM.
// N = 2^15, r = 8, p = 1 needs 32 MiB per hash. Stored as scrypt$<log2N>$<r>$<p>$<salt>$<hash> (base64url).
const LOG2_N = 15;
const R = 8;
const P = 1;
const KEY_LENGTH = 32;
const MAXMEM = 64 * 1024 * 1024;

export const MIN_PASSWORD_LENGTH = 12;

function scrypt(password: string, salt: Buffer, keyLength: number, options: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password.normalize('NFKC'), salt, keyLength, options, (error, key) => (error ? reject(error) : resolve(key)));
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, KEY_LENGTH, { N: 2 ** LOG2_N, r: R, p: P, maxmem: MAXMEM });
  return ['scrypt', LOG2_N, R, P, salt.toString('base64url'), key.toString('base64url')].join('$');
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') {
    return false;
  }
  const [, log2n, r, p, saltText, keyText] = parts as [string, string, string, string, string, string];
  const expected = Buffer.from(keyText, 'base64url');
  const key = await scrypt(password, Buffer.from(saltText, 'base64url'), expected.length, {
    N: 2 ** Number(log2n),
    r: Number(r),
    p: Number(p),
    maxmem: MAXMEM,
  });
  return key.length === expected.length && timingSafeEqual(key, expected);
}

// Verified against when the username doesn't exist, so a wrong username takes as long as a wrong password.
const DUMMY_HASH = 'scrypt$15$8$1$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

export async function verifyAgainstDummy(password: string): Promise<false> {
  await verifyPassword(password, DUMMY_HASH);
  return false;
}

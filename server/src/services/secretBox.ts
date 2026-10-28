import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { config } from '../config/config';

// AES-256-GCM for small secrets at rest (the TOTP secrets). Format: v1.<iv>.<tag>.<ciphertext>, base64url.

export function seal(plaintext: string, key: Buffer = config.totpEncKey): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  return ['v1', iv.toString('base64url'), cipher.getAuthTag().toString('base64url'), ciphertext.toString('base64url')].join('.');
}

export function open(sealed: string, key: Buffer = config.totpEncKey): string {
  const [version, iv, tag, ciphertext] = sealed.split('.');
  if (version !== 'v1' || !iv || !tag || ciphertext === undefined) {
    throw new Error('Unknown sealed format.');
  }
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'base64url'));
  decipher.setAuthTag(Buffer.from(tag, 'base64url'));
  return Buffer.concat([decipher.update(Buffer.from(ciphertext, 'base64url')), decipher.final()]).toString('utf8');
}

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { checkFormToken, issueFormToken } from '../src/services/formToken';
import { hashPassword, verifyAgainstDummy, verifyPassword } from '../src/services/password';
import { open, seal } from '../src/services/secretBox';
import { base32Decode, base32Encode, hotp, verifyTotp } from '../src/services/totp';

describe('TOTP (RFC 6238 SHA-1 vectors)', () => {
  const secret = Buffer.from('12345678901234567890');
  const vectors: [number, string][] = [
    [59, '94287082'],
    [1111111109, '07081804'],
    [1111111111, '14050471'],
    [1234567890, '89005924'],
    [2000000000, '69279037'],
    [20000000000, '65353130'],
  ];

  it('matches the RFC test vectors', () => {
    for (const [seconds, code] of vectors) {
      assert.equal(hotp(secret, Math.floor(seconds / 30), 8), code, `t=${seconds}`);
    }
  });

  it('accepts ±1 step, rejects replays and junk', () => {
    const b32 = base32Encode(secret);
    const now = 1234567890 * 1000;
    const step = Math.floor(1234567890 / 30);
    assert.equal(verifyTotp(b32, '005924', null, now), step);
    assert.equal(verifyTotp(b32, '005924', null, now + 30_000), step);
    assert.equal(verifyTotp(b32, '005924', null, now + 90_000), null);
    assert.equal(verifyTotp(b32, '005924', step, now), null, 'replay of the same step');
    assert.equal(verifyTotp(b32, '12345', null, now), null);
    assert.equal(verifyTotp(b32, 'abcdef', null, now), null);
  });

  it('round-trips base32', () => {
    const bytes = Buffer.from('any bytes at all ✓');
    assert.deepEqual(base32Decode(base32Encode(bytes)), bytes);
    assert.equal(base32Encode(Buffer.from('12345678901234567890')), 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ');
  });
});

describe('passwords', () => {
  it('verifies the right password only', async () => {
    const hash = await hashPassword('correct horse battery');
    assert.match(hash, /^scrypt\$15\$8\$1\$/);
    assert.equal(await verifyPassword('correct horse battery', hash), true);
    assert.equal(await verifyPassword('correct horse batterY', hash), false);
    assert.equal(await verifyPassword('x', 'bcrypt$whatever'), false);
    assert.equal(await verifyAgainstDummy('x'), false);
  });
});

describe('secretBox', () => {
  it('round-trips and detects tampering', () => {
    const sealed = seal('JBSWY3DPEHPK3PXP');
    assert.equal(open(sealed), 'JBSWY3DPEHPK3PXP');
    const parts = sealed.split('.');
    parts[3] = Buffer.from('tampered').toString('base64url');
    assert.throws(() => open(parts.join('.')));
    assert.throws(() => open(sealed, Buffer.alloc(32, 1)));
  });
});

describe('form token', () => {
  it('flags missing, forged, too fast and old tokens', () => {
    const issued = 1_800_000_000_000;
    const token = issueFormToken(issued);
    assert.equal(checkFormToken(token, issued + 10_000), 'ok');
    assert.equal(checkFormToken(token, issued + 1_000), 'fast');
    assert.equal(checkFormToken(token, issued + 25 * 3_600_000), 'expired');
    assert.equal(checkFormToken(undefined), 'missing');
    assert.equal(checkFormToken(`${issued}.forged`), 'invalid');
    assert.equal(checkFormToken('garbage'), 'invalid');
  });
});

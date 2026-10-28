import { audit } from '../repositories/audit';
import { deleteUserSessions } from '../repositories/sessions';
import { setTotpSecret } from '../repositories/users';
import { seal } from '../services/secretBox';
import { generateTotpSecret, otpauthUri, verifyTotp } from '../services/totp';
import { ask } from './prompt';

/** Shows a new secret, requires one correct code from the authenticator app, then stores it encrypted. */
export async function enrollTotp(userId: number, username: string): Promise<void> {
  const secret = generateTotpSecret();
  console.log('\nAdd this account to your authenticator app (manual entry / "enter a setup key"):');
  console.log(`  Account: turve.ee:${username}`);
  console.log(`  Key:     ${secret.replace(/(.{4})/g, '$1 ').trim()}`);
  console.log('  Type:    time-based, 6 digits, 30 s');
  // No QR code on purpose: pasting the secret into an online QR generator would leak it.
  console.log(`\nPassword managers (Bitwarden, 1Password, KeePassXC) also accept this URI:\n  ${otpauthUri(secret, username)}\n`);

  for (let attempt = 1; attempt <= 3; attempt++) {
    const code = await ask('Code from the app: ');
    if (verifyTotp(secret, code, null) !== null) {
      await setTotpSecret(userId, seal(secret));
      await deleteUserSessions(userId);
      await audit('admin.totp_enrolled', { userId, detail: 'via CLI' });
      console.log('Two-factor sign-in is set up. Existing sessions were signed out.');
      return;
    }
    console.log('That code does not match. Check the phone clock and try again.');
  }
  throw new Error('TOTP not enrolled: three wrong codes.');
}

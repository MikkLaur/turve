/**
 * Creates the admin user, or resets an existing one's password, then enrols TOTP. Run on the VM by the owner:
 *   cd ~/domeenid/www.turve.ee/server && TZ=UTC npm run create-admin -- [username]
 * The password is typed hidden and never printed or logged.
 */
import { closePool } from '../db/pool';
import { audit } from '../repositories/audit';
import { deleteUserSessions } from '../repositories/sessions';
import { getUserByUsername, upsertUser } from '../repositories/users';
import { hashPassword, MIN_PASSWORD_LENGTH } from '../services/password';
import { enrollTotp } from './enrollTotp';
import { ask, askHidden, assertInteractive } from './prompt';

async function main(): Promise<void> {
  assertInteractive();
  const username = process.argv[2] || (await ask('Username: '));
  if (!/^[a-z0-9._-]{3,64}$/i.test(username)) {
    throw new Error('Username: 3–64 characters, letters, digits, . _ -');
  }
  const existing = await getUserByUsername(username);
  const displayName = (await ask(`Display name${existing?.displayName ? ` [${existing.displayName}]` : ''}: `)) || existing?.displayName || null;
  const email = (await ask(`E-mail (optional)${existing?.email ? ` [${existing.email}]` : ''}: `)) || existing?.email || null;

  const password = await askHidden(`New password for "${username}" (min ${MIN_PASSWORD_LENGTH} characters): `);
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
  if ((await askHidden('Repeat: ')) !== password) {
    throw new Error('Passwords do not match.');
  }

  const created = await upsertUser({ username, email, displayName, role: 'admin', passwordHash: await hashPassword(password) });
  const user = await getUserByUsername(username);
  if (!user) {
    throw new Error('User was not saved.');
  }
  await deleteUserSessions(user.id);
  await audit(created ? 'admin.created' : 'admin.password_set', { userId: user.id, detail: 'via CLI' });
  console.log(created ? `Created admin "${username}".` : `Password updated for "${username}".`);

  if (!user.totpSecretEnc || (await ask('Set up a new authenticator too? [y/N] ')).toLowerCase() === 'y') {
    await enrollTotp(user.id, username);
  }
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  })
  .finally(() => closePool());

/**
 * Enrols a new authenticator for an existing user (lost phone). Run on the VM:
 *   cd ~/domeenid/www.turve.ee/server && TZ=UTC npm run reset-totp -- <username>
 */
import { closePool } from '../db/pool';
import { getUserByUsername } from '../repositories/users';
import { enrollTotp } from './enrollTotp';
import { ask, assertInteractive } from './prompt';

async function main(): Promise<void> {
  assertInteractive();
  const username = process.argv[2] || (await ask('Username: '));
  const user = await getUserByUsername(username);
  if (!user) {
    throw new Error(`No user "${username}".`);
  }
  await enrollTotp(user.id, username);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  })
  .finally(() => closePool());

import { getPool } from '../db/pool';

export type UserRole = 'admin' | 'staff';

export interface User {
  id: number;
  username: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  passwordHash: string;
  totpSecretEnc: string | null;
  totpLastStep: number | null;
  lastLoginAt: Date | null;
  disabledAt: Date | null;
}

const COLUMNS = 'id, username, email, displayName, role, passwordHash, totpSecretEnc, totpLastStep, lastLoginAt, disabledAt';

export async function getUserByUsername(username: string): Promise<User | null> {
  const rows: User[] = await getPool().query(`SELECT ${COLUMNS} FROM Users WHERE username = ?`, [username]);
  return rows[0] ?? null;
}

export async function getUserById(id: number): Promise<User | null> {
  const rows: User[] = await getPool().query(`SELECT ${COLUMNS} FROM Users WHERE id = ?`, [id]);
  return rows[0] ?? null;
}

/** Creates the user, or updates password/role/name of an existing one. Returns true if created. */
export async function upsertUser(input: {
  username: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  passwordHash: string;
}): Promise<boolean> {
  const result = await getPool().query(
    `INSERT INTO Users (username, email, displayName, role, passwordHash) VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE email = VALUES(email), displayName = VALUES(displayName), role = VALUES(role),
       passwordHash = VALUES(passwordHash), disabledAt = NULL`,
    [input.username, input.email, input.displayName, input.role, input.passwordHash],
  );
  // MariaDB reports 1 affected row for an insert, 2 for an update.
  return Number(result.affectedRows) === 1;
}

export async function setTotpSecret(userId: number, totpSecretEnc: string): Promise<void> {
  await getPool().query('UPDATE Users SET totpSecretEnc = ?, totpLastStep = NULL WHERE id = ?', [totpSecretEnc, userId]);
}

/** Records the used TOTP step only if it is newer than the stored one (no replay, also under concurrent logins). */
export async function consumeTotpStep(userId: number, step: number): Promise<boolean> {
  const result = await getPool().query(
    'UPDATE Users SET totpLastStep = ?, lastLoginAt = UTC_TIMESTAMP() WHERE id = ? AND (totpLastStep IS NULL OR totpLastStep < ?)',
    [step, userId, step],
  );
  return Number(result.affectedRows) === 1;
}

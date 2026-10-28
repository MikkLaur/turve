import { getPool } from '../db/pool';
import { UserRole } from './users';

// All session times use the database clock (UTC_TIMESTAMP()), never the app's, so a clock skew
// between the API host and the DB can't make sessions expire early or live too long.

export interface SessionWithUser {
  id: string;
  userId: number;
  mfaVerifiedAt: Date | null;
  expired: boolean;
  idleSeconds: number;
  failedMfaAttempts: number;
  username: string;
  displayName: string | null;
  role: UserRole;
  disabledAt: Date | null;
}

export async function insertSession(input: { id: string; userId: number; ttlSeconds: number; userAgent: string | null }): Promise<void> {
  await getPool().query(
    `INSERT INTO Sessions (id, userId, createdAt, lastSeenAt, expiresAt, userAgent)
     VALUES (?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP(), UTC_TIMESTAMP() + INTERVAL ? SECOND, ?)`,
    [input.id, input.userId, input.ttlSeconds, input.userAgent],
  );
}

export async function getSession(id: string): Promise<SessionWithUser | null> {
  const rows: (Omit<SessionWithUser, 'expired'> & { expired: number })[] = await getPool().query(
    `SELECT s.id, s.userId, s.mfaVerifiedAt, s.failedMfaAttempts,
            s.expiresAt <= UTC_TIMESTAMP() AS expired,
            TIMESTAMPDIFF(SECOND, s.lastSeenAt, UTC_TIMESTAMP()) AS idleSeconds,
            u.username, u.displayName, u.role, u.disabledAt
       FROM Sessions s JOIN Users u ON u.id = s.userId
      WHERE s.id = ?`,
    [id],
  );
  const row = rows[0];
  return row ? { ...row, expired: Number(row.expired) === 1, idleSeconds: Number(row.idleSeconds) } : null;
}

/** Swaps a pending session for a verified one under a new id (no session fixation). */
export async function promoteSession(oldId: string, newId: string, ttlSeconds: number): Promise<boolean> {
  const result = await getPool().query(
    `UPDATE Sessions SET id = ?, mfaVerifiedAt = UTC_TIMESTAMP(), lastSeenAt = UTC_TIMESTAMP(),
            expiresAt = UTC_TIMESTAMP() + INTERVAL ? SECOND
      WHERE id = ? AND mfaVerifiedAt IS NULL AND expiresAt > UTC_TIMESTAMP()`,
    [newId, ttlSeconds, oldId],
  );
  return Number(result.affectedRows) === 1;
}

export async function recordFailedMfa(id: string): Promise<number> {
  await getPool().query('UPDATE Sessions SET failedMfaAttempts = failedMfaAttempts + 1 WHERE id = ?', [id]);
  const rows: { failedMfaAttempts: number }[] = await getPool().query('SELECT failedMfaAttempts FROM Sessions WHERE id = ?', [id]);
  return rows[0]?.failedMfaAttempts ?? 0;
}

export async function touchSession(id: string): Promise<void> {
  await getPool().query('UPDATE Sessions SET lastSeenAt = UTC_TIMESTAMP() WHERE id = ?', [id]);
}

export async function deleteSession(id: string): Promise<void> {
  await getPool().query('DELETE FROM Sessions WHERE id = ?', [id]);
}

export async function deleteUserSessions(userId: number): Promise<void> {
  await getPool().query('DELETE FROM Sessions WHERE userId = ?', [userId]);
}

export async function deleteExpiredSessions(): Promise<void> {
  await getPool().query('DELETE FROM Sessions WHERE expiresAt < UTC_TIMESTAMP()');
}

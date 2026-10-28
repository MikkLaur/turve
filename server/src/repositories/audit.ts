import { getPool } from '../db/pool';

export type AuditAction =
  | 'login.password_ok'
  | 'login.password_failed'
  | 'login.totp_ok'
  | 'login.totp_failed'
  | 'login.totp_locked'
  | 'logout'
  | 'inquiry.status'
  | 'inquiry.notes'
  | 'inquiry.delete'
  | 'admin.created'
  | 'admin.password_set'
  | 'admin.totp_enrolled';

export interface AuditEntry {
  id: number;
  at: Date;
  userId: number | null;
  username: string | null;
  action: AuditAction;
  detail: string | null;
  ip: string | null;
}

/** Audit writes must never break the request that triggered them. */
export async function audit(action: AuditAction, input: { userId?: number | null; detail?: string; ip?: string | null } = {}): Promise<void> {
  try {
    await getPool().query('INSERT INTO AuditLog (userId, action, detail, ip) VALUES (?, ?, ?, ?)', [
      input.userId ?? null,
      action,
      input.detail?.slice(0, 500) ?? null,
      input.ip?.slice(0, 45) ?? null,
    ]);
  } catch (error) {
    console.error('Audit write failed:', error instanceof Error ? error.message : error);
  }
}

export async function listAudit(limit: number): Promise<AuditEntry[]> {
  return getPool().query(
    `SELECT a.id, a.at, a.userId, u.username, a.action, a.detail, a.ip
       FROM AuditLog a LEFT JOIN Users u ON u.id = a.userId
      ORDER BY a.id DESC LIMIT ?`,
    [limit],
  );
}

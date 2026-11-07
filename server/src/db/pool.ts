import mariadb, { Pool, PoolConnection } from 'mariadb';
import { config } from '../config/config';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = mariadb.createPool({
      host: config.db.host,
      port: config.db.port,
      user: config.db.user,
      password: config.db.password,
      database: config.db.name,
      connectionLimit: config.db.connectionLimit,
      // DATETIME columns hold UTC (the processes run with TZ=UTC).
      timezone: 'Z',
      insertIdAsNumber: true,
      bigIntAsNumber: true,
      decimalAsNumber: false,
    });
  }
  return pool;
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export async function withTransaction<T>(fn: (conn: PoolConnection) => Promise<T>): Promise<T> {
  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

/** The DB server's current UTC time. Use this, not Date.now(), for anything compared with stored times. */
export async function dbNow(): Promise<Date> {
  const rows: { now: Date }[] = await getPool().query('SELECT UTC_TIMESTAMP() AS now');
  return rows[0]!.now;
}

/**
 * One line for logs: the driver wraps the real reason (wrong password, unknown database, no privileges, refused)
 * in error.cause behind a generic "pool failed to retrieve a connection". Never contains the password.
 */
export function describeDbError(error: unknown): string {
  const parts: string[] = [];
  let current: unknown = error;
  for (let depth = 0; current && depth < 4; depth++) {
    const e = current as { code?: string; sqlMessage?: string | null; message?: string; cause?: unknown };
    const text = (e.sqlMessage || e.message || String(current)).split('\n')[0] ?? '';
    parts.push(e.code ? `${e.code}: ${text}` : text);
    current = e.cause;
  }
  return parts.join(' ← caused by ');
}

/** MariaDB's JSON is LONGTEXT; depending on server metadata the driver returns a string or an object. */
export function parseJson<T>(value: unknown): T | null {
  if (value == null) {
    return null;
  }
  if (typeof value === 'string') {
    return JSON.parse(value) as T;
  }
  return value as T;
}

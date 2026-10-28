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

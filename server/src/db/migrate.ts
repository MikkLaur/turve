/**
 * Applies pending migrations (deploy.sh runs this before restarting the API).
 *   npm run migrate                       apply everything not yet in schema_migrations
 *   npm run migrate -- --status           list applied / pending
 *   npm run migrate -- --down <id>        roll back one applied migration (destroys its data)
 */
import { closePool, getPool } from './pool';
import { migrations } from './migrations';

const LOCK_NAME = 'turve_migrations';

async function run(): Promise<void> {
  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      appliedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `);

  const conn = await pool.getConnection();
  try {
    const [lock] = await conn.query('SELECT GET_LOCK(?, 30) AS ok', [LOCK_NAME]);
    if (!lock || Number(lock.ok) !== 1) {
      throw new Error('Another migration run holds the lock.');
    }

    const rows: { id: string }[] = await conn.query('SELECT id FROM schema_migrations');
    const applied = new Set(rows.map((row) => row.id));
    const args = process.argv.slice(2);

    if (args[0] === '--status') {
      for (const migration of migrations) {
        console.info(`${applied.has(migration.id) ? 'applied' : 'pending'}  ${migration.id}`);
      }
      return;
    }

    if (args[0] === '--down') {
      const migration = migrations.find((m) => m.id === args[1]);
      if (!migration) {
        throw new Error(`Give an existing migration id, e.g. --down ${migrations.at(-1)?.id}`);
      }
      if (!applied.has(migration.id)) {
        throw new Error(`${migration.id} is not applied.`);
      }
      console.info(`Rolling back ${migration.id}…`);
      await migration.down(pool);
      await conn.query('DELETE FROM schema_migrations WHERE id = ?', [migration.id]);
      console.info('Done.');
      return;
    }

    const pending = migrations.filter((m) => !applied.has(m.id));
    if (pending.length === 0) {
      console.info('No pending migrations.');
    }
    for (const migration of pending) {
      console.info(`Applying ${migration.id}…`);
      await migration.up(pool);
      await conn.query('INSERT INTO schema_migrations (id) VALUES (?)', [migration.id]);
    }
  } finally {
    await conn.query('SELECT RELEASE_LOCK(?)', [LOCK_NAME]).catch(() => undefined);
    conn.release();
  }
}

run()
  .catch((error) => {
    console.error('Migration failed:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => closePool());

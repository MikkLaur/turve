import app from './app';
import { config } from './config/config';
import { describeDbError, getPool } from './db/pool';

(async () => {
  try {
    // Fail fast if the database is unreachable; the schema comes from "npm run migrate", not from start-up.
    await getPool().query('SELECT 1');
    app.listen(config.port, () => {
      console.log(`turve API listening on port ${config.port} (${config.nodeEnv})`);
    });
  } catch (error) {
    console.error(`Database not reachable: ${describeDbError(error)}`);
    process.exit(1);
  }
})();

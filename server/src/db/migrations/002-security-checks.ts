import { Migration, TABLE_OPTIONS } from './types';

const migration: Migration = {
  id: '002-security-checks',
  async up(pool) {
    // Results of the public website check. No visitor IP is stored.
    await pool.query(`
      CREATE TABLE IF NOT EXISTS SecurityChecks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        publicId CHAR(22) NOT NULL UNIQUE,
        domain VARCHAR(253) NOT NULL,
        grade CHAR(1) NOT NULL,
        score SMALLINT NOT NULL,
        resultJson JSON NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_checks_domain (domain, createdAt),
        INDEX idx_checks_created (createdAt)
      ) ${TABLE_OPTIONS}
    `);
  },
  async down(pool) {
    await pool.query('DROP TABLE IF EXISTS SecurityChecks');
  },
};

export default migration;

import { Migration, TABLE_OPTIONS } from './types';

const migration: Migration = {
  id: '004-audit-log',
  async up(pool) {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS AuditLog (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        userId INT NULL,
        action VARCHAR(64) NOT NULL,
        detail VARCHAR(500) NULL,
        ip VARCHAR(45) NULL,
        INDEX idx_audit_at (at),
        CONSTRAINT fk_audit_user FOREIGN KEY (userId) REFERENCES Users (id) ON DELETE SET NULL
      ) ${TABLE_OPTIONS}
    `);
  },
  async down(pool) {
    await pool.query('DROP TABLE IF EXISTS AuditLog');
  },
};

export default migration;

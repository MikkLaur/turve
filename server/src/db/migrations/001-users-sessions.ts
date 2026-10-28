import { Migration, TABLE_OPTIONS } from './types';

const migration: Migration = {
  id: '001-users-sessions',
  async up(pool) {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(64) NOT NULL UNIQUE,
        email VARCHAR(254) NULL,
        displayName VARCHAR(200) NULL,
        role ENUM('admin', 'staff') NOT NULL DEFAULT 'staff',
        passwordHash VARCHAR(255) NOT NULL,
        totpSecretEnc VARCHAR(255) NULL,
        totpLastStep BIGINT NULL,
        lastLoginAt DATETIME NULL,
        disabledAt DATETIME NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ${TABLE_OPTIONS}
    `);
    // id is the SHA-256 of the cookie token; the token itself is never stored.
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Sessions (
        id CHAR(64) NOT NULL PRIMARY KEY,
        userId INT NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        lastSeenAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        expiresAt DATETIME NOT NULL,
        mfaVerifiedAt DATETIME NULL,
        failedMfaAttempts TINYINT UNSIGNED NOT NULL DEFAULT 0,
        userAgent VARCHAR(255) NULL,
        INDEX idx_sessions_user (userId),
        INDEX idx_sessions_expires (expiresAt),
        CONSTRAINT fk_sessions_user FOREIGN KEY (userId) REFERENCES Users (id) ON DELETE CASCADE
      ) ${TABLE_OPTIONS}
    `);
  },
  async down(pool) {
    await pool.query('DROP TABLE IF EXISTS Sessions');
    await pool.query('DROP TABLE IF EXISTS Users');
  },
};

export default migration;

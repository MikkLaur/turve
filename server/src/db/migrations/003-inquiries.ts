import { Migration, TABLE_OPTIONS } from './types';

const migration: Migration = {
  id: '003-inquiries',
  async up(pool) {
    // Text is stored as typed and escaped on output. Money in cents, time in minutes.
    // selectionJson is the server-priced snapshot of the chosen packages (catalog version, minutes, rate, totals).
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Inquiries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lang ENUM('et', 'en') NOT NULL,
        name VARCHAR(200) NOT NULL,
        company VARCHAR(200) NULL,
        email VARCHAR(254) NOT NULL,
        phone VARCHAR(40) NULL,
        website VARCHAR(255) NULL,
        message TEXT NULL,
        selectionJson JSON NULL,
        catalogVersion VARCHAR(32) NULL,
        onceMinutes INT NOT NULL DEFAULT 0,
        onceCents INT NOT NULL DEFAULT 0,
        monthlyMinutes INT NOT NULL DEFAULT 0,
        monthlyCents INT NOT NULL DEFAULT 0,
        securityCheckId INT NULL,
        status ENUM('new', 'in_progress', 'won', 'lost', 'spam') NOT NULL DEFAULT 'new',
        flags VARCHAR(100) NULL,
        adminNotes TEXT NULL,
        consentAt DATETIME NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_inquiries_status (status, createdAt),
        CONSTRAINT fk_inquiries_check FOREIGN KEY (securityCheckId) REFERENCES SecurityChecks (id) ON DELETE SET NULL
      ) ${TABLE_OPTIONS}
    `);
  },
  async down(pool) {
    await pool.query('DROP TABLE IF EXISTS Inquiries');
  },
};

export default migration;

import { Migration, TABLE_OPTIONS } from './types';

const migration: Migration = {
  id: '006-consultations',
  async up(pool) {
    // Weekly windows when the free 20-minute consultation can be booked (set in kapsaaed → Ajad).
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ConsultationHours (
        id INT AUTO_INCREMENT PRIMARY KEY,
        weekday TINYINT NOT NULL,
        startTime CHAR(5) NOT NULL,
        endTime CHAR(5) NOT NULL,
        CONSTRAINT chk_consultation_hours_weekday CHECK (weekday BETWEEN 1 AND 7)
      ) ${TABLE_OPTIONS}
    `);
    // Tallinn dates with no consultations (days off, holidays).
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ConsultationBlocks (
        day DATE PRIMARY KEY,
        note VARCHAR(200) NULL
      ) ${TABLE_OPTIONS}
    `);
    // weekday: ISO 1 = Monday … 7 = Sunday; times are 'HH:MM' Tallinn time. startsAt is UTC.
    // activeStart is NULL for cancelled rows, so a cancelled time can be booked again, while the UNIQUE key stops two
    // active bookings at the same start even if two requests race.
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Consultations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        startsAt DATETIME NOT NULL,
        status ENUM('booked', 'done', 'no_show', 'cancelled') NOT NULL DEFAULT 'booked',
        lang ENUM('et', 'en') NOT NULL,
        name VARCHAR(200) NOT NULL,
        company VARCHAR(200) NULL,
        email VARCHAR(254) NOT NULL,
        phone VARCHAR(40) NOT NULL,
        topic ENUM('website', 'modernising', 'security', 'other') NOT NULL DEFAULT 'other',
        message TEXT NULL,
        flags VARCHAR(100) NULL,
        adminNotes TEXT NULL,
        consentAt DATETIME NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        activeStart DATETIME AS (IF(status = 'cancelled', NULL, startsAt)) PERSISTENT,
        UNIQUE KEY uq_consultations_active_start (activeStart),
        INDEX idx_consultations_starts (startsAt),
        INDEX idx_consultations_email (email, status)
      ) ${TABLE_OPTIONS}
    `);
  },
  async down(pool) {
    await pool.query('DROP TABLE IF EXISTS Consultations');
    await pool.query('DROP TABLE IF EXISTS ConsultationBlocks');
    await pool.query('DROP TABLE IF EXISTS ConsultationHours');
  },
};

export default migration;

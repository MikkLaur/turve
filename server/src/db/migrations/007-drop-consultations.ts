import { Migration } from './types';

const migration: Migration = {
  id: '007-drop-consultations',
  async up(pool) {
    // The free consultation is no longer booked on the site (TURVE-013): visitors ask for it in the contact form or call.
    await pool.query('DROP TABLE IF EXISTS Consultations');
    await pool.query('DROP TABLE IF EXISTS ConsultationBlocks');
    await pool.query('DROP TABLE IF EXISTS ConsultationHours');
  },
  async down() {
    // Nothing to restore: 006-consultations holds the schema if booking ever comes back.
  },
};

export default migration;

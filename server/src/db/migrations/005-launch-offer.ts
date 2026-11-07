import { Migration } from './types';

const migration: Migration = {
  id: '005-launch-offer',
  async up(pool) {
    // 1 = the inquiry takes a spot in the launch offer (LAUNCH_OFFER in the catalog); the owner can toggle it in kapsaaed.
    await pool.query('ALTER TABLE Inquiries ADD COLUMN countsForOffer TINYINT(1) NOT NULL DEFAULT 0 AFTER flags');
  },
  async down(pool) {
    await pool.query('ALTER TABLE Inquiries DROP COLUMN countsForOffer');
  },
};

export default migration;

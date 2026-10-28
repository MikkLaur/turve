import { Pool } from 'mariadb';

export interface Migration {
  /** Stable id, recorded in schema_migrations once applied. Never rename or edit an applied migration. */
  id: string;
  up: (pool: Pool) => Promise<void>;
  down: (pool: Pool) => Promise<void>;
}

export const TABLE_OPTIONS = 'ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci';

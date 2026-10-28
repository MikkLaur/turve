import migration001 from './001-users-sessions';
import migration002 from './002-security-checks';
import migration003 from './003-inquiries';
import migration004 from './004-audit-log';
import { Migration } from './types';

/** Applied in this order; append new migrations at the end. */
export const migrations: Migration[] = [migration001, migration002, migration003, migration004];

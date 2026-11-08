import migration001 from './001-users-sessions';
import migration002 from './002-security-checks';
import migration003 from './003-inquiries';
import migration004 from './004-audit-log';
import migration005 from './005-launch-offer';
import migration006 from './006-consultations';
import migration007 from './007-drop-consultations';
import { Migration } from './types';

/** Applied in this order; append new migrations at the end. */
export const migrations: Migration[] = [migration001, migration002, migration003, migration004, migration005, migration006, migration007];

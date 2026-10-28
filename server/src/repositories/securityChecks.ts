import { randomBytes } from 'node:crypto';
import { getPool, parseJson } from '../db/pool';
import type { CheckResult } from '../check/types';

export interface StoredCheck {
  id: number;
  publicId: string;
  domain: string;
  grade: string;
  score: number;
  createdAt: Date;
  result: CheckResult;
}

interface Row {
  id: number;
  publicId: string;
  domain: string;
  grade: string;
  score: number;
  createdAt: Date;
  resultJson: unknown;
}

function toStored(row: Row): StoredCheck {
  const { resultJson, ...rest } = row;
  return { ...rest, result: parseJson<CheckResult>(resultJson)! };
}

export async function insertCheck(result: CheckResult): Promise<StoredCheck> {
  const publicId = randomBytes(16).toString('base64url').slice(0, 22);
  const insert = await getPool().query(
    'INSERT INTO SecurityChecks (publicId, domain, grade, score, resultJson) VALUES (?, ?, ?, ?, ?)',
    [publicId, result.domain, result.grade, result.score, JSON.stringify(result)],
  );
  return { id: Number(insert.insertId), publicId, domain: result.domain, grade: result.grade, score: result.score, createdAt: new Date(), result };
}

export async function findRecentCheck(domain: string, maxAgeMinutes: number): Promise<StoredCheck | null> {
  const rows: Row[] = await getPool().query(
    `SELECT id, publicId, domain, grade, score, createdAt, resultJson FROM SecurityChecks
      WHERE domain = ? AND createdAt > UTC_TIMESTAMP() - INTERVAL ? MINUTE
      ORDER BY id DESC LIMIT 1`,
    [domain, maxAgeMinutes],
  );
  return rows[0] ? toStored(rows[0]) : null;
}

export async function findCheckByPublicId(publicId: string): Promise<StoredCheck | null> {
  const rows: Row[] = await getPool().query(
    'SELECT id, publicId, domain, grade, score, createdAt, resultJson FROM SecurityChecks WHERE publicId = ?',
    [publicId],
  );
  return rows[0] ? toStored(rows[0]) : null;
}

export async function findCheckById(id: number): Promise<StoredCheck | null> {
  const rows: Row[] = await getPool().query(
    'SELECT id, publicId, domain, grade, score, createdAt, resultJson FROM SecurityChecks WHERE id = ?',
    [id],
  );
  return rows[0] ? toStored(rows[0]) : null;
}

export async function listRecentChecks(limit: number): Promise<
  { id: number; domain: string; grade: string; score: number; createdAt: Date; inquiryId: number | null }[]
> {
  return getPool().query(
    `SELECT c.id, c.domain, c.grade, c.score, c.createdAt, MIN(i.id) AS inquiryId
       FROM SecurityChecks c LEFT JOIN Inquiries i ON i.securityCheckId = c.id
      GROUP BY c.id ORDER BY c.id DESC LIMIT ?`,
    [limit],
  );
}

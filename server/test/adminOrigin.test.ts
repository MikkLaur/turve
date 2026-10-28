import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { NextFunction, Request, Response } from 'express';
import { config } from '../src/config/config';
import { requireAdminOrigin } from '../src/middlewares/adminOrigin';

function run(method: string, headers: Record<string, string>, isJson = true) {
  let status = 0;
  let nextCalled = false;
  const req = { method, headers, is: () => (isJson ? 'application/json' : false) } as unknown as Request;
  const res = {
    status(code: number) {
      status = code;
      return this;
    },
    json() {
      return this;
    },
  } as unknown as Response;
  requireAdminOrigin(req, res, (() => (nextCalled = true)) as NextFunction);
  return { status, nextCalled };
}

describe('requireAdminOrigin', () => {
  it('lets reads through', () => {
    assert.equal(run('GET', {}).nextCalled, true);
  });

  it('requires the panel origin for writes', () => {
    assert.equal(run('POST', { origin: 'https://www.turve.ee' }).status, 403);
    assert.equal(run('POST', {}).status, 403);
    assert.equal(run('DELETE', { origin: 'https://evil.example' }).status, 403);
    assert.equal(run('POST', { origin: config.adminOrigin, 'content-length': '10' }).nextCalled, true);
  });

  it('requires JSON bodies (no simple cross-site form posts)', () => {
    assert.equal(run('POST', { origin: config.adminOrigin, 'content-length': '10' }, false).status, 415);
  });
});

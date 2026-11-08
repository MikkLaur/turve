import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Router } from 'express';
import adminRoutes from '../src/routes/adminRoutes';
import publicRoutes from '../src/routes/publicRoutes';

/** Every HTTP method the router's routes answer, as "METHOD /path". */
function routesOf(router: Router): string[] {
  const found: string[] = [];
  for (const layer of router.stack as unknown as { route?: { path: string; methods: Record<string, boolean> } }[]) {
    if (!layer.route) continue;
    for (const method of Object.keys(layer.route.methods)) {
      found.push(`${method.toUpperCase()} ${layer.route.path}`);
    }
  }
  return found;
}

// Zone.eu's proxy in front of api.turve.ee answers PUT, DELETE and PATCH itself with a 403 HTML page: such routes
// would work locally and fail in production. Only GET and POST reach the API.
describe('API routes', () => {
  for (const [name, router] of [
    ['admin', adminRoutes],
    ['public', publicRoutes],
  ] as const) {
    it(`${name} routes use only GET and POST`, () => {
      const routes = routesOf(router);
      assert.ok(routes.length > 0, 'no routes found');
      const others = routes.filter((route) => !/^(GET|POST) /.test(route));
      assert.deepEqual(others, []);
    });
  }

  it('has the POST replacements for the old PUT/DELETE admin routes', () => {
    const routes = routesOf(adminRoutes);
    for (const route of [
      'POST /consultation-hours',
      'POST /consultation-blocks/:day/delete',
      'POST /consultations/:id/delete',
      'POST /inquiries/:id/delete',
    ]) {
      assert.ok(routes.includes(route), route);
    }
  });
});

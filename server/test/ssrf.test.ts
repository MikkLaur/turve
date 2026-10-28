import assert from 'node:assert/strict';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { after, before, describe, it } from 'node:test';
import { isPublicAddress } from '../src/check/addressGuard';
import { mailDomainOf, normalizeHostname } from '../src/check/hostname';
import { fetchFollowing } from '../src/check/httpProbe';
import { DnsClient, resolvePublic } from '../src/check/resolve';
import { CheckInputError } from '../src/check/types';

function fakeDns(a: Record<string, string[]>, aaaa: Record<string, string[]> = {}): DnsClient {
  const lookup = (table: Record<string, string[]>) => async (name: string) => {
    const hit = table[name];
    if (!hit) {
      throw Object.assign(new Error('ENOTFOUND'), { code: 'ENOTFOUND' });
    }
    return hit;
  };
  return {
    resolve4: lookup(a),
    resolve6: lookup(aaaa),
    resolveTxt: async () => [],
    resolveMx: async () => [],
    resolveCaa: async () => [],
  };
}

const code = (fn: () => unknown) => {
  try {
    fn();
  } catch (error) {
    return error instanceof CheckInputError ? error.code : 'other';
  }
  return 'accepted';
};

describe('normalizeHostname', () => {
  it('accepts what people type', () => {
    assert.equal(normalizeHostname('Example.EE'), 'example.ee');
    assert.equal(normalizeHostname(' https://www.example.ee/some/page?x=1 '), 'www.example.ee');
    assert.equal(normalizeHostname('example.ee.'), 'example.ee');
    assert.equal(normalizeHostname('õun.ee'), 'xn--un-bka.ee');
  });

  it('refuses IP literals in every spelling', () => {
    for (const input of ['127.0.0.1', '2130706433', '0x7f000001', '0x7f.1', '127.1', '0177.0.0.1', '10.0.0.1', '[::1]', 'http://[::ffff:127.0.0.1]/', '::1', '169.254.169.254']) {
      assert.equal(code(() => normalizeHostname(input)), 'invalid_domain', input);
    }
  });

  it('refuses ports, credentials, other schemes and internal names', () => {
    for (const input of [
      'example.ee:8080',
      'http://example.ee:443/',
      'user:pass@example.ee',
      'ftp://example.ee',
      'file:///etc/passwd',
      'localhost',
      'foo.localhost',
      'printer.local',
      'db.internal',
      'router.home.arpa',
      'nodot',
      'example.123',
      'exa_mple.ee',
      '-bad.ee',
      'a'.repeat(64) + '.ee',
      '',
      42,
      null,
    ]) {
      assert.equal(code(() => normalizeHostname(input)), 'invalid_domain', String(input));
    }
  });

  it('derives the mail domain', () => {
    assert.equal(mailDomainOf('www.example.ee'), 'example.ee');
    assert.equal(mailDomainOf('example.ee'), 'example.ee');
    assert.equal(mailDomainOf('shop.example.ee'), 'shop.example.ee');
  });
});

describe('isPublicAddress', () => {
  it('refuses private, loopback (incl. Zone 127.2.x.x), link-local and special ranges', () => {
    for (const ip of [
      '127.0.0.1', '127.2.50.216', '10.0.0.1', '172.16.0.1', '172.31.255.255', '192.168.1.1', '169.254.169.254',
      '100.64.0.1', '0.0.0.0', '224.0.0.1', '255.255.255.255', '192.0.2.10', '198.18.0.1',
      '::1', '::', '::ffff:127.0.0.1', '::ffff:10.0.0.1', 'fe80::1', 'fc00::1', 'fd12:3456::1', 'ff02::1',
      '64:ff9b::7f00:1', '2001:db8::1', '2002:7f00:1::1', '2001::1', 'not-an-ip',
    ]) {
      assert.equal(isPublicAddress(ip), false, ip);
    }
  });

  it('allows public unicast', () => {
    for (const ip of ['93.184.215.14', '1.1.1.1', '217.146.69.36', '2a00:1450:4001:80b::200e', '2606:4700::6810:84e5']) {
      assert.equal(isPublicAddress(ip), true, ip);
    }
  });
});

describe('resolvePublic', () => {
  it('refuses a hostname if ANY of its addresses is not public', async () => {
    await assert.rejects(resolvePublic('evil.example.ee', fakeDns({ 'evil.example.ee': ['127.0.0.1'] })), { code: 'not_public' });
    await assert.rejects(resolvePublic('mixed.example.ee', fakeDns({ 'mixed.example.ee': ['1.1.1.1', '10.0.0.5'] })), { code: 'not_public' });
    await assert.rejects(resolvePublic('v6.example.ee', fakeDns({}, { 'v6.example.ee': ['::1'] })), { code: 'not_public' });
    await assert.rejects(resolvePublic('none.example.ee', fakeDns({})), { code: 'not_found' });
  });

  it('pins one vetted address, preferring IPv4', async () => {
    const pinned = await resolvePublic('ok.example.ee', fakeDns({ 'ok.example.ee': ['1.1.1.1'] }, { 'ok.example.ee': ['2606:4700::1111'] }));
    assert.deepEqual(pinned, { address: '1.1.1.1', family: 4 });
  });
});

describe('fetchFollowing redirect validation', () => {
  // A stand-in "public" site. The test pins 127.0.0.1 itself; production never can (resolvePublic refuses it).
  let server: http.Server;
  let port: number;
  const hits: string[] = [];

  before(async () => {
    server = http.createServer((req, res) => {
      hits.push(`${req.headers.host}${req.url}`);
      const targets: Record<string, string> = {
        '/to-private-host': 'http://internal.example.ee/',
        '/to-ip-literal': 'http://127.0.0.1/admin',
        '/to-port': 'http://site.example.ee:8080/',
        '/to-file': 'file:///etc/passwd',
        '/loop': '/loop',
      };
      const target = targets[req.url ?? ''];
      if (target) {
        res.writeHead(302, { location: target }).end();
      } else {
        res.writeHead(200, { 'content-type': 'text/plain' }).end('ok');
      }
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    port = (server.address() as AddressInfo).port;
  });

  after(() => new Promise<void>((resolve) => server.close(() => resolve())));

  const start = (path: string) => new URL(`http://site.example.ee${path}`);
  const pinned = { address: '127.0.0.1', family: 4 as const };
  const dns = fakeDns({ 'internal.example.ee': ['10.0.0.5'] });

  for (const path of ['/to-private-host', '/to-ip-literal', '/to-port', '/to-file']) {
    it(`does not follow ${path}`, async () => {
      hits.length = 0;
      const { response, chain } = await fetchFollowing(start(path), pinned, dns, { deadline: Date.now() + 5000, testPort: port });
      assert.equal(response.status, 302);
      assert.equal(chain.length, 1);
      assert.deepEqual(hits, [`site.example.ee${path}`]);
    });
  }

  it('stops a redirect loop after 3 hops', async () => {
    hits.length = 0;
    const { chain } = await fetchFollowing(start('/loop'), pinned, dns, { deadline: Date.now() + 5000, testPort: port });
    assert.equal(chain.length, 4);
    assert.equal(hits.length, 4);
  });

  it('sends the hostname as Host header while connecting to the pinned IP', async () => {
    hits.length = 0;
    const { response } = await fetchFollowing(start('/'), pinned, dns, { deadline: Date.now() + 5000, testPort: port });
    assert.equal(response.status, 200);
    assert.deepEqual(hits, ['site.example.ee/']);
  });
});

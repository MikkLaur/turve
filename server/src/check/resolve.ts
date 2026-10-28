import { Resolver } from 'node:dns/promises';
import { config } from '../config/config';
import { isPublicAddress } from './addressGuard';
import { CheckInputError } from './types';

export interface PinnedAddress {
  address: string;
  family: 4 | 6;
}

export interface DnsClient {
  resolve4(hostname: string): Promise<string[]>;
  resolve6(hostname: string): Promise<string[]>;
  resolveTxt(hostname: string): Promise<string[][]>;
  resolveMx(hostname: string): Promise<{ exchange: string; priority: number }[]>;
  resolveCaa(hostname: string): Promise<unknown[]>;
}

/** Queries DNS directly (never /etc/hosts, which on Zone.eu maps hosted domains to internal addresses). */
export function createResolver(): DnsClient {
  const resolver = new Resolver({ timeout: 3000, tries: 2 });
  if (config.checkDnsServers.length) {
    resolver.setServers(config.checkDnsServers);
  }
  return resolver;
}

/**
 * Resolves a hostname and returns ONE vetted address to connect to. If any A/AAAA record is not public,
 * the whole hostname is refused. Callers connect to the returned IP directly (no second lookup), so a
 * DNS answer that changes between check and connect (rebinding) cannot redirect the connection.
 */
export async function resolvePublic(hostname: string, dns: DnsClient): Promise<PinnedAddress> {
  const [v4, v6] = await Promise.allSettled([dns.resolve4(hostname), dns.resolve6(hostname)]);
  const addresses: PinnedAddress[] = [
    ...(v4.status === 'fulfilled' ? v4.value.map((address) => ({ address, family: 4 as const })) : []),
    ...(v6.status === 'fulfilled' ? v6.value.map((address) => ({ address, family: 6 as const })) : []),
  ];
  if (addresses.length === 0) {
    throw new CheckInputError('not_found');
  }
  if (!addresses.every((entry) => isPublicAddress(entry.address))) {
    throw new CheckInputError('not_public');
  }
  // Prefer IPv4: not every host has working IPv6 connectivity.
  return addresses.find((entry) => entry.family === 4) ?? addresses[0]!;
}

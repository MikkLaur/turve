import { BlockList, isIP } from 'node:net';

// Addresses the check may connect to: public unicast only. Everything special-purpose is refused,
// including all of 127.0.0.0/8 (Zone.eu binds apps to 127.x.x.x addresses) and every private range.
const V4_BLOCKED: [string, number][] = [
  ['0.0.0.0', 8], // "this network"
  ['10.0.0.0', 8], // private
  ['100.64.0.0', 10], // carrier-grade NAT
  ['127.0.0.0', 8], // loopback
  ['169.254.0.0', 16], // link-local, cloud metadata
  ['172.16.0.0', 12], // private
  ['192.0.0.0', 24], // IETF protocol assignments
  ['192.0.2.0', 24], // documentation
  ['192.88.99.0', 24], // 6to4 relay
  ['192.168.0.0', 16], // private
  ['198.18.0.0', 15], // benchmarking
  ['198.51.100.0', 24], // documentation
  ['203.0.113.0', 24], // documentation
  ['224.0.0.0', 4], // multicast
  ['240.0.0.0', 4], // reserved, broadcast
];

// IPv6: allow only global unicast 2000::/3, minus its special-purpose blocks.
const V6_BLOCKED_INSIDE_GLOBAL: [string, number][] = [
  ['2001::', 23], // IETF protocol assignments, incl. Teredo 2001::/32
  ['2001:db8::', 32], // documentation
  ['2002::', 16], // 6to4 (can embed private IPv4)
  ['3fff::', 20], // documentation
];

const blocked = new BlockList();
for (const [network, prefix] of V4_BLOCKED) {
  blocked.addSubnet(network, prefix, 'ipv4');
}
for (const [network, prefix] of V6_BLOCKED_INSIDE_GLOBAL) {
  blocked.addSubnet(network, prefix, 'ipv6');
}
const globalUnicastV6 = new BlockList();
globalUnicastV6.addSubnet('2000::', 3, 'ipv6');

export function isPublicAddress(address: string): boolean {
  const family = isIP(address);
  if (family === 4) {
    return !blocked.check(address, 'ipv4');
  }
  if (family === 6) {
    return globalUnicastV6.check(address, 'ipv6') && !blocked.check(address, 'ipv6');
  }
  return false;
}

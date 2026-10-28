import tls from 'node:tls';
import { PinnedAddress } from './resolve';

export interface TlsInfo {
  protocol: string | null;
  /** Chain validates against the system CA store. */
  authorized: boolean;
  authorizationError: string | null;
  hostnameMatches: boolean;
  validTo: string | null;
  daysLeft: number | null;
  issuer: string | null;
}

const TIMEOUT_MS = 5000;

function connect(hostname: string, pinned: PinnedAddress, extra: tls.ConnectionOptions): Promise<tls.TLSSocket> {
  return new Promise((resolve, reject) => {
    let socket: tls.TLSSocket;
    try {
      socket = tls.connect({
        host: pinned.address,
        port: 443,
        servername: hostname,
        rejectUnauthorized: false,
        timeout: TIMEOUT_MS,
        ALPNProtocols: ['http/1.1'],
        ...extra,
      });
    } catch (error) {
      reject(error);
      return;
    }
    const timer = setTimeout(() => socket.destroy(new Error('timeout')), TIMEOUT_MS);
    socket.once('secureConnect', () => {
      clearTimeout(timer);
      resolve(socket);
    });
    socket.once('timeout', () => socket.destroy(new Error('timeout')));
    socket.once('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}

export async function probeTls(hostname: string, pinned: PinnedAddress, now: Date = new Date()): Promise<TlsInfo> {
  const socket = await connect(hostname, pinned, {});
  try {
    const cert = socket.getPeerCertificate();
    const hasCert = cert && Object.keys(cert).length > 0;
    const validToMs = hasCert ? Date.parse(cert.valid_to) : NaN;
    const issuer = hasCert ? (cert.issuer?.O ?? cert.issuer?.CN ?? null) : null;
    return {
      protocol: socket.getProtocol(),
      authorized: socket.authorized,
      authorizationError: socket.authorizationError ? String(socket.authorizationError) : null,
      hostnameMatches: hasCert ? tls.checkServerIdentity(hostname, cert) === undefined : false,
      validTo: Number.isNaN(validToMs) ? null : new Date(validToMs).toISOString(),
      daysLeft: Number.isNaN(validToMs) ? null : Math.floor((validToMs - now.getTime()) / 86_400_000),
      issuer: Array.isArray(issuer) ? (issuer[0] ?? null) : issuer,
    };
  } finally {
    socket.destroy();
  }
}

/** True if the server still completes a TLS 1.0/1.1 handshake. */
export async function acceptsLegacyTls(hostname: string, pinned: PinnedAddress): Promise<boolean> {
  try {
    const socket = await connect(hostname, pinned, { minVersion: 'TLSv1', maxVersion: 'TLSv1.1', ciphers: 'DEFAULT@SECLEVEL=0' });
    socket.destroy();
    return true;
  } catch {
    return false;
  }
}

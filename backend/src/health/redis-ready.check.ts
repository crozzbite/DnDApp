import * as net from 'node:net';
import { getRedisConnectionConfig } from '../config/redis-connection.config';

/** App-side Redis PING timeout — must finish before K8s readinessProbe.timeoutSeconds (5s). */
export const REDIS_PROBE_TIMEOUT_MS = 3_000;

const REDIS_PING = '*1\r\n$4\r\nPING\r\n';

/** Redis PING using the same host/port as BullMQ (RESP, not TCP-only). */
export function checkRedisReady(): Promise<boolean> {
  const { host, port } = getRedisConnectionConfig();

  return new Promise((resolve) => {
    let settled = false;
    let buffer = '';

    const finish = (result: boolean) => {
      if (settled) {
        return;
      }
      settled = true;
      socket.destroy();
      resolve(result);
    };

    const socket = net.connect({ host, port }, () => {
      socket.write(REDIS_PING);
    });

    socket.on('data', (chunk) => {
      buffer += chunk.toString();
      if (buffer.includes('PONG')) {
        finish(true);
      }
    });

    socket.on('error', () => finish(false));
    socket.setTimeout(REDIS_PROBE_TIMEOUT_MS, () => finish(false));
  });
}

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as net from 'node:net';
import {
  DEFAULT_REDIS_HOST,
  DEFAULT_REDIS_PORT,
  getRedisConnectionConfig,
} from '../config/redis-connection.config';
import { checkRedisReady } from './redis-ready.check';

jest.mock('../config/redis-connection.config', () => {
  const actual = jest.requireActual<
    typeof import('../config/redis-connection.config')
  >('../config/redis-connection.config');
  return {
    ...actual,
    getRedisConnectionConfig: jest.fn(),
  };
});

jest.mock('node:net', () => ({
  connect: jest.fn(),
}));

const mockedGetConfig = getRedisConnectionConfig as jest.MockedFunction<
  typeof getRedisConnectionConfig
>;
const mockedConnect = net.connect as jest.MockedFunction<typeof net.connect>;

function invokeConnectCallback(
  callback: net.NetConnectOpts | (() => void) | undefined,
  socket: net.Socket,
): void {
  if (typeof callback === 'function') {
    process.nextTick(() => {
      callback.call(socket);
    });
  }
}

describe('checkRedisReady', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedGetConfig.mockReturnValue({
      host: 'redis.internal',
      port: 6380,
    });
  });

  it('connects with host/port from getRedisConnectionConfig', async () => {
    mockedConnect.mockImplementation((_opts, callback) => {
      const socket = {
        write: jest.fn(),
        on: jest.fn((event: string, handler: () => void) => {
          if (event === 'error') {
            process.nextTick(handler);
          }
        }),
        setTimeout: jest.fn(),
        destroy: jest.fn(),
      } as unknown as net.Socket;

      invokeConnectCallback(callback, socket);

      return socket;
    });

    await checkRedisReady();

    expect(mockedGetConfig).toHaveBeenCalled();
    expect(mockedConnect).toHaveBeenCalledWith(
      { host: 'redis.internal', port: 6380 },
      expect.any(Function),
    );
  });

  it('returns true when Redis responds PONG', async () => {
    mockedConnect.mockImplementation((_opts, callback) => {
      const handlers: Record<string, (chunk?: Buffer) => void> = {};
      const socket = {
        write: jest.fn((payload: string) => {
          expect(payload).toContain('PING');
          handlers['data']?.(Buffer.from('+PONG\r\n'));
        }),
        on: jest.fn((event: string, handler: (chunk?: Buffer) => void) => {
          handlers[event] = handler;
        }),
        setTimeout: jest.fn(),
        destroy: jest.fn(),
      } as unknown as net.Socket;

      invokeConnectCallback(callback, socket);

      return socket;
    });

    await expect(checkRedisReady()).resolves.toBe(true);
  });

  it('returns false when TCP connect errors', async () => {
    mockedConnect.mockImplementation(() => {
      const socket = {
        write: jest.fn(),
        on: jest.fn((event: string, handler: () => void) => {
          if (event === 'error') {
            handler();
          }
        }),
        setTimeout: jest.fn(),
        destroy: jest.fn(),
      } as unknown as net.Socket;

      return socket;
    });

    await expect(checkRedisReady()).resolves.toBe(false);
  });

  it('returns false on probe timeout', async () => {
    mockedConnect.mockImplementation((_opts, callback) => {
      const socket = {
        write: jest.fn(),
        on: jest.fn(),
        setTimeout: jest.fn((_ms: number, handler: () => void) => {
          process.nextTick(handler);
        }),
        destroy: jest.fn(),
      } as unknown as net.Socket;

      invokeConnectCallback(callback, socket);

      return socket;
    });

    await expect(checkRedisReady()).resolves.toBe(false);
  });
});

describe('redis config defaults (overlay contract)', () => {
  it('matches Build-Overlay.ps1 api-configmap REDIS_* literals', () => {
    const overlayScript = readFileSync(
      join(__dirname, '../../../deploy/k8s/scripts/Build-Overlay.ps1'),
      'utf8',
    );

    expect(overlayScript).toContain('REDIS_HOST: redis');
    expect(overlayScript).toContain('REDIS_PORT: "6379"');
    expect(DEFAULT_REDIS_HOST).toBe('redis');
    expect(DEFAULT_REDIS_PORT).toBe(6379);
  });
});

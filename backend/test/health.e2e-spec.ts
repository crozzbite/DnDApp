import * as net from 'node:net';
import { Module } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { registerHealthRoutes } from '../src/health/register-health-routes';

@Module({})
class HealthE2eModule {}

function startFakeRedisServer(): Promise<{
  port: number;
  close: () => Promise<void>;
}> {
  return new Promise((resolve, reject) => {
    const server = net.createServer((socket) => {
      socket.on('data', () => {
        socket.write('+PONG\r\n');
      });
    });

    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        reject(new Error('Failed to bind fake Redis server'));
        return;
      }

      resolve({
        port: address.port,
        close: () =>
          new Promise((closeResolve, closeReject) => {
            server.close((error) =>
              error ? closeReject(error) : closeResolve(),
            );
          }),
      });
    });
  });
}

describe('Health endpoints (e2e)', () => {
  let app: NestFastifyApplication;

  async function createApp(): Promise<void> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [HealthE2eModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    registerHealthRoutes(app);
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  }

  afterEach(async () => {
    if (app) {
      await app.close();
    }
    delete process.env['REDIS_HOST'];
    delete process.env['REDIS_PORT'];
  });

  it('GET /health returns 200 when process is up (no Redis check)', async () => {
    process.env['REDIS_HOST'] = '127.0.0.1';
    process.env['REDIS_PORT'] = '1';
    await createApp();

    const response = await app.inject({ method: 'GET', url: '/health' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ status: 'ok' });
  });

  it('GET /ready returns 503 when Redis is unreachable', async () => {
    process.env['REDIS_HOST'] = '127.0.0.1';
    process.env['REDIS_PORT'] = '1';
    await createApp();

    const response = await app.inject({ method: 'GET', url: '/ready' });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toMatchObject({
      status: 'not_ready',
      checks: { redis: false },
    });
  });

  it('GET /ready returns 200 when Redis responds PONG', async () => {
    const fakeRedis = await startFakeRedisServer();
    process.env['REDIS_HOST'] = '127.0.0.1';
    process.env['REDIS_PORT'] = String(fakeRedis.port);

    try {
      await createApp();

      const response = await app.inject({ method: 'GET', url: '/ready' });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        status: 'ready',
        checks: { redis: true },
      });
    } finally {
      await fakeRedis.close();
    }
  });
});

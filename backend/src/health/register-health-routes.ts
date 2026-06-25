import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { checkRedisReady } from './redis-ready.check';

/**
 * Liveness vs readiness split (Phase 3.5 / Judgment Day P0):
 * - GET /health — process alive only (liveness)
 * - GET /ready  — process + Redis PING (readiness / traffic gate)
 */
export function registerHealthRoutes(app: NestFastifyApplication): void {
  const fastify = app.getHttpAdapter().getInstance();

  fastify.get('/health', () => ({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  }));

  fastify.get('/ready', async (_request, reply) => {
    const redisReady = await checkRedisReady();

    if (!redisReady) {
      return reply.status(503).send({
        status: 'not_ready',
        checks: { redis: false },
        timestamp: new Date().toISOString(),
      });
    }

    return {
      status: 'ready',
      checks: { redis: true },
      timestamp: new Date().toISOString(),
    };
  });
}

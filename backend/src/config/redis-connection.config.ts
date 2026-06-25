/** Shared Redis connection settings — same source for BullMQ and /ready checks. */
export const DEFAULT_REDIS_HOST = 'redis';
export const DEFAULT_REDIS_PORT = 6379;

export interface RedisConnectionConfig {
  host: string;
  port: number;
}

export function getRedisConnectionConfig(): RedisConnectionConfig {
  return {
    host: process.env['REDIS_HOST'] ?? DEFAULT_REDIS_HOST,
    port: Number(process.env['REDIS_PORT'] ?? DEFAULT_REDIS_PORT),
  };
}

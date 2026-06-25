import {
  DEFAULT_REDIS_HOST,
  DEFAULT_REDIS_PORT,
  getRedisConnectionConfig,
} from './redis-connection.config';

describe('getRedisConnectionConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env['REDIS_HOST'];
    delete process.env['REDIS_PORT'];
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('defaults to redis service name and 6379 when env is unset', () => {
    expect(getRedisConnectionConfig()).toEqual({
      host: DEFAULT_REDIS_HOST,
      port: DEFAULT_REDIS_PORT,
    });
  });

  it('reads REDIS_HOST and REDIS_PORT from environment', () => {
    process.env['REDIS_HOST'] = 'cache.internal';
    process.env['REDIS_PORT'] = '6380';

    expect(getRedisConnectionConfig()).toEqual({
      host: 'cache.internal',
      port: 6380,
    });
  });
});

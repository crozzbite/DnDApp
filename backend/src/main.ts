import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from '@fastify/helmet';
import compress from '@fastify/compress';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception';
import { TransformInterceptor } from './common/interceptors/transform';
import { registerHealthRoutes } from './health/register-health-routes';

const isProduction = process.env['NODE_ENV'] === 'production';
const logger = new Logger('Bootstrap');

/**
 * NERVOUS SYSTEM — Nexus Gateway Bootstrap
 * Hardened configuration for high-performance D&D search & ingestion.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: {
        level: isProduction ? 'warn' : 'debug',
      },
      bodyLimit: 1_048_576, // 1MB payload limit
    }),
  );

  // ─── Immune System: Defense Layers ───────────────────────────────────

  // 1. Graceful Shutdown Hooks (Vital for BullMQ/Redis)
  app.enableShutdownHooks();

  // 2. Security Headers (Helmet)
  await app.register(helmet, {
    contentSecurityPolicy: isProduction ? undefined : false,
  });

  // 3. Performance: Threshold Compression (>1KB only to save CPU & latency)
  await app.register(compress, {
    global: true,
    threshold: 1024,
  });

  // 4. Observability: /health (liveness) + /ready (Redis + HTTP readiness)
  registerHealthRoutes(app);

  // 5. CORS Hardening
  const frontendUrl = process.env['FRONTEND_URL'];
  if (!frontendUrl && isProduction) {
    logger.error('CRITICAL: FRONTEND_URL must be defined in production');
    process.exit(1);
  }

  app.enableCors({
    origin: frontendUrl ?? 'http://localhost:4200',
    credentials: true,
    methods: ['GET', 'POST'],
  });

  // ─── API Governance ──────────────────────────────────────────────────
  app.setGlobalPrefix('v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 6. Global Communication Protocols
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // ─── Documentation Guard ─────────────────────────────────────────────
  if (!isProduction) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('DnDApp Nexus Gateway')
      .setDescription('D&D Multiverse API — SkullRender Nexus Architecture')
      .setVersion('1.0')
      .addTag('compendium', 'Search and retrieve resources')
      .addTag('sessions', 'Shadow Sessions')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document);
  }

  // ─── Nexus Activation ────────────────────────────────────────────────
  const port = process.env['PORT'] ?? 3000;
  await app.listen(port, '0.0.0.0');

  logger.log(`🦇 Nexus Gateway Active: http://localhost:${port}/v1`);
  if (!isProduction) {
    logger.log(`📜 Documentation: http://localhost:${port}/docs`);
    logger.log(
      `🏥 Health: http://localhost:${port}/health | Ready: http://localhost:${port}/ready`,
    );
  }
}

// Execute bootstrap and catch early exit errors
bootstrap().catch((err) => {
  logger.error('Failed to wake the Nexus Gateway:', err);
  process.exit(1);
});

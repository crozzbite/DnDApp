import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { CompendiumController } from './api/compendium/compendium';
import { IngestionWorker } from './workers/ingestion/ingestion';
import { INGESTION_QUEUE } from './workers/ingestion/ingestion-job';

/**
 * Root Module — Nexus Gateway.
 * Registra los módulos del sistema de colas (BullMQ) y los controladores.
 */
@Module({
  imports: [
    // ─── BullMQ (Soul-Harvesting Broker) ──────────────────────────────────
    BullModule.forRoot({
      connection: {
        host: process.env['REDIS_HOST'] ?? 'localhost',
        port: Number(process.env['REDIS_PORT'] ?? 6379),
      },
    }),
    BullModule.registerQueue({
      name: INGESTION_QUEUE,
    }),
  ],
  controllers: [CompendiumController],
  providers: [IngestionWorker],
})
export class AppModule {}

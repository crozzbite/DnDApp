import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { CompendiumController } from './api/compendium/compendium';
import { getRedisConnectionConfig } from './config/redis-connection.config';
import { IngestionWorker } from './workers/ingestion/ingestion';
import { INGESTION_QUEUE } from './workers/ingestion/ingestion-job';

/**
 * Root Module — Nexus Gateway.
 * Registra los módulos del sistema de colas (BullMQ) y los controladores.
 */
@Module({
  imports: [
    // ─── BullMQ (Soul-Harvesting Broker) ──────────────────────────────────
    BullModule.forRootAsync({
      useFactory: () => {
        const connection = getRedisConnectionConfig();
        return { connection };
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

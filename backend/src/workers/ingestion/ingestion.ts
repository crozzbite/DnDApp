import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import {
  INGESTION_QUEUE,
  IngestionJobName,
  IngestResourceJob,
} from './ingestion-job';
import { NexusSanitizer } from '../../common/utils/nexus';

/**
 * NERVOUS SYSTEM — Ingestion Worker (Hardened)
 *
 * Configurado con concurrencia 5 para balancear throughput y CPU.
 * Implementa seguridad de Capa 2 (Sanitización) en el backend.
 */
@Processor(INGESTION_QUEUE, {
  concurrency: 5,
  lockDuration: 30000, // 30s para procesos pesados de embeddings
})
export class IngestionWorker extends WorkerHost {
  private readonly logger = new Logger(IngestionWorker.name);

  process(job: Job): Promise<void> {
    const jobName = job.name as IngestionJobName;

    this.logger.log({
      evt: 'JOB_STARTED',
      queue: INGESTION_QUEUE,
      jobId: job.id,
      jobName: jobName,
    });

    try {
      switch (jobName) {
        case IngestionJobName.INGEST_RESOURCE:
          this.handleIngestResource(job.data as IngestResourceJob);
          break;

        case IngestionJobName.BULK_INGEST:
          this.logger.warn({ evt: 'JOB_NOT_IMPLEMENTED', jobName });
          break;

        default:
          this.logger.error({ evt: 'UNKNOWN_JOB_SPIRIT', jobName });
      }

      return Promise.resolve();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error({
        evt: 'JOB_FAILED_INTERNAL',
        jobId: job.id,
        error: err.message,
        stack: err.stack,
      });
      return Promise.reject(err);
    }
  }

  private handleIngestResource(data: IngestResourceJob): void {
    const secureData = NexusSanitizer.sanitizeData(data.rawData);

    this.logger.log({
      evt: 'RESOURCE_SANITIZED',
      resourceId: data.resourceId,
      category: data.category,
      isClean: JSON.stringify(secureData) === JSON.stringify(data.rawData),
    });

    // TODO: Connect to Phase 4 Orchestrator using secureData
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    const runtime =
      job.finishedOn && job.processedOn ? job.finishedOn - job.processedOn : 0;

    this.logger.log({
      evt: 'SOUL_HARVEST_SUCCESS',
      jobId: job.id,
      runtime: `${runtime}ms`,
    });
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error({
      evt: 'SOUL_HARVEST_CRASH',
      jobId: job.id,
      error: error.message,
      attemptsMade: job.attemptsMade,
    });
  }
}

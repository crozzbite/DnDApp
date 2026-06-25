import { CompendiumCategory } from '../../common/enums/compendium';

/**
 * Nombre de la cola de ingesta
 */
export const INGESTION_QUEUE = 'ingestion';

/**
 * Nombres de los Jobs del Nexo
 */
export enum IngestionJobName {
  INGEST_RESOURCE = 'INGEST_RESOURCE',
  BULK_INGEST = 'BULK_INGEST',
}

/**
 * Contrato de Ingesta Individual
 */
export interface IngestResourceJob {
  resourceId: string;
  category: CompendiumCategory;
  rawData: unknown;
}

/**
 * Contrato de Ingesta Masiva
 */
export interface BulkIngestJob {
  source: string;
  count: number;
}

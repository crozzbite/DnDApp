import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsIn,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CompendiumCategory, CompendiumSource } from '../enums/compendium';

/**
 * NERVOUS SYSTEM — DTO for Compendium Search.
 * Strictly validated for the GET /v1/compendium/search endpoint.
 */
export class SearchCompendiumDto {
  @ApiProperty({
    description: 'Búsqueda de texto (semántica + keyword)',
    example: 'beholder',
  })
  @IsString()
  @IsNotEmpty({ message: 'La query de búsqueda no puede estar vacía' })
  query!: string;

  @ApiPropertyOptional({
    description: 'Filtrar por categoría del compendio',
    example: 'monster',
    enum: CompendiumCategory,
  })
  @IsOptional()
  @IsIn(Object.values(CompendiumCategory), {
    message: 'Categoría no válida en el Nexo',
  })
  category?: CompendiumCategory;

  @ApiPropertyOptional({
    description: 'Filtrar por fuente de datos',
    example: 'srd',
    enum: CompendiumSource,
  })
  @IsOptional()
  @IsIn(Object.values(CompendiumSource), {
    message: 'Fuente de datos desconocida',
  })
  source?: CompendiumSource;

  @ApiPropertyOptional({
    description: 'Número máximo de resultados (1-50)',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  topK: number = 10;
}

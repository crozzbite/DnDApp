import {
  Controller,
  Get,
  Query,
  Param,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { SearchCompendiumDto } from '../../common/dto/search-compendium.dto';
import { CompendiumCategory } from '../../common/enums/compendium';
import { NexusSanitizer } from '../../common/utils/nexus';

/**
 * NERVOUS SYSTEM — Nexus Gateway Controller.
 * Entry point for all Compendium operations.
 *
 * @spec nervous-system-gateway.spec.md § 5.1
 */
@ApiTags('compendium')
@Controller('compendium')
export class CompendiumController {
  private readonly logger = new Logger(CompendiumController.name);

  @Get('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Search the compendium (Semantic + Keyword)',
    description: 'Uses the Vector Oracle and structural Repository hydration.',
  })
  @ApiQuery({ name: 'query', description: 'Búsqueda de texto', required: true })
  @ApiQuery({
    name: 'category',
    enum: CompendiumCategory,
    required: false,
    description: 'Filtrar por categoría',
  })
  @ApiQuery({
    name: 'topK',
    type: Number,
    required: false,
    description: 'Cantidad de resultados (1-50)',
  })
  @ApiResponse({
    status: 200,
    description: 'Resource batch successfully retrieved.',
  })
  @ApiResponse({
    status: 400,
    description: 'Payload contains bad spirits (Invalid DTO).',
  })
  async search(@Query() dto: SearchCompendiumDto) {
    // Sanitización de entrada (Protección contra Prompt Injection)
    const sanitizedQuery = NexusSanitizer.sanitizeQuery(dto.query);

    this.logger.debug({
      evt: 'SEARCH_REQUESTED',
      query: sanitizedQuery,
      originalQuery: dto.query === sanitizedQuery ? undefined : dto.query,
      category: dto.category,
      topK: dto.topK,
    });

    // Future Bridge: return this.orchestrator.search({ ...dto, query: sanitizedQuery });
    return {
      meta: {
        query: sanitizedQuery,
        topK: dto.topK,
        category: dto.category ?? 'all',
      },
      items: [], // Populated in Phase 4
    };
  }

  @Get(':index')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get resource detail by slug/index' })
  @ApiParam({
    name: 'index',
    example: 'beholder',
    description: 'Slug del recurso (e.g., acid-arrow)',
  })
  @ApiResponse({
    status: 200,
    description: 'Resource hydrated from the Grave (DB).',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid index format.',
  })
  @ApiResponse({
    status: 404,
    description: 'Resource non-existent in this realm.',
  })
  async getDetail(@Param('index') index: string) {
    // Basic Slug validation (immune system)
    if (!/^[a-z0-9-]+$/.test(index)) {
      this.logger.warn({ evt: 'INVALID_INDEX_ATTEMPT', index });
      throw new BadRequestException('Invalid index format (slugs only)');
    }

    this.logger.debug({ evt: 'DETAIL_REQUESTED', index });

    return {
      index,
      data: null, // Populated in Phase 4
    };
  }
}

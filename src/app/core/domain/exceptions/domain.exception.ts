/**
 * Base para todas las excepciones del dominio SkullRender.
 */
export class DomainException extends Error {
  constructor(
    public override message: string,
    public code: string,
  ) {
    super(message);
    this.name = 'DomainException';
  }
}

/**
 * Lanzada cuando un recurso solicitado no existe en los registros.
 */
export class ResourceNotFoundException extends DomainException {
  constructor(index: string) {
    super(
      `El recurso '${index}' no existe en los registros del Nexo.`,
      'RESOURCE_NOT_FOUND',
    );
  }
}

/**
 * Lanzada cuando ocurre un error en la transformación de datos (Alquimia).
 */
export class AlchemyException extends DomainException {
  constructor(details: string) {
    super(`Fallo en la transmutación de datos: ${details}`, 'ALCHEMY_ERROR');
  }
}

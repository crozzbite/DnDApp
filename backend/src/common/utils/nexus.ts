/**
 * ALQUIMIA — Sanitización de datos para el Nexo.
 * Protege contra Prompt Injection y limpia datos sensibles.
 */
export class NexusSanitizer {
  private static readonly INJECTION_PATTERNS = [
    /ignore all previous instructions/gi,
    /system message/gi,
    /dan mode/gi,
    /you are now an? assistant/gi,
  ];

  /**
   * Limpia strings de posibles ataques de inyección de prompt.
   */
  static sanitizeQuery(input: string): string {
    let sanitized = input;
    for (const pattern of this.INJECTION_PATTERNS) {
      sanitized = sanitized.replace(pattern, '[REDACTED_ATTEMPT]');
    }
    return sanitized.trim();
  }

  /**
   * Sanitiza objetos de datos crudos.
   */
  static sanitizeData<T>(data: T): T {
    const json = JSON.stringify(data);
    let sanitized = json;

    // Filtro básico de PII (Emails/Phones)
    sanitized = sanitized.replace(
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      '[EMAIL_REDACTED]',
    );

    return JSON.parse(sanitized) as T;
  }
}

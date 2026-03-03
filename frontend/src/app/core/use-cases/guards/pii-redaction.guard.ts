/**
 * BRAIN — Guard de Seguridad Lógica.
 * Sanitiza queries antes de enviarlas a servicios externos (Vector Nexus, APIs).
 * Previene la filtración de PII y la inyección de prompts.
 *
 * @spec brain-logic.spec.md § 5.3 "Seguridad en los Casos de Uso"
 */
export class PiiRedactionGuard {
  /** Patrones de información sensible que no deben salir del perímetro. */
  private static readonly PII_PATTERNS: RegExp[] = [
    /\b\d{3}-\d{2}-\d{4}\b/g, // SSN (US)
    /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, // Tarjeta de crédito
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, // Email
    /\+?[\d\s\-().]{7,}/g, // Teléfonos
  ];

  /** Patrones de inyección de prompts. */
  private static readonly INJECTION_PATTERNS: RegExp[] = [
    /ignore\s+(previous|above|all)\s+instructions/gi,
    /you\s+are\s+now/gi,
    /act\s+as\s+a/gi,
    /system\s*:/gi,
    /<\|.*?\|>/g, // Tokens de control de LLMs
  ];

  /**
   * Aplica redacción PII y filtros anti-inyección a la query del usuario.
   * @returns Query saneada, lista para enviar al exterior.
   */
  static sanitize(query: string): string {
    let safe = query.trim();

    for (const pattern of this.PII_PATTERNS) {
      safe = safe.replace(pattern, '[REDACTED]');
    }

    for (const pattern of this.INJECTION_PATTERNS) {
      safe = safe.replace(pattern, '');
    }

    // Limitar longitud máxima de query (anti-spam / denial-of-service)
    return safe.slice(0, 512);
  }
}

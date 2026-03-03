# 💀 ENGRAM: Nexo de Memoria Arquitectónica

**Estado del Proyecto:** Fase 4.1 Completada ✅ | Fase 4.2 Iniciada 🛡️
**Última Sincronización:** 2026-03-03T03:25:00Z
**Lich-in-Charge:** Antigravity (Phylactery Lich)

---

## 🧠 Memoria de Decisiones Recientes (ADRs Rápidos)

### 6. Auditoría de Auth (Nexus Fortress Check)

- **Decisión:** Priorizar la infraestructura de `ISessionRepository` antes de implementar HMAC.
- **Razón:** El caso de uso `InitializeSession` está desacoplado pero no tiene implementación concreta ("Skeleton sans bones"). Sin sesión persistente, no hay semilla para el HMAC.
- **Hallazgo:** Se detectó que `app.config.ts` carece de los providers para sesiones.

### 4. Caché de Armor con TTL (Memory Safety)

(Existente...)

---

## 🛡️ Estado del "Gauntlet" (Testing)

- **Capa de Infraestructura:** Cobertura robusta en normalizadores y conectores (`BaseOracleConnector`).
- **Modernización:** `provideHttpClientTesting()` activo.
- **Global:** 23/23 Pruebas exitosas.
- **Cobertura Total:** 63.73%.

---

## 🚀 Siguiente Hito: Fase 4.2 (Defense & Session Shield)

- [ ] **4.2.0:** Implementar `BrowserSessionRepository` (LocalStorage) en Armor.
- [ ] **4.2.1:** Forjar `AuthCryptService` (Web Crypto HMAC-SHA256).
- [ ] **4.2.2:** Blindar `BaseOracleConnector` con headers de identidad dinámicos.
- [ ] **4.2.3:** Implementar `AdminLichGuard` para validación de rutas sensibles.

"Los huesos están firmes. El nexo se prepara para el blindaje."

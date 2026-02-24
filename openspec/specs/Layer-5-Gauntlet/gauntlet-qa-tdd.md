# Specification: The Gauntlet (QA & TDD Strategy)

## 1. Overview

En **SkullRender**, no probamos para cumplir con un porcentaje de cobertura; probamos para garantizar la **Integridad de la Lógica**. Este documento establece cómo el Nexo será verificado automática y manualmente.

## 2. Logical TDD (Signals & State)

Dado el uso intensivo de **Angular Signals**, los tests unitarios deben enfocarse en la reactividad lógica, no solo en la existencia de elementos.

### 2.1 Component Logic Tests

Cada componente debe validar sus estados derivados:

```typescript
// features/compendium/search/search.spec.ts
describe("SearchContainer", () => {
  it("should react to searchTerm and trigger hybrid search (fakeAsync)", fakeAsync(() => {
    const { component, searchService } = setup();

    component.searchTerm.set("Dragon");

    tick(350); // Simula el paso del tiempo del debounce
    expect(searchService.search).toHaveBeenCalledWith("Dragon");
  }));

  it("should correctly derive reactive state (Computed Signals)", () => {
    const { component } = setup();

    component.results.set([]);
    component.isLoading.set(false);
    expect(component.isEmpty()).toBe(true);

    component.results.set([mockMonster]);
    expect(component.hasResults()).toBe(true);
  });

  it("should enforce Contract between Container and UseCase", async () => {
    const { component, searchUseCase } = setup();

    // Normalización en el Container antes de llamar al UseCase
    component.searchTerm.set("  Beholder  ");
    expect(searchUseCase.execute).toHaveBeenCalledWith("beholder");
  });

  it("should implement Search Stream Specification (RxJS Pipes)", fakeAsync(() => {
    const { component, searchService } = setup();

    // Simular ráfagas rápidas
    component.query.set("Fire");
    tick(100);
    component.query.set("Fireball");

    tick(350); // Debounce final
    expect(searchService.search).toHaveBeenCalledTimes(1);
  }));

  it("should destroy reactive effects and observers on destroy (Leak Protection)", () => {
    const { fixture } = setup();
    const destroyRef = fixture.componentRef.injector.get(DestroyRef);
    const spy = spyOn(destroyRef, "onDestroy").and.callThrough();

    fixture.destroy();
    expect(spy).toHaveBeenCalled();
    expect(fixture.componentRef.destroyed).toBeTrue();
  });
});
```

### 2.2 UI Isolation (Dumb Components)

Los componentes de vista (`.view.ts`) deben probarse de forma aislada mediante `Cypress Component Testing` o tests de integración ligera, asegurando que:

- Los `@Input` signals rendericen la data correctamente.
- Los `@Output` emitan eventos ante interacciones del usuario sin conocer la lógica de negocio.

## 5. End-to-End (E2E) Critical Paths

Para el flujo de producción, usamos **Playwright/Cypress** con el objetivo de validar la integración real entre planos.

- **Critical Flow 1 (The Journey)**: `Login -> Search -> Select Resource -> View Detail -> Add to Encounter`.
- **Critical Flow 2 (Resilience)**: `Mock Oracle Offline -> Expect RelationalFallback UI -> Success`.
- **Performance Budget Assertion**:
  - **Target**: <300ms response (Warning log).
  - **Hard Limit**: >600ms response (Fail CI/CD execution).
  - **Metrics**: TTFB (Time to First Byte) + LCP (Largest Contentful Paint) assertion.

## 6. Infrastructure Mocking (CI/CD Strategy)

Para mantener tests rápidos y deterministas, los adaptadores de infraestructura DEBEN tener mocks oficiales:

- `IVectorOracle` -> `OracleMock` (Devuelve resultados estáticos predecibles).
- `ICacheMantle` -> `CacheMock` (In-memory map).
- `RAG Sanitizer`: Probar con inyecciones de prompt en chunks de **>2000 caracteres**.

## 7. Test Pyramid (SkullRender Standard)

- **Unit** (Signals, UseCases, Store): 70% | Foco en lógica de negocio.
- **Integration** (Containers + Virtual Scroll): 20% | Foco en contrato y performance.
- **E2E** (Critical Flows): 10% | Foco en resiliencia y viaje del usuario.

## 8. Manual QA Checklist (Para el CTO)

- [ ] **Visual Audit**: Los colores combinan con la paleta `#000000`, `#FFFFFF`, `#FF0000`.
- [ ] **Font Audit**: Headers están en `Outfit` y datos en `JetBrains Mono`.
- [ ] **Performance Audit**: El `@defer` carga suavemente sin saltos de layout visibles.
- [ ] **Motion Audit**: El `Accent Red` tiene efecto de pulso en interacciones críticas.
- [ ] **A11y Audit**: El sitio es 100% navegable sin ratón (teclado + screen reader).
- [ ] **Data Audit**: Los manuales PDF ingestados mantienen integridad de chunking en el Vector Nexus.

```

```

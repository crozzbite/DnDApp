import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { REDIS_PROBE_TIMEOUT_MS } from '../health/redis-ready.check';

describe('K8s api readiness contract', () => {
  const deploymentYaml = readFileSync(
    join(__dirname, '../../../deploy/k8s/base/api-deployment.yaml'),
    'utf8',
  );

  const ingressYaml = readFileSync(
    join(__dirname, '../../../deploy/k8s/base/ingress.yaml'),
    'utf8',
  );

  const overlayScript = readFileSync(
    join(__dirname, '../../../deploy/k8s/scripts/Build-Overlay.ps1'),
    'utf8',
  );

  const backendDockerfile = readFileSync(
    join(__dirname, '../../../deploy/docker/backend.Dockerfile'),
    'utf8',
  );

  const composeYaml = readFileSync(
    join(__dirname, '../../../deploy/compose/docker-compose.yml'),
    'utf8',
  );

  it('gates traffic with httpGet /ready (HTTP listener + app-level Redis check)', () => {
    expect(deploymentYaml).toMatch(/readinessProbe:/);
    expect(deploymentYaml).toMatch(/httpGet:/);
    expect(deploymentYaml).toMatch(/path: \/ready/);
    expect(deploymentYaml).toMatch(/timeoutSeconds: 5/);
  });

  it('uses /health for liveness only', () => {
    expect(deploymentYaml).toMatch(/livenessProbe:/);
    expect(deploymentYaml).toMatch(/path: \/health/);
  });

  it('does not use exec-only Redis probe that bypasses HTTP listener', () => {
    expect(deploymentYaml).not.toMatch(/require\('net'\)\.connect/);
  });

  it('probe timeout covers app REDIS_PROBE_TIMEOUT_MS', () => {
    const match = deploymentYaml.match(/timeoutSeconds:\s*(\d+)/);
    expect(match).not.toBeNull();
    const probeTimeoutSec = Number(match![1]);
    expect(probeTimeoutSec * 1000).toBeGreaterThanOrEqual(
      REDIS_PROBE_TIMEOUT_MS,
    );
  });

  it('exposes /ready on Ingress for external smoke tests', () => {
    expect(ingressYaml).toMatch(/path: \/ready/);
    expect(overlayScript).toMatch(/path: \/ready/);
  });

  it('Docker HEALTHCHECK targets /ready via node fetch (no wget on alpine)', () => {
    expect(backendDockerfile).toMatch(/HEALTHCHECK/);
    expect(backendDockerfile).toMatch(/\/ready/);
    expect(backendDockerfile).toMatch(
      /fetch\('http:\/\/127\.0\.0\.1:3000\/ready'\)/,
    );
    expect(backendDockerfile).not.toMatch(/wget/);
  });

  it('compose api healthcheck targets /ready', () => {
    expect(composeYaml).toMatch(/healthcheck:/);
    expect(composeYaml).toMatch(/\/ready/);
  });
});

describe('K8s web HTTP probe contract', () => {
  const webDeploymentYaml = readFileSync(
    join(__dirname, '../../../deploy/k8s/base/web-deployment.yaml'),
    'utf8',
  );

  const composeYaml = readFileSync(
    join(__dirname, '../../../deploy/compose/docker-compose.yml'),
    'utf8',
  );

  const serverTs = readFileSync(
    join(__dirname, '../../../frontend/src/server.ts'),
    'utf8',
  );

  it('gates web traffic with httpGet /health (Express, not Angular SSR)', () => {
    expect(webDeploymentYaml).toMatch(/readinessProbe:/);
    expect(webDeploymentYaml).toMatch(/livenessProbe:/);
    expect(webDeploymentYaml).toMatch(/httpGet:/);
    expect(webDeploymentYaml).toMatch(/path: \/health/);
    expect(webDeploymentYaml).not.toMatch(/tcpSocket:/);
  });

  it('frontend server exposes GET /health before SSR catch-all', () => {
    const healthIndex = serverTs.indexOf("app.get('/health'");
    const ssrIndex = serverTs.indexOf("app.use('/**'");
    expect(healthIndex).toBeGreaterThan(-1);
    expect(ssrIndex).toBeGreaterThan(healthIndex);
  });

  it('compose web healthcheck targets /health', () => {
    expect(composeYaml).toMatch(/4000\/health/);
  });
});

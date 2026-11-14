// B3 · Prueba E2E del guion de demo (3 minutos) con Playwright.
// Corre contra un build de producción en el puerto 3100 con DEMO_OFFLINE=1:
// respuestas fijas y sin WhatsApp real, para que el resultado no dependa de la red ni de credenciales.
// Para probar contra un servidor ya levantado: PLAYWRIGHT_BASE_URL=http://localhost:3000 npm run test:e2e
import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3100";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL,
    viewport: { width: 1440, height: 900 },
    locale: "es-MX",
    timezoneId: "America/Mexico_City",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } }],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "npm run build && npm run start -- -p 3100",
        url: baseURL,
        timeout: 180_000,
        reuseExistingServer: true,
        env: { DEMO_OFFLINE: "1" },
      },
});

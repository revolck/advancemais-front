import { defineConfig, devices } from '@playwright/test';

const e2ePort = Number(process.env.PLAYWRIGHT_PORT ?? process.env.PORT ?? 3001);
const e2eBaseUrl = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${e2ePort}`;
const e2eWebServerCommand =
  process.env.PLAYWRIGHT_WEB_SERVER_COMMAND ??
  `pnpm exec next dev --turbopack --port ${e2ePort}`;

/**
 * Configuração do Playwright para testes E2E
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  /* Executar testes em paralelo controlado para reduzir flakiness por concorrência */
  fullyParallel: false,
  /* Falhar o build no CI se você deixou test.only no código */
  forbidOnly: !!process.env.CI,
  /* Não executar testes em CI por padrão - descomente se necessário */
  retries: process.env.CI ? 2 : 0,
  /* Limite de workers para testes em paralelo */
  workers: process.env.CI ? 1 : 2,
  /* Configuração de reporter */
  reporter: 'html',
  /* Configurações compartilhadas para todos os projetos */
  use: {
    /* URL base para usar em navegações */
    baseURL: e2eBaseUrl,
    /* Coletar trace quando retentar o teste falhado */
    trace: 'on-first-retry',
    /* Screenshot apenas em falhas */
    screenshot: 'only-on-failure',
    /* Vídeo apenas em falhas */
    video: 'retain-on-failure',
    /* Timeout para ações */
    actionTimeout: 30000,
    navigationTimeout: 30000,
  },
  
  /* Timeout global para cada teste */
  timeout: 60000,

  /* Configurar projetos para diferentes navegadores */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* Executar servidor de desenvolvimento antes de iniciar os testes */
  webServer: {
    command: e2eWebServerCommand,
    url: e2eBaseUrl,
    reuseExistingServer: true,
    timeout: 180 * 1000,
  },
});

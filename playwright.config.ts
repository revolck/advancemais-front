import { defineConfig, devices } from '@playwright/test';

/**
 * Configuração do Playwright para testes E2E
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  /* Executar testes em arquivos em paralelo */
  fullyParallel: true,
  /* Falhar o build no CI se você deixou test.only no código */
  forbidOnly: !!process.env.CI,
  /* Não executar testes em CI por padrão - descomente se necessário */
  retries: process.env.CI ? 2 : 0,
  /* Limite de workers para testes em paralelo */
  workers: process.env.CI ? 1 : undefined,
  /* Configuração de reporter */
  reporter: 'html',
  /* Configurações compartilhadas para todos os projetos */
  use: {
    /* URL base para usar em navegações */
    baseURL: 'http://localhost:3001',
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
  /* Desabilitado porque o servidor já está rodando manualmente */
  // webServer: {
  //   command: 'pnpm dev',
  //   url: 'http://localhost:3001',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120 * 1000,
  // },
});

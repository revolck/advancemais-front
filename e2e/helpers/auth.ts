import { Page } from '@playwright/test';

/**
 * Credenciais do usuário admin para testes
 */
export const ADMIN_CREDENTIALS = {
  documento: '11111111111', // CPF
  senha: 'AdminTeste@123',
  email: 'admin.teste@advancemais.com.br',
};

/**
 * Realiza login no sistema com o usuário admin
 * @param page - Página do Playwright
 */
export async function loginAsAdmin(page: Page) {
  // Verificar se já está autenticado
  await page.goto('/dashboard/cursos/aulas');
  await page.waitForTimeout(1000);
  
  const currentUrl = page.url();
  if (!currentUrl.includes('/auth/login')) {
    // Já está autenticado
    return;
  }
  
  // Se não está autenticado, fazer login
  await page.goto('/auth/login');
  await page.waitForLoadState('networkidle');

  // Aguardar o formulário estar visível
  await page.waitForSelector('input[name="documento"], input[type="text"]', { timeout: 10000 });

  // Preencher CPF - pode estar em input[name="documento"] ou input[type="text"]
  const documentoInput = page.locator('input[name="documento"]').first();
  if (await documentoInput.count() === 0) {
    // Tentar encontrar pelo placeholder ou label
    const docInput = page.locator('input[type="text"]').first();
    await docInput.fill(ADMIN_CREDENTIALS.documento);
  } else {
    await documentoInput.fill(ADMIN_CREDENTIALS.documento);
  }

  // Preencher senha
  const senhaInput = page.locator('input[type="password"]').first();
  await senhaInput.fill(ADMIN_CREDENTIALS.senha);

  // Aguardar um pouco antes de clicar
  await page.waitForTimeout(500);

  // Clicar no botão de login e aguardar a resposta da API
  const loginButton = page.locator('button[type="submit"]').first();
  
  // Aguardar a requisição de login ser completada
  let response = null;
  try {
    [response] = await Promise.all([
      page.waitForResponse(resp => {
        const url = resp.url();
        return url.includes('/api/v1/usuarios/login') && resp.request().method() === 'POST';
      }, { timeout: 15000 }),
      loginButton.click(),
    ]);
    
      // Verificar se a resposta foi bem-sucedida
      if (response) {
        const status = response.status();
        const responseBody = await response.json().catch(() => ({}));
        
        if (status === 429) {
          // Rate limit - lançar erro com mensagem clara
          const retryAfter = responseBody.retryAfter || 60;
          throw new Error(`Rate limit atingido. Aguarde ${retryAfter} segundos antes de tentar novamente.`);
        }
        
        if (status >= 400) {
          throw new Error(`Login falhou com status ${status}: ${JSON.stringify(responseBody)}`);
        }
      
      // Verificar se a resposta indica sucesso
      if (responseBody && !responseBody.success) {
        throw new Error(`Login falhou: ${responseBody.message || 'Resposta não indica sucesso'}`);
      }
      
      // Verificar se tem token na resposta
      if (!responseBody.token) {
        throw new Error('Login falhou: Token não retornado na resposta');
      }
    }
  } catch (error: any) {
    // Se não conseguiu aguardar a resposta ou houve erro, verificar se há mensagem de erro na página
    if (error.message.includes('Login falhou') || error.message.includes('Token não retornado')) {
      throw error;
    }
    
    // Se timeout, verificar se há erro na página
    await page.waitForTimeout(2000);
    const errorSelectors = [
      '[role="alert"]',
      '.error',
      '[class*="error"]',
      'text=/erro|Erro|inválido|Inválido|incorreto|Incorreto|não encontrado/i',
    ];
    
    for (const selector of errorSelectors) {
      const errorElement = page.locator(selector).first();
      if (await errorElement.count() > 0) {
        const errorText = await errorElement.textContent();
        if (errorText && errorText.trim()) {
          throw new Error(`Login falhou: ${errorText}`);
        }
      }
    }
    
    console.warn('Não foi possível aguardar resposta da API, mas continuando...');
  }

  // Aguardar o redirecionamento (o código usa setTimeout de 1 segundo)
  // Aguardar até 5 segundos para o redirecionamento
  try {
    await page.waitForURL((url) => !url.href.includes("/auth/login"), {
      timeout: 5000,
    });
  } catch {
    // Se não redirecionou, aguardar mais um pouco
    await page.waitForTimeout(2000);
  }

  // Verificar a URL atual após redirecionamento
  let finalUrl = page.url();
  
  // Se ainda está na página de login, verificar se há erro
  if (finalUrl.includes('/auth/login')) {
    // Aguardar um pouco mais para ver se aparece algum erro
    await page.waitForTimeout(2000);
    
    // Verificar se há mensagem de erro ou toast
    const errorSelectors = [
      '[role="alert"]',
      '.error',
      '[class*="error"]',
      'text=/erro|Erro|inválido|Inválido|incorreto|Incorreto|não encontrado/i',
    ];
    
    for (const selector of errorSelectors) {
      const errorElement = page.locator(selector).first();
      if (await errorElement.count() > 0) {
        const errorText = await errorElement.textContent();
        if (errorText && errorText.trim()) {
          throw new Error(`Login falhou: ${errorText}`);
        }
      }
    }
    
    // Se não há erro visível, pode ser que o redirecionamento esteja demorando
    // Tentar navegar manualmente para o dashboard
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    finalUrl = page.url();
  } else {
    // Já foi redirecionado, aguardar carregamento completo
    await page.waitForLoadState('networkidle');
  }

  // Se ainda está em /auth/login após todas as tentativas, verificar cookies
  if (finalUrl.includes('/auth/login')) {
    const cookies = await page.context().cookies();
    const hasToken = cookies.some(c => c.name === 'token' || c.name === 'refresh_token');
    
    if (!hasToken) {
      // Tentar uma última vez navegando diretamente
      await page.goto('/dashboard/cursos/aulas');
      await page.waitForTimeout(2000);
      
      // Se ainda redirecionou para login, então realmente falhou
      if (page.url().includes('/auth/login')) {
        throw new Error('Login falhou: Não foi possível autenticar. Verifique as credenciais e se o usuário existe no banco de dados.');
      }
    }
  }

  // Aguardar um pouco mais para garantir que tudo carregou
  await page.waitForTimeout(1000);
}

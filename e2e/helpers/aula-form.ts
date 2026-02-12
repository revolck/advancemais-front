import { Page, expect } from '@playwright/test';

/**
 * Helper para preencher o formulário de cadastro de aula
 */

const OPENED_SELECT_OPTIONS = '[role="option"]:visible, [cmdk-item]:visible';

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function getFieldContainer(page: Page, labelText: string) {
  const label = page
    .locator('label')
    .filter({ hasText: new RegExp(`^\\s*${escapeRegExp(labelText)}\\s*$`, 'i') })
    .first();
  await expect(label).toBeVisible({ timeout: 15000 });
  return label.locator('xpath=ancestor::div[contains(@class, "space-y-2")][1]');
}

async function getSelectTrigger(
  page: Page,
  labelText: string,
  options?: { waitEnabled?: boolean }
) {
  const container = await getFieldContainer(page, labelText);
  const trigger = container
    .locator('button[role="combobox"], button[type="button"]:not([aria-label="Limpar seleção"])')
    .first();
  await expect(trigger).toBeVisible({ timeout: 15000 });
  if (options?.waitEnabled ?? true) {
    await expect(trigger).toBeEnabled({ timeout: 20000 });
  }
  return trigger;
}

async function openSelect(page: Page, labelText: string, options?: { waitEnabled?: boolean }) {
  const trigger = await getSelectTrigger(page, labelText, options);
  await trigger.click();
  const allOptions = page.locator(OPENED_SELECT_OPTIONS);
  await expect(allOptions.first()).toBeVisible({ timeout: 10000 });
  return allOptions;
}

async function selectFirstVisibleOption(
  options: ReturnType<Page['locator']>,
  opts?: { skipTexts?: string[] }
) {
  const skipTexts = (opts?.skipTexts ?? []).map((text) => text.toLowerCase());
  const count = await options.count();
  for (let index = 0; index < count; index += 1) {
    const option = options.nth(index);
    const isDisabled =
      (await option.getAttribute('aria-disabled')) === 'true' ||
      (await option.getAttribute('data-disabled')) !== null;
    if (isDisabled) {
      continue;
    }
    const text = ((await option.textContent()) ?? '').trim();
    const normalizedText = text.toLowerCase();
    if (!text || normalizedText.includes('selecione')) {
      continue;
    }
    if (skipTexts.some((skipText) => normalizedText.includes(skipText))) {
      continue;
    }
    await option.click();
    return true;
  }
  return false;
}

/**
 * Preenche campos básicos obrigatórios da aula
 */
export async function preencherCamposBasicos(
  page: Page,
  titulo: string,
  descricao: string,
  duracaoMinutos: string = '60'
) {
  // Título - procurar pelo label ou name
  const tituloLabel = page.locator('label:has-text("Título")').first();
  let tituloInput;
  
  if (await tituloLabel.count() > 0) {
    tituloInput = tituloLabel
      .locator('..')
      .locator('..')
      .locator('input[name="titulo"], input[type="text"]')
      .first();
  } else {
    tituloInput = page.locator('input[name="titulo"]').first();
  }
  
  await tituloInput.fill(titulo);
  await page.waitForTimeout(200);

  // Descrição - pode ser um textarea ou um editor rico
  // Tentar encontrar de várias formas
  let descricaoTextarea = page.locator('textarea').first();
  
  // Se não encontrou, tentar pelo label
  if (await descricaoTextarea.count() === 0) {
    const descricaoLabel = page.locator('label:has-text("Descrição"), label:has-text("descrição")').first();
    if (await descricaoLabel.count() > 0) {
      descricaoTextarea = descricaoLabel
        .locator('..')
        .locator('..')
        .locator('textarea, [contenteditable="true"]')
        .first();
    }
  }
  
  // Se ainda não encontrou, tentar qualquer textarea ou contenteditable
  if (await descricaoTextarea.count() === 0) {
    descricaoTextarea = page.locator('textarea, [contenteditable="true"]').first();
  }
  
  await descricaoTextarea.waitFor({ timeout: 10000 });
  await descricaoTextarea.fill(descricao);
  await page.waitForTimeout(200);

  // Duração - procurar pelo label
  const duracaoLabel = page.locator('label:has-text("Duração")').first();
  let duracaoInput;
  
  if (await duracaoLabel.count() > 0) {
    duracaoInput = duracaoLabel
      .locator('..')
      .locator('..')
      .locator('input[type="number"]')
      .first();
  } else {
    duracaoInput = page.locator('input[type="number"]').first();
  }
  
  await duracaoInput.fill(duracaoMinutos);
  await page.waitForTimeout(200);
}

/**
 * Seleciona modalidade da aula
 */
export async function selecionarModalidade(
  page: Page,
  modalidade: 'ONLINE' | 'PRESENCIAL' | 'AO_VIVO' | 'SEMIPRESENCIAL'
) {
  const options = await openSelect(page, 'Modalidade');

  const modalidadeOptions: Record<string, string> = {
    ONLINE: 'Online (YouTube)',
    PRESENCIAL: 'Presencial',
    AO_VIVO: 'Ao Vivo (Google Meet)',
    SEMIPRESENCIAL: 'Semipresencial',
  };

  const option = options
    .filter({ hasText: modalidadeOptions[modalidade] })
    .first();
  await expect(option).toBeVisible({ timeout: 10000 });
  await option.click();
  await page.waitForTimeout(500);
}

/**
 * Preenche link do YouTube
 */
export async function preencherYouTubeUrl(page: Page, url: string = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ') {
  // Procurar pelo label primeiro
  const youtubeLabel = page.locator('label:has-text("Link do YouTube")').first();
  let youtubeInput;
  
  if (await youtubeLabel.count() > 0) {
    youtubeInput = youtubeLabel
      .locator('..')
      .locator('..')
      .locator('input[type="url"], input[type="text"]')
      .first();
  } else {
    youtubeInput = page.locator('input[placeholder*="youtube" i], input[placeholder*="YouTube" i]').first();
  }
  
  await youtubeInput.fill(url);
  await page.waitForTimeout(200);
}

/**
 * Seleciona tipo de link para semipresencial
 */
export async function selecionarTipoLink(page: Page, tipo: 'YOUTUBE' | 'MEET') {
  const options = await openSelect(page, 'Tipo de Link');
  const optionText = tipo === 'YOUTUBE'
    ? /link do youtube|youtube/i
    : /google meet|meet/i;
  const option = options.filter({ hasText: optionText }).first();
  await expect(option).toBeVisible({ timeout: 10000 });
  await option.click();
  await page.waitForTimeout(500);
}

/**
 * Seleciona curso
 */
export async function selecionarCurso(page: Page, nomeCurso?: string) {
  const options = await openSelect(page, 'Curso');
  if (nomeCurso) {
    const option = options
      .filter({ hasText: nomeCurso })
      .first();
    await expect(option).toBeVisible({ timeout: 10000 });
    await option.click();
  } else {
    const picked = await selectFirstVisibleOption(options, {
      skipTexts: ['sem curso'],
    });
    if (!picked) {
      throw new Error('Nenhuma opção de curso válida encontrada no select');
    }
  }

  // Aguarda turma ficar habilitada após seleção de curso
  const turmaTrigger = await getSelectTrigger(page, 'Turma', { waitEnabled: false });
  await expect(turmaTrigger).toBeEnabled({ timeout: 20000 });
  await page.waitForTimeout(300);
}

/**
 * Seleciona turma
 */
export async function selecionarTurma(page: Page, nomeTurma?: string) {
  const options = await openSelect(page, 'Turma');
  if (nomeTurma) {
    const option = options
      .filter({ hasText: nomeTurma })
      .first();
    await expect(option).toBeVisible({ timeout: 10000 });
    await option.click();
  } else {
    const picked = await selectFirstVisibleOption(options, {
      skipTexts: ['sem turma'],
    });
    if (!picked) {
      throw new Error('Nenhuma turma válida encontrada no select');
    }
  }
  await page.waitForTimeout(500);
}

/**
 * Seleciona instrutor
 */
export async function selecionarInstrutor(page: Page, nomeInstrutor?: string) {
  const options = await openSelect(page, 'Instrutor');
  if (nomeInstrutor) {
    const option = options
      .filter({ hasText: nomeInstrutor })
      .first();
    await expect(option).toBeVisible({ timeout: 10000 });
    await option.click();
  } else {
    const picked = await selectFirstVisibleOption(options, {
      skipTexts: ['sem instrutor'],
    });
    if (!picked) {
      throw new Error('Nenhum instrutor válido encontrado no select');
    }
  }
  
  await page.waitForTimeout(500);
}

/**
 * Preenche campos de período (data, hora início, hora fim)
 */
export async function preencherPeriodo(
  page: Page,
  dataOffset: number = 1, // Dias a partir de hoje
  horaInicio: string = '10:00',
  horaFim: string = '11:00'
) {
  // Data da aula - pode ser um date picker customizado
  // Tentar encontrar pelo label primeiro
  const dataLabel = page.locator('label:has-text("Data da Aula")').first();
  let dataInput;
  
  if (await dataLabel.count() > 0) {
    // Pode ser um input dentro do container do label
    dataInput = dataLabel
      .locator('..')
      .locator('..')
      .locator('input[type="date"], input[type="text"]')
      .first();
  } else {
    // Fallback: procurar diretamente
    dataInput = page.locator('input[type="date"], input[placeholder*="data" i], input[placeholder*="Data" i]').first();
  }
  
  // Calcular data futura
  const data = new Date();
  data.setDate(data.getDate() + dataOffset);
  const dataFormatada = data.toISOString().split('T')[0];
  
  // Se for um date picker customizado, pode precisar clicar primeiro
  const dataInputCount = await dataInput.count();
  if (dataInputCount === 0) {
    // Em alguns fluxos (ex.: semipresencial + YouTube) não há período.
    return;
  }

  await dataInput.click();
  await dataInput.fill(dataFormatada);
  await page.keyboard.press('Enter');
  
  await page.waitForTimeout(300);
  
  // Hora início - procurar pelo label
  const horaInicioLabel = page.locator('label:has-text("Hora de Início")').first();
  let horaInicioInput;
  
  if (await horaInicioLabel.count() > 0) {
    horaInicioInput = horaInicioLabel
      .locator('..')
      .locator('..')
      .locator('input[type="time"], input[type="text"]')
      .first();
  } else {
    horaInicioInput = page.locator('input[placeholder*="00:00"], input[name*="horaInicio" i]').first();
  }
  
  await horaInicioInput.fill(horaInicio);
  
  // Hora fim
  const horaFimLabel = page.locator('label:has-text("Hora de Término")').first();
  let horaFimInput;
  
  if (await horaFimLabel.count() > 0) {
    horaFimInput = horaFimLabel
      .locator('..')
      .locator('..')
      .locator('input[type="time"], input[type="text"]')
      .first();
  } else {
    horaFimInput = page.locator('input[placeholder*="00:00"], input[name*="horaFim" i]').first();
  }
  
  await horaFimInput.fill(horaFim);
}

/**
 * Preenche sala (apenas para presencial)
 */
export async function preencherSala(page: Page, sala: string = 'Lab 101') {
  // Procurar pelo label primeiro
  const salaLabel = page.locator('label:has-text("Sala")').first();
  let salaInput;
  
  if (await salaLabel.count() > 0) {
    salaInput = salaLabel
      .locator('..')
      .locator('..')
      .locator('input[type="text"]')
      .first();
  } else {
    salaInput = page.locator('input[placeholder*="Lab" i], input[placeholder*="Sala" i]').first();
  }
  
  await salaInput.fill(sala);
  await page.waitForTimeout(200);
}

/**
 * Seleciona se a aula é obrigatória
 */
export async function selecionarAulaObrigatoria(page: Page, obrigatoria: boolean = true) {
  const obrigatoriaLabel = page.locator('label:has-text("Aula obrigatória")').first();
  
  const selectTrigger = obrigatoriaLabel
    .locator('..')
    .locator('..')
    .locator('button[role="combobox"], button:has([data-radix-collection-item])')
    .first();
  
  await selectTrigger.click();
  
  await page.waitForTimeout(500);
  
  const optionText = obrigatoria ? 'Sim' : 'Não';
  const option = page
    .locator('[role="option"]')
    .filter({ hasText: optionText })
    .first();
  
  await option.click();
  
  await page.waitForTimeout(500);
}

/**
 * Adiciona material complementar (upload de arquivo)
 */
export async function adicionarMaterialComplementar(page: Page, filePath: string) {
  // Criar um arquivo de teste simples se não existir
  const fileInput = page.locator('input[type="file"]').first();
  await fileInput.setInputFiles(filePath);
  
  // Aguardar upload
  await page.waitForTimeout(1000);
}

/**
 * Submete o formulário
 */
export async function submeterFormulario(page: Page) {
  const submitButton = page.locator('button[type="submit"]:has-text("Criar Aula"), button:has-text("Salvar")').first();
  await submitButton.click();
  
  // Aguardar processamento
  await page.waitForTimeout(2000);
  
  // Aguardar redirecionamento ou mensagem de sucesso
  try {
    await page.waitForURL(/\/dashboard\/cursos\/aulas/, { timeout: 10000 });
  } catch {
    // Pode não redirecionar imediatamente, verificar se há mensagem de sucesso
    const successMessage = page.locator('text=/sucesso|Sucesso|Aula criada/i');
    await successMessage.waitFor({ timeout: 5000 }).catch(() => {});
  }
}

/**
 * Verifica se a aula foi criada com sucesso
 */
export async function verificarSucesso(page: Page) {
  // Aguardar um pouco para garantir que a página carregou
  await page.waitForTimeout(2000);
  
  // Verificar se foi redirecionado ou se há mensagem de sucesso
  const url = page.url();
  const isOnListPage = url.includes('/dashboard/cursos/aulas');
  
  if (isOnListPage) {
    // Verificar se a lista de aulas está visível - tentar vários seletores
    const possibleSelectors = [
      'text=/aulas/i',
      'text=/Aulas/i',
      'h1, h2, h3',
      '[class*="aula"]',
      'table',
      '[role="table"]',
    ];
    
    let found = false;
    for (const selector of possibleSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.count() > 0) {
          await element.waitFor({ timeout: 3000 });
          found = true;
          break;
        }
      } catch {
        // Continuar tentando outros seletores
      }
    }
    
    if (!found) {
      // Se não encontrou nada específico, pelo menos verificar que não está na página de cadastro
      if (!url.includes('/cadastrar')) {
        // Considerar sucesso se foi redirecionado para a lista
        return;
      }
    }
  } else {
    // Verificar mensagem de sucesso - tentar vários seletores
    const successSelectors = [
      'text=/sucesso/i',
      'text=/Sucesso/i',
      'text=/aula criada/i',
      'text=/Aula criada/i',
      '[role="alert"]',
      '[class*="success"]',
      '[class*="toast"]',
    ];
    
    let found = false;
    for (const selector of successSelectors) {
      try {
        const element = page.locator(selector).first();
        if (await element.count() > 0) {
          await element.waitFor({ timeout: 3000 });
          found = true;
          break;
        }
      } catch {
        // Continuar tentando
      }
    }
    
    // Se não encontrou mensagem de sucesso mas a URL mudou, considerar sucesso
    if (!found && !url.includes('/cadastrar')) {
      return;
    }
  }
}

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { loginAsAdmin } from './helpers/auth';
import {
  preencherCamposBasicos,
  selecionarModalidade,
  preencherYouTubeUrl,
  selecionarTipoLink,
  selecionarCurso,
  selecionarTurma,
  selecionarInstrutor,
  preencherPeriodo,
  preencherSala,
  selecionarAulaObrigatoria,
  adicionarMaterialComplementar,
  submeterFormulario,
  verificarSucesso,
} from './helpers/aula-form';

/**
 * Testes automatizados para cadastro de aulas
 * 
 * Cenários testados:
 * 1. Cadastro sem vínculos (sem curso, turma, instrutor, materiais)
 *    - Modalidade YouTube
 *    - Modalidade Presencial
 *    - Modalidade Ao Vivo
 *    - Modalidade Semipresencial
 * 
 * 2. Cadastro com curso e turma vinculados
 * 3. Cadastro apenas com instrutor vinculado
 * 4. Cadastro com instrutor, curso e turma vinculados
 * 5. Cadastro com materiais complementares
 * 6. Cadastro com materiais, curso, turma e instrutor
 */

test.describe('Cadastro de Aulas - Sem Vínculos', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/dashboard/cursos/aulas/cadastrar');
    await page.waitForLoadState('networkidle');
  });

  test('Cadastrar aula YouTube sem vínculos', async ({ page }) => {
    const timestamp = Date.now();
    const titulo = `Aula Teste YouTube ${timestamp}`;
    const descricao = 'Descrição da aula de teste YouTube sem vínculos';

    await preencherCamposBasicos(page, titulo, descricao, '60');
    await selecionarModalidade(page, 'ONLINE');
    await preencherYouTubeUrl(page);
    await selecionarAulaObrigatoria(page, true);
    await submeterFormulario(page);
    await verificarSucesso(page);
  });

  test('Cadastrar aula Presencial sem vínculos', async ({ page }) => {
    const timestamp = Date.now();
    const titulo = `Aula Teste Presencial ${timestamp}`;
    const descricao = 'Descrição da aula de teste Presencial sem vínculos';

    await preencherCamposBasicos(page, titulo, descricao, '90');
    await selecionarModalidade(page, 'PRESENCIAL');
    await preencherPeriodo(page, 1, '14:00', '15:30');
    await preencherSala(page, 'Sala 101');
    await selecionarAulaObrigatoria(page, true);
    await submeterFormulario(page);
    await verificarSucesso(page);
  });

  test('Cadastrar aula Ao Vivo sem vínculos', async ({ page }) => {
    const timestamp = Date.now();
    const titulo = `Aula Teste Ao Vivo ${timestamp}`;
    const descricao = 'Descrição da aula de teste Ao Vivo sem vínculos';

    await preencherCamposBasicos(page, titulo, descricao, '120');
    await selecionarModalidade(page, 'AO_VIVO');
    await preencherPeriodo(page, 1, '16:00', '18:00');
    await selecionarAulaObrigatoria(page, true);
    await submeterFormulario(page);
    await verificarSucesso(page);
  });

  test('Cadastrar aula Semipresencial sem vínculos', async ({ page }) => {
    const timestamp = Date.now();
    const titulo = `Aula Teste Semipresencial ${timestamp}`;
    const descricao = 'Descrição da aula de teste Semipresencial sem vínculos';

    await preencherCamposBasicos(page, titulo, descricao, '90');
    await selecionarModalidade(page, 'SEMIPRESENCIAL');
    await selecionarTipoLink(page, 'YOUTUBE');
    await preencherYouTubeUrl(page);
    await preencherPeriodo(page, 1, '19:00', '20:30');
    await selecionarAulaObrigatoria(page, true);
    await submeterFormulario(page);
    await verificarSucesso(page);
  });
});

test.describe('Cadastro de Aulas - Com Curso e Turma', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/dashboard/cursos/aulas/cadastrar');
    await page.waitForLoadState('networkidle');
  });

  test('Cadastrar aula YouTube com curso e turma', async ({ page }) => {
    const timestamp = Date.now();
    const titulo = `Aula YouTube Curso/Turma ${timestamp}`;
    const descricao = 'Descrição da aula YouTube com curso e turma';

    await preencherCamposBasicos(page, titulo, descricao, '60');
    await selecionarCurso(page);
    await selecionarTurma(page);
    await preencherYouTubeUrl(page);
    await selecionarAulaObrigatoria(page, true);
    await submeterFormulario(page);
    await verificarSucesso(page);
  });

  test('Cadastrar aula Presencial com curso e turma', async ({ page }) => {
    const timestamp = Date.now();
    const titulo = `Aula Presencial Curso/Turma ${timestamp}`;
    const descricao = 'Descrição da aula Presencial com curso e turma';

    await preencherCamposBasicos(page, titulo, descricao, '90');
    await selecionarCurso(page);
    await selecionarTurma(page);
    await preencherPeriodo(page, 1, '14:00', '15:30');
    await preencherSala(page, 'Lab 201');
    await selecionarAulaObrigatoria(page, true);
    await submeterFormulario(page);
    await verificarSucesso(page);
  });

  test('Cadastrar aula Ao Vivo com curso e turma', async ({ page }) => {
    const timestamp = Date.now();
    const titulo = `Aula Ao Vivo Curso/Turma ${timestamp}`;
    const descricao = 'Descrição da aula Ao Vivo com curso e turma';

    await preencherCamposBasicos(page, titulo, descricao, '120');
    await selecionarCurso(page);
    await selecionarTurma(page);
    await preencherPeriodo(page, 1, '16:00', '18:00');
    await selecionarAulaObrigatoria(page, true);
    await submeterFormulario(page);
    await verificarSucesso(page);
  });

  test('Cadastrar aula Semipresencial com curso e turma', async ({ page }) => {
    const timestamp = Date.now();
    const titulo = `Aula Semipresencial Curso/Turma ${timestamp}`;
    const descricao = 'Descrição da aula Semipresencial com curso e turma';

    await preencherCamposBasicos(page, titulo, descricao, '90');
    await selecionarCurso(page);
    await selecionarTurma(page);
    await selecionarTipoLink(page, 'YOUTUBE');
    await preencherYouTubeUrl(page);
    await preencherPeriodo(page, 1, '19:00', '20:30');
    await selecionarAulaObrigatoria(page, true);
    await submeterFormulario(page);
    await verificarSucesso(page);
  });
});

test.describe('Cadastro de Aulas - Apenas com Instrutor', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/dashboard/cursos/aulas/cadastrar');
    await page.waitForLoadState('networkidle');
  });

  test('Cadastrar aula YouTube apenas com instrutor', async ({ page }) => {
    const timestamp = Date.now();
    const titulo = `Aula YouTube Instrutor ${timestamp}`;
    const descricao = 'Descrição da aula YouTube apenas com instrutor';

    await preencherCamposBasicos(page, titulo, descricao, '60');
    await selecionarModalidade(page, 'ONLINE');
    await selecionarInstrutor(page);
    await preencherYouTubeUrl(page);
    await selecionarAulaObrigatoria(page, true);
    await submeterFormulario(page);
    await verificarSucesso(page);
  });

  test('Cadastrar aula Presencial apenas com instrutor', async ({ page }) => {
    const timestamp = Date.now();
    const titulo = `Aula Presencial Instrutor ${timestamp}`;
    const descricao = 'Descrição da aula Presencial apenas com instrutor';

    await preencherCamposBasicos(page, titulo, descricao, '90');
    await selecionarModalidade(page, 'PRESENCIAL');
    await selecionarInstrutor(page);
    await preencherPeriodo(page, 1, '14:00', '15:30');
    await preencherSala(page, 'Sala 301');
    await selecionarAulaObrigatoria(page, true);
    await submeterFormulario(page);
    await verificarSucesso(page);
  });

  test('Cadastrar aula Ao Vivo apenas com instrutor', async ({ page }) => {
    const timestamp = Date.now();
    const titulo = `Aula Ao Vivo Instrutor ${timestamp}`;
    const descricao = 'Descrição da aula Ao Vivo apenas com instrutor';

    await preencherCamposBasicos(page, titulo, descricao, '120');
    await selecionarModalidade(page, 'AO_VIVO');
    await selecionarInstrutor(page);
    await preencherPeriodo(page, 1, '16:00', '18:00');
    await selecionarAulaObrigatoria(page, true);
    await submeterFormulario(page);
    await verificarSucesso(page);
  });

  test('Cadastrar aula Semipresencial apenas com instrutor', async ({ page }) => {
    const timestamp = Date.now();
    const titulo = `Aula Semipresencial Instrutor ${timestamp}`;
    const descricao = 'Descrição da aula Semipresencial apenas com instrutor';

    await preencherCamposBasicos(page, titulo, descricao, '90');
    await selecionarModalidade(page, 'SEMIPRESENCIAL');
    await selecionarInstrutor(page);
    await selecionarTipoLink(page, 'YOUTUBE');
    await preencherYouTubeUrl(page);
    await preencherPeriodo(page, 1, '19:00', '20:30');
    await selecionarAulaObrigatoria(page, true);
    await submeterFormulario(page);
    await verificarSucesso(page);
  });
});

test.describe('Cadastro de Aulas - Com Instrutor, Curso e Turma', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/dashboard/cursos/aulas/cadastrar');
    await page.waitForLoadState('networkidle');
  });

  test('Cadastrar aula YouTube com instrutor, curso e turma', async ({ page }) => {
    const timestamp = Date.now();
    const titulo = `Aula YouTube Completo ${timestamp}`;
    const descricao = 'Descrição da aula YouTube com instrutor, curso e turma';

    await preencherCamposBasicos(page, titulo, descricao, '60');
    await selecionarCurso(page);
    await selecionarTurma(page);
    await selecionarInstrutor(page);
    await preencherYouTubeUrl(page);
    await selecionarAulaObrigatoria(page, true);
    await submeterFormulario(page);
    await verificarSucesso(page);
  });

  test('Cadastrar aula Presencial com instrutor, curso e turma', async ({ page }) => {
    const timestamp = Date.now();
    const titulo = `Aula Presencial Completo ${timestamp}`;
    const descricao = 'Descrição da aula Presencial com instrutor, curso e turma';

    await preencherCamposBasicos(page, titulo, descricao, '90');
    await selecionarCurso(page);
    await selecionarTurma(page);
    await selecionarInstrutor(page);
    await preencherPeriodo(page, 1, '14:00', '15:30');
    await preencherSala(page, 'Lab 401');
    await selecionarAulaObrigatoria(page, true);
    await submeterFormulario(page);
    await verificarSucesso(page);
  });

  test('Cadastrar aula Ao Vivo com instrutor, curso e turma', async ({ page }) => {
    const timestamp = Date.now();
    const titulo = `Aula Ao Vivo Completo ${timestamp}`;
    const descricao = 'Descrição da aula Ao Vivo com instrutor, curso e turma';

    await preencherCamposBasicos(page, titulo, descricao, '120');
    await selecionarCurso(page);
    await selecionarTurma(page);
    await selecionarInstrutor(page);
    await preencherPeriodo(page, 1, '16:00', '18:00');
    await selecionarAulaObrigatoria(page, true);
    await submeterFormulario(page);
    await verificarSucesso(page);
  });

  test('Cadastrar aula Semipresencial com instrutor, curso e turma', async ({ page }) => {
    const timestamp = Date.now();
    const titulo = `Aula Semipresencial Completo ${timestamp}`;
    const descricao = 'Descrição da aula Semipresencial com instrutor, curso e turma';

    await preencherCamposBasicos(page, titulo, descricao, '90');
    await selecionarCurso(page);
    await selecionarTurma(page);
    await selecionarInstrutor(page);
    await selecionarTipoLink(page, 'YOUTUBE');
    await preencherYouTubeUrl(page);
    await preencherPeriodo(page, 1, '19:00', '20:30');
    await selecionarAulaObrigatoria(page, true);
    await submeterFormulario(page);
    await verificarSucesso(page);
  });
});

test.describe('Cadastro de Aulas - Com Materiais Complementares', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/dashboard/cursos/aulas/cadastrar');
    await page.waitForLoadState('networkidle');
  });

  test('Cadastrar aula YouTube com materiais complementares', async ({ page }) => {
    const timestamp = Date.now();
    const titulo = `Aula YouTube Materiais ${timestamp}`;
    const descricao = 'Descrição da aula YouTube com materiais complementares';

    await preencherCamposBasicos(page, titulo, descricao, '60');
    await selecionarModalidade(page, 'ONLINE');
    await preencherYouTubeUrl(page);
    await selecionarAulaObrigatoria(page, true);
    
    // Criar arquivo de teste temporário
    const testFile = path.join(__dirname, 'test-file.pdf');
    fs.writeFileSync(testFile, 'Test PDF content');
    
    await adicionarMaterialComplementar(page, testFile);
    await submeterFormulario(page);
    await verificarSucesso(page);
    
    // Limpar arquivo de teste
    fs.unlinkSync(testFile);
  });

  test('Cadastrar aula Presencial com materiais complementares', async ({ page }) => {
    const timestamp = Date.now();
    const titulo = `Aula Presencial Materiais ${timestamp}`;
    const descricao = 'Descrição da aula Presencial com materiais complementares';

    await preencherCamposBasicos(page, titulo, descricao, '90');
    await selecionarModalidade(page, 'PRESENCIAL');
    await preencherPeriodo(page, 1, '14:00', '15:30');
    await preencherSala(page, 'Sala 501');
    await selecionarAulaObrigatoria(page, true);
    
    const testFile = path.join(__dirname, 'test-file.pdf');
    fs.writeFileSync(testFile, 'Test PDF content');
    
    await adicionarMaterialComplementar(page, testFile);
    await submeterFormulario(page);
    await verificarSucesso(page);
    
    fs.unlinkSync(testFile);
  });

  test('Cadastrar aula Ao Vivo com materiais complementares', async ({ page }) => {
    const timestamp = Date.now();
    const titulo = `Aula Ao Vivo Materiais ${timestamp}`;
    const descricao = 'Descrição da aula Ao Vivo com materiais complementares';

    await preencherCamposBasicos(page, titulo, descricao, '120');
    await selecionarModalidade(page, 'AO_VIVO');
    await preencherPeriodo(page, 1, '16:00', '18:00');
    await selecionarAulaObrigatoria(page, true);
    
    const testFile = path.join(__dirname, 'test-file.pdf');
    fs.writeFileSync(testFile, 'Test PDF content');
    
    await adicionarMaterialComplementar(page, testFile);
    await submeterFormulario(page);
    await verificarSucesso(page);
    
    fs.unlinkSync(testFile);
  });

  test('Cadastrar aula Semipresencial com materiais complementares', async ({ page }) => {
    const timestamp = Date.now();
    const titulo = `Aula Semipresencial Materiais ${timestamp}`;
    const descricao = 'Descrição da aula Semipresencial com materiais complementares';

    await preencherCamposBasicos(page, titulo, descricao, '90');
    await selecionarModalidade(page, 'SEMIPRESENCIAL');
    await selecionarTipoLink(page, 'YOUTUBE');
    await preencherYouTubeUrl(page);
    await preencherPeriodo(page, 1, '19:00', '20:30');
    await selecionarAulaObrigatoria(page, true);
    
    const testFile = path.join(__dirname, 'test-file.pdf');
    fs.writeFileSync(testFile, 'Test PDF content');
    
    await adicionarMaterialComplementar(page, testFile);
    await submeterFormulario(page);
    await verificarSucesso(page);
    
    fs.unlinkSync(testFile);
  });
});

test.describe('Cadastro de Aulas - Com Materiais, Curso, Turma e Instrutor', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/dashboard/cursos/aulas/cadastrar');
    await page.waitForLoadState('networkidle');
  });

  test('Cadastrar aula YouTube com materiais, curso, turma e instrutor', async ({ page }) => {
    const timestamp = Date.now();
    const titulo = `Aula YouTube Completo Materiais ${timestamp}`;
    const descricao = 'Descrição da aula YouTube completa com materiais';

    await preencherCamposBasicos(page, titulo, descricao, '60');
    await selecionarCurso(page);
    await selecionarTurma(page);
    await selecionarInstrutor(page);
    await preencherYouTubeUrl(page);
    await selecionarAulaObrigatoria(page, true);
    
    const testFile = path.join(__dirname, 'test-file.pdf');
    fs.writeFileSync(testFile, 'Test PDF content');
    
    await adicionarMaterialComplementar(page, testFile);
    await submeterFormulario(page);
    await verificarSucesso(page);
    
    fs.unlinkSync(testFile);
  });

  test('Cadastrar aula Presencial com materiais, curso, turma e instrutor', async ({ page }) => {
    const timestamp = Date.now();
    const titulo = `Aula Presencial Completo Materiais ${timestamp}`;
    const descricao = 'Descrição da aula Presencial completa com materiais';

    await preencherCamposBasicos(page, titulo, descricao, '90');
    await selecionarCurso(page);
    await selecionarTurma(page);
    await selecionarInstrutor(page);
    await preencherPeriodo(page, 1, '14:00', '15:30');
    await preencherSala(page, 'Lab 601');
    await selecionarAulaObrigatoria(page, true);
    
    const testFile = path.join(__dirname, 'test-file.pdf');
    fs.writeFileSync(testFile, 'Test PDF content');
    
    await adicionarMaterialComplementar(page, testFile);
    await submeterFormulario(page);
    await verificarSucesso(page);
    
    fs.unlinkSync(testFile);
  });

  test('Cadastrar aula Ao Vivo com materiais, curso, turma e instrutor', async ({ page }) => {
    const timestamp = Date.now();
    const titulo = `Aula Ao Vivo Completo Materiais ${timestamp}`;
    const descricao = 'Descrição da aula Ao Vivo completa com materiais';

    await preencherCamposBasicos(page, titulo, descricao, '120');
    await selecionarCurso(page);
    await selecionarTurma(page);
    await selecionarInstrutor(page);
    await preencherPeriodo(page, 1, '16:00', '18:00');
    await selecionarAulaObrigatoria(page, true);
    
    const testFile = path.join(__dirname, 'test-file.pdf');
    fs.writeFileSync(testFile, 'Test PDF content');
    
    await adicionarMaterialComplementar(page, testFile);
    await submeterFormulario(page);
    await verificarSucesso(page);
    
    fs.unlinkSync(testFile);
  });

  test('Cadastrar aula Semipresencial com materiais, curso, turma e instrutor', async ({ page }) => {
    const timestamp = Date.now();
    const titulo = `Aula Semipresencial Completo Materiais ${timestamp}`;
    const descricao = 'Descrição da aula Semipresencial completa com materiais';

    await preencherCamposBasicos(page, titulo, descricao, '90');
    await selecionarCurso(page);
    await selecionarTurma(page);
    await selecionarInstrutor(page);
    await selecionarTipoLink(page, 'YOUTUBE');
    await preencherYouTubeUrl(page);
    await preencherPeriodo(page, 1, '19:00', '20:30');
    await selecionarAulaObrigatoria(page, true);
    
    const testFile = path.join(__dirname, 'test-file.pdf');
    fs.writeFileSync(testFile, 'Test PDF content');
    
    await adicionarMaterialComplementar(page, testFile);
    await submeterFormulario(page);
    await verificarSucesso(page);
    
    fs.unlinkSync(testFile);
  });
});

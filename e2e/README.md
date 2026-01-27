# Testes E2E - Cadastro de Aulas

Este diretório contém testes automatizados end-to-end (E2E) usando Playwright para o cadastro de aulas.

## Pré-requisitos

1. Ter o servidor de desenvolvimento rodando na porta 3001
2. Ter o usuário admin de teste configurado no sistema:
   - CPF: 11111111111
   - Email: admin.teste@advancemais.com.br
   - Senha: AdminTeste@123
   - Role: ADMIN

## Instalação

Os testes já estão configurados. Se necessário, instale os browsers do Playwright:

```bash
npx playwright install chromium
```

## Executando os Testes

### Executar todos os testes

```bash
pnpm test:e2e
```

### Executar com interface gráfica

```bash
pnpm test:e2e:ui
```

### Executar em modo headed (com navegador visível)

```bash
pnpm test:e2e:headed
```

### Executar em modo debug

```bash
pnpm test:e2e:debug
```

### Executar um teste específico

```bash
npx playwright test cadastro-aulas.spec.ts
```

## Estrutura dos Testes

Os testes estão organizados em grupos (describe blocks) que cobrem diferentes cenários:

### 1. Cadastro sem Vínculos
- Aula YouTube sem curso, turma, instrutor ou materiais
- Aula Presencial sem vínculos
- Aula Ao Vivo sem vínculos
- Aula Semipresencial sem vínculos

### 2. Cadastro com Curso e Turma
- Todas as modalidades com curso e turma vinculados

### 3. Cadastro apenas com Instrutor
- Todas as modalidades apenas com instrutor vinculado

### 4. Cadastro com Instrutor, Curso e Turma
- Todas as modalidades com todos os vínculos

### 5. Cadastro com Materiais Complementares
- Todas as modalidades com materiais complementares

### 6. Cadastro Completo
- Todas as modalidades com materiais, curso, turma e instrutor

## Helpers

### `e2e/helpers/auth.ts`
- `loginAsAdmin(page)`: Realiza login com o usuário admin de teste

### `e2e/helpers/aula-form.ts`
- `preencherCamposBasicos()`: Preenche título, descrição e duração
- `selecionarModalidade()`: Seleciona a modalidade da aula
- `preencherYouTubeUrl()`: Preenche o link do YouTube
- `selecionarTipoLink()`: Seleciona tipo de link (para semipresencial)
- `selecionarCurso()`: Seleciona um curso
- `selecionarTurma()`: Seleciona uma turma
- `selecionarInstrutor()`: Seleciona um instrutor
- `preencherPeriodo()`: Preenche data, hora início e hora fim
- `preencherSala()`: Preenche a sala (para presencial)
- `selecionarAulaObrigatoria()`: Define se a aula é obrigatória
- `adicionarMaterialComplementar()`: Adiciona material complementar
- `submeterFormulario()`: Submete o formulário
- `verificarSucesso()`: Verifica se a aula foi criada com sucesso

## Configuração

A configuração do Playwright está em `playwright.config.ts`. Por padrão:
- Base URL: `http://localhost:3001`
- Navegador: Chromium
- Timeout: 10 segundos para navegação
- Screenshots e vídeos são salvos apenas em caso de falha

## Troubleshooting

### Erro: "Browser not found"
Execute: `npx playwright install chromium`

### Erro: "Page not found" ou timeout
Certifique-se de que o servidor está rodando na porta 3001:
```bash
pnpm dev
```

### Erro de autenticação
Verifique se o usuário admin de teste existe no banco de dados com as credenciais corretas.

### Testes falhando por seletores
Os seletores podem precisar ser ajustados se a estrutura do HTML mudar. Verifique os componentes em `src/components/ui/custom/select/` e ajuste os helpers em `e2e/helpers/aula-form.ts`.

## Relatórios

Após executar os testes, um relatório HTML será gerado. Para visualizar:

```bash
npx playwright show-report
```

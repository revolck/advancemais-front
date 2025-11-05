# Prompt: Correção de Erro 500 no Endpoint GET /cursos/{cursoId}/turmas/{turmaId}

## Problema Crítico

O endpoint `GET /api/v1/cursos/{cursoId}/turmas/{turmaId}` está retornando **Status 500 (Internal Server Error)** quando tenta buscar os detalhes de uma turma específica.

## Informações do Erro

**Endpoint:** `GET /api/v1/cursos/4/turmas/80288180-a09c-4a2a-bade-022c7268e395`

**Status HTTP:** `500 Internal Server Error`

**Mensagem de Erro:** `"Erro ao buscar turma do curso"`

**Contexto:**
- O curso existe (ID: 4)
- A turma existe (ID: 80288180-a09c-4a2a-bade-022c7268e395)
- O erro ocorre especificamente quando há turmas vinculadas ao curso com os novos campos calculados

## Causa Provável

Baseado no contexto, o erro provavelmente está relacionado aos **novos campos calculados** que foram adicionados recentemente:

- `inscricoesCount` - Número total de inscrições ativas
- `vagasOcupadas` - Número de vagas ocupadas
- `vagasDisponiveisCalculadas` - Vagas disponíveis calculadas (vagasTotais - inscricoesCount)

O erro pode estar acontecendo porque:

1. **Query SQL falhando**: A query que calcula `inscricoesCount` pode estar causando erro
2. **Serialização JSON**: Os novos campos podem estar causando erro de serialização
3. **Validação de DTO**: O DTO pode estar rejeitando os novos campos
4. **Relacionamento circular**: Pode haver referência circular ao incluir relacionamentos
5. **Campo null/undefined**: Algum campo pode estar retornando null/undefined de forma incorreta

## Estrutura Esperada da Resposta

```json
{
  "id": "80288180-a09c-4a2a-bade-022c7268e395",
  "codigo": "GEST-PROJ-T1",
  "nome": "Turma 1 - Gestão de Projetos Ágeis",
  "turno": "MANHA",
  "metodo": "ONLINE",
  "status": "INSCRICOES_ABERTAS",
  "vagasTotais": 30,
  "vagasDisponiveis": 30,
  "inscricoesCount": 3,
  "vagasOcupadas": 3,
  "vagasDisponiveisCalculadas": 27,
  "dataInicio": "2024-01-01",
  "dataFim": "2024-06-30",
  "dataInscricaoInicio": "2024-01-01T00:00:00Z",
  "dataInscricaoFim": "2024-01-15T00:00:00Z",
  "instrutor": {
    "id": "uuid-instrutor",
    "nome": "Nome do Instrutor",
    "email": "instrutor@example.com",
    "codUsuario": "INST001"
  }
}
```

## Verificações Necessárias

### 1. Verificar Logs do Servidor

**Prioridade ALTA**: Verificar os logs do servidor no momento da requisição para identificar:
- Stack trace completo do erro
- Linha exata onde o erro está ocorrendo
- Mensagem de erro detalhada do banco de dados (se aplicável)
- Query SQL que está falhando (se aplicável)

### 2. Verificar Query de Cálculo de Inscrições

Se a query que calcula `inscricoesCount` está falhando:

```sql
-- Verificar se esta query funciona para a turma específica
SELECT COUNT(*) as inscricoes_count
FROM "TurmasInscricoes" ti
INNER JOIN "Usuarios" u ON ti."alunoId" = u.id
WHERE 
  ti."turmaId" = '80288180-a09c-4a2a-bade-022c7268e395'
  AND ti.status NOT IN ('CANCELADO', 'TRANCADO')
  AND u.status NOT IN ('INATIVO', 'CANCELADO')
  AND u."deletedAt" IS NULL;
```

**Possíveis problemas:**
- Tabela `TurmasInscricoes` não existe ou tem nome diferente
- Coluna `status` não existe na tabela `TurmasInscricoes`
- Relacionamento com `Usuarios` está quebrado
- Campos `deletedAt` ou `status` não existem em `Usuarios`

### 3. Verificar Serialização JSON

Se o problema for de serialização:

```typescript
// ❌ ERRADO - pode causar erro se for null
inscricoesCount: turma.inscricoesCount

// ✅ CORRETO - sempre retorna número ou null explícito
inscricoesCount: turma.inscricoesCount ?? null
```

### 4. Verificar DTO/Validação

Se estiver usando class-validator, garantir que os campos sejam opcionais:

```typescript
@IsOptional()
@IsNumber()
@Type(() => Number)
@AllowNull()
inscricoesCount?: number | null;

@IsOptional()
@IsNumber()
@Type(() => Number)
@AllowNull()
vagasOcupadas?: number | null;

@IsOptional()
@IsNumber()
@Type(() => Number)
@AllowNull()
vagasDisponiveisCalculadas?: number | null;
```

### 5. Verificar Tratamento de Erros

Adicionar tratamento de erro específico para identificar o problema:

```typescript
try {
  const turma = await this.turmaRepository.findOne({
    where: { id: turmaId, cursoId },
    relations: ['instrutor']
  });

  if (!turma) {
    throw new NotFoundException(`Turma ${turmaId} não encontrada`);
  }

  // Calcular campos
  try {
    turma.inscricoesCount = await this.calculateInscricoesCount(turma.id);
    turma.vagasOcupadas = turma.inscricoesCount;
    turma.vagasDisponiveisCalculadas = (turma.vagasTotais ?? 0) - turma.inscricoesCount;
  } catch (calcError) {
    console.error('Erro ao calcular campos da turma:', {
      turmaId,
      error: calcError,
      stack: calcError.stack,
    });
    // Se o cálculo falhar, define como null ou 0
    turma.inscricoesCount = null;
    turma.vagasOcupadas = null;
    turma.vagasDisponiveisCalculadas = null;
  }

  return turma;
} catch (error) {
  console.error('Erro ao buscar turma:', {
    cursoId,
    turmaId,
    error: error.message,
    stack: error.stack,
  });
  throw error;
}
```

## Solução Sugerida

### Opção 1: Tornar Campos Calculados Opcionais e Seguros

```typescript
// Calcular campos de forma segura
const calcularCamposTurma = async (turma: Turma) => {
  try {
    const inscricoesCount = await this.countInscricoesAtivas(turma.id);
    return {
      ...turma,
      inscricoesCount: inscricoesCount ?? 0,
      vagasOcupadas: inscricoesCount ?? 0,
      vagasDisponiveisCalculadas: (turma.vagasTotais ?? 0) - (inscricoesCount ?? 0),
    };
  } catch (error) {
    console.warn('Erro ao calcular campos, usando valores padrão:', error);
    return {
      ...turma,
      inscricoesCount: null,
      vagasOcupadas: null,
      vagasDisponiveisCalculadas: null,
    };
  }
};
```

### Opção 2: Usar Transação SQL Mais Segura

```sql
-- Query mais segura que trata nulls
SELECT 
  t.*,
  COALESCE(
    (SELECT COUNT(*) 
     FROM "TurmasInscricoes" ti
     INNER JOIN "Usuarios" u ON ti."alunoId" = u.id
     WHERE ti."turmaId" = t.id
       AND (ti.status IS NULL OR ti.status NOT IN ('CANCELADO', 'TRANCADO'))
       AND (u.status IS NULL OR u.status NOT IN ('INATIVO', 'CANCELADO'))
       AND (u."deletedAt" IS NULL)
    ),
    0
  ) as "inscricoesCount"
FROM "CursosTurmas" t
WHERE t.id = :turmaId AND t."cursoId" = :cursoId;
```

### Opção 3: Adicionar Try-Catch em Cada Campo

```typescript
const turmaResponse = {
  ...turma,
  inscricoesCount: await safeCalculate(() => this.getInscricoesCount(turma.id)),
  vagasOcupadas: await safeCalculate(() => this.getVagasOcupadas(turma.id)),
  vagasDisponiveisCalculadas: await safeCalculate(() => 
    this.getVagasDisponiveisCalculadas(turma.id)
  ),
};

async function safeCalculate<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    console.warn('Erro ao calcular campo:', error);
    return null;
  }
}
```

## Testes Necessários

1. ✅ Testar endpoint com turma sem inscrições (deve funcionar)
2. ✅ Testar endpoint com turma com inscrições (verificar se funciona)
3. ✅ Testar endpoint com turma que tem muitos relacionamentos
4. ✅ Verificar logs do servidor durante a requisição
5. ✅ Testar query SQL diretamente no banco de dados
6. ✅ Verificar se os campos calculados estão sendo serializados corretamente

## Prioridade

**CRÍTICA** - Este erro impede completamente o acesso aos detalhes de turmas, o que é um fluxo crítico do sistema.

## Informações Adicionais

- **Endpoint:** `GET /api/v1/cursos/{cursoId}/turmas/{turmaId}`
- **Método:** GET
- **Headers:** Requer autenticação (Authorization header)
- **Response esperada:** JSON com objeto `CursoTurma` completo
- **Status codes esperados:** 
  - 200 (sucesso)
  - 401 (não autenticado)
  - 403 (sem permissão)
  - 404 (turma não encontrada)
  - **500 (erro interno) - ATUAL PROBLEMA**

## Exemplo de Requisição

```bash
curl -X GET \
  "http://api.example.com/api/v1/cursos/4/turmas/80288180-a09c-4a2a-bade-022c7268e395" \
  -H "Authorization: Bearer <token>"
```

## Próximos Passos

1. **Verificar logs do servidor** para identificar a causa raiz do erro 500
2. **Testar a query SQL** diretamente no banco de dados
3. **Adicionar tratamento de erro** mais robusto nos cálculos
4. **Tornar campos calculados opcionais** para não quebrar se houver erro
5. **Adicionar logging detalhado** para diagnóstico

---

**Nota**: Compartilhar os logs do servidor durante a requisição facilitará muito o diagnóstico do problema.


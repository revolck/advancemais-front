# Prompt: Correção de Erro no Endpoint GET /cursos/{id}

## Problema

O endpoint `GET /api/v1/cursos/{id}` está retornando erro quando o curso possui turmas vinculadas. O frontend está recebendo um erro genérico "Erro ao buscar curso" após 3 tentativas.

## Contexto

Após implementar os novos campos calculados nas turmas (`inscricoesCount`, `vagasOcupadas`, `vagasDisponiveisCalculadas`), o endpoint de detalhes do curso começou a falhar quando há turmas associadas.

## Erro Observado

```
⚠️ API Error [1/3]: Error: Erro ao buscar curso
❌ API Failed após 3 tentativas: Error: Erro ao buscar curso
```

**Cursos afetados:**
- `/api/v1/cursos/2` - ❌ Falha (tem turmas)
- `/api/v1/cursos/1` - ✅ Funciona (sem turmas ou turmas diferentes)
- `/api/v1/cursos/3` - ✅ Funciona (sem turmas)
- `/api/v1/cursos/4` - ✅ Funciona (sem turmas)

## Possíveis Causas

1. **Erro de Serialização JSON**: Os novos campos calculados podem estar causando erro de serialização quando há turmas
2. **Tipo de Dados**: Campos numéricos podem estar sendo retornados como `null` ou `undefined` de forma incorreta
3. **Relacionamento Circular**: Pode haver referência circular entre curso e turmas
4. **Validação de Schema**: A validação do DTO pode estar rejeitando os novos campos

## Estrutura Esperada da Resposta

```json
{
  "id": 2,
  "nome": "Nome do Curso",
  "codigo": "CURSO-001",
  "descricao": "Descrição...",
  "cargaHoraria": 40,
  "categoriaId": 1,
  "statusPadrao": "PUBLICADO",
  "criadoEm": "2024-01-01T00:00:00Z",
  "atualizadoEm": "2024-01-01T00:00:00Z",
  "imagemUrl": "https://...",
  "subcategoriaId": 1,
  "categoria": {
    "id": 1,
    "nome": "Categoria"
  },
  "subcategoria": {
    "id": 1,
    "nome": "Subcategoria"
  },
  "turmas": [
    {
      "id": "uuid-turma-1",
      "codigo": "TURMA-001",
      "nome": "Turma 1",
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
  ],
  "turmasCount": 1
}
```

## Verificações Necessárias

### 1. Verificar Serialização JSON

Certifique-se de que todos os campos numéricos são tratados corretamente:

```typescript
// ❌ ERRADO - pode causar erro se for null
inscricoesCount: turma.inscricoesCount

// ✅ CORRETO - sempre retorna número ou null explícito
inscricoesCount: turma.inscricoesCount ?? null
```

### 2. Verificar DTO/Validação

Se estiver usando class-validator ou similar, garantir que os novos campos sejam opcionais:

```typescript
@IsOptional()
@IsNumber()
@Type(() => Number)
inscricoesCount?: number;

@IsOptional()
@IsNumber()
@Type(() => Number)
vagasOcupadas?: number;

@IsOptional()
@IsNumber()
@Type(() => Number)
vagasDisponiveisCalculadas?: number;
```

### 3. Verificar Relacionamentos

Se estiver usando TypeORM/Prisma, verificar que o relacionamento não está causando loop infinito:

```typescript
// ✅ CORRETO - usar select específico ou @Exclude
@OneToMany(() => Turma, turma => turma.curso, { 
  eager: false, // ou true se necessário
  select: ['id', 'codigo', 'nome', 'inscricoesCount', ...]
})
turmas: Turma[];
```

### 4. Verificar Logs do Servidor

Verificar os logs do servidor para identificar:
- Erro de serialização JSON
- Erro de validação de DTO
- Erro de query do banco
- Timeout ou erro de memória

## Solução Sugerida

### Opção 1: Serialização Manual (Mais Segura)

```typescript
// No controller/service
const curso = await this.cursosService.findById(id);

return {
  ...curso,
  turmas: curso.turmas?.map(turma => ({
    ...turma,
    inscricoesCount: turma.inscricoesCount ?? null,
    vagasOcupadas: turma.vagasOcupadas ?? null,
    vagasDisponiveisCalculadas: turma.vagasDisponiveisCalculadas ?? null,
  })) ?? [],
};
```

### Opção 2: Usar @Exclude() e @Expose()

```typescript
import { Exclude, Expose } from 'class-transformer';

export class TurmaResponseDto {
  // ... campos existentes
  
  @Expose()
  @IsOptional()
  @IsNumber()
  inscricoesCount?: number;
  
  @Expose()
  @IsOptional()
  @IsNumber()
  vagasOcupadas?: number;
  
  @Expose()
  @IsOptional()
  @IsNumber()
  vagasDisponiveisCalculadas?: number;
}
```

### Opção 3: Tratamento de Erro Específico

Adicionar tratamento de erro específico para identificar o problema:

```typescript
try {
  const curso = await this.cursosService.findById(id);
  return curso;
} catch (error) {
  console.error('Erro ao buscar curso:', {
    cursoId: id,
    error: error.message,
    stack: error.stack,
    turmasCount: curso?.turmas?.length,
  });
  throw error;
}
```

## Testes Sugeridos

1. ✅ Testar curso sem turmas (deve funcionar)
2. ✅ Testar curso com 1 turma (verificar se funciona)
3. ✅ Testar curso com múltiplas turmas (verificar se funciona)
4. ✅ Testar curso com turmas que têm inscrições (verificar se campos calculados estão corretos)
5. ✅ Verificar logs do servidor durante a requisição

## Prioridade

**ALTA** - Este erro impede o acesso aos detalhes de cursos que têm turmas vinculadas, o que é um fluxo crítico do sistema.

## Informações Adicionais

- **Endpoint**: `GET /api/v1/cursos/{id}`
- **Método**: GET
- **Headers**: Requer autenticação (Authorization header)
- **Response esperada**: JSON com objeto Curso completo incluindo turmas
- **Status codes esperados**: 200 (sucesso), 401 (não autenticado), 403 (sem permissão), 404 (não encontrado)

---

**Nota**: Se possível, compartilhar os logs do servidor durante a requisição para facilitar o diagnóstico.


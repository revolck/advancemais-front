# Análise: Mudanças na API de Turmas - O que precisa ser atualizado

## 📋 Resumo das Mudanças na API

A API de turmas foi atualizada para retornar uma estrutura **paginada** ao invés de um array simples, e agora suporta **filtros** e **paginação** diretamente no endpoint.

---

## ✅ O que JÁ está implementado

1. **Campos calculados de vagas** ✅
   - `inscricoesCount` - Já existe na interface `CursoTurma`
   - `vagasOcupadas` - Já existe na interface `CursoTurma`
   - `vagasDisponiveisCalculadas` - Já existe na interface `CursoTurma`

2. **Filtros no frontend** ✅
   - Filtros de `status`, `turno`, `metodo` já existem no componente `TurmasDashboard`
   - Mas estão sendo aplicados **no frontend** (client-side), não na API

---

## ❌ O que PRECISA ser atualizado

### 1. **Interface TypeScript - Adicionar campo `curso`**

**Arquivo:** `src/api/cursos/types.ts`

**Status atual:**
```typescript
export interface CursoTurma {
  // ... campos existentes
  instrutor?: { ... };
  // ❌ FALTA: campo curso
}
```

**Precisa adicionar:**
```typescript
export interface CursoTurma {
  // ... campos existentes
  instrutor?: { ... };
  curso?: {  // ✅ NOVO
    id: number;
    nome: string;
    codigo: string;
  } | null;
}
```

---

### 2. **Interface TypeScript - Criar `TurmasListResponse`**

**Arquivo:** `src/api/cursos/types.ts`

**Status atual:** Não existe interface para resposta paginada de turmas

**Precisa criar:**
```typescript
export interface TurmasListResponse {
  data: CursoTurma[];
  pagination: {
    page: number;
    requestedPage: number;
    pageSize: number;
    total: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    isPageAdjusted: boolean;
  };
  filters: {
    applied: {
      cursoId: number;
      status: string | null;
      turno: string | null;
      metodo: string | null;
      instrutorId: string | null;
    };
  };
  meta: {
    empty: boolean;
  };
}
```

---

### 3. **Atualizar função `listTurmas` - Suportar paginação e filtros**

**Arquivo:** `src/api/cursos/core.ts`

**Status atual:**
```typescript
export async function listTurmas(
  cursoId: number | string,
  init?: RequestInit
): Promise<CursoTurma[]> {
  // Retorna array simples
  // Não aceita parâmetros de paginação ou filtros
}
```

**Precisa atualizar para:**
```typescript
export interface ListTurmasParams {
  page?: number;
  pageSize?: number;
  status?: string;
  turno?: string;
  metodo?: string;
  instrutorId?: string;
}

export async function listTurmas(
  cursoId: number | string,
  params?: ListTurmasParams,
  init?: RequestInit
): Promise<TurmasListResponse> {
  // Construir query params
  // Retornar TurmasListResponse
}
```

---

### 4. **Atualizar `normalizeTurma` - Incluir campo `curso`**

**Arquivo:** `src/api/cursos/core.ts`

**Status atual:** A função `normalizeTurma` não normaliza o campo `curso`

**Precisa adicionar:**
```typescript
function normalizeTurma(turma: any): CursoTurma {
  return {
    // ... campos existentes
    curso: turma.curso ? {
      id: Number(turma.curso.id ?? 0),
      nome: String(turma.curso.nome ?? ""),
      codigo: String(turma.curso.codigo ?? ""),
    } : null,  // ✅ NOVO
  };
}
```

---

### 5. **Atualizar hook `useTurmasDashboardQuery` - Suportar paginação e filtros**

**Arquivo:** `src/theme/dashboard/components/admin/lista-turmas/hooks/useTurmasDashboardQuery.ts`

**Status atual:**
- Aceita apenas `cursoId`
- Não suporta paginação
- Não envia filtros para API (faz filtro client-side)

**Precisa atualizar para:**
```typescript
export interface TurmasDashboardFilters {
  cursoId: string | null;
  page?: number;
  pageSize?: number;
  status?: string | null;
  turno?: string | null;
  metodo?: string | null;
  instrutorId?: string | null;
}

export function useTurmasDashboardQuery({
  cursoId,
  page = 1,
  pageSize = 10,
  status,
  turno,
  metodo,
  instrutorId,
}: TurmasDashboardFilters) {
  // Enviar filtros para API
  // Retornar TurmasListResponse com paginação
}
```

**Observação:** A função `listAllTurmas()` precisa ser refatorada ou removida, pois agora a API suporta listar todas as turmas de forma paginada.

---

### 6. **Atualizar componente `TurmasDashboard` - Usar paginação e filtros da API**

**Arquivo:** `src/theme/dashboard/components/admin/lista-turmas/TurmasDashboard.tsx`

**Status atual:**
- Filtros são aplicados client-side no `useMemo`
- Não há controles de paginação
- Não envia filtros para API

**Precisa atualizar para:**
1. **Remover filtro client-side** - A API já faz o filtro
2. **Adicionar estado de paginação** (`page`, `pageSize`)
3. **Enviar filtros para API** via hook
4. **Adicionar controles de paginação** na UI (botões anterior/próxima)
5. **Usar `turma.curso?.nome`** ao invés de `cursoNome` (que era adicionado manualmente)

**Exemplo de mudança:**
```typescript
// ❌ ANTES: Filtro client-side
const filteredTurmas = useMemo(() => {
  return turmas.filter((t) => { ... });
}, [turmas, selectedStatus, ...]);

// ✅ DEPOIS: Filtro na API
const turmasQuery = useTurmasDashboardQuery({
  cursoId: selectedCourseId,
  page: currentPage,
  pageSize: 10,
  status: selectedStatus,
  turno: selectedTurno,
  metodo: selectedMetodo,
});

const turmas = turmasQuery.data?.data ?? [];
const pagination = turmasQuery.data?.pagination;
```

---

### 7. **Atualizar componente `TurmaRow` - Usar `curso.nome`**

**Arquivo:** `src/theme/dashboard/components/admin/lista-turmas/components/TurmaRow.tsx`

**Status atual:**
```typescript
interface TurmaComCurso extends CursoTurma {
  cursoId?: number;
  cursoNome?: string;  // ❌ Adicionado manualmente
}
```

**Precisa atualizar para:**
```typescript
// ✅ Usar curso.nome da API
<span>{turma.curso?.nome || "—"}</span>
```

---

### 8. **Adicionar controles de paginação na UI**

**Arquivo:** `src/theme/dashboard/components/admin/lista-turmas/TurmasDashboard.tsx`

**Precisa adicionar:**
- Botões "Anterior" e "Próxima"
- Indicador de página atual (ex: "Página 1 de 5")
- Seletor de `pageSize` (opcional)

---

## 📊 Checklist de Implementação

- [ ] 1. Adicionar campo `curso` na interface `CursoTurma`
- [ ] 2. Criar interface `TurmasListResponse`
- [ ] 3. Criar interface `ListTurmasParams`
- [ ] 4. Atualizar função `listTurmas` para aceitar parâmetros e retornar `TurmasListResponse`
- [ ] 5. Atualizar `normalizeTurma` para incluir campo `curso`
- [ ] 6. Atualizar hook `useTurmasDashboardQuery` para suportar paginação e filtros
- [ ] 7. Refatorar ou remover `listAllTurmas()` (se não for mais necessária)
- [ ] 8. Atualizar `TurmasDashboard` para remover filtro client-side
- [ ] 9. Adicionar estado de paginação no `TurmasDashboard`
- [ ] 10. Enviar filtros para API via hook
- [ ] 11. Adicionar controles de paginação na UI
- [ ] 12. Atualizar `TurmaRow` para usar `turma.curso?.nome`
- [ ] 13. Testar paginação com diferentes `pageSize`
- [ ] 14. Testar cada filtro individualmente
- [ ] 15. Testar combinação de múltiplos filtros

---

## 🔍 Pontos de Atenção

1. **Compatibilidade:** A função atual `listTurmas` ainda pode retornar array simples em alguns casos (normalização atual). Verificar se a API sempre retorna estrutura paginada.

2. **Listagem de todas as turmas:** A função `listAllTurmas()` atual busca todas as turmas de todos os cursos. Com a nova API, pode ser necessário:
   - Remover essa função
   - Ou criar um endpoint específico para listar todas as turmas (se a API suportar)

3. **Filtro de instrutor:** Atualmente não há filtro de instrutor no frontend. Se necessário, adicionar na UI.

4. **Performance:** Com paginação, não precisamos mais buscar todas as turmas de uma vez. Isso melhora a performance.

5. **Reset de página:** Ao mudar filtros, resetar para página 1.

---

## 📝 Notas Importantes

- O campo `vagasDisponiveis` do banco pode estar desatualizado. **Sempre usar `vagasDisponiveisCalculadas`** para exibição.
- A resposta sempre vem com estrutura de paginação, mesmo que haja poucas turmas.
- Os filtros são opcionais e podem ser combinados.
- O campo `curso` pode ser `null` se houver inconsistência de dados (não deve ocorrer).

---

## 🎯 Ordem Sugerida de Implementação

1. **Fase 1 - Tipos e API:**
   - Atualizar interfaces TypeScript
   - Atualizar função `listTurmas`
   - Atualizar `normalizeTurma`

2. **Fase 2 - Hook:**
   - Atualizar `useTurmasDashboardQuery`
   - Remover/refatorar `listAllTurmas`

3. **Fase 3 - Componente:**
   - Atualizar `TurmasDashboard`
   - Remover filtro client-side
   - Adicionar paginação

4. **Fase 4 - UI:**
   - Adicionar controles de paginação
   - Atualizar `TurmaRow` para usar `curso.nome`

5. **Fase 5 - Testes:**
   - Testar paginação
   - Testar filtros individuais
   - Testar combinação de filtros


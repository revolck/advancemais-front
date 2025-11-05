# React Query Migration To-Do

## Concluído
- [x] Configurar `AppProviders` com `QueryClientProvider`.
- [x] Cachear candidatos de vagas via `useVacancyCandidates`.
- [x] Migrar `useCompanyDashboardData` para React Query.
- [x] Migrar `useEmpresasForSelect` para React Query com paginação em cache.
- [x] CompanyDetails dashboard alimentado pelo cache consolidado (`CompanyDetailsView` + SSR hydration).
- [x] Portar dashboards `lista-alunos`, `lista-vagas` e `lista-turmas` para React Query com `queryKeys` compartilhadas.
- [x] Migrar `VagaDetailsView` (edição e hidratação) para React Query, eliminando `window.location.reload`.

## Próximos passos (prioridade alta)
- [x] Converter `AlunoDetailsView` e hooks associados (`EditarAlunoModal`, `BloquearAlunoModal`, etc.) para uso de `useQuery`/`useMutation`.
- [x] Migrar `CandidatoDetailsView` para React Query com invalidação e mutações cacheadas.
- [x] Migrar `UsuarioDetailsView`, `InstrutorDetailsView` e `CursoDetailsView` para `useQuery`, incluindo invalidação após ações de modais.
- [x] Reorganizar hooks das listagens restantes (`lista-cursos`, painéis empresariais, etc.) para reutilizar queries cacheadas e remover `useEffect` imperativo.
- [x] Centralizar mutations (bloqueio/desbloqueio, atualização de planos, edição de cadastros) com `useMutation` e `queryClient.invalidateQueries`.

## Fase seguinte
- [x] Consolidar utilitários de query keys (e.g. `buildQueryKey`) em módulo compartilhado.
- [ ] Instrumentar métricas simples (ex.: `console.time`) nas principais queries para monitorar ganhos.
- [ ] Documentar padrões de uso (SSR hydration, invalidation, suspense) para novos módulos.

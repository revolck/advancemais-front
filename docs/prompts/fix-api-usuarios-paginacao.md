# Prompt para corrigir paginação de usuários na API

Contexto:
- Frontend em `/dashboard/usuarios` agora usa paginação server-side.
- Endpoint consumido: `GET /api/v1/usuarios/usuarios`.
- Problema observado: UI mostra total menor (ex.: 100) quando o total real é maior (ex.: ~4500).

Objetivo:
Corrigir a API para que a paginação reflita o total real no banco, mantendo filtros e performance.

Requisitos funcionais:
1. O endpoint deve aceitar e aplicar corretamente:
- `page`
- `limit`
- `status`
- `role`
- `tipoUsuario`
- `search`
- `cidade`
- `estado`

2. A resposta deve conter:
- `usuarios`: apenas os registros da página solicitada (`limit`)
- `pagination.page`
- `pagination.limit`
- `pagination.total` (TOTAL REAL de registros que casam com os filtros, sem aplicar paginação)
- `pagination.pages` (`Math.ceil(total / limit)`)

3. `pagination.total` não pode ser o tamanho do array retornado na página atual.

4. Se houver joins (ex.: vínculos), garantir que o `count` não seja inflado por duplicidade de linha.

Requisitos técnicos:
- Separar consulta de dados e consulta de contagem.
- Aplicar exatamente os mesmos filtros na query de dados e na query de contagem.
- Evitar `count` sobre resultado já paginado.
- Revisar defaults de `limit` para não forçar teto silencioso indevido.
- Se houver limite máximo de segurança, documentar e retornar consistente.

Critérios de aceite:
1. Com base de dados > 4000 usuários, `GET /usuarios/usuarios?page=1&limit=10` retorna:
- `usuarios.length = 10`
- `pagination.total` > 4000
- `pagination.pages` coerente

2. Com filtro (ex.: `role=EMPRESA`), `pagination.total` deve refletir total filtrado.

3. Navegação de páginas no frontend deve mostrar:
- "Mostrando 1 a 10 de X usuários" com `X` correto
- última página acessível sem inconsistência.

Saída esperada da tarefa:
- Código alterado na API
- Testes automatizados (unitário/integrado) cobrindo paginação e contagem
- Breve relatório com payload real de exemplo antes/depois.

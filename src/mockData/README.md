# Dados Mockados

Esta pasta contém dados mockados temporários para desenvolvimento e testes.

## ⚠️ IMPORTANTE

**Estes dados são temporários e devem ser removidos quando a API estiver retornando dados reais.**

## Arquivos

- `faturamento.ts` - Dados mockados para faturamento (gráfico de tendências)

## Como remover os mocks

Quando a API estiver pronta:

1. **Remover imports de mockData:**
   ```typescript
   // Remover esta linha:
   import { generateMockFaturamentoData } from "@/mockData/faturamento";
   ```

2. **Substituir uso de dados mockados:**
   ```typescript
   // Antes (com mock):
   const historicalData = useMemo(() => {
     return generateMockFaturamentoData();
   }, []);

   // Depois (com API):
   const historicalData = useMemo(() => {
     return data.historicalData || []; // ou como a API retornar
   }, [data]);
   ```

3. **Deletar esta pasta:**
   ```bash
   rm -rf src/mockData
   ```

## Localizações onde os mocks são usados

- `src/theme/dashboard/components/admin/visao-geral/components/FaturamentoSection.tsx`
  - Linha ~5: Import de `generateMockFaturamentoData`
  - Linha ~134: Uso em `historicalData`


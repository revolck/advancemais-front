/**
 * Dados mockados para faturamento
 * TODO: Remover quando a API estiver retornando dados reais
 */

export interface MockFaturamentoDataPoint
  extends Record<string, string | number> {
  date: string; // Formato YYYY-MM-DD
  faturamento: number;
  transacoes: number;
  transacoesAprovadas: number;
  cursos: number;
}

/**
 * Gera dados mockados dos últimos 30 dias
 */
export function generateMockFaturamentoData(): MockFaturamentoDataPoint[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalizar para início do dia
  const data: MockFaturamentoDataPoint[] = [];

  // Valores base para simulação
  const baseFaturamento = 50000; // R$ 50.000 base
  const baseTransacoes = 150;
  const baseCursos = 8;

  // Gerar dados dos últimos 30 dias (passado, não futuro)
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i); // Subtrair dias (dados do passado)
    date.setHours(0, 0, 0, 0);

    // Garantir que a data não seja futura
    if (date > today) {
      continue; // Pular datas futuras
    }

    // Variação aleatória para simular flutuações
    const variation = (Math.random() - 0.5) * 0.3; // ±15%
    const trendFactor = 1 + (29 - i) * 0.01; // Tendência ligeiramente crescente

    const transacoes = Math.max(
      0,
      Math.round(baseTransacoes * trendFactor * (1 + variation * 0.5))
    );
    // Transações aprovadas são geralmente 90-95% das transações totais
    const transacoesAprovadas = Math.round(transacoes * (0.9 + Math.random() * 0.05));

    data.push({
      date: date.toISOString().split("T")[0], // Formato YYYY-MM-DD
      faturamento: Math.max(
        0,
        Math.round(baseFaturamento * trendFactor * (1 + variation))
      ),
      transacoes,
      transacoesAprovadas,
      cursos: Math.max(0, Math.round(baseCursos * (1 + variation * 0.3))),
    });
  }

  return data;
}

/**
 * Dados mockados estáticos (alternativa)
 */
export const mockFaturamentoData: MockFaturamentoDataPoint[] =
  generateMockFaturamentoData();

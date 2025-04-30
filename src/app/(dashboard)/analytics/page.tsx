import React from 'react';

const AnalyticsDashboardPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Dashboard Analytics</h1>
      <p className="mb-4">
        Bem-vindo ao painel de análise. Esta é uma página de exemplo para o desenvolvimento do
        design.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Cards de estatísticas de exemplo */}
        {['Usuários', 'Vendas', 'Tráfego', 'Conversões'].map((item, index) => (
          <div key={index} className="p-4 bg-card rounded-lg shadow">
            <h3 className="text-default-700 font-medium">{item}</h3>
            <p className="text-2xl font-bold">{Math.floor(Math.random() * 10000)}</p>
            <p className="text-default-500 text-sm">Últimos 30 dias</p>
          </div>
        ))}
      </div>

      <div className="bg-card p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Gráfico de Exemplo</h2>
        <div className="w-full h-64 bg-default-100 rounded-md flex items-center justify-center">
          <p className="text-default-500">Área para implementação de gráfico</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboardPage;

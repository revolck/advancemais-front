import http from "node:http";

/**
 * API simulada para as páginas que buscam dados no servidor do Next (o Playwright só
 * intercepta o que sai do navegador). O front de dev aponta a API para localhost:3000;
 * se já houver algo nessa porta (a API local de verdade), o teste para em vez de usá-la.
 */

export type RespostaSimulada = { status?: number; body: unknown };
export type RotaDoServidor = (url: URL, metodo: string) => RespostaSimulada | undefined;

export async function subirApiSimulada(rota: RotaDoServidor, porta = 3000) {
  const servidor = http.createServer((req, res) => {
    const url = new URL(req.url ?? "/", `http://localhost:${porta}`);
    const resposta = rota(url, req.method ?? "GET") ?? { body: { success: true, data: [] } };
    res.writeHead(resposta.status ?? 200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(resposta.body));
  });

  await new Promise<void>((resolve, reject) => {
    servidor.once("error", (erro: NodeJS.ErrnoException) =>
      reject(
        erro.code === "EADDRINUSE"
          ? new Error(
              `A porta ${porta} está em uso (API local rodando?). Pare-a para rodar este teste: ele não usa dados reais.`
            )
          : erro
      )
    );
    // Sem host: atende localhost em IPv4 e IPv6
    servidor.listen(porta, () => resolve());
  });

  return () => new Promise<void>((resolve) => servidor.close(() => resolve()));
}

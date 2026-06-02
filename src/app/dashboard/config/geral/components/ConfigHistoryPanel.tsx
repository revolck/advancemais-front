"use client";

import React from "react";
import { Clock, History } from "lucide-react";

import { getConfiguracoesGeraisHistorico } from "@/api/configuracoes-gerais";
import type { ConfiguracoesGeraisHistoricoItem } from "@/api/configuracoes-gerais/types";
import { Badge } from "@/components/ui/badge";
import { ButtonCustom } from "@/components/ui/custom/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toastCustom } from "@/components/ui/custom/toast";

interface ConfigHistoryPanelProps {
  refreshKey?: number;
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function categoryLabel(value?: string | null) {
  const labels: Record<string, string> = {
    mercadopago: "Mercado Pago",
    emails: "E-mails",
    agenda: "Agenda",
    logs: "Logs",
    uploads: "Uploads",
    integracoes: "Integrações",
  };

  return value ? (labels[value] ?? value) : "Sistema";
}

export function ConfigHistoryPanel({ refreshKey }: ConfigHistoryPanelProps) {
  const [items, setItems] = React.useState<ConfiguracoesGeraisHistoricoItem[]>(
    [],
  );
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const loadHistory = React.useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await getConfiguracoesGeraisHistorico({
        page: 1,
        pageSize: 20,
      });
      setItems(response.data);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível carregar o histórico.";
      toastCustom.error({
        title: "Histórico indisponível",
        description: message,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    void loadHistory();
  }, [loadHistory, refreshKey]);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-20 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <section className="rounded-3xl border border-border bg-white p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-foreground">
            <History className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Histórico de alterações</h3>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Veja quem alterou as configurações e quando a mudança foi feita.
          </p>
        </div>
        <ButtonCustom
          type="button"
          variant="outline"
          size="md"
          withAnimation={false}
          isLoading={refreshing}
          onClick={() => loadHistory(true)}
          disabled={refreshing}
        >
          {!refreshing && <Clock className="h-4 w-4" />}
          Atualizar
        </ButtonCustom>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
          Nenhuma alteração registrada ainda.
        </div>
      ) : (
        <div className="divide-y divide-border rounded-2xl border border-border">
          {items.map((item) => (
            <article key={item.id} className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">
                      {categoryLabel(item.categoria)}
                    </Badge>
                    <span className="text-sm font-semibold text-foreground">
                      {item.acao}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {item.descricao}
                  </p>
                  {item.usuario && (
                    <p className="text-xs text-muted-foreground">
                      Feito por{" "}
                      {item.usuario.nome ||
                        item.usuario.email ||
                        "usuário não informado"}
                    </p>
                  )}
                </div>
                <time className="text-xs text-muted-foreground">
                  {formatDate(item.criadoEm)}
                </time>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

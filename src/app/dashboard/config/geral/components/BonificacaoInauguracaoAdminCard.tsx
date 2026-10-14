"use client";

import React from "react";
import { Gift } from "lucide-react";

import {
  aplicarBonificacaoInauguracao,
  getPreviaBonificacaoInauguracao,
  type PreviaBonificacaoInauguracao,
} from "@/api/empresas/bonificacao";
import { ButtonCustom } from "@/components/ui/custom";
import {
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/custom/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { toastCustom } from "@/components/ui/custom/toast";

const numero = (valor: number) => valor.toLocaleString("pt-BR");
const data = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });

/** Admin: prévia e aplicação do mês grátis de inauguração para as empresas */
export function BonificacaoInauguracaoAdminCard() {
  const [previa, setPrevia] = React.useState<PreviaBonificacaoInauguracao | null>(
    null
  );
  const [carregando, setCarregando] = React.useState(true);
  const [aplicando, setAplicando] = React.useState(false);
  const [confirmar, setConfirmar] = React.useState(false);

  const carregar = React.useCallback(async () => {
    try {
      setPrevia((await getPreviaBonificacaoInauguracao()).data);
    } catch (error) {
      toastCustom.error({
        title: "Prévia indisponível",
        description: error instanceof Error ? error.message : "Tente novamente.",
      });
    } finally {
      setCarregando(false);
    }
  }, []);

  React.useEffect(() => {
    void carregar();
  }, [carregar]);

  const aplicar = async () => {
    setAplicando(true);
    try {
      const { data: r } = await aplicarBonificacaoInauguracao();
      toastCustom.success({
        title: "Bonificação aplicada",
        description: `${numero(r.criadas)} empresa(s) receberam 1 mês grátis do plano ${r.plano}${
          r.convertidas
            ? ` e ${numero(r.convertidas)} empresa(s) que já tinham 1 mês grátis do admin entraram na bonificação`
            : ""
        }. Válido até ${data(r.validoAte)}.`,
      });
      setConfirmar(false);
      await carregar();
    } catch (error) {
      toastCustom.error({
        title: "Não foi possível aplicar",
        description: error instanceof Error ? error.message : "Tente novamente.",
      });
    } finally {
      setAplicando(false);
    }
  };

  if (carregando) return <Skeleton className="h-36 w-full" />;
  if (!previa) return null;

  const pendentes = previa.elegiveis + previa.concessoesAdminParaConverter;

  return (
    <section className="rounded-xl border border-border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
            <Gift className="h-5 w-5" />
          </div>
          <div>
            <h4 className="!mb-1">Mês grátis de inauguração (empresas)</h4>
            <p className="!mb-0 !text-sm text-muted-foreground">
              Plano {previa.plano?.nome ?? "—"}
              {previa.plano ? ` (${previa.plano.quantidadeVagas} vagas)` : ""} de{" "}
              {data(previa.inicio)} até {data(previa.validoAte)}. Depois disso as
              vagas voltam para rascunho e a empresa é avisada para contratar.
            </p>
          </div>
        </div>
        <ButtonCustom
          variant="primary"
          size="sm"
          disabled={previa.encerrada || pendentes === 0 || !previa.plano}
          onClick={() => setConfirmar(true)}
        >
          {pendentes === 0 ? "Tudo aplicado" : "Aplicar bonificação"}
        </ButtonCustom>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["Vão receber agora", previa.elegiveis],
          ["Empresas com mês grátis do admin a ajustar", previa.concessoesAdminParaConverter],
          ["Já com a bonificação", previa.jaBonificadas],
          ["Com plano próprio (mantido)", previa.comPlanoAtivo],
        ].map(([rotulo, valor]) => (
          <div key={rotulo as string} className="rounded-lg bg-muted/30 p-3">
            <p className="!mb-0 !text-xs text-muted-foreground">{rotulo}</p>
            <p className="!mb-0 text-xl font-semibold text-gray-900">
              {numero(valor as number)}
            </p>
          </div>
        ))}
      </div>
      {previa.excluidas.length > 0 ? (
        <p className="!mb-0 !mt-3 !text-xs text-muted-foreground">
          Fora da bonificação: {previa.excluidas.map((e) => e.nomeCompleto).join(", ")}.
        </p>
      ) : null}

      <ModalCustom
        isOpen={confirmar}
        onClose={() => !aplicando && setConfirmar(false)}
        size="md"
        backdrop="blur"
      >
        <ModalContentWrapper>
          <ModalHeader>
            <ModalTitle>Aplicar o mês grátis?</ModalTitle>
          </ModalHeader>
          <ModalBody className="space-y-2 text-sm">
            <p className="!mb-0">
              <strong>{numero(previa.elegiveis)}</strong> empresa(s) recebem{" "}
              <strong>1 mês grátis</strong> do plano {previa.plano?.nome}, até{" "}
              {data(previa.validoAte)}.
              {previa.concessoesAdminParaConverter > 0 ? (
                <>
                  {" "}
                  As <strong>{numero(previa.concessoesAdminParaConverter)}</strong>{" "}
                  empresa(s) que já tinham 1 mês grátis lançado pelo admin entram na
                  mesma bonificação (mesmo prazo, sem cobrança).
                </>
              ) : null}
            </p>
            <p className="!mb-0 text-muted-foreground">
              Nenhum e-mail é enviado agora. A empresa vê o presente ao entrar na
              plataforma. Pode aplicar de novo depois para empresas novas.
            </p>
          </ModalBody>
          <ModalFooter>
            <div className="flex w-full justify-end gap-3">
              <ButtonCustom
                variant="outline"
                onClick={() => setConfirmar(false)}
                disabled={aplicando}
              >
                Cancelar
              </ButtonCustom>
              <ButtonCustom
                variant="primary"
                onClick={() => void aplicar()}
                isLoading={aplicando}
                loadingText="Aplicando..."
              >
                Aplicar
              </ButtonCustom>
            </div>
          </ModalFooter>
        </ModalContentWrapper>
      </ModalCustom>
    </section>
  );
}

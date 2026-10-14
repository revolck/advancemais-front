import type { SituacaoBonificacao } from "@/api/empresas/bonificacao";
import type { TutoriaisUsuario } from "@/api/usuarios/tutoriais";

/** Tour de primeiro acesso das empresas (mude o sufixo para mostrar uma versão nova a todos) */
export const TOUR_EMPRESA = "EMPRESA_PRIMEIRO_ACESSO_V1";

export type AcaoAssistente =
  | "INICIAR_TOUR"
  | "PUBLICAR_VAGA"
  | "VER_PLANOS"
  | "AGORA_NAO"
  | "FECHAR";

export interface BotaoAssistente {
  acao: AcaoAssistente;
  rotulo: string;
  principal?: boolean;
}

export type MotivoConversa =
  | "PLANO_GRATUITO_EXPIRADO"
  | "BONIFICACAO"
  | "PRIMEIRO_ACESSO"
  | "AJUDA"
  | "TOUR_CONCLUIDO";

export interface Conversa {
  motivo: MotivoConversa;
  /** Abre sozinho ao entrar (senão só quando a empresa clica no robô) */
  abrirSozinho: boolean;
  /** Mesma animação de compra aprovada */
  comemorar: boolean;
  mensagens: string[];
  botoes: BotaoAssistente[];
}

interface Contexto {
  nomeEmpresa: string;
  situacao: SituacaoBonificacao | null;
  tutoriais: TutoriaisUsuario;
  /** O aviso de plano encerrado já foi dispensado hoje */
  expiradoDispensadoHoje: boolean;
}

const primeiroNome = (nome: string) => nome.trim().split(/\s+/)[0] || nome;

export const formatarDiaMes = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "numeric",
    month: "long",
  });

const tourFeito = (tutoriais: TutoriaisUsuario) => Boolean(tutoriais[TOUR_EMPRESA]);

/**
 * O que o assistente diz para a empresa, em ordem de prioridade:
 * plano gratuito encerrado → presente de inauguração → tour de primeiro acesso → ajuda.
 */
export function escolherConversa({
  nomeEmpresa,
  situacao,
  tutoriais,
  expiradoDispensadoHoje,
}: Contexto): Conversa {
  const ola = `Oi, ${primeiroNome(nomeEmpresa)}! 👋 Eu sou o assistente da Advance+.`;
  const fezTour = tourFeito(tutoriais);

  if (situacao?.gratuitoExpirado) {
    const periodo = situacao.gratuitoExpirado.inauguracao ? "mês grátis" : "período gratuito";
    return {
      motivo: "PLANO_GRATUITO_EXPIRADO",
      abrirSozinho: !expiradoDispensadoHoje,
      comemorar: false,
      mensagens: [
        `⏳ Seu ${periodo} chegou ao fim. Esperamos que a nova Advance+ tenha ajudado a sua empresa a encontrar ótimos talentos!`,
        "Suas vagas foram salvas como rascunho, então nada foi perdido. Escolha um plano para republicá-las e continuar recebendo candidatos.",
      ],
      botoes: [
        { acao: "VER_PLANOS", rotulo: "Ver planos", principal: true },
        { acao: "AGORA_NAO", rotulo: "Agora não" },
      ],
    };
  }

  const bonus = situacao?.bonificacao ?? null;
  if (bonus?.exibir) {
    const vagas = `${bonus.quantidadeVagas} vaga${bonus.quantidadeVagas === 1 ? "" : "s"}`;
    return {
      motivo: "BONIFICACAO",
      abrirSozinho: true,
      comemorar: true,
      mensagens: [
        ola,
        `🎁 Presente de inauguração: a nova Advance+ chegou e trouxe 1 mês grátis do plano ${bonus.planoNome} para a sua empresa!`,
        `Até ${formatarDiaMes(bonus.validoAte)}, publique até ${vagas}, receba candidatos e conduza seus processos seletivos sem pagar nada. É a nossa forma de dizer obrigado por fazer parte desta nova fase!`,
        fezTour
          ? "Que tal publicar sua primeira vaga agora?"
          : "Quer que eu te mostre a plataforma? Leva menos de 1 minuto.",
      ],
      botoes: fezTour
        ? [
            { acao: "PUBLICAR_VAGA", rotulo: "Publicar minha primeira vaga", principal: true },
            { acao: "FECHAR", rotulo: "Explorar a plataforma" },
          ]
        : [
            { acao: "INICIAR_TOUR", rotulo: "Fazer o tour", principal: true },
            { acao: "PUBLICAR_VAGA", rotulo: "Publicar minha primeira vaga" },
            { acao: "AGORA_NAO", rotulo: "Agora não" },
          ],
    };
  }

  if (!fezTour) {
    return {
      motivo: "PRIMEIRO_ACESSO",
      abrirSozinho: true,
      comemorar: false,
      mensagens: [
        ola,
        "É sua primeira vez por aqui? Posso te mostrar onde fica cada coisa. Leva menos de 1 minuto.",
      ],
      botoes: [
        { acao: "INICIAR_TOUR", rotulo: "Fazer o tour", principal: true },
        { acao: "AGORA_NAO", rotulo: "Agora não" },
      ],
    };
  }

  return {
    motivo: "AJUDA",
    abrirSozinho: false,
    comemorar: false,
    mensagens: [
      `Oi, ${primeiroNome(nomeEmpresa)}! Como posso ajudar?`,
      ...(bonus ? [`🎁 Seu mês grátis do plano ${bonus.planoNome} vai até ${formatarDiaMes(bonus.validoAte)}.`] : []),
    ],
    botoes: [
      { acao: "PUBLICAR_VAGA", rotulo: "Publicar uma vaga", principal: true },
      { acao: "INICIAR_TOUR", rotulo: "Ver o tour de novo" },
      { acao: "VER_PLANOS", rotulo: "Ver planos" },
    ],
  };
}

/** Mensagem do fim do tour */
export const conversaTourConcluido = (): Conversa => ({
  motivo: "TOUR_CONCLUIDO",
  abrirSozinho: true,
  comemorar: false,
  mensagens: [
    "Pronto! 🎉 Agora você já sabe onde fica cada coisa.",
    "Quer publicar sua primeira vaga agora? Se precisar, é só clicar em mim aqui no canto.",
  ],
  botoes: [
    { acao: "PUBLICAR_VAGA", rotulo: "Publicar minha primeira vaga", principal: true },
    { acao: "FECHAR", rotulo: "Depois" },
  ],
});

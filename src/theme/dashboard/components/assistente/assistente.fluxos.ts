import type { SituacaoBonificacao } from "@/api/empresas/bonificacao";
import type { ContextoEmpresa } from "@/api/usuarios/assistente";
import type { TutoriaisUsuario } from "@/api/usuarios/tutoriais";

/** Tour de primeiro acesso das empresas (mude o sufixo para mostrar uma versão nova a todos) */
export const TOUR_EMPRESA = "EMPRESA_PRIMEIRO_ACESSO_V1";

export const CENTRAL_DE_AJUDA = "https://ajuda.advancemais.com";
const PAGINA_CANDIDATOS = "/dashboard/empresas/candidatos";
const PAGINA_ENTREVISTAS = "/dashboard/empresas/entrevistas";

export type AcaoAssistente =
  | "INICIAR_TOUR"
  | "PUBLICAR_VAGA"
  | "VER_PLANOS"
  | "AGORA_NAO"
  | "FECHAR"
  /** Abre `href` (página do painel, ou outra aba se `externo`) */
  | "IR"
  | "AJUDA";

export interface BotaoAssistente {
  acao: AcaoAssistente;
  rotulo: string;
  principal?: boolean;
  href?: string;
  externo?: boolean;
}

export type MotivoConversa =
  | "PLANO_GRATUITO_EXPIRADO"
  | "BONIFICACAO"
  | "PRIMEIRO_ACESSO"
  | "AJUDA"
  | "TOUR_CONCLUIDO"
  | "BOAS_VINDAS"
  | "ENTREVISTA"
  | "RESUMO_DO_DIA";

export interface Conversa {
  motivo: MotivoConversa;
  /** Abre sozinho ao entrar (senão só quando a pessoa clica no robô) */
  abrirSozinho: boolean;
  /** Mesma animação de compra aprovada */
  comemorar: boolean;
  mensagens: string[];
  botoes: BotaoAssistente[];
  /** Bolinha no robô: há algo para ver, mesmo sem abrir sozinho */
  novidade?: boolean;
  /** Ao fechar ou clicar, marca este tutorial como visto (não abre sozinho de novo) */
  marcaTutorial?: string;
  /** Ao fechar, não abre sozinho de novo hoje (chave do aviso) */
  dispensaDiaria?: string;
}

interface Contexto {
  nomeEmpresa: string;
  situacao: SituacaoBonificacao | null;
  tutoriais: TutoriaisUsuario;
  /** O aviso de plano encerrado já foi dispensado hoje */
  expiradoDispensadoHoje: boolean;
  /** Plano e uso de vagas (ausente se a API ainda não respondeu) */
  contexto?: ContextoEmpresa | null;
}

export const primeiroNome = (nome: string) => nome.trim().split(/\s+/)[0] || nome;

export const formatarDiaMes = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "numeric",
    month: "long",
  });

/** "amanhã às 14:00", "hoje às 9:30", "20 de outubro às 10:00" */
export function quando(iso: string, agora = new Date()) {
  const dia = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
  const data = new Date(iso);
  const hora = data.toLocaleTimeString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
  });
  const diferenca = Math.round((Date.parse(dia(data)) - Date.parse(dia(agora))) / 86_400_000);
  if (diferenca === 0) return `hoje às ${hora}`;
  if (diferenca === 1) return `amanhã às ${hora}`;
  return `${formatarDiaMes(iso)} às ${hora}`;
}

export const plural = (n: number, um: string, varios: string) =>
  `${n.toLocaleString("pt-BR")} ${n === 1 ? um : varios}`;

const tourFeito = (tutoriais: TutoriaisUsuario) => Boolean(tutoriais[TOUR_EMPRESA]);

export type SituacaoPublicacao =
  | { pode: true; emUso?: number; limite?: number | null }
  | { pode: false; motivo: "SEM_PLANO" }
  | { pode: false; motivo: "LIMITE"; emUso: number; limite: number };

/**
 * A empresa pode publicar? Precisa de plano ativo (ou vagas ilimitadas) e de vaga
 * livre no plano. Vagas em análise já contam, porque viram publicadas na aprovação.
 */
export function situacaoDePublicacao(contexto?: ContextoEmpresa | null): SituacaoPublicacao {
  if (!contexto) return { pode: true }; // sem dados: a tela de cadastro valida
  if (contexto.vagasIlimitadas) return { pode: true };
  if (!contexto.plano) return { pode: false, motivo: "SEM_PLANO" };
  const emUso = contexto.vagas.publicadas + contexto.vagas.emAnalise;
  const limite = contexto.plano.limiteVagas;
  if (limite && emUso >= limite) return { pode: false, motivo: "LIMITE", emUso, limite };
  return { pode: true, emUso, limite };
}

/** Publicar vaga quando pode; senão, o caminho para liberar (plano ou upgrade) */
function botaoPublicar(publicacao: SituacaoPublicacao, rotulo: string): BotaoAssistente {
  if (publicacao.pode) return { acao: "PUBLICAR_VAGA", rotulo, principal: true };
  return {
    acao: "VER_PLANOS",
    rotulo: publicacao.motivo === "LIMITE" ? "Fazer upgrade do plano" : "Escolher um plano",
    principal: true,
  };
}

/**
 * O que o assistente diz para a empresa, em ordem de prioridade:
 * plano gratuito encerrado → presente de inauguração → tour de primeiro acesso → ajuda.
 */
export function escolherConversa({
  nomeEmpresa,
  situacao,
  tutoriais,
  expiradoDispensadoHoje,
  contexto,
}: Contexto): Conversa {
  const ola = `Oi, ${primeiroNome(nomeEmpresa)}! 👋 Eu sou o assistente da Advance+.`;
  const fezTour = tourFeito(tutoriais);
  const publicacao = situacaoDePublicacao(contexto);

  if (situacao?.gratuitoExpirado) {
    const periodo = situacao.gratuitoExpirado.inauguracao ? "mês grátis" : "período gratuito";
    return {
      motivo: "PLANO_GRATUITO_EXPIRADO",
      abrirSozinho: !expiradoDispensadoHoje,
      comemorar: false,
      novidade: true,
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
      novidade: true,
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
            botaoPublicar(publicacao, "Publicar minha primeira vaga"),
            { acao: "FECHAR", rotulo: "Explorar a plataforma" },
          ]
        : [
            { acao: "INICIAR_TOUR", rotulo: "Fazer o tour", principal: true },
            { ...botaoPublicar(publicacao, "Publicar minha primeira vaga"), principal: false },
            { acao: "AGORA_NAO", rotulo: "Agora não" },
          ],
    };
  }

  if (!fezTour) {
    return {
      motivo: "PRIMEIRO_ACESSO",
      abrirSozinho: true,
      comemorar: false,
      novidade: true,
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

  // Ajuda do dia a dia: só oferece o que a empresa consegue fazer agora
  const mensagens = [`Oi, ${primeiroNome(nomeEmpresa)}! Como posso ajudar?`];
  if (bonus) {
    mensagens.push(
      `🎁 Seu mês grátis do plano ${bonus.planoNome} vai até ${formatarDiaMes(bonus.validoAte)}.`
    );
  }
  if (!publicacao.pode && publicacao.motivo === "SEM_PLANO") {
    mensagens.push(
      "Para publicar vagas, sua empresa precisa de um plano ativo. Suas vagas ficam guardadas como rascunho até lá."
    );
  } else if (!publicacao.pode) {
    mensagens.push(
      `📊 Você está usando ${publicacao.emUso} de ${publicacao.limite} vagas do seu plano. Para publicar mais, faça um upgrade ou encerre uma vaga.`
    );
  } else if (contexto?.plano && publicacao.limite && !bonus) {
    const plano = contexto.plano.nome ? `Plano ${contexto.plano.nome}` : "Seu plano";
    mensagens.push(`📊 ${plano}: ${publicacao.emUso} de ${publicacao.limite} vagas em uso.`);
  }
  if (contexto?.candidatosNovos7Dias) {
    mensagens.push(
      `📥 ${plural(contexto.candidatosNovos7Dias, "candidato novo", "candidatos novos")} nos últimos 7 dias.`
    );
  }
  if (contexto?.entrevistas.proxima) {
    mensagens.push(`📅 Próxima entrevista: ${quando(contexto.entrevistas.proxima)}.`);
  }

  const botoes: BotaoAssistente[] = [botaoPublicar(publicacao, "Publicar uma vaga")];
  if (contexto?.candidatosNovos7Dias) {
    botoes.push({ acao: "IR", rotulo: "Ver candidatos", href: PAGINA_CANDIDATOS });
  }
  if (contexto?.entrevistas.proxima) {
    botoes.push({ acao: "IR", rotulo: "Ver entrevistas", href: PAGINA_ENTREVISTAS });
  }
  botoes.push({ acao: "INICIAR_TOUR", rotulo: "Ver o tour de novo" });
  if (publicacao.pode) botoes.push({ acao: "VER_PLANOS", rotulo: "Ver planos" });

  return {
    motivo: "AJUDA",
    abrirSozinho: false,
    comemorar: false,
    mensagens,
    botoes: botoes.slice(0, 4),
  };
}

/** Mensagem do fim do tour */
export const conversaTourConcluido = (contexto?: ContextoEmpresa | null): Conversa => {
  const publicacao = situacaoDePublicacao(contexto);
  return {
    motivo: "TOUR_CONCLUIDO",
    abrirSozinho: true,
    comemorar: false,
    mensagens: [
      "Pronto! 🎉 Agora você já sabe onde fica cada coisa.",
      publicacao.pode
        ? "Quer publicar sua primeira vaga agora? Se precisar, é só clicar em mim aqui no canto."
        : "Para publicar vagas, escolha um plano. Se precisar, é só clicar em mim aqui no canto.",
    ],
    botoes: [
      botaoPublicar(publicacao, "Publicar minha primeira vaga"),
      { acao: "FECHAR", rotulo: "Depois" },
    ],
  };
};

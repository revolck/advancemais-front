import type { ContextoEquipe } from "@/api/usuarios/assistente";
import type { TutoriaisUsuario } from "@/api/usuarios/tutoriais";
import {
  plural,
  primeiroNome,
  quando,
  type BotaoAssistente,
  type Conversa,
} from "./assistente.fluxos";

/** Boas-vindas da equipe (mude o sufixo para mostrar de novo a todos) */
export const BOAS_VINDAS_EQUIPE = "EQUIPE_BOAS_VINDAS_V1";

/** Uma pendência do dia: frase + atalho para resolver */
interface Item {
  mensagem: string;
  botao?: BotaoAssistente;
  /** Conta como pendência (acende a bolinha do robô) */
  pendencia: boolean;
}

const ir = (rotulo: string, href: string): BotaoAssistente => ({ acao: "IR", rotulo, href });

/** Pendências de cada função, na ordem de importância */
export function itensDaEquipe(role: string, e: ContextoEquipe, agora = new Date()): Item[] {
  const itens: Item[] = [];
  const add = (condicao: unknown, item: Item) => {
    if (condicao) itens.push(item);
  };

  switch (role) {
    case "ADMIN":
    case "MODERADOR":
    case "SETOR_DE_VAGAS":
      add(e.vagasEmAnalise, {
        mensagem: `📝 ${plural(e.vagasEmAnalise ?? 0, "vaga aguarda", "vagas aguardam")} aprovação.`,
        botao: ir("Revisar vagas", "/dashboard/empresas/solicitacoes"),
        pendencia: true,
      });
      add(role !== "SETOR_DE_VAGAS" && e.usuariosPendentes, {
        mensagem: `🔓 ${plural(e.usuariosPendentes ?? 0, "usuário aguarda", "usuários aguardam")} liberação de acesso.`,
        botao: ir("Ver usuários", "/dashboard/usuarios"),
        pendencia: true,
      });
      add(e.empresasNovas7Dias, {
        mensagem: `🏢 ${plural(e.empresasNovas7Dias ?? 0, "empresa nova", "empresas novas")} nos últimos 7 dias.`,
        botao: ir("Ver empresas", "/dashboard/empresas"),
        pendencia: false,
      });
      if (role !== "SETOR_DE_VAGAS") {
        itens.push({
          mensagem: "",
          botao: ir("Comunicado da nova plataforma", "/dashboard/config/geral?tab=comunicado"),
          pendencia: false,
        });
      }
      break;

    case "RECRUTADOR":
      add(e.vagasVinculadas === 0, {
        mensagem:
          "🔗 Ainda não há vagas ou empresas ligadas a você. Peça ao administrador para fazer o vínculo.",
        pendencia: false,
      });
      add(e.entrevistasHoje, {
        mensagem: `📅 ${plural(e.entrevistasHoje ?? 0, "entrevista", "entrevistas")} hoje.`,
        botao: ir("Ver entrevistas", "/dashboard/empresas/entrevistas"),
        pendencia: true,
      });
      add(!e.entrevistasHoje && e.entrevistas?.proxima, {
        mensagem: `📅 Próxima entrevista: ${e.entrevistas?.proxima ? quando(e.entrevistas.proxima, agora) : ""}.`,
        botao: ir("Ver entrevistas", "/dashboard/empresas/entrevistas"),
        pendencia: false,
      });
      add(e.candidatosNovos7Dias, {
        mensagem: `📥 ${plural(e.candidatosNovos7Dias ?? 0, "candidato novo", "candidatos novos")} nas suas vagas nos últimos 7 dias.`,
        botao: ir("Ver candidatos", "/dashboard/empresas/candidatos"),
        pendencia: true,
      });
      add(e.vagasVinculadas, {
        mensagem: "",
        botao: ir("Minhas vagas", "/dashboard/empresas/vagas"),
        pendencia: false,
      });
      break;

    case "INSTRUTOR":
      add(e.turmas === 0, {
        mensagem: "🔗 Ainda não há turmas ligadas a você. Fale com o pedagógico.",
        pendencia: false,
      });
      add(e.aulasHoje, {
        mensagem: `🎬 ${plural(e.aulasHoje ?? 0, "aula", "aulas")} hoje.`,
        botao: ir("Ver aulas", "/dashboard/cursos/aulas"),
        pendencia: true,
      });
      add(e.provasParaCorrigir, {
        mensagem: `✍️ ${plural(e.provasParaCorrigir ?? 0, "prova ou atividade", "provas e atividades")} para corrigir.`,
        botao: ir("Corrigir", "/dashboard/cursos/atividades-provas"),
        pendencia: true,
      });
      add(e.notasPendentes, {
        mensagem: `📊 ${plural(e.notasPendentes ?? 0, "nota pendente", "notas pendentes")} de lançamento.`,
        botao: ir("Lançar notas", "/dashboard/cursos/notas"),
        pendencia: true,
      });
      break;

    case "PEDAGOGICO":
      add(e.certificadosAEmitir, {
        mensagem: `🎓 ${plural(e.certificadosAEmitir ?? 0, "aluno concluiu", "alunos concluíram")} e ainda não ${e.certificadosAEmitir === 1 ? "tem" : "têm"} certificado.`,
        botao: ir("Emitir certificados", "/dashboard/cursos/certificados"),
        pendencia: true,
      });
      add(e.inscricoesAguardandoPagamento, {
        mensagem: `💳 ${plural(e.inscricoesAguardandoPagamento ?? 0, "inscrição aguarda", "inscrições aguardam")} pagamento.`,
        botao: ir("Ver alunos", "/dashboard/cursos/alunos"),
        pendencia: false,
      });
      add(e.turmasEmAndamento, {
        mensagem: `🏫 ${plural(e.turmasEmAndamento ?? 0, "turma em andamento", "turmas em andamento")}.`,
        botao: ir("Ver turmas", "/dashboard/cursos/turmas"),
        pendencia: false,
      });
      break;

    default:
      break;
  }
  return itens;
}

interface ContextoConversaEquipe {
  role: string;
  nome: string;
  equipe: ContextoEquipe | null | undefined;
  tutoriais: TutoriaisUsuario;
  agora?: Date;
}

/**
 * Equipe: boas-vindas uma vez, depois só abre quando a pessoa clica. A bolinha no robô
 * acende quando há pendência (vaga para aprovar, prova para corrigir, entrevista hoje...).
 */
export function escolherConversaEquipe({
  role,
  nome,
  equipe,
  tutoriais,
  agora = new Date(),
}: ContextoConversaEquipe): Conversa {
  const itens = equipe ? itensDaEquipe(role, equipe, agora) : [];
  const frases = itens.map((i) => i.mensagem).filter(Boolean);
  const temPendencia = itens.some((i) => i.pendencia);
  const atalhos = itens
    .map((i) => i.botao)
    .filter((b): b is BotaoAssistente => Boolean(b))
    .filter((b, i, todos) => todos.findIndex((o) => o.href === b.href) === i)
    .slice(0, 3)
    .map((b, i) => ({ ...b, principal: i === 0 }));

  const ola = `Oi, ${primeiroNome(nome)}! 👋`;
  const situacao = equipe
    ? frases.length
      ? frases
      : ["✅ Tudo em dia por aqui. Nenhuma pendência agora."]
    : [];

  if (!tutoriais[BOAS_VINDAS_EQUIPE]) {
    return {
      motivo: "BOAS_VINDAS",
      abrirSozinho: true,
      comemorar: false,
      novidade: true,
      marcaTutorial: BOAS_VINDAS_EQUIPE,
      mensagens: [
        `${ola} Eu sou o assistente da Advance+.`,
        "Aqui eu mostro as suas pendências do dia, com atalhos para resolver cada uma.",
        ...situacao,
        "Se eu estiver atrapalhando, é só clicar em “Ocultar assistente”, aqui embaixo. 😉",
      ],
      botoes: [...atalhos, { acao: "AGORA_NAO", rotulo: "Agora não" }],
    };
  }

  return {
    motivo: "RESUMO_DO_DIA",
    abrirSozinho: false,
    comemorar: false,
    novidade: temPendencia,
    mensagens: [frases.length ? `${ola} Seu resumo de hoje:` : `${ola} Como posso ajudar?`, ...situacao],
    botoes: [...atalhos, { acao: "AJUDA", rotulo: "Central de ajuda", principal: atalhos.length === 0 }],
  };
}

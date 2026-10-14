import type { ContextoAluno } from "@/api/usuarios/assistente";
import type { TutoriaisUsuario } from "@/api/usuarios/tutoriais";
import {
  plural,
  primeiroNome,
  quando,
  type BotaoAssistente,
  type Conversa,
} from "./assistente.fluxos";

/** Boas-vindas do aluno/candidato (mude o sufixo para mostrar de novo a todos) */
export const BOAS_VINDAS_ALUNO = "ALUNO_BOAS_VINDAS_V1";

export const PAGINAS_ALUNO = {
  cursos: "/dashboard/cursos/alunos/cursos",
  curso: (cursoId: string, turmaId: string) =>
    `/dashboard/cursos/alunos/cursos/${cursoId}/${turmaId}`,
  pagamentos: "/dashboard/cursos/pagamentos",
  certificados: "/dashboard/cursos/alunos/certificados",
  novoCurriculo: "/dashboard/curriculo/cadastrar",
  curriculos: "/dashboard/curriculo",
  vagas: "/dashboard/vagas",
  agenda: "/dashboard/agenda",
};

interface ContextoConversaAluno {
  nome: string;
  aluno: ContextoAluno | null | undefined;
  tutoriais: TutoriaisUsuario;
  /** Endereço dos cursos no site (fora do painel) */
  urlCursosDoSite: string;
  /** Aviso já dispensado hoje (chave da conversa) */
  dispensadaHoje: (chave: string) => boolean;
  agora?: Date;
}

const ate = (texto: string, max = 28) =>
  texto.length > max ? `${texto.slice(0, max - 1).trimEnd()}…` : texto;

/** Próximos passos conforme a situação: só oferece o que a pessoa pode fazer agora */
function proximosPassos(aluno: ContextoAluno, urlCursosDoSite: string): BotaoAssistente[] {
  const botoes: BotaoAssistente[] = [];
  const [cursoAtual] = aluno.cursosEmAndamento;

  if (aluno.inscricoesAguardandoPagamento > 0) {
    botoes.push({ acao: "IR", rotulo: "Concluir pagamento", href: PAGINAS_ALUNO.pagamentos });
  }
  if (cursoAtual) {
    botoes.push({
      acao: "IR",
      rotulo: `Continuar ${ate(cursoAtual.curso)}`,
      href: PAGINAS_ALUNO.curso(cursoAtual.cursoId, cursoAtual.turmaId),
    });
  }
  if (aluno.curriculos === 0) {
    botoes.push({ acao: "IR", rotulo: "Criar meu currículo", href: PAGINAS_ALUNO.novoCurriculo });
  } else {
    botoes.push({ acao: "IR", rotulo: "Ver vagas", href: PAGINAS_ALUNO.vagas });
  }
  if (!cursoAtual && aluno.cursosConcluidos === 0) {
    botoes.push({ acao: "IR", rotulo: "Conhecer cursos", href: urlCursosDoSite, externo: true });
  }
  if (aluno.certificados > 0) {
    botoes.push({ acao: "IR", rotulo: "Meus certificados", href: PAGINAS_ALUNO.certificados });
  }

  return botoes.slice(0, 3).map((botao, i) => ({ ...botao, principal: i === 0 }));
}

/** O que está acontecendo, em frases curtas */
function resumo(aluno: ContextoAluno, agora: Date): string[] {
  const linhas: string[] = [];
  const [cursoAtual, ...outros] = aluno.cursosEmAndamento;

  if (cursoAtual) {
    linhas.push(
      outros.length
        ? `📚 Você está cursando ${cursoAtual.curso} e mais ${plural(outros.length, "curso", "cursos")}.`
        : `📚 Você está cursando ${cursoAtual.curso}.`
    );
  } else if (aluno.cursosConcluidos > 0) {
    linhas.push(
      `🎓 Você já concluiu ${plural(aluno.cursosConcluidos, "curso", "cursos")}. Que tal o próximo?`
    );
  } else {
    linhas.push("📚 Você ainda não está em nenhum curso. Conheça os cursos da Advance+.");
  }

  if (aluno.inscricoesAguardandoPagamento > 0) {
    linhas.push(
      `💳 ${plural(aluno.inscricoesAguardandoPagamento, "inscrição aguarda", "inscrições aguardam")} o pagamento para liberar as aulas.`
    );
  }

  if (aluno.curriculos === 0) {
    linhas.push("📄 Para se candidatar às vagas, crie seu currículo. Leva poucos minutos.");
  } else if (aluno.candidaturas > 0) {
    linhas.push(
      `💼 Você tem ${plural(aluno.candidaturas, "candidatura", "candidaturas")}. Novas vagas chegam toda semana.`
    );
  } else {
    linhas.push("💼 Seu currículo está pronto. Que tal se candidatar a uma vaga?");
  }

  if (aluno.entrevistas.proxima) {
    linhas.push(`📅 Próxima entrevista: ${quando(aluno.entrevistas.proxima, agora)}.`);
  }
  return linhas;
}

/**
 * O que o assistente diz para o aluno/candidato, em ordem de prioridade:
 * entrevista em até 2 dias → boas-vindas (uma vez) → ajuda do dia a dia.
 */
export function escolherConversaAluno({
  nome,
  aluno,
  tutoriais,
  urlCursosDoSite,
  dispensadaHoje,
  agora = new Date(),
}: ContextoConversaAluno): Conversa {
  const ola = `Oi, ${primeiroNome(nome)}! 👋`;

  if (!aluno) {
    return {
      motivo: "AJUDA",
      abrirSozinho: false,
      comemorar: false,
      mensagens: [`${ola} Como posso ajudar?`],
      botoes: [
        { acao: "IR", rotulo: "Meus cursos", href: PAGINAS_ALUNO.cursos, principal: true },
        { acao: "IR", rotulo: "Ver vagas", href: PAGINAS_ALUNO.vagas },
        { acao: "AJUDA", rotulo: "Central de ajuda" },
      ],
    };
  }

  const proxima = aluno.entrevistas.proxima;
  const emDoisDias = proxima && Date.parse(proxima) - agora.getTime() <= 2 * 86_400_000;
  if (proxima && emDoisDias) {
    const chave = `entrevista:${proxima}`;
    return {
      motivo: "ENTREVISTA",
      abrirSozinho: !dispensadaHoje(chave),
      comemorar: false,
      novidade: true,
      dispensaDiaria: chave,
      mensagens: [
        `${ola} Lembrete importante:`,
        `📅 Você tem uma entrevista ${quando(proxima, agora)}.`,
        "Confira os detalhes e o link na agenda. Dica: entre alguns minutos antes e deixe o currículo à mão. Boa sorte! 🍀",
      ],
      botoes: [
        { acao: "IR", rotulo: "Ver na agenda", href: PAGINAS_ALUNO.agenda, principal: true },
        { acao: "FECHAR", rotulo: "Entendi" },
      ],
    };
  }

  const passos = proximosPassos(aluno, urlCursosDoSite);

  if (!tutoriais[BOAS_VINDAS_ALUNO]) {
    return {
      motivo: "BOAS_VINDAS",
      abrirSozinho: true,
      comemorar: false,
      novidade: true,
      marcaTutorial: BOAS_VINDAS_ALUNO,
      mensagens: [
        `${ola} Eu sou o assistente da Advance+.`,
        "Estou aqui para te ajudar com seus cursos, seu currículo e as vagas de emprego.",
        ...resumo(aluno, agora),
        "Se eu estiver atrapalhando, é só me ocultar no ícone de olho aqui em cima. 😉",
      ],
      botoes: [...passos, { acao: "AGORA_NAO", rotulo: "Agora não" }],
    };
  }

  return {
    motivo: "AJUDA",
    abrirSozinho: false,
    comemorar: false,
    novidade: aluno.inscricoesAguardandoPagamento > 0,
    mensagens: [`${ola} Como posso ajudar?`, ...resumo(aluno, agora)],
    botoes: [...passos, { acao: "AJUDA", rotulo: "Central de ajuda" }],
  };
}

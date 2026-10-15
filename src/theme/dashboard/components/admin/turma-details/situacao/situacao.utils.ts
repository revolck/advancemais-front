import type {
  ResultadoAdicao,
  ResultadoRemocao,
  ResumoSituacao,
  SituacaoInscricao,
} from "@/api/cursos/situacao";

export interface OpcaoSituacao {
  valor: SituacaoInscricao;
  rotulo: string;
  /** Como fica o certificado */
  efeito: string;
  /** Tira o certificado: pede atenção na confirmação */
  revoga: boolean;
}

export const OPCOES_SITUACAO: OpcaoSituacao[] = [
  {
    valor: "CONCLUIU",
    rotulo: "Concluiu",
    efeito: "Pode receber certificado. Se tinha um revogado, ele volta a valer (mesmo código).",
    revoga: false,
  },
  {
    valor: "NAO_CONCLUIU",
    rotulo: "Não concluiu",
    efeito:
      "Continua na lista da turma como “não concluiu” e perde o acesso às aulas. O certificado, se houver, é revogado.",
    revoga: true,
  },
  {
    valor: "REPROVADO",
    rotulo: "Reprovado",
    efeito: "Fica registrado como reprovado. O certificado, se houver, é revogado.",
    revoga: true,
  },
  {
    valor: "TRANCADO",
    rotulo: "Trancado",
    efeito: "Matrícula pausada. O certificado, se houver, é revogado.",
    revoga: true,
  },
  {
    valor: "CURSANDO",
    rotulo: "Voltar para cursando",
    efeito: "Ainda está fazendo o curso. O certificado, se houver, é revogado até concluir.",
    revoga: true,
  },
];

export const opcaoDa = (valor: SituacaoInscricao) =>
  OPCOES_SITUACAO.find((o) => o.valor === valor) ?? OPCOES_SITUACAO[0];

const n = (valor: number, um: string, varios: string) =>
  `${valor.toLocaleString("pt-BR")} ${valor === 1 ? um : varios}`;

/** Frases da prévia, na ordem em que importam */
export function frasesDoResumo(resumo: ResumoSituacao): string[] {
  const frases = [
    `${n(resumo.atingidos, "aluno atingido", "alunos atingidos")}; ${n(
      resumo.mudam,
      "muda",
      "mudam"
    )} de situação.`,
  ];
  if (resumo.certificadosARevogar > 0) {
    frases.push(
      `${n(resumo.certificadosARevogar, "certificado será revogado", "certificados serão revogados")} (deixam de valer na consulta pública).`
    );
  }
  if (resumo.certificadosARestaurar > 0) {
    frases.push(
      `${n(resumo.certificadosARestaurar, "certificado volta", "certificados voltam")} a valer.`
    );
  }
  if (resumo.concluintesSemCertificado > 0) {
    frases.push(
      `${n(resumo.concluintesSemCertificado, "concluinte ainda não tem", "concluintes ainda não têm")} certificado: emita depois em “Emitir certificados dos concluintes”.`
    );
  }
  if (resumo.jaNaSituacao > 0) {
    frases.push(`${n(resumo.jaNaSituacao, "aluno já estava", "alunos já estavam")} nessa situação.`);
  }
  return frases;
}

/** Turmas migradas do sistema antigo (código MIGT…): o aviso ao aluno vem desligado */
export const ehTurmaMigrada = (codigo?: string | null) => /^MIGT/i.test(codigo ?? "");

/** A cobrança é paga no checkout do site, que só vende turma aberta */
export function motivoSemCobranca(statusTurma?: string | null): string | null {
  const status = (statusTurma ?? "").toUpperCase();
  if (status === "CONCLUIDO") return "Turma concluída não é vendida no site.";
  if (status === "RASCUNHO") return "Turma em rascunho não é vendida no site.";
  return null;
}

/** CPF digitado com pontos e traço vira só números (é como está no cadastro) */
export function termoDeBusca(texto: string): string {
  const termo = texto.trim();
  return /^[\d.\-\s/]+$/.test(termo) ? termo.replace(/\D/g, "") : termo;
}

const v = (valor: number, um: string, varios: string) => (valor === 1 ? um : varios);

/** Prévia de quem entra: o que acontece (frases) e o que pede atenção (alertas) */
export function frasesDaAdicao(r: ResultadoAdicao): { frases: string[]; alertas: string[] } {
  const frases: string[] = [];
  if (r.adicionar.length > 0) {
    frases.push(`${n(r.adicionar.length, "aluno entra", "alunos entram")} na turma.`);
  }
  if (r.reativar.length > 0) {
    frases.push(
      `${n(r.reativar.length, "aluno volta", "alunos voltam")} para a turma (${v(
        r.reativar.length,
        "tinha sido removido",
        "tinham sido removidos"
      )}), com a situação de antes.`
    );
  }
  if (r.jaNaTurma.length > 0) {
    frases.push(
      `${n(r.jaNaTurma.length, "aluno já está", "alunos já estão")} na turma e ${v(
        r.jaNaTurma.length,
        "fica",
        "ficam"
      )} como ${v(r.jaNaTurma.length, "está", "estão")}.`
    );
  }
  frases.push(
    r.vagas.limite === null
      ? "Vagas ilimitadas."
      : `Vagas: ${r.vagas.ocupadas} de ${r.vagas.limite} ocupadas; ${v(
          r.vagas.depois,
          "fica",
          "ficam"
        )} ${r.vagas.depois}.`
  );

  const alertas: string[] = [];
  const { avisos } = r;
  if (avisos.turmaConcluida) {
    alertas.push(
      "A turma já foi concluída. O aluno entra como cursando: depois mude a situação para “Concluiu” ou “Não concluiu”."
    );
  } else {
    if (avisos.turmaIniciada) {
      alertas.push("A turma já começou: o aluno passa a ver o conteúdo já liberado.");
    }
    if (avisos.prazoDeInscricaoEncerrado) {
      alertas.push("O prazo de inscrição já terminou; a equipe pode adicionar mesmo assim.");
    }
  }
  if (avisos.excedeVagas && r.vagas.limite !== null) {
    alertas.push(`Passa do limite de vagas: ${r.vagas.depois} alunos para ${r.vagas.limite} vagas.`);
  }
  avisos.outrasTurmasDoCurso.forEach((o) => {
    alertas.push(`${o.nome} já está em outra turma deste curso (${o.turma}).`);
  });
  return { frases, alertas };
}

/** Turma concluída ou vagas estouradas: a equipe confirma que viu */
export const adicaoPedeCiencia = (r: ResultadoAdicao) =>
  r.avisos.turmaConcluida || r.avisos.excedeVagas;

export function frasesDaRemocao(r: ResultadoRemocao): string[] {
  const frases: string[] = [];
  if (r.remover.length > 0) {
    frases.push(
      `${n(r.remover.length, "aluno sai", "alunos saem")} da turma e ${v(
        r.remover.length,
        "perde",
        "perdem"
      )} o acesso. Notas, frequência e histórico ficam guardados.`
    );
  }
  if (r.certificadosARevogar > 0) {
    frases.push(
      `${n(r.certificadosARevogar, "certificado será revogado", "certificados serão revogados")} (o código fica guardado e volta a valer se o aluno voltar).`
    );
  }
  if (r.cobrancasACancelar > 0) {
    frases.push(
      `${n(r.cobrancasACancelar, "cobrança pendente será cancelada", "cobranças pendentes serão canceladas")}.`
    );
  }
  if (r.jaRemovidas > 0) {
    frases.push(
      `${n(r.jaRemovidas, "aluno já tinha", "alunos já tinham")} sido ${v(r.jaRemovidas, "removido", "removidos")}.`
    );
  }
  return frases;
}

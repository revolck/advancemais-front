import type { ResumoSituacao, SituacaoInscricao } from "@/api/cursos/situacao";

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
    rotulo: "Não concluiu (desvincular)",
    efeito: "Sai da turma sem apagar o histórico. O certificado, se houver, é revogado.",
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

/**
 * CPFs colados (uma coluna da planilha, separados por linha, vírgula ou espaço).
 * O Excel tira o zero à esquerda: 9 ou 10 dígitos são completados com zeros.
 */
export function extrairCpfs(texto: string): string[] {
  const vistos = new Set<string>();
  const cpfs: string[] = [];
  texto
    .split(/[\s,;]+/)
    .map((pedaco) => pedaco.trim())
    .filter((pedaco) => /\d/.test(pedaco))
    .forEach((pedaco) => {
      const digitos = pedaco.replace(/\D/g, "");
      const cpf =
        digitos.length === 9 || digitos.length === 10 ? digitos.padStart(11, "0") : digitos;
      const chave = cpf.length === 11 ? cpf : pedaco;
      if (vistos.has(chave)) return;
      vistos.add(chave);
      cpfs.push(chave);
    });
  return cpfs;
}

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

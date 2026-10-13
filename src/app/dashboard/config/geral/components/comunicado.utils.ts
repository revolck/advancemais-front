import type {
  ComunicadoAcaoAlunoResultado,
  ComunicadoResultadoValidacao,
  ComunicadoTipoPendencia,
} from "@/api/email/types";

export const RESULTADO_LABEL: Record<ComunicadoResultadoValidacao, string> = {
  VALIDO: "Válidos",
  INVALIDO: "Inválidos",
  RISCO: "Risco elevado",
  DESCONHECIDO: "Inconclusivos",
  TEMPORARIO: "Temporários",
  BLOQUEADO: "Bloqueados na Brevo",
  PENDENTE: "Aguardando validador",
  SEM_VALIDACAO: "Sem validação",
};

export const TIPO_PENDENCIA_LABEL: Record<ComunicadoTipoPendencia, string> = {
  SENHA_POSSIVELMENTE_EXPOSTA: "Senha possivelmente exposta",
  EMAIL_DEVOLVIDO: "E-mail devolvido",
  SENHA_REVOGADA: "Senha revogada",
  ENVIO_INCERTO: "Envio incerto",
  FALHA_NO_ENVIO: "Falha no envio",
  DEVOLUCAO_TEMPORARIA_PERSISTENTE: "Caixa indisponível",
  EMAIL_INVALIDO: "E-mail inválido",
  EMAIL_BLOQUEADO: "Bloqueado na Brevo",
  EMAIL_DE_RISCO: "E-mail de risco",
  VALIDACAO_INCONCLUSIVA: "Validação inconclusiva",
};

type AcaoAluno = "corrigir" | "reenviar" | "revogar";

/** Ações além de "corrigir e-mail", que vale para todos */
export const ACOES_POR_TIPO: Record<ComunicadoTipoPendencia, AcaoAluno[]> = {
  SENHA_POSSIVELMENTE_EXPOSTA: ["revogar", "corrigir"],
  EMAIL_DEVOLVIDO: ["corrigir"],
  SENHA_REVOGADA: ["corrigir"],
  ENVIO_INCERTO: ["reenviar", "corrigir"],
  FALHA_NO_ENVIO: ["reenviar", "corrigir"],
  DEVOLUCAO_TEMPORARIA_PERSISTENTE: ["reenviar", "corrigir"],
  EMAIL_INVALIDO: ["corrigir"],
  EMAIL_BLOQUEADO: ["corrigir"],
  EMAIL_DE_RISCO: ["corrigir"],
  VALIDACAO_INCONCLUSIVA: ["corrigir"],
};

export function tonalidadeSituacao(
  codigo: string,
): "ok" | "alerta" | "perigo" | "neutro" {
  if (codigo === "EM_ANDAMENTO" || codigo === "CONCLUIDO") return "ok";
  if (
    codigo === "TAXA_DEVOLUCAO_ALTA" ||
    codigo === "FALHA_SINCRONIZACAO_BREVO" ||
    codigo.startsWith("COTA_BREVO")
  ) {
    return "perigo";
  }
  if (codigo === "DESLIGADO") return "neutro";
  return "alerta";
}

const MOTIVO_NAO_ENVIADO: Record<string, string> = {
  TAXA_DEVOLUCAO_ALTA: "o envio está pausado pela taxa de devolução",
  COTA_BREVO_DESCONHECIDA: "não foi possível ler os créditos da Brevo",
  COTA_BREVO_INSUFICIENTE: "os créditos da Brevo estão na reserva",
  DAILY_LIMIT_REACHED: "o limite diário de envio foi atingido",
};

/** Mensagem para o suporte depois de corrigir ou reenviar */
export function descreverResultadoAcao(
  resultado: ComunicadoAcaoAlunoResultado,
) {
  const validacao = resultado.validacao;
  if (resultado.envio?.enviados) {
    return {
      sucesso: true,
      titulo: "Comunicado enviado",
      descricao: `Nova senha provisória enviada para ${resultado.email}.`,
    };
  }
  if (resultado.validadorIndisponivel) {
    return {
      sucesso: false,
      titulo: "E-mail salvo, validação pendente",
      descricao:
        "O validador não respondeu; o envio sai quando o endereço for confirmado.",
    };
  }
  if (resultado.liberadoParaEnvio) {
    const motivo = resultado.envio?.interrompidoPor;
    return {
      sucesso: false,
      titulo: "E-mail confirmado, envio aguardando",
      descricao: motivo
        ? `Não enviado agora: ${MOTIVO_NAO_ENVIADO[motivo] ?? motivo}.`
        : "O aluno está na fila do envio automático.",
    };
  }
  const resultadoLabel = validacao
    ? RESULTADO_LABEL[validacao.resultado]
    : "Sem validação";
  return {
    sucesso: false,
    titulo: `E-mail salvo: ${resultadoLabel.toLowerCase()}`,
    descricao:
      validacao?.resultado === "PENDENTE"
        ? "Configure o validador de e-mails para liberar o envio."
        : `Não será enviado automaticamente${validacao?.motivo ? ` (${validacao.motivo})` : ""}. Confirme o endereço com o aluno.`,
  };
}

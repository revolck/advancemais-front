import type {
  ComunicadoAcaoAlunoResultado,
  ComunicadoFaixaProgresso,
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

export type Gravidade = "critica" | "alta" | "media";

/** Cor do selo na lista: senha exposta é urgente; e-mail ruim impede o acesso */
export const GRAVIDADE_PENDENCIA: Record<ComunicadoTipoPendencia, Gravidade> = {
  SENHA_POSSIVELMENTE_EXPOSTA: "critica",
  EMAIL_DEVOLVIDO: "alta",
  SENHA_REVOGADA: "alta",
  EMAIL_INVALIDO: "alta",
  EMAIL_BLOQUEADO: "alta",
  ENVIO_INCERTO: "media",
  FALHA_NO_ENVIO: "media",
  DEVOLUCAO_TEMPORARIA_PERSISTENTE: "media",
  EMAIL_DE_RISCO: "media",
  VALIDACAO_INCONCLUSIVA: "media",
};

/** Ordem da barra de progresso: do melhor para o que precisa de ação */
export const FAIXAS_PROGRESSO: {
  chave: ComunicadoFaixaProgresso;
  rotulo: string;
  descricao: string;
  cor: string;
}[] = [
  {
    chave: "jaAcessaram",
    rotulo: "Já acessaram",
    descricao: "Entraram ou criaram a senha pelo CPF",
    cor: "bg-emerald-500",
  },
  {
    chave: "receberamComunicado",
    rotulo: "Receberam o comunicado",
    descricao: "Ainda não entraram",
    cor: "bg-sky-500",
  },
  {
    chave: "emAndamento",
    rotulo: "Em andamento",
    descricao: "Envio em processamento ou nova tentativa",
    cor: "bg-indigo-300",
  },
  {
    chave: "aguardandoPrimeiroAcesso",
    rotulo: "Aguardando primeiro acesso",
    descricao: "Podem entrar em “Esqueci minha senha” com o CPF",
    cor: "bg-slate-300",
  },
  {
    chave: "precisamAtencao",
    rotulo: "Precisam de atenção",
    descricao: "E-mail com problema: corrigir com o aluno",
    cor: "bg-amber-500",
  },
];

/** Percentual com uma casa (pt-BR); 0 quando não há base */
export function percentual(parte: number, total: number) {
  if (!total) return 0;
  return Math.round((parte / total) * 1000) / 10;
}

export const formatarPercentual = (valor: number) =>
  `${valor.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;

/** Segmentos da barra (só os que têm alunos), com largura em % */
export function segmentosProgresso(
  progresso: Record<ComunicadoFaixaProgresso, number>,
) {
  const total = FAIXAS_PROGRESSO.reduce(
    (soma, faixa) => soma + (progresso[faixa.chave] ?? 0),
    0,
  );
  return FAIXAS_PROGRESSO.map((faixa) => ({
    ...faixa,
    valor: progresso[faixa.chave] ?? 0,
    percentual: percentual(progresso[faixa.chave] ?? 0, total),
  }));
}

/** Iniciais para o avatar da lista de pendências */
export function iniciais(nome: string) {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  const primeira = partes[0][0] ?? "";
  const ultima = partes.length > 1 ? (partes[partes.length - 1][0] ?? "") : "";
  return (primeira + ultima).toUpperCase();
}

const DIA_MS = 86_400_000;
const diaEmSaoPaulo = (data: Date) =>
  data.toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" });
const diasEntre = (de: string, ate: string) =>
  Math.round((Date.parse(ate) - Date.parse(de)) / DIA_MS);

/** Andamento de uma campanha por dia do calendário de Brasília */
export function prazoCampanha(inicioIso: string, fimIso: string, agora = new Date()) {
  const inicio = diaEmSaoPaulo(new Date(inicioIso));
  const fim = diaEmSaoPaulo(new Date(fimIso));
  const hoje = diaEmSaoPaulo(agora);
  const totalDias = Math.max(1, diasEntre(inicio, fim));
  const faltam = diasEntre(hoje, fim);
  const decorridos = Math.min(totalDias, Math.max(0, diasEntre(inicio, hoje)));
  return {
    totalDias,
    faltam: Math.max(0, faltam),
    encerrada: faltam < 0,
    percentual: percentual(decorridos, totalDias),
  };
}

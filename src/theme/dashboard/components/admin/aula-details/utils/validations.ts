/**
 * Validações para publicação, despublicação e exclusão de aulas
 */

import type { Aula } from "@/api/aulas";

export interface ValidacaoPublicacao {
  podePublicar: boolean;
  camposFaltando: string[];
  avisos: string[];
  bloqueios: string[];
}

export interface ValidacaoExclusao {
  podeExcluir: boolean;
  motivo?: string;
  diasRestantes?: number;
}

export interface ValidacaoDespublicacao {
  podeDespublicar: boolean;
  motivo?: string;
}

/**
 * Valida se uma aula pode ser publicada baseado nos campos obrigatórios por modalidade
 */
export function validarPublicacao(aula: Aula): ValidacaoPublicacao {
  const camposFaltando: string[] = [];
  const avisos: string[] = [];
  const bloqueios: string[] = [];

  // Campos básicos sempre obrigatórios
  if (!aula.titulo || aula.titulo.trim().length < 3) {
    camposFaltando.push("Título (mínimo 3 caracteres)");
  }

  if (!aula.descricao || aula.descricao.trim().length < 10) {
    camposFaltando.push("Descrição (mínimo 10 caracteres)");
  }

  // Validações por modalidade
  switch (aula.modalidade) {
    case "PRESENCIAL":
      if (!aula.dataInicio) camposFaltando.push("Data de início");
      if (!aula.turma?.id) camposFaltando.push("Turma");
      if (!aula.instrutor?.id) camposFaltando.push("Instrutor");
      break;

    case "AO_VIVO":
      if (!aula.dataInicio) {
        camposFaltando.push("Data de início");
      } else {
        const dataAula = new Date(aula.dataInicio);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        dataAula.setHours(0, 0, 0, 0);

        if (dataAula <= hoje) {
          bloqueios.push("Data de início deve ser no futuro");
        }
      }
      if (!aula.turma?.id) camposFaltando.push("Turma");
      if (!aula.instrutor?.id) camposFaltando.push("Instrutor");
      break;

    case "SEMIPRESENCIAL":
      if (!aula.youtubeUrl && !aula.dataInicio) {
        camposFaltando.push("YouTube URL ou Data de início");
      }
      if (aula.dataInicio) {
        const dataAula = new Date(aula.dataInicio);
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        dataAula.setHours(0, 0, 0, 0);

        if (dataAula <= hoje) {
          bloqueios.push("Data de início deve ser no futuro");
        }
        if (!aula.turma?.id) camposFaltando.push("Turma");
        if (!aula.instrutor?.id) camposFaltando.push("Instrutor");
      }
      break;

    case "ONLINE":
      if (!aula.youtubeUrl) camposFaltando.push("YouTube URL");
      break;
  }

  // Avisos de prazo
  if (aula.dataInicio) {
    const dataAula = new Date(aula.dataInicio);
    const hoje = new Date();
    const horasRestantes =
      (dataAula.getTime() - hoje.getTime()) / (1000 * 60 * 60);

    if (horasRestantes < 24 && horasRestantes > 0) {
      avisos.push("Aula agendada para menos de 24 horas");
    }

    if (horasRestantes < 1 && horasRestantes > 0) {
      bloqueios.push("Aula agendada para menos de 1 hora");
    }
  }

  return {
    podePublicar: camposFaltando.length === 0 && bloqueios.length === 0,
    camposFaltando,
    avisos,
    bloqueios,
  };
}

/**
 * Valida se uma aula pode ser excluída baseado nas regras de negócio
 */
export function validarExclusao(
  aula: Aula,
  userRole?: string
): ValidacaoExclusao {
  // 1. Verificar permissão
  if (!userRole || !["ADMIN", "MODERADOR", "PEDAGOGICO"].includes(userRole)) {
    return {
      podeExcluir: false,
      motivo:
        "Apenas administradores, moderadores e equipe pedagógica podem excluir aulas",
    };
  }

  // 2. Verificar status
  if (aula.status === "EM_ANDAMENTO") {
    return {
      podeExcluir: false,
      motivo: "Não é possível excluir uma aula em andamento",
    };
  }

  // 3. Verificar se aula já foi realizada
  if (aula.dataInicio) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataAula = new Date(aula.dataInicio);
    dataAula.setHours(0, 0, 0, 0);

    if (dataAula < hoje) {
      return {
        podeExcluir: false,
        motivo: "Não é possível excluir aulas que já foram realizadas",
      };
    }

    // 4. Verificar prazo mínimo (5 dias)
    const diffTime = dataAula.getTime() - hoje.getTime();
    const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diasRestantes < 5 && diasRestantes >= 0) {
      return {
        podeExcluir: false,
        motivo: `A exclusão deve ser feita com no mínimo 5 dias de antecedência. A aula acontece em ${diasRestantes} dia(s).`,
        diasRestantes,
      };
    }
  }

  // 5. ONLINE sem data pode ser excluída
  if (aula.modalidade === "ONLINE" && !aula.dataInicio) {
    return { podeExcluir: true };
  }

  return { podeExcluir: true };
}

/**
 * Valida se uma aula pode ser despublicada
 */
export function validarDespublicacao(
  aula: Aula,
  userRole?: string
): ValidacaoDespublicacao {
  // 1. Verificar se está publicada
  if (aula.status !== "PUBLICADA") {
    return {
      podeDespublicar: false,
      motivo: "A aula não está publicada",
    };
  }

  // 2. Após verificar que é PUBLICADA, não há necessidade de verificar EM_ANDAMENTO ou CONCLUIDA
  // pois o TypeScript já sabe que o status só pode ser PUBLICADA neste ponto
  // Essas verificações são redundantes e causam erro de tipo

  // 3. Verificar se data já passou
  if (aula.dataInicio) {
    const hoje = new Date();
    const dataAula = new Date(aula.dataInicio);

    if (dataAula < hoje) {
      return {
        podeDespublicar: false,
        motivo: "Não é possível despublicar uma aula que já foi realizada",
      };
    }
  }

  return { podeDespublicar: true };
}

/**
 * Verifica se o usuário pode alterar o status da aula
 */
export function podeAlterarStatus(
  statusAtual: string,
  novoStatus: string,
  userRole?: string
): boolean {
  // ADMIN pode tudo
  if (userRole === "ADMIN") {
    return true;
  }

  // Não pode alterar se está em andamento
  if (statusAtual === "EM_ANDAMENTO") {
    return false;
  }

  // Não pode alterar se está concluída (exceto ADMIN)
  if (statusAtual === "CONCLUIDA") {
    return false;
  }

  // Transições permitidas
  const transicoesPermitidas = [
    "RASCUNHO -> PUBLICADA",
    "PUBLICADA -> RASCUNHO",
    "PUBLICADA -> CANCELADA",
    "RASCUNHO -> CANCELADA",
  ];

  const transicao = `${statusAtual} -> ${novoStatus}`;
  return transicoesPermitidas.includes(transicao);
}

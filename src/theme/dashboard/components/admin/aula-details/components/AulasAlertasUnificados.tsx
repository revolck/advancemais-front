"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, Info } from "lucide-react";
import type { Aula } from "@/api/aulas";
import {
  validarPublicacao,
  validarDespublicacao,
  validarExclusao,
  podeAlterarStatus,
} from "../utils/validations";
import { useAuth } from "@/hooks/useAuth";

interface AulasAlertasUnificadosProps {
  aula: Aula;
}

export function AulasAlertasUnificados({ aula }: AulasAlertasUnificadosProps) {
  const { user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  // Garantir que só renderize no cliente para evitar erro de hidratação
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Durante SSR, retornar null para evitar diferença entre servidor e cliente
  if (!isMounted) {
    return null;
  }

  const isPublicada = aula.status === "PUBLICADA";
  const validacaoPublicacao = isPublicada ? null : validarPublicacao(aula);
  const validacaoDespublicacao = isPublicada
    ? validarDespublicacao(aula, user?.role)
    : null;
  const validacaoExclusao = validarExclusao(aula, user?.role);

  const podeAlterar = podeAlterarStatus(
    aula.status,
    isPublicada ? "RASCUNHO" : "PUBLICADA",
    user?.role,
  );

  const formatDiasRestantes = (dias?: number) => {
    if (dias === undefined) return "";
    if (dias === 0) return "hoje";
    if (dias === 1) return "em 1 dia";
    return `em ${dias} dias`;
  };

  const formatCamposFaltandoPublicacao = (campos: string[]) => {
    if (campos.length === 0)
      return "Para publicar, complete os campos obrigatórios.";
    if (campos.length === 1) {
      const campo = campos[0];
      const map: Record<string, string> = {
        Turma: "Para publicar, selecione uma turma.",
        "Data de início": "Para publicar, selecione a data da aula.",
        "YouTube URL": "Para publicar, informe o link do YouTube.",
        "YouTube URL ou Data de início":
          "Para publicar, informe o link do YouTube ou selecione a data da aula.",
        "Título (mínimo 3 caracteres)":
          "Para publicar, informe um título com pelo menos 3 caracteres.",
        "Descrição (mínimo 10 caracteres)":
          "Para publicar, complete a descrição (mínimo 10 caracteres).",
      };
      return map[campo] ?? `Para publicar, preencha: ${campo}.`;
    }
    return `Para publicar, preencha: ${campos.join(", ")}.`;
  };

  // Coletar todos os problemas
  const problemas: Array<{
    tipo: "publicacao" | "exclusao";
    titulo: string;
    mensagem: string;
    severidade: "warning" | "info";
  }> = [];

  // Problemas de publicação/despublicação
  if (!podeAlterar) {
    if (aula.status === "EM_ANDAMENTO") {
      problemas.push({
        tipo: "publicacao",
        titulo: "Ação não permitida",
        mensagem: "Não é possível alterar o status de uma aula em andamento",
        severidade: "warning",
      });
    } else if (aula.status === "CONCLUIDA" && user?.role !== "ADMIN") {
      problemas.push({
        tipo: "publicacao",
        titulo: "Ação não permitida",
        mensagem: "Apenas administradores podem editar aulas concluídas",
        severidade: "warning",
      });
    }
  } else if (isPublicada) {
    // Tentando despublicar
    if (
      !validacaoDespublicacao?.podeDespublicar &&
      validacaoDespublicacao?.motivo
    ) {
      problemas.push({
        tipo: "publicacao",
        titulo: "Não é possível despublicar esta aula",
        mensagem: validacaoDespublicacao.motivo,
        severidade: "warning",
      });
    }
  } else {
    // Tentando publicar
    if (validacaoPublicacao) {
      if (validacaoPublicacao.camposFaltando.length > 0) {
        problemas.push({
          tipo: "publicacao",
          titulo: "Não é possível publicar agora",
          mensagem: formatCamposFaltandoPublicacao(
            validacaoPublicacao.camposFaltando,
          ),
          severidade: "warning",
        });
      } else if (validacaoPublicacao.bloqueios.length > 0) {
        problemas.push({
          tipo: "publicacao",
          titulo: "Não é possível publicar agora",
          mensagem:
            validacaoPublicacao.bloqueios.length === 1
              ? `Para publicar, ajuste: ${validacaoPublicacao.bloqueios[0]}.`
              : `Para publicar, ajuste: ${validacaoPublicacao.bloqueios.join(", ")}.`,
          severidade: "warning",
        });
      } else if (!validacaoPublicacao.podePublicar) {
        problemas.push({
          tipo: "publicacao",
          titulo: "Não é possível publicar agora",
          mensagem: "Tente novamente após concluir os dados da aula.",
          severidade: "info",
        });
      }
    }
  }

  // Problemas de exclusão
  if (!validacaoExclusao.podeExcluir && validacaoExclusao.motivo) {
    const quando = formatDiasRestantes(validacaoExclusao.diasRestantes);
    problemas.push({
      tipo: "exclusao",
      titulo: "Não é possível excluir agora",
      mensagem:
        validacaoExclusao.diasRestantes !== undefined
          ? `Exclusão bloqueada: a aula acontece ${quando}. Você pode excluir apenas até 5 dias antes da data.`
          : validacaoExclusao.motivo,
      severidade: "warning",
    });
  }

  // Se não há problemas, não mostrar nada
  if (problemas.length === 0) {
    return null;
  }

  // Se há apenas um problema, mostrar alerta simples
  if (problemas.length === 1) {
    const problema = problemas[0];
    const bgColor =
      problema.severidade === "warning" ? "bg-red-50" : "bg-blue-50";
    const borderColor =
      problema.severidade === "warning" ? "border-red-200" : "border-blue-200";
    const iconColor =
      problema.severidade === "warning" ? "text-red-600" : "text-blue-600";
    const titleColor =
      problema.severidade === "warning" ? "text-red-800" : "text-blue-800";
    const textColor =
      problema.severidade === "warning" ? "text-gray-700" : "text-blue-700";
    const iconBgColor =
      problema.severidade === "warning" ? "bg-red-100" : "bg-blue-100";

    return (
      <div
        className={`${bgColor} border ${borderColor} rounded-lg p-4 space-y-3`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iconBgColor}`}
          >
            {problema.severidade === "warning" ? (
              <AlertTriangle className={`h-4 w-4 ${iconColor}`} />
            ) : (
              <Info className={`h-4 w-4 ${iconColor}`} />
            )}
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <p
              className={`text-sm! font-bold! mb-0! ${titleColor} leading-normal!`}
            >
              {problema.titulo}
            </p>
            <p className={`text-sm! ${textColor} leading-normal! mb-0!`}>
              {problema.mensagem}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Se há múltiplos problemas, consolidar em um único alerta
  const temWarning = problemas.some((p) => p.severidade === "warning");
  const bgColor = temWarning ? "bg-red-50" : "bg-blue-50";
  const borderColor = temWarning ? "border-red-200" : "border-blue-200";
  const iconColor = temWarning ? "text-red-600" : "text-blue-600";
  const titleColor = temWarning ? "text-red-800" : "text-blue-800";
  const textColor = temWarning ? "text-gray-700" : "text-blue-700";
  const iconBgColor = temWarning ? "bg-red-100" : "bg-blue-100";

  // Determinar título consolidado
  const temPublicacao = problemas.some((p) => p.tipo === "publicacao");
  const temExclusao = problemas.some((p) => p.tipo === "exclusao");

  let tituloConsolidado = "";
  if (temPublicacao && temExclusao) {
    tituloConsolidado = "Algumas ações estão bloqueadas";
  } else if (temPublicacao) {
    tituloConsolidado = "Publicação bloqueada";
  } else if (temExclusao) {
    tituloConsolidado = "Exclusão bloqueada";
  }

  return (
    <div
      className={`${bgColor} border ${borderColor} rounded-lg p-4 space-y-3`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iconBgColor}`}
        >
          <AlertTriangle className={`h-4 w-4 ${iconColor}`} />
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <p
            className={`text-sm! font-bold! mb-0! ${titleColor} leading-normal!`}
          >
            {tituloConsolidado}
          </p>
          <ul
            className={`text-xs! ${textColor} space-y-1.5 ml-3 mb-0! list-disc`}
          >
            {problemas.map((problema, index) => (
              <li key={index} className="leading-normal! mb-0!">
                {problema.mensagem}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

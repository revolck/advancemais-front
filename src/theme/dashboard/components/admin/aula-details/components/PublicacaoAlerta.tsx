"use client";

import React from "react";
import { AlertTriangle, Info } from "lucide-react";
import type { Aula } from "@/api/aulas";
import {
  validarPublicacao,
  validarDespublicacao,
  podeAlterarStatus,
} from "../utils/validations";
import { useAuth } from "@/hooks/useAuth";

interface PublicacaoAlertaProps {
  aula: Aula;
}

export function PublicacaoAlerta({ aula }: PublicacaoAlertaProps) {
  const { user } = useAuth();

  const isPublicada = aula.status === "PUBLICADA";
  const validacao = isPublicada ? null : validarPublicacao(aula);
  const validacaoDespublicacao = isPublicada
    ? validarDespublicacao(aula, user?.role)
    : null;

  const podeAlterar = podeAlterarStatus(
    aula.status,
    isPublicada ? "RASCUNHO" : "PUBLICADA",
    user?.role
  );

  // Se pode publicar/despublicar, não mostrar alerta
  if (podeAlterar) {
    if (isPublicada) {
      if (validacaoDespublicacao?.podeDespublicar) {
        return null;
      }
    } else {
      if (validacao?.podePublicar) {
        return null;
      }
    }
  }

  // Determinar mensagem do alerta
  let titulo = "";
  let mensagens: string[] = [];
  let tipo: "info" | "warning" = "info";

  if (!podeAlterar) {
    if (aula.status === "EM_ANDAMENTO") {
      titulo = "Ação não permitida";
      mensagens = ["Não é possível alterar o status de uma aula em andamento"];
      tipo = "warning";
    } else if (aula.status === "CONCLUIDA") {
      if (user?.role !== "ADMIN") {
        titulo = "Ação não permitida";
        mensagens = ["Apenas administradores podem editar aulas concluídas"];
        tipo = "warning";
      } else {
        return null; // ADMIN pode, não precisa mostrar alerta
      }
    }
  } else if (isPublicada) {
    // Tentando despublicar
    if (!validacaoDespublicacao?.podeDespublicar) {
      titulo = "Não é possível despublicar esta aula";
      mensagens = [
        validacaoDespublicacao?.motivo ||
          "Não é possível despublicar esta aula",
      ];
      tipo = "warning";
    }
  } else {
    // Tentando publicar
    if (validacao && validacao.camposFaltando.length > 0) {
      titulo = "Não é possível publicar a aula. Campos obrigatórios faltando!";
      mensagens = validacao.camposFaltando;
      tipo = "warning";
    } else if (validacao && validacao.bloqueios.length > 0) {
      titulo = "A publicação está bloqueada!";
      mensagens = validacao.bloqueios;
      tipo = "warning";
    } else {
      titulo = "Não é possível publicar";
      mensagens = ["Esta aula não pode ser publicada no momento"];
      tipo = "info";
    }
  }

  if (!titulo || mensagens.length === 0) return null;

  const bgColor = tipo === "warning" ? "bg-red-50" : "bg-blue-50";
  const borderColor = tipo === "warning" ? "border-red-200" : "border-blue-200";
  const iconColor = tipo === "warning" ? "text-red-600" : "text-blue-600";
  const titleColor = tipo === "warning" ? "text-red-800" : "text-blue-800";
  const textColor = tipo === "warning" ? "text-gray-700" : "text-blue-700";

  const iconBgColor = tipo === "warning" ? "bg-red-100" : "bg-blue-100";

  return (
    <div
      className={`${bgColor} border ${borderColor} rounded-lg p-4 space-y-3`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iconBgColor}`}
        >
          {tipo === "warning" ? (
            <AlertTriangle className={`h-4 w-4 ${iconColor}`} />
          ) : (
            <Info className={`h-4 w-4 ${iconColor}`} />
          )}
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <p
            className={`text-sm! font-bold! mb-0! ${titleColor} leading-normal!`}
          >
            {titulo}
          </p>
          {mensagens.length === 1 ? (
            <p className={`text-sm! ${textColor} leading-normal! mb-0!`}>
              {mensagens[0]}
            </p>
          ) : (
            <ul className={`text-sm! ${textColor} space-y-1 ml-3 mb-0!`}>
              {mensagens.map((msg, index) => (
                <li key={index}>• {msg}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ModalCustom,
  ModalContentWrapper,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from "@/components/ui/custom/modal";
import { ButtonCustom } from "@/components/ui/custom/button";
import { Users, Mail, Phone, CalendarDays } from "lucide-react";
import { getCandidaturaDetalhe } from "@/api/candidatos";
import type { CandidaturaDetalhe } from "@/api/candidatos/types";
import type { CandidatoItem } from "../types";
import { formatDate } from "../utils";

interface VerCandidatoDetalheModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  candidaturaId?: string;
  fallback?: Pick<CandidatoItem, "nome" | "email" | "telefone" | "dataInscricao">;
}

export function VerCandidatoDetalheModal({
  isOpen,
  onOpenChange,
  candidaturaId,
  fallback,
}: VerCandidatoDetalheModalProps) {
  const [detalhe, setDetalhe] = useState<CandidaturaDetalhe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (!isOpen || !candidaturaId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await getCandidaturaDetalhe(candidaturaId);
        if (mounted) setDetalhe(data);
      } catch (err) {
        console.error("Erro ao carregar candidatura:", err);
        if (mounted) setError("Não foi possível carregar o currículo do candidato.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [isOpen, candidaturaId]);

  const headerNome = detalhe?.candidato?.nome ?? fallback?.nome ?? "Candidato";
  const headerEmail = detalhe?.candidato?.email ?? fallback?.email ?? "";
  const headerTelefone = detalhe?.candidato?.telefone ?? fallback?.telefone ?? "";
  const inscricao = detalhe?.criadoEm ?? fallback?.dataInscricao ?? "";

  const experiencias = useMemo(
    () => detalhe?.curriculo?.experiencias ?? [],
    [detalhe?.curriculo?.experiencias]
  );
  const formacoes = useMemo(
    () => detalhe?.curriculo?.formacoes ?? [],
    [detalhe?.curriculo?.formacoes]
  );

  return (
    <ModalCustom isOpen={isOpen} onOpenChange={onOpenChange} size="lg" backdrop="blur">
      <ModalContentWrapper>
        <ModalHeader>
          <ModalTitle>Detalhes do Candidato</ModalTitle>
        </ModalHeader>

        <ModalBody className="space-y-6">
          {/* Cabeçalho do candidato */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Users className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate !mb-0">{headerNome}</h3>
                <div className="mt-1 flex flex-wrap items-center gap-4 text-sm">
                  {headerEmail && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="truncate">{headerEmail}</span>
                    </div>
                  )}
                  {headerTelefone && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="truncate">{headerTelefone}</span>
                    </div>
                  )}
                  {inscricao && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <CalendarDays className="h-4 w-4 text-gray-500" />
                      <span className="truncate">Inscrito em {formatDate(inscricao)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Currículo */}
          <div className="space-y-4">
            {loading && (
              <p className="text-sm text-gray-500">Carregando currículo...</p>
            )}
            {error && !loading && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            {!loading && !error && (
              <>
                <div>
                  <h4 className="text-sm font-semibold text-gray-800">Currículo</h4>
                  <div className="mt-2 rounded-lg border border-gray-200 p-3 bg-white">
                    <div className="text-sm text-gray-900 font-medium">
                      {detalhe?.curriculo?.titulo ?? "Currículo não informado"}
                    </div>
                    {detalhe?.curriculo?.resumo && (
                      <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
                        {detalhe.curriculo.resumo}
                      </p>
                    )}
                  </div>
                </div>

                {experiencias.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800">Experiências</h4>
                    <div className="mt-2 space-y-2">
                      {experiencias.map((exp: any, idx: number) => (
                        <div key={idx} className="rounded-lg border border-gray-200 p-3 bg-white">
                          <div className="text-sm font-medium text-gray-900">
                            {exp.cargo || exp.empresa || `Experiência ${idx + 1}`}
                          </div>
                          {exp.empresa && (
                            <div className="text-xs text-gray-600">{exp.empresa}</div>
                          )}
                          {exp.periodo && (
                            <div className="text-xs text-gray-600 mt-1">{exp.periodo}</div>
                          )}
                          {exp.descricao && (
                            <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{exp.descricao}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {formacoes.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-800">Formação</h4>
                    <div className="mt-2 space-y-2">
                      {formacoes.map((f: any, idx: number) => (
                        <div key={idx} className="rounded-lg border border-gray-200 p-3 bg-white">
                          <div className="text-sm font-medium text-gray-900">
                            {f.curso || `Formação ${idx + 1}`}
                          </div>
                          {(f.instituicao || f.periodo) && (
                            <div className="text-xs text-gray-600 mt-1">
                              {[f.instituicao, f.periodo].filter(Boolean).join(" • ")}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </ModalBody>

        <ModalFooter>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <ButtonCustom variant="primary" size="md" onClick={() => onOpenChange(false)}>
              Fechar
            </ButtonCustom>
          </div>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}


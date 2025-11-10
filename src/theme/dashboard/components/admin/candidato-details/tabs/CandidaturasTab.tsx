"use client";

import React from "react";
import { Briefcase, Calendar, MapPin, Clock, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatDate, getStatusBadge } from "../utils/formatters";
import type { CandidaturasTabProps } from "../types";
import type { Candidatura } from "@/api/candidatos/types";

export function CandidaturasTab({
  candidato,
  candidaturas = [],
  onUpdateStatus,
  isLoading = false,
}: CandidaturasTabProps) {
  const candidaturasData =
    candidaturas.length > 0 ? candidaturas : candidato.candidaturas || [];

  if (candidaturasData.length === 0) {
    return (
      <div className="text-center py-12">
        <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhuma candidatura encontrada
        </h3>
        <p className="text-gray-500">
          Este candidato ainda não se candidatou a nenhuma vaga.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo das Candidaturas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Resumo das Candidaturas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-semibold text-blue-600">
                {candidaturasData.length}
              </div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-green-600">
                {
                  candidaturasData.filter(
                    (c: Candidatura) =>
                      ![
                        "RECUSADO",
                        "DESISTIU",
                        "NAO_COMPARECEU",
                        "ARQUIVADO",
                        "CANCELADO",
                      ].includes(c.status)
                  ).length
                }
              </div>
              <div className="text-sm text-gray-600">Ativas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-purple-600">
                {
                  candidaturasData.filter((c: Candidatura) => c.status === "ENTREVISTA")
                    .length
                }
              </div>
              <div className="text-sm text-gray-600">Entrevistas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-green-600">
                {
                  candidaturasData.filter((c: Candidatura) => c.status === "CONTRATADO")
                    .length
                }
              </div>
              <div className="text-sm text-gray-600">Contratados</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Candidaturas */}
      <div className="space-y-4">
        {candidaturasData.map((candidatura) => (
          <Card
            key={candidatura.id}
            className="hover:shadow-md transition-shadow"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {candidatura.vaga?.titulo || "Vaga não encontrada"}
                    </h3>
                    {getStatusBadge(candidatura.status)}
                  </div>

                  {candidatura.vaga && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Briefcase className="h-4 w-4" />
                        <span>
                          {candidatura.vaga.empresa?.nome ||
                            "Empresa não informada"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {candidatura.vaga.modalidade === "REMOTO"
                            ? "Remoto"
                            : candidatura.vaga.modalidade === "PRESENCIAL"
                            ? "Presencial"
                            : candidatura.vaga.modalidade === "HIBRIDO"
                            ? "Híbrido"
                            : candidatura.vaga.modalidade}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(candidatura.aplicadaEm)}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>
                        Aplicada em {formatDate(candidatura.aplicadaEm)}
                      </span>
                    </div>
                    {candidatura.atualizadaEm !== candidatura.aplicadaEm && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          Atualizada em {formatDate(candidatura.atualizadaEm)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {candidatura.vaga && (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Link href={`/dashboard/empresas/vagas/${candidatura.vaga.id}`}>
                        <Eye className="h-4 w-4" />
                        Ver Vaga
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

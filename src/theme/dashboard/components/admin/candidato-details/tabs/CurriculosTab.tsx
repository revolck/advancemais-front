"use client";

import React from "react";
import {
  FileText,
  Star,
  Calendar,
  Target,
  Users,
  Award,
  Globe,
  Briefcase,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "../utils/formatters";
import type { CurriculosTabProps } from "../types";
import type { Idioma } from "@/api/candidatos/types";

export function CurriculosTab({
  candidato,
  curriculos = [],
  isLoading = false,
}: CurriculosTabProps) {
  const curriculosData =
    curriculos.length > 0 ? curriculos : candidato.curriculos || [];

  if (curriculosData.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhum currículo encontrado
        </h3>
        <p className="text-gray-500">
          Este candidato ainda não possui currículos cadastrados.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumo dos Currículos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Resumo dos Currículos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-semibold text-blue-600">
                {curriculosData.length}
              </div>
              <div className="text-sm text-gray-600">Total de Currículos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-green-600">
                {curriculosData.filter((c) => c.principal).length}
              </div>
              <div className="text-sm text-gray-600">Principal</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-purple-600">
                {formatDate(curriculosData[0]?.ultimaAtualizacao)}
              </div>
              <div className="text-sm text-gray-600">Última Atualização</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Currículos */}
      <div className="space-y-4">
        {curriculosData.map((curriculo) => (
          <Card
            key={curriculo.id}
            className="hover:shadow-md transition-shadow"
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg">{curriculo.titulo}</CardTitle>
                  {curriculo.principal && (
                    <Badge
                      variant="default"
                      className="flex items-center gap-1"
                    >
                      <Star className="h-3 w-3" />
                      Principal
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  Atualizado em {formatDate(curriculo.ultimaAtualizacao)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Objetivo */}
              {curriculo.objetivo && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Objetivo
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    {curriculo.objetivo}
                  </p>
                </div>
              )}

              {/* Resumo */}
              {curriculo.resumo && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Resumo
                  </h4>
                  <p className="text-gray-700 leading-relaxed">
                    {curriculo.resumo}
                  </p>
                </div>
              )}

              {/* Área de Interesse */}
              {curriculo.areasInteresse && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">
                    Área de Interesse
                  </h4>
                  <Badge variant="outline">
                    {curriculo.areasInteresse.primaria}
                  </Badge>
                </div>
              )}

              {/* Habilidades Técnicas */}
              {curriculo.habilidades?.tecnicas &&
                curriculo.habilidades.tecnicas.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Habilidades Técnicas
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {curriculo.habilidades.tecnicas.map(
                        (habilidade: string, index: number) => (
                          <Badge key={index} variant="secondary">
                            {habilidade}
                          </Badge>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* Idiomas */}
              {curriculo.idiomas && curriculo.idiomas.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Idiomas
                  </h4>
                  <div className="space-y-2">
                    {curriculo.idiomas.map((idioma: Idioma, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <span className="text-gray-700">{idioma.idioma}</span>
                        <Badge variant="outline">{idioma.nivel}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Experiências */}
              {curriculo.experiencias && curriculo.experiencias.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Experiências ({curriculo.experiencias.length})
                  </h4>
                  <p className="text-sm text-gray-600">
                    {curriculo.experiencias.length} experiência
                    {curriculo.experiencias.length !== 1 ? "s" : ""} cadastrada
                    {curriculo.experiencias.length !== 1 ? "s" : ""}
                  </p>
                </div>
              )}

              {/* Formação */}
              {curriculo.formacao && curriculo.formacao.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    Formação ({curriculo.formacao.length})
                  </h4>
                  <p className="text-sm text-gray-600">
                    {curriculo.formacao.length} curso
                    {curriculo.formacao.length !== 1 ? "s" : ""} de formação
                    cadastrado{curriculo.formacao.length !== 1 ? "s" : ""}
                  </p>
                </div>
              )}

              {/* Informações do Currículo */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Criado em {formatDate(curriculo.criadoEm)}</span>
                  <span>
                    Atualizado em {formatDate(curriculo.atualizadoEm)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

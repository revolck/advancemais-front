"use client";

import type { DetailsTabProps } from "../types";
import { Database, Shield, Activity, Tag } from "lucide-react";
import { formatDate } from "../utils";

export function DetailsTab({ vaga }: DetailsTabProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h5 className="!mb-0">Detalhes Técnicos</h5>
        <p>
          Informações técnicas específicas e configurações avançadas da vaga
        </p>
      </div>

      {/* Informações Técnicas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Metadados */}
        <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
          <h5 className="!mb-0 flex items-center gap-2">
            <Database className="h-5 w-5 text-green-600" />
            Metadados
          </h5>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Criada em:</span>
              <span className="text-sm font-medium">
                {vaga.inseridaEm ? formatDate(vaga.inseridaEm) : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Atualizada em:</span>
              <span className="text-sm font-medium">
                {vaga.atualizadoEm ? formatDate(vaga.atualizadoEm) : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Inscrições até:</span>
              <span className="text-sm font-medium">
                {vaga.inscricoesAte
                  ? formatDate(vaga.inscricoesAte)
                  : "Não definida"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Última modificação:</span>
              <span className="text-sm font-medium">
                {vaga.atualizadoEm ? formatDate(vaga.atualizadoEm) : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Configurações de Segurança */}
        <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
          <h5 className="!mb-0 flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-600" />
            Configurações de Segurança
          </h5>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Modo Anônimo:</span>
              <span
                className={`text-sm font-medium ${
                  vaga.modoAnonimo ? "text-green-600" : "text-red-600"
                }`}
              >
                {vaga.modoAnonimo ? "Ativado" : "Desativado"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Acessibilidade PCD:</span>
              <span
                className={`text-sm font-medium ${
                  vaga.paraPcd ? "text-green-600" : "text-red-600"
                }`}
              >
                {vaga.paraPcd ? "Ativado" : "Desativado"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Salário Confidencial:
              </span>
              <span
                className={`text-sm font-medium ${
                  vaga.salarioConfidencial ? "text-green-600" : "text-red-600"
                }`}
              >
                {vaga.salarioConfidencial ? "Sim" : "Não"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Visibilidade:</span>
              <span className="text-sm font-medium">Pública</span>
            </div>
          </div>
        </div>

        {/* Configurações de Performance */}
        <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
          <h5 className="!mb-0 flex items-center gap-2">
            <Activity className="h-5 w-5 text-orange-600" />
            Configurações de Performance
          </h5>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Número de vagas:</span>
              <span className="text-sm font-medium">
                {vaga.numeroVagas || "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Status de Publicação:
              </span>
              <span className="text-sm font-medium">Publicada</span>
            </div>
          </div>
        </div>

        {/* Categorização e Classificação */}
        <div className="rounded-2xl border border-gray-200/60 bg-white p-6">
          <h5 className="!mb-0 flex items-center gap-2">
            <Tag className="h-5 w-5 text-purple-600" />
            Categorização e Classificação
          </h5>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Categoria:</span>
              <span className="text-sm font-medium">
                {vaga.areaInteresse?.categoria || "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Subárea:</span>
              <span className="text-sm font-medium">
                {vaga.subareaInteresse?.nome || "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tipo de Vaga:</span>
              <span className="text-sm font-medium">Padrão</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

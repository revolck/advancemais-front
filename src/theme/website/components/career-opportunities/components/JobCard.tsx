// src/theme/website/components/career-opportunities/components/JobCard.tsx

"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ImageNotFound } from "@/components/ui/custom/image-not-found";
import {
  MapPin,
  Briefcase,
  Monitor,
  Building2,
  Zap,
  User,
  GraduationCap,
  Star,
  Eye,
  ArrowRight,
  Accessibility,
} from "lucide-react";
import type { JobCardProps } from "../types";
import { ICON_MAPPING } from "../constants";

export const JobCard: React.FC<JobCardProps> = ({
  job,
  index,
  onApply,
  onViewDetails,
}) => {
  const [logoError, setLogoError] = useState(false);

  // Mapeamento de ícones
  const getModalityIcon = (modality: string) => {
    const iconName =
      ICON_MAPPING.modality[modality as keyof typeof ICON_MAPPING.modality];
    switch (iconName) {
      case "Monitor":
        return Monitor;
      case "Building2":
        return Building2;
      case "Zap":
        return Zap;
      default:
        return Monitor;
    }
  };

  const getContractIcon = (contract: string) => {
    const iconName =
      ICON_MAPPING.contractType[
        contract as keyof typeof ICON_MAPPING.contractType
      ];
    switch (iconName) {
      case "Briefcase":
        return Briefcase;
      case "User":
        return User;
      case "GraduationCap":
        return GraduationCap;
      default:
        return Briefcase;
    }
  };

  const ModalityIcon = getModalityIcon(job.modalidade);
  const ContractIcon = getContractIcon(job.tipoContrato);

  const handleApply = () => {
    onApply?.(job.id);
  };

  const handleViewDetails = () => {
    onViewDetails?.(job.id);
  };

  return (
    <div
      className="group cursor-pointer"
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      <Card
        className={`bg-white/80 backdrop-blur-xl transition-all duration-300 hover:shadow-lg ${
          job.destaque
            ? "border-2 border-black/10 shadow-lg shadow-black/5 rounded-2xl"
            : "border border-gray-200/60 hover:border-gray-300/60 shadow-sm hover:shadow-md rounded-xl"
        }`}
      >
        {/* Featured Badge */}
        {job.destaque && (
          <div className="bg-gradient-to-r from-gray-900 to-black px-4 py-2 rounded-t-2xl">
            <div className="flex items-center gap-2 text-white">
              <Star className="w-3 h-3" />
              <span className="font-medium text-xs">Vaga em Destaque</span>
            </div>
          </div>
        )}

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start gap-4 mb-5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-inner overflow-hidden">
              {job.empresaLogo && !logoError ? (
                <Image
                  src={job.empresaLogo}
                  alt={`Logo ${job.empresa}`}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <ImageNotFound
                  size="xs"
                  variant="muted"
                  aspectRatio="square"
                  icon="Building2"
                  showMessage={false}
                  className="w-full h-full rounded-2xl border-0"
                />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-black transition-colors leading-tight">
                {job.titulo}
              </h3>
              <p className="text-gray-600 font-medium">
                {job.empresaAnonima ? "Empresa Confidencial" : job.empresa}
              </p>
            </div>
          </div>

          {/* Tags Section */}
          <div className="border-t border-b border-gray-100 py-4 mb-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-gray-50 text-gray-700 hover:bg-gray-100 border-0 px-3 py-1 rounded-full font-medium text-sm transition-colors">
                <MapPin className="w-3 h-3 mr-1.5" />
                {job.localizacao}
              </Badge>
              <Badge className="bg-gray-50 text-gray-700 hover:bg-gray-100 border-0 px-3 py-1 rounded-full font-medium text-sm transition-colors">
                <ContractIcon className="w-3 h-3 mr-1.5" />
                {job.tipoContrato}
              </Badge>
              <Badge className="bg-gray-50 text-gray-700 hover:bg-gray-100 border-0 px-3 py-1 rounded-full font-medium text-sm transition-colors">
                <ModalityIcon className="w-3 h-3 mr-1.5" />
                {job.modalidade}
              </Badge>
              <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-0 px-3 py-1 rounded-full font-medium text-sm transition-colors">
                {job.nivel}
              </Badge>
              {job.pcd && (
                <Badge className="bg-green-50 text-green-700 hover:bg-green-100 border-0 px-3 py-1 rounded-full font-medium text-sm transition-colors">
                  <Accessibility className="w-3 h-3 mr-1.5" />
                  Elegível para PCD
                </Badge>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mb-5">
            <h4 className="font-semibold text-gray-900 mb-2 text-sm">
              Descrição
            </h4>
            <p className="text-gray-600 leading-relaxed text-sm font-medium line-clamp-3">
              {job.descricao}
            </p>
          </div>

          {/* Salary */}
          {job.salario && (
            <div className="mb-5">
              <h4 className="font-semibold text-gray-900 mb-2 text-sm">
                Faixa Salarial
              </h4>
              <p className="text-green-600 font-bold text-sm">
                R$ {job.salario.min?.toLocaleString()} - R${" "}
                {job.salario.max?.toLocaleString()}
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <span className="text-gray-500 font-medium text-sm">
              Publicado em {job.dataPublicacao}
            </span>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleViewDetails}
                className="border-gray-200 text-gray-700 hover:text-gray-900 hover:border-gray-300 px-4 py-2 rounded-lg bg-white/50 hover:bg-white transition-all font-medium text-sm"
              >
                <Eye className="w-3 h-3 mr-1.5" />
                Ver detalhes
              </Button>
              <Button
                onClick={handleApply}
                className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 group text-sm"
              >
                Candidatar-se
                <ArrowRight className="w-3 h-3 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

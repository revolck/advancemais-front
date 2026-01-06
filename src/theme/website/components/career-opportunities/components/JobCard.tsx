// src/theme/website/components/career-opportunities/components/JobCard.tsx

"use client";

import React, { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonCustom } from "@/components/ui/custom/button";
import {
  MapPin,
  Clock,
  DollarSign,
  Star,
  User,
  Monitor,
  Briefcase,
} from "lucide-react";
import type { JobCardProps } from "../types";

export const JobCard: React.FC<JobCardProps> = ({
  job,
  index,
  onApply,
  onViewDetails,
}) => {
  const [logoError, setLogoError] = useState(false);

  const handleApply = () => onApply?.(job.id);
  const handleViewDetails = () => onViewDetails?.(job);
  const effectiveLogo =
    job.empresaLogo && !job.empresaAnonima && !logoError
      ? job.empresaLogo
      : "/images/company-placeholder.svg";

  const salaryLabel = job.salario
    ? `R$ ${job.salario.min?.toLocaleString()} - R$ ${job.salario.max?.toLocaleString()}`
    : "A combinar";

  return (
    <Card
      className={cn(
        "border border-gray-200 bg-white rounded-2xl transition-all duration-200 shadow-none",
        job.destaque && "border-[#1f8454]/60"
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <CardContent className="p-6 py-2 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden">
              <Image
                src={effectiveLogo}
                alt={
                  job.empresaAnonima
                    ? "Logo empresa anônima"
                    : `Logo ${job.empresa}`
                }
                width={56}
                height={56}
                className="w-full h-full object-cover"
                onError={() => setLogoError(true)}
                unoptimized={effectiveLogo.startsWith("http")}
              />
            </div>
            <div className="space-y-1 mt-1">
              <p className="!text-xs !font-semibold !uppercase !text-gray-400 !mb-0">
                {job.empresaAnonima ? "Empresa anônima" : job.empresa}
              </p>
              <h3 className="!sm:text-xl !font-semibold !text-gray-900">
                {job.titulo}
              </h3>
            </div>
          </div>
          {job.destaque && (
            <span className="text-xs font-semibold text-[#1f8454] bg-[#1f8454]/10 px-3 py-1 rounded-full flex items-center gap-1">
              <Star className="w-3 h-3" />
              Destaque
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { label: job.localizacao, icon: MapPin },
            { label: salaryLabel, icon: DollarSign },
            { label: job.nivel, icon: User },
            { label: job.modalidade, icon: Monitor },
            { label: job.tipoContrato, icon: Briefcase },
          ]
            .filter(({ label }) => Boolean(label))
            .map(({ label, icon: Icon }, idx) => (
              <Badge
                key={`${job.id}-${label}-${idx}`}
                className="bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-xs font-medium inline-flex items-center gap-1"
              >
                {Icon && <Icon className="w-3.5 h-3.5 text-gray-500" />}
                {label}
              </Badge>
            ))}
        </div>

        <p className="!text-sm !text-gray-600 !leading-relaxed !line-clamp-2">
          {job.descricao}
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-gray-100 pt-4">
          <div className="flex flex-col sm:flex-row gap-2 sm:ml-auto">
            <ButtonCustom
              variant="outline"
              onClick={handleViewDetails}
              className="border-gray-200 text-gray-700"
            >
              Ver detalhes
            </ButtonCustom>
            <ButtonCustom
              variant="default"
              onClick={handleApply}
              className="bg-[#1f8454] hover:bg-[#16603d] text-white rounded-full"
            >
              Candidatar-se
            </ButtonCustom>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

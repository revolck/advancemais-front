"use client";

import {
  ModalCustom,
  ModalContentWrapper,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
} from "@/components/ui/custom/modal";
import { ButtonCustom } from "@/components/ui/custom/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Target,
  Globe,
  Briefcase,
  Award,
  GraduationCap,
  Trophy,
  MapPin,
  Calendar,
} from "lucide-react";
import type { Curriculo } from "@/api/candidatos/types";

interface ViewCurriculoModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  curriculo: Curriculo;
  usuarioNome: string;
}

export function ViewCurriculoModal({
  isOpen,
  onOpenChange,
  curriculo,
  usuarioNome,
}: ViewCurriculoModalProps) {
  const handleClose = () => onOpenChange(false);

  // Construir campos de detalhes
  const detailFields = [];

  if (curriculo.areasInteresse) {
    detailFields.push({
      label: "Área de Interesse",
      value: curriculo.areasInteresse.primaria,
      icon: Target,
    });
  }

  if (curriculo.preferencias?.local) {
    detailFields.push({
      label: "Local de Preferência",
      value: curriculo.preferencias.local,
      icon: MapPin,
    });
  }

  if (curriculo.preferencias?.regime) {
    detailFields.push({
      label: "Regime",
      value: curriculo.preferencias.regime,
      icon: Briefcase,
    });
  }

  detailFields.push({
    label: "Criado em",
    value: new Date(curriculo.criadoEm).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    icon: Calendar,
  });

  detailFields.push({
    label: "Atualizado em",
    value: new Date(curriculo.ultimaAtualizacao).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    icon: Calendar,
  });

  // Construir seções de conteúdo
  const contentSections = [];

  if (curriculo.objetivo) {
    contentSections.push({
      label: "Objetivo",
      content: curriculo.objetivo,
      icon: Target,
    });
  }

  if (curriculo.resumo) {
    contentSections.push({
      label: "Resumo",
      content: curriculo.resumo,
      icon: Target,
    });
  }

  if (
    curriculo.habilidades?.tecnicas &&
    curriculo.habilidades.tecnicas.length > 0
  ) {
    contentSections.push({
      label: "Habilidades Técnicas",
      content: curriculo.habilidades.tecnicas,
      icon: GraduationCap,
      isArray: true,
    });
  }

  if (curriculo.idiomas && curriculo.idiomas.length > 0) {
    contentSections.push({
      label: "Idiomas",
      content: curriculo.idiomas,
      icon: Globe,
      isArray: true,
      isLanguageArray: true,
    });
  }

  if (curriculo.experiencias && curriculo.experiencias.length > 0) {
    contentSections.push({
      label: `Experiências Profissionais (${curriculo.experiencias.length})`,
      content: curriculo.experiencias,
      icon: Briefcase,
      isArray: true,
      isExperienceArray: true,
    });
  }

  if (curriculo.formacao && curriculo.formacao.length > 0) {
    contentSections.push({
      label: `Formação Acadêmica (${curriculo.formacao.length})`,
      content: curriculo.formacao,
      icon: Award,
      isArray: true,
      isEducationArray: true,
    });
  }

  if (
    curriculo.cursosCertificacoes &&
    curriculo.cursosCertificacoes.length > 0
  ) {
    contentSections.push({
      label: `Cursos e Certificações (${curriculo.cursosCertificacoes.length})`,
      content: curriculo.cursosCertificacoes,
      icon: GraduationCap,
      isArray: true,
      isCourseArray: true,
    });
  }

  if (curriculo.premiosPublicacoes && curriculo.premiosPublicacoes.length > 0) {
    contentSections.push({
      label: `Prêmios e Publicações (${curriculo.premiosPublicacoes.length})`,
      content: curriculo.premiosPublicacoes,
      icon: Trophy,
      isArray: true,
      isAwardArray: true,
    });
  }

  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="2xl"
      backdrop="blur"
      scrollBehavior="inside"
    >
      <ModalContentWrapper>
        <ModalHeader className="space-y-2">
          <div className="flex items-start justify-between">
            <ModalTitle className="pr-4">{curriculo.titulo}</ModalTitle>
            {curriculo.principal && (
              <Badge
                variant="outline"
                className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1 flex-shrink-0"
              >
                <Star className="h-3 w-3 fill-current" />
                Principal
              </Badge>
            )}
          </div>
          <ModalDescription className="text-xs uppercase tracking-[0.3em] text-slate-400">
            {usuarioNome}
          </ModalDescription>
        </ModalHeader>
        <ModalBody className="max-h-[60vh] space-y-4 pr-1">
          {/* Campos de detalhes */}
          {detailFields.length > 0 && (
            <div className="grid gap-2 sm:grid-cols-2">
              {detailFields.map((field) => (
                <div
                  key={field.label}
                  className="rounded-lg border border-slate-200/70 bg-slate-50/80 px-3 py-2"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {field.label}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-900">
                    {field.value}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Seções de conteúdo */}
          {contentSections.map((section) => (
            <div
              key={section.label}
              className="rounded-lg border border-slate-200/70 bg-white p-3 shadow-sm"
            >
              <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-2 flex items-center gap-2">
                {section.icon && <section.icon className="h-3.5 w-3.5" />}
                {section.label}
              </h4>
              {section.isArray ? (
                <div className="space-y-2">
                  {section.isLanguageArray &&
                    (section.content as any[]).map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
                      >
                        <span className="text-sm font-medium text-gray-900">
                          {item.idioma}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {item.nivel}
                        </Badge>
                      </div>
                    ))}
                  {section.isExperienceArray &&
                    (section.content as any[]).map((item, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-lg px-3 py-2"
                      >
                        {item.cargo && (
                          <h5 className="font-semibold text-gray-900 text-sm">
                            {item.cargo}
                          </h5>
                        )}
                        {item.empresa && (
                          <p className="text-blue-600 text-sm font-medium">
                            {item.empresa}
                          </p>
                        )}
                        {item.periodo && (
                          <p className="text-xs text-gray-600">
                            {item.periodo}
                          </p>
                        )}
                        {item.descricao && (
                          <p className="text-gray-700 mt-1 text-sm leading-relaxed whitespace-pre-wrap">
                            {item.descricao}
                          </p>
                        )}
                      </div>
                    ))}
                  {section.isEducationArray &&
                    (section.content as any[]).map((item, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-lg px-3 py-2"
                      >
                        {item.curso && (
                          <h5 className="font-semibold text-gray-900 text-sm">
                            {item.curso}
                          </h5>
                        )}
                        {item.instituicao && (
                          <p className="text-blue-600 text-sm font-medium">
                            {item.instituicao}
                          </p>
                        )}
                        {item.periodo && (
                          <p className="text-xs text-gray-600">
                            {item.periodo}
                          </p>
                        )}
                        {item.descricao && (
                          <p className="text-gray-700 mt-1 text-sm leading-relaxed whitespace-pre-wrap">
                            {item.descricao}
                          </p>
                        )}
                      </div>
                    ))}
                  {section.isCourseArray &&
                    (section.content as any[]).map((item, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-lg px-3 py-2"
                      >
                        {item.titulo && (
                          <h5 className="font-semibold text-gray-900 text-sm">
                            {item.titulo}
                          </h5>
                        )}
                        {item.instituicao && (
                          <p className="text-blue-600 text-sm font-medium">
                            {item.instituicao}
                          </p>
                        )}
                        {item.periodo && (
                          <p className="text-xs text-gray-600">
                            {item.periodo}
                          </p>
                        )}
                      </div>
                    ))}
                  {section.isAwardArray &&
                    (section.content as any[]).map((item, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-lg px-3 py-2"
                      >
                        {item.titulo && (
                          <h5 className="font-semibold text-gray-900 text-sm">
                            {item.titulo}
                          </h5>
                        )}
                        {item.descricao && (
                          <p className="text-gray-700 mt-1 text-sm leading-relaxed whitespace-pre-wrap">
                            {item.descricao}
                          </p>
                        )}
                      </div>
                    ))}
                  {section.content instanceof Array &&
                    !section.isLanguageArray &&
                    !section.isExperienceArray &&
                    !section.isEducationArray &&
                    !section.isCourseArray &&
                    !section.isAwardArray &&
                    (section.content as string[]).map((item, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="mr-2 mb-2"
                      >
                        {item}
                      </Badge>
                    ))}
                </div>
              ) : (
                <p className="mt-1 whitespace-pre-line text-sm text-slate-700">
                  {section.content as string}
                </p>
              )}
            </div>
          ))}
        </ModalBody>
        <ModalFooter className="pt-2">
          <ButtonCustom variant="ghost" onClick={handleClose}>
            Fechar
          </ButtonCustom>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}

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

  const experienciasArray: any[] = Array.isArray(curriculo.experiencias)
    ? curriculo.experiencias
    : (curriculo.experiencias as any)?.experiencias || [];

  const formacaoArray: any[] = Array.isArray((curriculo as any).formacao)
    ? ((curriculo as any).formacao as any[])
    : [];

  const cursosCertificacoesFlat: any[] = (() => {
    const raw: any = (curriculo as any)?.cursosCertificacoes;
    const cursos = Array.isArray(raw)
      ? raw
      : raw && typeof raw === "object" && Array.isArray(raw.cursos)
        ? raw.cursos
        : [];
    const certificacoes =
      raw && typeof raw === "object" && Array.isArray(raw.certificacoes)
        ? raw.certificacoes
        : [];

    const normalizePeriodo = (inicio?: any, fim?: any) => {
      const start = typeof inicio === "string" ? inicio : "";
      const end = typeof fim === "string" ? fim : "";
      if (!start && !end) return "";
      if (start && end) return `${start} → ${end}`;
      return start || end;
    };

    const mappedCursos = (cursos as any[]).map((c) => ({
      titulo:
        (typeof c?.titulo === "string" && c.titulo) ||
        (typeof c?.nome === "string" && c.nome) ||
        "",
      instituicao: (typeof c?.instituicao === "string" && c.instituicao) || "",
      periodo:
        (typeof c?.periodo === "string" && c.periodo) ||
        (typeof c?.dataConclusao === "string" && c.dataConclusao) ||
        "",
    }));

    const mappedCertificacoes = (certificacoes as any[]).map((c) => ({
      titulo:
        (typeof c?.titulo === "string" && c.titulo) ||
        (typeof c?.nome === "string" && c.nome) ||
        "",
      instituicao:
        (typeof c?.organizacao === "string" && c.organizacao) ||
        (typeof c?.instituicao === "string" && c.instituicao) ||
        "",
      periodo:
        (typeof c?.periodo === "string" && c.periodo) ||
        normalizePeriodo(c?.dataEmissao, c?.dataExpiracao) ||
        (typeof c?.dataEmissao === "string" && c.dataEmissao) ||
        "",
    }));

    return [...mappedCursos, ...mappedCertificacoes].filter(
      (i) => Boolean(i.titulo) || Boolean(i.instituicao) || Boolean(i.periodo)
    );
  })();

  const premiosPublicacoesFlat: any[] = (() => {
    const raw: any = (curriculo as any)?.premiosPublicacoes;
    const premios = Array.isArray(raw)
      ? raw
      : raw && typeof raw === "object" && Array.isArray(raw.premios)
        ? raw.premios
        : [];
    const publicacoes =
      raw && typeof raw === "object" && Array.isArray(raw.publicacoes)
        ? raw.publicacoes
        : [];

    const mappedPremios = (premios as any[]).map((p) => ({
      titulo: (typeof p?.titulo === "string" && p.titulo) || "",
      descricao: (typeof p?.descricao === "string" && p.descricao) || "",
    }));

    const mappedPublicacoes = (publicacoes as any[]).map((p) => {
      const titulo = (typeof p?.titulo === "string" && p.titulo) || "";
      const parts = [
        typeof p?.tipo === "string" ? p.tipo : "",
        typeof p?.veiculo === "string" ? p.veiculo : "",
        typeof p?.data === "string" ? p.data : "",
      ].filter(Boolean);
      const descricaoBase = parts.join(" • ");
      const url = typeof p?.url === "string" ? p.url : "";
      const descricao = [descricaoBase, url].filter(Boolean).join(" • ");
      return { titulo, descricao };
    });

    return [...mappedPremios, ...mappedPublicacoes].filter(
      (i) => Boolean(i.titulo) || Boolean(i.descricao)
    );
  })();

  if (experienciasArray.length > 0) {
    contentSections.push({
      label: `Experiências Profissionais (${experienciasArray.length})`,
      content: experienciasArray,
      icon: Briefcase,
      isArray: true,
      isExperienceArray: true,
    });
  }

  if (formacaoArray.length > 0) {
    contentSections.push({
      label: `Formação Acadêmica (${formacaoArray.length})`,
      content: formacaoArray,
      icon: Award,
      isArray: true,
      isEducationArray: true,
    });
  }

  if (cursosCertificacoesFlat.length > 0) {
    contentSections.push({
      label: `Cursos e Certificações (${cursosCertificacoesFlat.length})`,
      content: cursosCertificacoesFlat,
      icon: GraduationCap,
      isArray: true,
      isCourseArray: true,
    });
  }

  if (premiosPublicacoesFlat.length > 0) {
    contentSections.push({
      label: `Prêmios e Publicações (${premiosPublicacoesFlat.length})`,
      content: premiosPublicacoesFlat,
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
                        {(item.periodo || item.dataInicio || item.dataFim) && (
                          <p className="text-xs text-gray-600">
                            {item.periodo ||
                              `${item.dataInicio || "—"}${
                                item.atual
                                  ? " • Atual"
                                  : item.dataFim
                                  ? ` → ${item.dataFim}`
                                  : ""
                              }`}
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
                        {(item.periodo ||
                          item.dataInicio ||
                          item.dataFim ||
                          item.status) && (
                          <p className="text-xs text-gray-600">
                            {item.periodo ||
                              `${item.dataInicio || "—"}${
                                item.status === "EM_ANDAMENTO" ||
                                item.status === "CURSANDO"
                                  ? " • Em andamento"
                                  : item.dataFim
                                  ? ` → ${item.dataFim}`
                                  : ""
                              }`}
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
                    (section.content as any[]).map((item, index) => {
                      const label =
                        typeof item === "string"
                          ? item
                          : `${item?.nome ?? "Habilidade"}${
                              item?.nivel ? ` • ${item.nivel}` : ""
                            }${
                              typeof item?.anosExperiencia === "number"
                                ? ` • ${item.anosExperiencia} ano(s)`
                                : ""
                            }`;
                      return (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="mr-2 mb-2"
                        >
                          {label}
                        </Badge>
                      );
                    })}
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

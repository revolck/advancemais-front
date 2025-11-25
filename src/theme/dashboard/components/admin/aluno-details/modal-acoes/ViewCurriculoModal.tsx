"use client";

import Image from "next/image";
import {
  ModalCustom,
  ModalContentWrapper,
  ModalBody,
  ModalFooter,
} from "@/components/ui/custom/modal";
import { DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { HorizontalTabs } from "@/components/ui/custom";
import type { HorizontalTabItem } from "@/components/ui/custom";
import { EmptyState } from "@/components/ui/custom";
import { ButtonCustom } from "@/components/ui/custom/button";
import { toastCustom } from "@/components/ui/custom/toast";
import {
  Crown,
  Globe,
  Award,
  GraduationCap,
  Trophy,
  Mail,
  Phone,
  Linkedin,
  Instagram,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Curriculo } from "@/api/candidatos/types";
import type { UsuarioGenerico } from "@/api/usuarios/types";
import { getAlunoInitials, formatTelefone } from "../utils/formatters";
import { generateCurriculoPdf } from "../utils/generateCurriculoPdf";

type ContactItem = {
  icon: typeof Mail;
  label: string;
  content: string;
  href: string;
  external?: boolean;
};

interface ViewCurriculoModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  curriculo: Curriculo;
  usuarioNome: string;
  usuarioData?: UsuarioGenerico | null;
}

export function ViewCurriculoModal({
  isOpen,
  onOpenChange,
  curriculo,
  usuarioNome,
  usuarioData,
}: ViewCurriculoModalProps) {
  const pdfRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | null>(null);

  const avatarUrl = usuarioData?.avatarUrl;
  const email = usuarioData?.email;
  const telefone = usuarioData?.telefone || usuarioData?.celular;
  const socialLinks = usuarioData?.socialLinks;
  const initials = getAlunoInitials(usuarioNome);

  const contactItems = useMemo<ContactItem[]>(() => {
    const items: ContactItem[] = [];

    if (email) {
      items.push({
        icon: Mail,
        label: "Email",
        content: email,
        href: `mailto:${email}`,
      });
    }

    if (telefone) {
      items.push({
        icon: Phone,
        label: "Telefone",
        content: formatTelefone(telefone),
        href: `tel:${telefone}`,
      });
    }

    if (socialLinks?.linkedin) {
      items.push({
        icon: Linkedin,
        label: "LinkedIn",
        content: socialLinks.linkedin,
        href: socialLinks.linkedin,
        external: true,
      });
    }

    if (socialLinks?.instagram) {
      items.push({
        icon: Instagram,
        label: "Instagram",
        content: socialLinks.instagram,
        href: socialLinks.instagram,
        external: true,
      });
    }

    return items;
  }, [email, telefone, socialLinks]);

  useEffect(() => {
    let isMounted = true;
    if (!avatarUrl) {
      setAvatarDataUrl(null);
      return () => {
        isMounted = false;
      };
    }

    fetch(avatarUrl)
      .then((response) => response.blob())
      .then(
        (blob) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          })
      )
      .then((dataUrl) => {
        if (isMounted) {
          setAvatarDataUrl(dataUrl);
        }
      })
      .catch(() => {
        if (isMounted) {
          setAvatarDataUrl(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [avatarUrl]);

  const slugify = useCallback((value: string) => {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }, []);

  const handleDownloadPdf = useCallback(async () => {
    setIsGeneratingPdf(true);

    try {
      await generateCurriculoPdf(curriculo, usuarioNome, usuarioData);

      toastCustom.success({
        title: "Download iniciado",
        description: "O currículo está sendo baixado em PDF.",
      });
    } catch (error) {
      console.error("Erro ao gerar PDF do currículo:", error);
      toastCustom.error({
        title: "Erro ao gerar PDF",
        description: "Não foi possível gerar o currículo em PDF.",
      });
    } finally {
      setIsGeneratingPdf(false);
    }
  }, [curriculo, usuarioNome, usuarioData]);

  const handleClose = () => onOpenChange(false);
  const avatarDisplay = avatarDataUrl || avatarUrl || null;

  const renderContactItem = useCallback((item: ContactItem, index: number) => {
    const IconComponent = item.icon;
    return (
      <div
        key={`${item.label}-${index}`}
        className="flex items-center gap-2 text-sm"
      >
        <IconComponent
          className={`h-4 w-4 shrink-0 ${
            item.external
              ? "text-[var(--primary-color)]"
              : "text-[var(--secondary-color)]"
          }`}
        />
        <a
          href={item.href}
          target={item.external ? "_blank" : undefined}
          rel={item.external ? "noopener noreferrer" : undefined}
          className="text-gray-700 hover:text-[var(--primary-color)] transition-colors truncate"
          title={item.label}
        >
          {item.content}
        </a>
      </div>
    );
  }, []);

  const renderContactList = useCallback(() => {
    if (contactItems.length === 0) {
      return null;
    }

    if (contactItems.length <= 2) {
      return (
        <div className="flex items-center gap-4 flex-wrap mt-2">
          {contactItems.map(renderContactItem)}
        </div>
      );
    }

    const gridCols =
      contactItems.length === 1
        ? "grid-cols-1"
        : contactItems.length === 3
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

    return (
      <div className={`grid ${gridCols} gap-3 mt-2`}>
        {contactItems.map(renderContactItem)}
      </div>
    );
  }, [contactItems, renderContactItem]);

  const pdfPreferences = useMemo(() => {
    const prefs: string[] = [];
    if (curriculo.areasInteresse?.primaria) {
      prefs.push(curriculo.areasInteresse.primaria);
    }
    if (curriculo.preferencias?.regime) {
      prefs.push(curriculo.preferencias.regime);
    }
    if (curriculo.preferencias?.local) {
      prefs.push(curriculo.preferencias.local);
    }
    return prefs;
  }, [
    curriculo.areasInteresse?.primaria,
    curriculo.preferencias?.regime,
    curriculo.preferencias?.local,
  ]);

  // Aba Sobre
  const sobreContent = (
    <div className="space-y-8">
      {curriculo.objetivo && (
        <div>
          <h5 className="!mb-0">Objetivo Profissional</h5>
          <p className="!leading-relaxed">{curriculo.objetivo}</p>
        </div>
      )}

      {curriculo.resumo && (
        <div>
          <h5 className="!mb-0">Resumo Profissional</h5>
          <p className="!leading-relaxed">{curriculo.resumo}</p>
        </div>
      )}

      {(curriculo.areasInteresse?.primaria ||
        curriculo.preferencias?.regime ||
        curriculo.preferencias?.local) && (
        <div className="!mt-[-10px]">
          <h5 className="!mb-2">Preferências</h5>
          <div className="flex flex-wrap gap-2.5">
            {curriculo.areasInteresse?.primaria && (
              <Badge
                variant="outline"
                className="text-xs font-medium border-[var(--primary-color)]/20 text-[var(--primary-color)] bg-[var(--primary-color)]/5 hover:bg-[var(--primary-color)]/10 hover:border-[var(--primary-color)]/30 transition-all px-3 py-1.5 rounded-md"
              >
                {curriculo.areasInteresse.primaria}
              </Badge>
            )}
            {curriculo.preferencias?.regime && (
              <Badge
                variant="outline"
                className="text-xs font-medium border-[var(--secondary-color)]/20 text-[var(--secondary-color)] bg-[var(--secondary-color)]/5 hover:bg-[var(--secondary-color)]/10 hover:border-[var(--secondary-color)]/30 transition-all px-3 py-1.5 rounded-md"
              >
                {curriculo.preferencias.regime}
              </Badge>
            )}
            {curriculo.preferencias?.local && (
              <Badge
                variant="outline"
                className="text-xs font-medium border-gray-300 text-gray-700 bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-all px-3 py-1.5 rounded-md"
              >
                {curriculo.preferencias.local}
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // Aba Experiência
  const experienciaContent = (
    <div className="space-y-8">
      {curriculo.experiencias && curriculo.experiencias.length > 0 ? (
        curriculo.experiencias.map((exp, index) => (
          <div key={index} className="relative">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                {exp.cargo && <h5 className="!mb-0">{exp.cargo}</h5>}
                <div className="mt-2 border-l border-slate-200/60 pl-4">
                  {exp.empresa && (
                    <p className="!mb-0 !text-[11px] !font-semibold !text-[var(--secondary-color)]">
                      {exp.empresa}
                    </p>
                  )}
                  {exp.periodo && <p>{exp.periodo}</p>}
                  {exp.descricao && <p className="!mb-0">{exp.descricao}</p>}
                  {index < curriculo.experiencias.length - 1 && (
                    <div className="absolute -bottom-4 left-0 right-0 h-px bg-gray-100" />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))
      ) : (
        <EmptyState
          illustration="fileNotFound"
          illustrationAlt="Nenhuma experiência"
          title="Nenhuma experiência profissional"
          description="Este currículo ainda não possui experiências profissionais cadastradas."
          maxContentWidth="md"
          size="sm"
        />
      )}
    </div>
  );

  // Aba Formação
  const formacaoContent = (
    <div className="space-y-10">
      {curriculo.formacao && curriculo.formacao.length > 0 && (
        <div>
          <h5 className="!mb-0 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-[var(--secondary-color)]" />
            Formação Acadêmica
          </h5>
          <div className="space-y-8 ml-3 mt-4 border-l border-slate-200/60 pl-4">
            {curriculo.formacao.map((form, index) => (
              <div key={index} className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {form.curso && <h6 className="!mb-0 mt-4">{form.curso}</h6>}
                    {form.instituicao && (
                      <p className="!mb-0 !text-[11px] !font-semibold !text-[var(--secondary-color)]">
                        {form.instituicao}
                      </p>
                    )}
                  </div>
                  {form.periodo && (
                    <span className="text-xs text-gray-500 whitespace-nowrap font-medium">
                      {form.periodo}
                    </span>
                  )}
                </div>
                {form.descricao && (
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {form.descricao}
                  </p>
                )}
                {index < curriculo.formacao.length - 1 && (
                  <div className="absolute -bottom-4 left-0 right-0 h-px bg-gray-100" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {curriculo.cursosCertificacoes &&
        curriculo.cursosCertificacoes.length > 0 && (
          <div>
            <h5 className="!mb-0 flex items-center gap-2">
              <Award className="h-4 w-4 text-[var(--secondary-color)]" />
              Cursos e Certificações
            </h5>
            <div className="space-y-8 ml-3 mt-4 border-l border-slate-200/60 pl-4">
              {curriculo.cursosCertificacoes.map((curso, index) => (
                <div key={index} className="relative">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex-1 min-w-0">
                      {curso.titulo && (
                        <h4 className="text-sm font-semibold text-gray-900 mb-1">
                          {curso.titulo}
                        </h4>
                      )}
                      {curso.instituicao && (
                        <p className="text-sm text-gray-600 font-medium">
                          {curso.instituicao}
                        </p>
                      )}
                    </div>
                    {curso.periodo && (
                      <span className="text-xs text-gray-500 whitespace-nowrap font-medium">
                        {curso.periodo}
                      </span>
                    )}
                  </div>
                  {index < curriculo.cursosCertificacoes.length - 1 && (
                    <div className="absolute -bottom-4 left-0 right-0 h-px bg-gray-100" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      {(!curriculo.formacao || curriculo.formacao.length === 0) &&
        (!curriculo.cursosCertificacoes ||
          curriculo.cursosCertificacoes.length === 0) && (
          <EmptyState
            illustration="fileNotFound"
            illustrationAlt="Nenhuma formação"
            title="Nenhuma formação cadastrada"
            description="Este currículo ainda não possui formação acadêmica ou cursos cadastrados."
            maxContentWidth="md"
            size="sm"
          />
        )}
    </div>
  );

  // Aba Habilidades
  const habilidadesContent = (
    <div className="space-y-10">
      {curriculo.habilidades?.tecnicas &&
        curriculo.habilidades.tecnicas.length > 0 && (
          <div>
            <h5 className="!mb-5 flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-[var(--primary-color)]" />
              Habilidades Técnicas
            </h5>
            <div className="flex flex-wrap gap-2.5">
              {curriculo.habilidades.tecnicas.map((habilidade, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs font-medium border-[var(--primary-color)]/20 text-[var(--primary-color)] bg-[var(--primary-color)]/5 hover:bg-[var(--primary-color)]/10 hover:border-[var(--primary-color)]/30 transition-all px-3 py-1.5 rounded-md"
                >
                  {habilidade}
                </Badge>
              ))}
            </div>
          </div>
        )}

      {curriculo.idiomas && curriculo.idiomas.length > 0 && (
        <div>
          <h5 className="mb-6 flex items-center gap-2">
            <Globe className="h-4 w-4 text-[var(--secondary-color)]" />
            Idiomas
          </h5>
          <div className="space-y-4">
            {curriculo.idiomas.map((idioma, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-900 font-medium">
                  {idioma.idioma}
                </span>
                <Badge
                  variant="outline"
                  className="text-xs font-medium border-gray-300 text-gray-700 bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-all px-3 py-1.5 rounded-md"
                >
                  {idioma.nivel}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {curriculo.premiosPublicacoes &&
        curriculo.premiosPublicacoes.length > 0 && (
          <div>
            <h5 className="!mb-6 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-[var(--primary-color)]" />
              Prêmios e Publicações
            </h5>
            <div className="space-y-8">
              {curriculo.premiosPublicacoes.map((premio, index) => (
                <div key={index} className="relative">
                  {premio.titulo && <h6 className="!mb-2">{premio.titulo}</h6>}
                  {premio.descricao && <p>{premio.descricao}</p>}
                  {index < curriculo.premiosPublicacoes.length - 1 && (
                    <div className="absolute -bottom-4 left-0 right-0 h-px bg-gray-100" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      {(!curriculo.habilidades?.tecnicas ||
        curriculo.habilidades.tecnicas.length === 0) &&
        (!curriculo.idiomas || curriculo.idiomas.length === 0) &&
        (!curriculo.premiosPublicacoes ||
          curriculo.premiosPublicacoes.length === 0) && (
          <EmptyState
            illustration="fileNotFound"
            illustrationAlt="Nenhuma habilidade"
            title="Nenhuma habilidade cadastrada"
            description="Este currículo ainda não possui habilidades técnicas, idiomas ou prêmios cadastrados."
            maxContentWidth="md"
            size="sm"
          />
        )}
    </div>
  );

  // Construir abas
  const tabs: HorizontalTabItem[] = [
    {
      value: "sobre",
      label: "Sobre",
      icon: "User",
      content: sobreContent,
    },
    {
      value: "experiencia",
      label: "Experiência",
      icon: "Briefcase",
      badge:
        curriculo.experiencias && curriculo.experiencias.length > 0
          ? curriculo.experiencias.length
          : undefined,
      content: experienciaContent,
    },
    {
      value: "formacao",
      label: "Formação",
      icon: "GraduationCap",
      badge:
        (curriculo.formacao?.length || 0) +
          (curriculo.cursosCertificacoes?.length || 0) >
        0
          ? (curriculo.formacao?.length || 0) +
            (curriculo.cursosCertificacoes?.length || 0)
          : undefined,
      content: formacaoContent,
    },
    {
      value: "habilidades",
      label: "Habilidades",
      icon: "Award",
      content: habilidadesContent,
    },
  ];

  return (
    <>
      <ModalCustom
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="5xl"
        backdrop="blur"
        scrollBehavior="inside"
      >
        <ModalContentWrapper>
          <DialogTitle className="sr-only">
            Currículo de {usuarioNome}
          </DialogTitle>
          <div className="-mx-2 -mt-4 px-6 pt-6 pb-4">
            <div className="flex gap-6">
              <div className="w-[13%] flex-shrink-0">
                <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-slate-200/70 bg-white">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={usuarioNome}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[var(--primary-color)]">
                      <span className="text-2xl font-semibold text-[var(--secondary-color)]">
                        {initials}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-2 flex-wrap mb-0">
                  <h2 className="!mb-0">{usuarioNome}</h2>
                  {curriculo.principal && (
                    <Badge
                      variant="outline"
                      className="bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1 w-fit"
                    >
                      <Crown className="h-3 w-3 fill-current" />
                      Currículo Principal
                    </Badge>
                  )}
                </div>
                {renderContactList()}
              </div>
            </div>
          </div>

          <ModalBody className="px-0 pb-6 pt-0 mt-[-10px] border-t border-slate-400/10">
            <HorizontalTabs items={tabs} defaultValue="sobre" />
          </ModalBody>

          <ModalFooter>
            <div className="flex items-center gap-3 justify-end w-full">
              <ButtonCustom
                variant="primary"
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                isLoading={isGeneratingPdf}
                loadingText="Gerando PDF..."
                icon="Download"
              >
                Baixar currículo
              </ButtonCustom>
              <ButtonCustom variant="outline" onClick={handleClose}>
                Fechar
              </ButtonCustom>
            </div>
          </ModalFooter>
        </ModalContentWrapper>
      </ModalCustom>

      <div
        ref={pdfRef}
        style={{
          position: "absolute",
          top: "-10000px",
          left: "-10000px",
          width: "794px",
          padding: "48px",
          backgroundColor: "#ffffff",
          color: "#1f2937",
          fontFamily: "'Nunito', Arial, sans-serif",
          lineHeight: 1.6,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "24px",
            borderBottom: "1px solid #e5e7eb",
            paddingBottom: "32px",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "110px",
              height: "110px",
              borderRadius: "16px",
              overflow: "hidden",
              backgroundColor: "#001a57",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              fontWeight: 700,
            }}
          >
            {avatarDisplay ? (
              <img
                src={avatarDisplay}
                alt={usuarioNome}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              initials
            )}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: "28px", fontWeight: 700 }}>
              {usuarioNome}
            </h1>
            {curriculo.titulo && (
              <p style={{ margin: "4px 0 16px", color: "#6b7280" }}>
                {curriculo.titulo}
              </p>
            )}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                fontSize: "12px",
                color: "#374151",
              }}
            >
              {contactItems.map((item) => (
                <span
                  key={`pdf-${item.label}`}
                  style={{ display: "flex", gap: "4px", alignItems: "center" }}
                >
                  <strong>{item.label}:</strong>
                  <span>{item.content}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            paddingTop: "24px",
          }}
        >
          {curriculo.objetivo && (
            <section>
              <h2 style={{ fontSize: "12px", letterSpacing: "0.1em" }}>
                OBJETIVO
              </h2>
              <p style={{ marginTop: "8px" }}>{curriculo.objetivo}</p>
            </section>
          )}

          {curriculo.resumo && (
            <section>
              <h2 style={{ fontSize: "12px", letterSpacing: "0.1em" }}>
                SOBRE
              </h2>
              <p style={{ marginTop: "8px" }}>{curriculo.resumo}</p>
            </section>
          )}

          {pdfPreferences.length > 0 && (
            <section>
              <h2 style={{ fontSize: "12px", letterSpacing: "0.1em" }}>
                PREFERÊNCIAS
              </h2>
              <p style={{ marginTop: "8px" }}>{pdfPreferences.join(" • ")}</p>
            </section>
          )}

          {curriculo.experiencias && curriculo.experiencias.length > 0 && (
            <section>
              <h2 style={{ fontSize: "12px", letterSpacing: "0.1em" }}>
                EXPERIÊNCIA
              </h2>
              <div
                style={{
                  marginTop: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                {curriculo.experiencias.map((exp, index) => (
                  <div key={`exp-pdf-${index}`}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontWeight: 600,
                      }}
                    >
                      <span>{exp.cargo}</span>
                      <span style={{ fontSize: "11px", color: "#6b7280" }}>
                        {exp.periodo}
                      </span>
                    </div>
                    {exp.empresa && (
                      <p style={{ margin: "2px 0", color: "#6b7280" }}>
                        {exp.empresa}
                      </p>
                    )}
                    {exp.descricao && (
                      <p style={{ margin: 0 }}>{exp.descricao}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {curriculo.formacao && curriculo.formacao.length > 0 && (
            <section>
              <h2 style={{ fontSize: "12px", letterSpacing: "0.1em" }}>
                FORMAÇÃO
              </h2>
              <div
                style={{
                  marginTop: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                {curriculo.formacao.map((form, index) => (
                  <div key={`edu-${index}`}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontWeight: 600,
                      }}
                    >
                      <span>{form.curso}</span>
                      <span style={{ fontSize: "11px", color: "#6b7280" }}>
                        {form.periodo}
                      </span>
                    </div>
                    {form.instituicao && (
                      <p style={{ margin: "2px 0", color: "#6b7280" }}>
                        {form.instituicao}
                      </p>
                    )}
                    {form.descricao && (
                      <p style={{ margin: 0 }}>{form.descricao}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {curriculo.cursosCertificacoes &&
            curriculo.cursosCertificacoes.length > 0 && (
              <section>
                <h2 style={{ fontSize: "12px", letterSpacing: "0.1em" }}>
                  CURSOS E CERTIFICAÇÕES
                </h2>
                <div
                  style={{
                    marginTop: "12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  {curriculo.cursosCertificacoes.map((curso, index) => (
                    <div key={`curso-${index}`}>
                      <div style={{ fontWeight: 600 }}>{curso.titulo}</div>
                      {curso.instituicao && (
                        <p style={{ margin: "2px 0", color: "#6b7280" }}>
                          {curso.instituicao}
                        </p>
                      )}
                      {curso.periodo && (
                        <p
                          style={{
                            margin: 0,
                            fontSize: "12px",
                            color: "#6b7280",
                          }}
                        >
                          {curso.periodo}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

          {curriculo.habilidades?.tecnicas &&
            curriculo.habilidades.tecnicas.length > 0 && (
              <section>
                <h2 style={{ fontSize: "12px", letterSpacing: "0.1em" }}>
                  HABILIDADES TÉCNICAS
                </h2>
                <p style={{ marginTop: "8px" }}>
                  {curriculo.habilidades.tecnicas.join(" • ")}
                </p>
              </section>
            )}

          {curriculo.idiomas && curriculo.idiomas.length > 0 && (
            <section>
              <h2 style={{ fontSize: "12px", letterSpacing: "0.1em" }}>
                IDIOMAS
              </h2>
              <div
                style={{
                  marginTop: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                {curriculo.idiomas.map((idioma, index) => (
                  <div
                    key={`lang-${index}`}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "13px",
                    }}
                  >
                    <span>{idioma.idioma}</span>
                    <span style={{ color: "#6b7280" }}>{idioma.nivel}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {curriculo.premiosPublicacoes &&
            curriculo.premiosPublicacoes.length > 0 && (
              <section>
                <h2 style={{ fontSize: "12px", letterSpacing: "0.1em" }}>
                  PRÊMIOS E PUBLICAÇÕES
                </h2>
                <div
                  style={{
                    marginTop: "12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  {curriculo.premiosPublicacoes.map((premio, index) => (
                    <div key={`award-${index}`}>
                      {premio.titulo && (
                        <p style={{ margin: 0, fontWeight: 600 }}>
                          {premio.titulo}
                        </p>
                      )}
                      {premio.descricao && (
                        <p style={{ margin: "4px 0 0" }}>{premio.descricao}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
        </div>
      </div>
    </>
  );
}

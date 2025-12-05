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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Globe,
  GraduationCap,
  Briefcase,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getCandidaturaDetalhe } from "@/api/candidatos";
import type { Curriculo } from "@/api/candidatos/types";
import { toastCustom } from "@/components/ui/custom/toast";
import { generateCurriculoPdf } from "../../candidato-details/utils/generateCurriculoPdf";
import type { CandidatoItem } from "../types";
import { formatDate } from "../utils";
import { getInitials } from "../utils/formatters";

// Formata telefone com máscara brasileira
function formatTelefone(phone?: string | null): string {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return cleaned.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  }
  if (cleaned.length === 10) {
    return cleaned.replace(/^(\d{2})(\d{4})(\d{4})$/, "($1) $2-$3");
  }
  return phone;
}

// Tipos baseados na nova estrutura da API
interface CandidaturaData {
  id: string;
  status: string;
  aplicadaEm: string;
  candidato: {
    id: string;
    nome: string;
    nomeCompleto?: string;
    email: string;
    telefone?: string | null;
    avatarUrl?: string | null;
    cidade?: string | null;
    estado?: string | null;
  } | null;
  curriculo: {
    id: string;
    titulo?: string | null;
    resumo?: string | null;
    objetivo?: string | null;
    experiencias?: Array<{
      empresa?: string;
      cargo?: string;
      periodo?: string;
      descricao?: string;
      atual?: boolean;
    }> | null;
    formacao?: Array<{
      curso?: string;
      instituicao?: string;
      periodo?: string;
      nivel?: string;
      concluido?: boolean;
    }> | null;
    habilidades?: {
      tecnicas?: string[];
      comportamentais?: string[];
      ferramentas?: string[];
    } | null;
    idiomas?: Array<{
      idioma?: string;
      nivel?: string;
    }> | null;
  } | null;
}

type ContactItem = {
  icon: typeof Mail;
  label: string;
  content: string;
  href?: string;
};

// Loading Skeleton seguindo o padrão do modal
function LoadingSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex gap-6">
        <Skeleton className="w-24 h-24 rounded-lg shrink-0" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-7 w-48" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-4 w-36" />
        </div>
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="space-y-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    </div>
  );
}

interface VerCandidatoDetalheModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  candidaturaId?: string;
  fallback?: Pick<CandidatoItem, "nome" | "email" | "telefone" | "dataInscricao" | "avatarUrl">;
}

export function VerCandidatoDetalheModal({
  isOpen,
  onOpenChange,
  candidaturaId,
  fallback,
}: VerCandidatoDetalheModalProps) {
  const [data, setData] = useState<CandidaturaData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!isOpen || !candidaturaId) return;
      
      setLoading(true);
      setError(null);
      setData(null);

      try {
        const response = await getCandidaturaDetalhe(candidaturaId);
        
        if (!mounted) return;
        
        // A API pode retornar direto ou dentro de { success, candidatura }
        if (response && typeof response === 'object') {
          if ('candidatura' in response) {
            setData(response.candidatura as CandidaturaData);
          } else {
            setData(response as unknown as CandidaturaData);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar candidatura:", err);
        if (mounted) {
          setError("Não foi possível carregar os dados do candidato.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [isOpen, candidaturaId]);

  const handleClose = () => onOpenChange(false);

  // Dados do candidato
  const candidato = data?.candidato;
  const curriculo = data?.curriculo;

  // Dados do header (usa fallback se não tiver dados da API)
  const nome = candidato?.nome ?? candidato?.nomeCompleto ?? fallback?.nome ?? "Candidato";

  // Download do currículo - gera PDF no frontend usando a função existente
  const handleDownloadCurriculo = useCallback(async () => {
    if (!curriculo) {
      toastCustom.error({
        title: "Currículo não disponível",
        description: "Este candidato não possui currículo cadastrado.",
      });
      return;
    }

    setIsDownloading(true);
    try {
      // Monta os dados do usuário para o PDF
      const usuarioData = {
        email: candidato?.email,
        telefone: candidato?.telefone,
        avatarUrl: candidato?.avatarUrl,
      };
      
      // Gera o PDF no frontend
      await generateCurriculoPdf(
        curriculo as Curriculo,
        nome,
        usuarioData as Parameters<typeof generateCurriculoPdf>[2]
      );
      
      toastCustom.success({
        title: "Download iniciado",
        description: "O currículo está sendo baixado em PDF.",
      });
    } catch (error) {
      console.error("Erro ao gerar PDF do currículo:", error);
      toastCustom.error({
        title: "Erro ao gerar PDF",
        description: "Não foi possível gerar o currículo em PDF. Tente novamente.",
      });
    } finally {
      setIsDownloading(false);
    }
  }, [curriculo, candidato, nome]);
  const email = candidato?.email ?? fallback?.email ?? "";
  const telefone = candidato?.telefone ?? fallback?.telefone ?? "";
  const avatarUrl = candidato?.avatarUrl ?? fallback?.avatarUrl ?? null;
  const cidade = candidato?.cidade;
  const estado = candidato?.estado;
  const inscricao = data?.aplicadaEm ?? fallback?.dataInscricao ?? "";
  const initials = getInitials(nome);

  // Items de contato
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

    if (cidade || estado) {
      items.push({
        icon: MapPin,
        label: "Localização",
        content: [cidade, estado].filter(Boolean).join(", "),
      });
    }

    if (inscricao) {
      items.push({
        icon: Calendar,
        label: "Inscrito em",
        content: formatDate(inscricao),
      });
    }

    return items;
  }, [email, telefone, cidade, estado, inscricao]);

  const renderContactItem = useCallback((item: ContactItem, index: number) => {
    const IconComponent = item.icon;
    const content = (
      <div
        key={`${item.label}-${index}`}
        className="flex items-center gap-2 text-sm"
      >
        <IconComponent className="h-4 w-4 shrink-0 text-[var(--secondary-color)]" />
        {item.href ? (
          <a
            href={item.href}
            className="text-gray-700 hover:text-[var(--primary-color)] transition-colors truncate"
            title={item.label}
          >
            {item.content}
          </a>
        ) : (
          <span className="text-gray-700 truncate" title={item.label}>
            {item.content}
          </span>
        )}
      </div>
    );
    return content;
  }, []);

  const renderContactList = useCallback(() => {
    if (contactItems.length === 0) return null;

    return (
      <div className="flex items-center gap-4 flex-wrap mt-2">
        {contactItems.map(renderContactItem)}
      </div>
    );
  }, [contactItems, renderContactItem]);

  // Dados do currículo
  const experiencias = useMemo(() => curriculo?.experiencias ?? [], [curriculo?.experiencias]);
  const formacoes = useMemo(() => curriculo?.formacao ?? [], [curriculo?.formacao]);
  const idiomas = useMemo(() => curriculo?.idiomas ?? [], [curriculo?.idiomas]);
  
  // Agrupa todas as habilidades
  const habilidadesTecnicas = curriculo?.habilidades?.tecnicas ?? [];
  const habilidadesComportamentais = curriculo?.habilidades?.comportamentais ?? [];
  const habilidadesFerramentas = curriculo?.habilidades?.ferramentas ?? [];
  const todasHabilidades = [...habilidadesTecnicas, ...habilidadesComportamentais, ...habilidadesFerramentas];

  // Aba Currículo (Sobre)
  const sobreContent = (
    <div className="space-y-8">
      {curriculo?.titulo && (
        <div>
          <h5 className="!mb-0">Título</h5>
          <p className="!leading-relaxed">{curriculo.titulo}</p>
        </div>
      )}

      {curriculo?.resumo && (
        <div>
          <h5 className="!mb-0">Resumo Profissional</h5>
          <p className="!leading-relaxed">{curriculo.resumo}</p>
        </div>
      )}

      {curriculo?.objetivo && (
        <div>
          <h5 className="!mb-0">Objetivo Profissional</h5>
          <p className="!leading-relaxed">{curriculo.objetivo}</p>
        </div>
      )}

      {!curriculo?.titulo && !curriculo?.resumo && !curriculo?.objetivo && (
        <EmptyState
          illustration="fileNotFound"
          illustrationAlt="Sem informações"
          title="Sem informações adicionais"
          description="O candidato não preencheu informações de resumo ou objetivo no currículo."
          maxContentWidth="md"
          size="sm"
        />
      )}
    </div>
  );

  // Aba Experiência
  const experienciaContent = (
    <div className="space-y-8">
      {experiencias.length > 0 ? (
        experiencias.map((exp, index) => (
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
                </div>
              </div>
              {exp.atual && (
                <Badge
                  variant="outline"
                  className="text-xs font-medium border-green-200 text-green-700 bg-green-50 px-2 py-0.5"
                >
                  Atual
                </Badge>
              )}
            </div>
            {index < experiencias.length - 1 && (
              <div className="absolute -bottom-4 left-0 right-0 h-px bg-gray-100" />
            )}
          </div>
        ))
      ) : (
        <EmptyState
          illustration="fileNotFound"
          illustrationAlt="Nenhuma experiência"
          title="Nenhuma experiência profissional"
          description="Este candidato ainda não cadastrou experiências profissionais."
          maxContentWidth="md"
          size="sm"
        />
      )}
    </div>
  );

  // Aba Formação
  const formacaoContent = (
    <div className="space-y-10">
      {formacoes.length > 0 ? (
        <div>
          <h5 className="!mb-0 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-[var(--secondary-color)]" />
            Formação Acadêmica
          </h5>
          <div className="space-y-8 ml-3 mt-4 border-l border-slate-200/60 pl-4">
            {formacoes.map((form, index) => (
              <div key={index} className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {form.curso && <h6 className="!mb-0 mt-4">{form.curso}</h6>}
                    {form.instituicao && (
                      <p className="!mb-0 !text-[11px] !font-semibold !text-[var(--secondary-color)]">
                        {form.instituicao}
                      </p>
                    )}
                    {form.nivel && (
                      <p className="!text-xs !text-gray-500">{form.nivel}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {form.periodo && (
                      <span className="text-xs text-gray-500 whitespace-nowrap font-medium">
                        {form.periodo}
                      </span>
                    )}
                    {form.concluido !== undefined && (
                      <Badge
                        variant="outline"
                        className={`text-xs font-medium px-2 py-0.5 ${
                          form.concluido
                            ? "border-green-200 text-green-700 bg-green-50"
                            : "border-amber-200 text-amber-700 bg-amber-50"
                        }`}
                      >
                        {form.concluido ? "Concluído" : "Em andamento"}
                      </Badge>
                    )}
                  </div>
                </div>
                {index < formacoes.length - 1 && (
                  <div className="absolute -bottom-4 left-0 right-0 h-px bg-gray-100" />
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState
          illustration="fileNotFound"
          illustrationAlt="Nenhuma formação"
          title="Nenhuma formação cadastrada"
          description="Este candidato ainda não cadastrou informações de formação acadêmica."
          maxContentWidth="md"
          size="sm"
        />
      )}
    </div>
  );

  // Aba Habilidades
  const habilidadesContent = (
    <div className="space-y-10">
      {todasHabilidades.length > 0 && (
        <div>
          <h5 className="!mb-5 flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-[var(--primary-color)]" />
            Habilidades
          </h5>
          <div className="flex flex-wrap gap-2.5">
            {todasHabilidades.map((habilidade, index) => (
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

      {idiomas.length > 0 && (
        <div>
          <h5 className="mb-6 flex items-center gap-2">
            <Globe className="h-4 w-4 text-[var(--secondary-color)]" />
            Idiomas
          </h5>
          <div className="space-y-4">
            {idiomas.map((idioma, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-900 font-medium">
                  {idioma.idioma}
                </span>
                {idioma.nivel && (
                  <Badge
                    variant="outline"
                    className="text-xs font-medium border-gray-300 text-gray-700 bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-all px-3 py-1.5 rounded-md"
                  >
                    {idioma.nivel}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {todasHabilidades.length === 0 && idiomas.length === 0 && (
        <EmptyState
          illustration="fileNotFound"
          illustrationAlt="Nenhuma habilidade"
          title="Nenhuma habilidade cadastrada"
          description="Este candidato ainda não cadastrou habilidades ou idiomas."
          maxContentWidth="md"
          size="sm"
        />
      )}
    </div>
  );

  // Construir abas
  const tabs: HorizontalTabItem[] = [
    {
      value: "curriculo",
      label: "Currículo",
      icon: "FileText",
      content: sobreContent,
    },
    {
      value: "experiencia",
      label: "Experiências",
      icon: "Briefcase",
      badge: experiencias.length > 0 ? experiencias.length : undefined,
      content: experienciaContent,
    },
    {
      value: "formacao",
      label: "Formação",
      icon: "GraduationCap",
      badge: formacoes.length > 0 ? formacoes.length : undefined,
      content: formacaoContent,
    },
    {
      value: "habilidades",
      label: "Habilidades",
      icon: "Award",
      content: habilidadesContent,
    },
  ];

  // Se está carregando ou não tem dados ainda
  if (loading) {
    return (
      <ModalCustom
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="5xl"
        backdrop="blur"
        scrollBehavior="inside"
      >
        <ModalContentWrapper>
          <DialogTitle className="sr-only">Carregando detalhes do candidato</DialogTitle>
          <LoadingSkeleton />
        </ModalContentWrapper>
      </ModalCustom>
    );
  }

  // Se deu erro
  if (error) {
    return (
      <ModalCustom
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="md"
        backdrop="blur"
      >
        <ModalContentWrapper>
          <DialogTitle className="sr-only">Erro ao carregar candidato</DialogTitle>
          <ModalBody>
            <EmptyState
              illustration="fileNotFound"
              illustrationAlt="Erro"
              title="Erro ao carregar"
              description={error}
              maxContentWidth="sm"
              size="sm"
            />
          </ModalBody>
          <ModalFooter>
            <ButtonCustom variant="outline" onClick={handleClose}>
              Fechar
            </ButtonCustom>
          </ModalFooter>
        </ModalContentWrapper>
      </ModalCustom>
    );
  }

  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="5xl"
      backdrop="blur"
      scrollBehavior="inside"
    >
      <ModalContentWrapper>
        <DialogTitle className="sr-only">
          Detalhes de {nome}
        </DialogTitle>
        
        {/* Header com avatar e informações de contato */}
        <div className="-mx-2 -mt-4 px-6 pt-6 pb-4">
          <div className="flex gap-6">
            {/* Avatar */}
            <div className="w-[13%] flex-shrink-0">
              <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-slate-200/70 bg-white">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={nome}
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

            {/* Informações */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="flex items-center gap-2 flex-wrap mb-0">
                <h2 className="!mb-0">{nome}</h2>
              </div>
              {curriculo?.titulo && (
                <p className="!text-sm !text-gray-600 !mb-0">{curriculo.titulo}</p>
              )}
              {renderContactList()}
            </div>
          </div>
        </div>

        {/* Tabs com conteúdo */}
        <ModalBody className="px-0 pb-6 pt-0 mt-[-10px] border-t border-slate-400/10">
          <HorizontalTabs items={tabs} defaultValue="curriculo" />
        </ModalBody>

        {/* Footer */}
        <ModalFooter>
          <div className="flex items-center gap-3 justify-end w-full">
            {curriculo && (
              <ButtonCustom
                variant="primary"
                onClick={handleDownloadCurriculo}
                disabled={isDownloading}
                isLoading={isDownloading}
                loadingText="Gerando PDF..."
                icon="Download"
              >
                Baixar currículo
              </ButtonCustom>
            )}
            <ButtonCustom variant="outline" onClick={handleClose}>
              Fechar
            </ButtonCustom>
          </div>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}

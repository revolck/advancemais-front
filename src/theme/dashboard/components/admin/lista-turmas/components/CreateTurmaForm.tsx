"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ButtonCustom,
  Icon,
  Stepper,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperTitle,
  StepperTrigger,
  StepperSeparator,
} from "@/components/ui/custom";
import { CardCustom } from "@/components/ui/custom";
import { Check, Loader2, CheckCircle2, Users } from "lucide-react";
import { FormLoadingModal } from "@/components/ui/custom/form-loading-modal";
import { motion, AnimatePresence } from "framer-motion";
import { InputCustom } from "@/components/ui/custom/input";
import { DatePickerRangeCustom } from "@/components/ui/custom/date-picker";
import { SelectCustom } from "@/components/ui/custom/select";
import { Label } from "@/components/ui/label";
import { toastCustom } from "@/components/ui/custom";
import {
  createTurma,
  vincularTemplatesAoCurso,
  type CreateTurmaPayload,
} from "@/api/cursos";
import { BuilderManager } from "@/components/ui/custom/builder-manager/BuilderManager";
import {
  type BuilderData,
  getDefaultBuilder,
} from "@/components/ui/custom/builder-manager/types";
import { useCursosForSelect } from "../hooks/useCursosForSelect";
import { useInstrutoresForSelect } from "../hooks/useInstrutoresForSelect";
import { useTemplatesForTurma } from "../hooks/useTemplatesForTurma";
import { Skeleton } from "@/components/ui/skeleton";

interface CreateTurmaFormProps {
  onSuccess?: () => void;
}

const TURNO_OPTIONS = [
  { value: "MANHA", label: "Manhã" },
  { value: "TARDE", label: "Tarde" },
  { value: "NOITE", label: "Noite" },
  { value: "INTEGRAL", label: "Integral" },
];

const METODO_OPTIONS = [
  { value: "ONLINE", label: "Online" },
  { value: "PRESENCIAL", label: "Presencial" },
  { value: "LIVE", label: "Ao vivo" },
  { value: "SEMIPRESENCIAL", label: "Semipresencial" },
];

const STATUS_OPTIONS = [
  { value: "RASCUNHO", label: "Rascunho" },
  { value: "PUBLICADO", label: "Publicado" },
];

const TEMPLATE_OPTIONS = [
  {
    value: "MODULAR",
    label: "Modular",
    helper: "Curso organizado por módulos",
  },
  { value: "DINAMICA", label: "Dinâmica", helper: "Módulos + aulas avulsas" },
  { value: "PADRAO", label: "Padrão", helper: "Aulas sem módulos" },
] as const;

type TemplateOptionValue = (typeof TEMPLATE_OPTIONS)[number]["value"];

const ACCENT_BY_TEMPLATE: Record<TemplateOptionValue, string> = {
  MODULAR: "#6366f1", // indigo
  DINAMICA: "#06b6d4", // cyan
  PADRAO: "#22c55e", // emerald
};

const ACCENTS: Record<
  TemplateOptionValue,
  { solid: string; from: string; to: string }
> = {
  MODULAR: { solid: "#6366f1", from: "#a78bfa", to: "#6366f1" }, // violet -> indigo
  DINAMICA: { solid: "#06b6d4", from: "#67e8f9", to: "#06b6d4" }, // sky -> cyan
  PADRAO: { solid: "#22c55e", from: "#86efac", to: "#22c55e" }, // light emerald -> emerald
};

const TEMPLATE_PREVIEW: Record<TemplateOptionValue, string> = {
  MODULAR: "/images/templates/modular.svg",
  DINAMICA: "/images/templates/dinamica.svg",
  PADRAO: "/images/templates/padrao.svg",
};

function TooltipCard({
  color,
  title,
  bullets,
  note,
}: {
  color: string;
  title: string;
  bullets: string[];
  note: string;
}) {
  return (
    <div className="w-[300px]">
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ background: color }}
        />
        <span className="text-[13px] font-semibold" style={{ color }}>
          {title}
        </span>
      </div>
      <ul className="space-y-1.5">
        {bullets.map((b, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-[12px] leading-5 opacity-90"
          >
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5" style={{ color }} />
            <span>{b}</span>
          </li>
        ))}
      </ul>
      <div className="mt-2 text-[11px] opacity-90" style={{ color }}>
        {note}
      </div>
    </div>
  );
}

const TEMPLATE_TOOLTIP: Record<TemplateOptionValue, React.ReactNode> = {
  MODULAR: (
    <div className="w-auto">
      <div
        className="text-[13px] font-semibold mt-3"
        style={{ color: ACCENTS.MODULAR.to }}
      >
        Estrutura Modular
      </div>
      <p className="mt-1 !text-[12px] !text-white/50 !leading-normal text-justify">
        Organiza o curso em módulos com etapas e possíveis pré‑requisitos. Ideal
        para trilhas longas em que você acompanha progresso e avaliações por
        módulo.
      </p>
    </div>
  ),
  DINAMICA: (
    <div className="w-auto">
      <div
        className="text-[13px] font-semibold mt-3"
        style={{ color: ACCENTS.DINAMICA.to }}
      >
        Estrutura Dinâmica
      </div>
      <p className="mt-1 !text-[12px] !text-white/50 !leading-normal text-justify">
        Combina módulos com aulas avulsas, permitindo ajustes ao longo do curso.
        Boa escolha quando o calendário varia e você precisa de flexibilidade
        para inserir conteúdos pontuais.
      </p>
    </div>
  ),
  PADRAO: (
    <div className="w-auto">
      <div
        className="text-[13px] font-semibold mt-3"
        style={{ color: ACCENTS.PADRAO.to }}
      >
        Estrutura Padrão
      </div>
      <p className="mt-1 !text-[12px] !text-white/50 !leading-normal text-justify">
        Lista linear de aulas, sem módulos. Configuração rápida e manutenção
        simples, indicada para conteúdos curtos e objetivos.
      </p>
    </div>
  ),
};

export function CreateTurmaForm({ onSuccess }: CreateTurmaFormProps) {
  const {
    cursos,
    isLoading: loadingCursos,
    error: cursosError,
    refetch: refetchCursos,
  } = useCursosForSelect();
  const { instrutores } = useInstrutoresForSelect();

  const [cursoId, setCursoId] = useState<string | null>(null);
  const {
    aulas: aulaTemplates,
    avaliacoes: avaliacaoTemplates,
    isLoading: loadingTemplates,
  } = useTemplatesForTurma({ cursoId });
  const [nome, setNome] = useState("");
  const [turno, setTurno] = useState<string | null>(null);
  const [metodo, setMetodo] = useState<string | null>(null);
  const [estruturaTipo, setEstruturaTipo] =
    useState<TemplateOptionValue | null>(null);
  const [status, setStatus] = useState<"RASCUNHO" | "PUBLICADO">("RASCUNHO");
  const [vagasIlimitadas, setVagasIlimitadas] = useState<boolean>(true);
  const [vagasTotais, setVagasTotais] = useState<string>("");
  const [curriculum, setCurriculum] = useState<BuilderData>({
    modules: [],
    standaloneItems: [],
  });
  const [dataInicio, setDataInicio] = useState<string>("");
  const [dataFim, setDataFim] = useState<string>("");
  const [dataInscricaoInicio, setDataInscricaoInicio] = useState<string>("");
  const [dataInscricaoFim, setDataInscricaoFim] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [step, setStep] = useState(1); // 1: Fluxo & iniciais, 2: Configurações, 3: Estrutura, 4: Revisão
  // Imagem do curso/turma (opcional)
  // imagem foi removida do cadastro de turmas

  const isFirstStep = step === 1;
  const isLastStep = step === 4;

  const toMs = (iso: string) => new Date(iso).getTime();

  const minDateTurma = useMemo(() => {
    const base = dataInscricaoFim ? new Date(dataInscricaoFim) : new Date();
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate());
    // Regra: início da turma deve ser APÓS o fim das inscrições
    d.setDate(d.getDate() + 1);
    return d;
  }, [dataInscricaoFim]);

  useEffect(() => {
    if (!dataInscricaoFim) return;
    if (!dataInicio && !dataFim) return;

    const min = new Date(
      minDateTurma.getFullYear(),
      minDateTurma.getMonth(),
      minDateTurma.getDate()
    ).getTime();

    const turmaIni = dataInicio ? toMs(dataInicio) : null;
    const turmaFim = dataFim ? toMs(dataFim) : null;

    // Se a turma já foi escolhida e ficou inválida após alterar inscrições, limpa.
    if (
      (turmaIni != null && turmaIni < min) ||
      (turmaFim != null && turmaFim < min)
    ) {
      setDataInicio("");
      setDataFim("");
      toastCustom.error(
        "O período da turma deve iniciar após o encerramento das inscrições."
      );
    }
  }, [dataFim, dataInicio, dataInscricaoFim, minDateTurma]);

  const validateStep1 = (): boolean => {
    if (!estruturaTipo) {
      toastCustom.error("Selecione um tipo de estrutura.");
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    if (!cursoId) {
      toastCustom.error("Selecione o curso da turma.");
      return false;
    }

    const nomeTrim = nome.trim();
    if (nomeTrim.length < 3 || nomeTrim.length > 255) {
      toastCustom.error("O nome deve ter entre 3 e 255 caracteres.");
      return false;
    }

    if (!turno || !metodo) {
      toastCustom.error("Selecione turno e modalidade.");
      return false;
    }

    if (!dataInscricaoInicio || !dataInscricaoFim) {
      toastCustom.error("Informe o período de inscrições.");
      return false;
    }
    if (!dataInicio || !dataFim) {
      toastCustom.error("Informe o período da turma.");
      return false;
    }

    const inscrIni = toMs(dataInscricaoInicio);
    const inscrFim = toMs(dataInscricaoFim);
    const turmaIni = toMs(dataInicio);
    const turmaFim = toMs(dataFim);

    if (Number.isNaN(inscrIni) || Number.isNaN(inscrFim)) {
      toastCustom.error("Período de inscrições inválido.");
      return false;
    }
    if (Number.isNaN(turmaIni) || Number.isNaN(turmaFim)) {
      toastCustom.error("Período da turma inválido.");
      return false;
    }

    if (inscrIni > inscrFim) {
      toastCustom.error("Inscrições: término deve ser após o início.");
      return false;
    }
    if (turmaIni > turmaFim) {
      toastCustom.error("Turma: término deve ser após o início.");
      return false;
    }

    // Regra do backend: turma não pode iniciar antes do fim das inscrições
    if (turmaIni <= inscrFim) {
      toastCustom.error(
        "A turma não pode iniciar antes do encerramento das inscrições."
      );
      return false;
    }

    if (!vagasIlimitadas) {
      const vagas = Number(vagasTotais);
      if (!Number.isInteger(vagas) || vagas <= 0) {
        toastCustom.error("Informe um número de vagas maior que zero.");
        return false;
      }
    }

    return true;
  };

  const validateStep3 = (): boolean => {
    const standalone = curriculum.standaloneItems || [];
    const modules = curriculum.modules || [];

    const hasModules = modules.length > 0;
    const hasStandalone = standalone.length > 0;

    if (estruturaTipo === "MODULAR") {
      if (!hasModules) {
        toastCustom.error("Estrutura modular: adicione ao menos 1 módulo.");
        return false;
      }
      if (hasStandalone) {
        toastCustom.error(
          "Estrutura modular: itens avulsos não são permitidos."
        );
        return false;
      }
    }

    if (estruturaTipo === "PADRAO") {
      if (hasModules) {
        toastCustom.error("Estrutura padrão: módulos não são permitidos.");
        return false;
      }
      if (!hasStandalone) {
        toastCustom.error("Estrutura padrão: adicione ao menos 1 item.");
        return false;
      }
    }

    if (estruturaTipo === "DINAMICA") {
      if (!hasModules && !hasStandalone) {
        toastCustom.error(
          "Estrutura dinâmica: adicione ao menos 1 módulo ou item avulso."
        );
        return false;
      }
    }

    const allItems = [
      ...modules.flatMap((m) => m.items || []),
      ...standalone,
    ];

    if (allItems.length === 0) {
      toastCustom.error("Adicione itens à estrutura.");
      return false;
    }

    const missingTemplate = allItems.find((it) => !it.templateId);
    if (missingTemplate) {
      toastCustom.error(
        "Há itens sem template vinculado. Abra o item e selecione um template."
      );
      return false;
    }

    const hasAula = allItems.some((it) => it.type === "AULA");
    const hasAvaliacao = allItems.some(
      (it) => it.type === "PROVA" || it.type === "ATIVIDADE"
    );
    if (!hasAula || !hasAvaliacao) {
      toastCustom.error(
        "A estrutura deve conter pelo menos 1 AULA e 1 PROVA ou ATIVIDADE."
      );
      return false;
    }

    return true;
  };

  const validate = (): boolean => {
    return validateStep1() && validateStep2() && validateStep3();
  };

  const validateStep = (current: number): boolean => {
    if (current === 1) {
      return validateStep1();
    }
    if (current === 2) {
      return validateStep2();
    }
    if (current === 3) {
      return validateStep3();
    }
    return true;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setLoadingStep("Criando turma...");
    try {
      const isUuid = (value: string) =>
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
          value
        );

      const aulaStatusById = new Map(
        (aulaTemplates || []).map((a) => [String(a.id), a.status])
      );
      const avaliacaoStatusById = new Map(
        (avaliacaoTemplates || []).map((a) => [String(a.id), a.status])
      );

      const allItems = [
        ...curriculum.modules.flatMap((m) => m.items || []),
        ...(curriculum.standaloneItems || []),
      ];

      const selectedAulaTemplateIds = new Set(
        allItems.filter((it) => it.type === "AULA").map((it) => String(it.templateId))
      );
      const selectedAvaliacaoTemplateIds = new Set(
        allItems
          .filter((it) => it.type === "PROVA" || it.type === "ATIVIDADE")
          .map((it) => String(it.templateId))
      );

      const aulasToLink = (aulaTemplates || []).filter(
        (t) => selectedAulaTemplateIds.has(String(t.id)) && !t.cursoId
      );
      const avaliacoesToLink = (avaliacaoTemplates || []).filter(
        (t) => selectedAvaliacaoTemplateIds.has(String(t.id)) && !t.cursoId
      );

      if (cursoId && (aulasToLink.length > 0 || avaliacoesToLink.length > 0)) {
        try {
          setLoadingStep("Vinculando templates ao curso...");
          await vincularTemplatesAoCurso({
            cursoId,
            ...(aulasToLink.length > 0
              ? { aulaTemplateIds: aulasToLink.map((t) => String(t.id)) }
              : {}),
            ...(avaliacoesToLink.length > 0
              ? { avaliacaoTemplateIds: avaliacoesToLink.map((t) => String(t.id)) }
              : {}),
          });
        } catch (err: any) {
          const message = err?.message || "Falha ao vincular templates ao curso.";
          toastCustom.error({
            title: "Erro ao vincular templates",
            description: message,
          });
          return;
        }
      }

      const payload: CreateTurmaPayload = {
        estruturaTipo: estruturaTipo as any,
        nome: nome.trim(),
        turno: turno as any,
        metodo: metodo as any,
        status,
        dataInscricaoInicio: new Date(dataInscricaoInicio).toISOString(),
        dataInscricaoFim: new Date(dataInscricaoFim).toISOString(),
        dataInicio: new Date(dataInicio).toISOString(),
        dataFim: new Date(dataFim).toISOString(),
        vagasIlimitadas,
        ...(!vagasIlimitadas ? { vagasTotais: Number(vagasTotais) } : {}),
        estrutura: {
          modules: (curriculum.modules || []).map((m, index) => ({
            ...(typeof m.id === "string" && isUuid(m.id) ? { id: m.id } : {}),
            title: (m.title || "").trim() || `Módulo ${index + 1}`,
            ordem: index + 1,
            items: (m.items || []).map((it, itemIndex) => ({
              type: it.type,
              title:
                it.title.trim() ||
              (it.type === "PROVA"
                ? "Prova"
                : it.type === "ATIVIDADE"
                ? "Atividade"
                : "Aula"),
              templateId: it.templateId as string,
              ordem: itemIndex + 1,
              ...(it.startDate && it.endDate
                ? { startDate: it.startDate, endDate: it.endDate }
                : {}),
              ...(() => {
                const status =
                  it.type === "AULA"
                    ? aulaStatusById.get(String(it.templateId))
                    : avaliacaoStatusById.get(String(it.templateId));
                return status && String(status).toUpperCase() === "RASCUNHO"
                  ? { status: "PUBLICADA" }
                  : {};
              })(),
              obrigatoria: it.obrigatoria ?? it.obrigatorio ?? true,
              ...(it.instructorIds && it.instructorIds.length > 0
                ? { instructorIds: it.instructorIds }
                : it.instructorId
                ? { instructorIds: [it.instructorId] }
                : {}),
              ...(it.type === "PROVA"
                ? { recuperacaoFinal: Boolean(it.recuperacaoFinal) }
                : {}),
            })),
          })),
          standaloneItems: (curriculum.standaloneItems || []).map((it, itemIndex) => ({
            type: it.type,
            title:
              it.title.trim() ||
              (it.type === "PROVA"
                ? "Prova"
                : it.type === "ATIVIDADE"
                ? "Atividade"
                : "Aula"),
            templateId: it.templateId as string,
            ordem: itemIndex + 1,
            ...(it.startDate && it.endDate
              ? { startDate: it.startDate, endDate: it.endDate }
              : {}),
            ...(() => {
              const status =
                it.type === "AULA"
                  ? aulaStatusById.get(String(it.templateId))
                  : avaliacaoStatusById.get(String(it.templateId));
              return status && String(status).toUpperCase() === "RASCUNHO"
                ? { status: "PUBLICADA" }
                : {};
            })(),
            obrigatoria: it.obrigatoria ?? it.obrigatorio ?? true,
            ...(it.instructorIds && it.instructorIds.length > 0
              ? { instructorIds: it.instructorIds }
              : it.instructorId
              ? { instructorIds: [it.instructorId] }
              : {}),
            ...(it.type === "PROVA"
              ? { recuperacaoFinal: Boolean(it.recuperacaoFinal) }
              : {}),
          })),
        },
      };
      if (process.env.NODE_ENV === "development") {
        console.log("[CREATE_TURMA] Enviando payload:", {
          cursoId,
          endpoint: `/api/v1/cursos/${cursoId}/turmas`,
          payload,
        });
      }
      setLoadingStep("Salvando turma...");
      const result = await createTurma(cursoId!, payload);
      const mapping = (result as any)?.mapping;
      if (typeof window !== "undefined" && Array.isArray(mapping)) {
        try {
          window.sessionStorage.setItem(
            `turma:create:mapping:${String(result.id)}`,
            JSON.stringify(mapping)
          );
        } catch {
          // ignore
        }
      }
      if (typeof window !== "undefined") {
        try {
          const cursoNome =
            cursos.find((c) => String(c.value) === String(cursoId))?.label ??
            null;
          window.sessionStorage.setItem(
            "turma:create:latest",
            JSON.stringify({
              turma: result,
              cursoId: String(cursoId),
              cursoNome,
              createdAt: new Date().toISOString(),
            })
          );
        } catch {
          // ignore
        }
      }
      setLoadingStep("Finalizando...");
      toastCustom.success({ title: "Turma criada com sucesso" });
      onSuccess?.();
    } catch (err: any) {
      const statusCode = err?.status as number | undefined;
      const code = err?.details?.code as string | undefined;
      const details = err?.details?.details as any;

      if (statusCode === 422 && code === "TURMA_PREREQUISITOS_NAO_ATENDIDOS") {
        const aulasCount =
          typeof details?.templatesAulasCount === "number"
            ? details.templatesAulasCount
            : null;
        const avalCount =
          typeof details?.templatesAvaliacoesCount === "number"
            ? details.templatesAvaliacoesCount
            : null;

        setStep(3);
        toastCustom.error({
          title: "Pré-requisitos do curso",
          description:
            aulasCount != null && avalCount != null
              ? `Para cadastrar turma, o curso precisa ter pelo menos 1 aula e 1 avaliação vinculadas (Aulas: ${aulasCount}, Avaliações: ${avalCount}).`
              : err?.message ||
                "Para cadastrar turma, o curso precisa ter pelo menos 1 aula e 1 avaliação vinculadas.",
        });
        return;
      }

      toastCustom.error({
        title: "Erro ao criar turma",
        description:
          statusCode === 422
            ? err?.message ||
              "Verifique os pré-requisitos do curso e os campos obrigatórios."
            : err?.message || "Tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
      setLoadingStep("");
    }
  };

  return (
    <div className="space-y-6 relative">
      <FormLoadingModal
        isLoading={isSubmitting}
        title="Criando turma..."
        loadingStep={loadingStep}
        icon={Users}
      />

      {/* Header com Stepper */}
      <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
        <Stepper
          value={step}
          onValueChange={() => {}}
          variant="minimal"
          indicators={{
            completed: <Check className="h-3 w-3 text-white" />,
            loading: <Loader2 className="h-3 w-3 animate-spin text-blue-600" />,
          }}
        >
          <StepperNav className="items-center gap-2 md:gap-3">
            {[
              { t: "Estrutura", d: "Escolha um template inicial" },
              { t: "Dados iniciais", d: "Curso, nome e parâmetros" },
              { t: "Estrutura", d: "Monte módulos e aulas" },
              { t: "Revisão", d: "Confirmação e envio" },
            ].map((s, idx, arr) => (
              <StepperItem
                key={idx}
                step={idx + 1}
                isLast={idx === arr.length - 1}
                disabled
                className={`flex-1 ${
                  idx + 1 <= step ? "opacity-100" : "opacity-60"
                }`}
              >
                <StepperTrigger
                  disabled
                  className="flex items-center gap-2 text-left rounded-md cursor-default"
                >
                  <StepperIndicator>
                    {idx + 1 < step ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </StepperIndicator>
                  <div className="flex flex-col max-w-[280px] md:max-w-[320px]">
                    <StepperTitle className="!mb-0">{s.t}</StepperTitle>
                    <StepperDescription className="!mt-0">
                      {s.d}
                    </StepperDescription>
                  </div>
                </StepperTrigger>
                <StepperSeparator hidden={idx === arr.length - 1} />
              </StepperItem>
            ))}
          </StepperNav>
        </Stepper>
      </div>

      {/* Container e formulário */}
      <div className="bg-white rounded-3xl p-6">
        <Stepper
          value={step}
          onValueChange={() => {}}
          variant="minimal"
          className="space-y-8"
        >
          <form onSubmit={onSubmit} className="flex flex-col gap-8">
            <StepperPanel>
              <StepperContent value={1} className="space-y-6">
                <div className="mb-6">
                  <h3 className="!mb-0">Estrutura</h3>
                  <p className="!text-sm">
                    Escolha a estrutura inicial da turma.
                  </p>
                </div>
                <div
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
                  role="radiogroup"
                  aria-label="Estrutura da turma"
                >
                  {TEMPLATE_OPTIONS.map((opt, idx) => {
                    const isActive = estruturaTipo === opt.value;
                    const theme =
                      opt.value === "MODULAR"
                        ? "250 75% 55%"
                        : opt.value === "DINAMICA"
                        ? "190 70% 45%"
                        : "150 60% 40%";
                    return (
                      <motion.div
                        key={opt.value}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.35,
                          delay: idx * 0.06,
                          ease: "easeOut",
                        }}
                      >
                        <CardCustom
                          role="radio"
                          aria-checked={isActive}
                          title={opt.label}
                          subtitle={opt.helper}
                          imageUrl={
                            TEMPLATE_PREVIEW[opt.value as TemplateOptionValue]
                          }
                          themeColor={theme}
                          selected={isActive}
                          tooltip={
                            TEMPLATE_TOOLTIP[opt.value as TemplateOptionValue]
                          }
                          onClick={() => {
                            setEstruturaTipo(opt.value);
                            setCurriculum(getDefaultBuilder(opt.value as any));
                          }}
                          className="min-h-[360px] md:min-h-[420px]"
                        />
                      </motion.div>
                    );
                  })}
                </div>
              </StepperContent>

              <StepperContent value={2} className="space-y-6">
                <div className="mb-6">
                  <h3 className="!mb-0">Dados iniciais</h3>
                  <p className="!text-sm">
                    Informe curso, nome, turno, modalidade e vagas.
                  </p>
                </div>
                <div className="space-y-4">
                  {/* Linha 1: Curso e Nome */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {loadingCursos ? (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium required">
                          Curso
                        </Label>
                        <Skeleton className="h-12 w-full" />
                      </div>
                    ) : cursosError ? (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium required">
                          Curso
                        </Label>
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <SelectCustom
                              label={undefined}
                              placeholder="Erro ao carregar"
                              options={[]}
                              value={null}
                              onChange={() => {}}
                              disabled
                              required
                            />
                          </div>
                          <ButtonCustom
                            type="button"
                            variant="outline"
                            size="md"
                            onClick={() => void refetchCursos()}
                          >
                            Recarregar
                          </ButtonCustom>
                        </div>
                      </div>
                    ) : (
                      <SelectCustom
                        label="Curso"
                        placeholder="Selecionar"
                        options={cursos}
                        value={cursoId}
                        onChange={(v) => {
                          setCursoId(v);
                          // Evita manter templateIds de outro curso
                          if (estruturaTipo) {
                            setCurriculum(
                              getDefaultBuilder(estruturaTipo as any)
                            );
                          }
                        }}
                        required
                      />
                    )}
                    <InputCustom
                      label="Nome da Turma"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Ex.: Turma 01 - Manhã"
                      className="md:col-span-3"
                      required
                    />
                  </div>

                  {/* Linha 2: Inscrições, Período da Turma, Turno e Modalidade */}
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <DatePickerRangeCustom
                      label="Inscrições"
                      size="md"
                      value={{
                        from: dataInscricaoInicio
                          ? new Date(dataInscricaoInicio)
                          : null,
                        to: dataInscricaoFim
                          ? new Date(dataInscricaoFim)
                          : null,
                      }}
                      onChange={(range) => {
                        setDataInscricaoInicio(
                          range.from ? range.from.toISOString() : ""
                        );
                        setDataInscricaoFim(
                          range.to ? range.to.toISOString() : ""
                        );
                      }}
                      helperLabel="Período em que os alunos poderão se inscrever"
                      minDate={new Date()}
                      required
                      className="md:col-span-2"
                    />
                    <DatePickerRangeCustom
                      label="Período da Turma"
                      size="md"
                      value={{
                        from: dataInicio ? new Date(dataInicio) : null,
                        to: dataFim ? new Date(dataFim) : null,
                      }}
                      onChange={(range) => {
                        setDataInicio(range.from ? range.from.toISOString() : "");
                        setDataFim(range.to ? range.to.toISOString() : "");
                      }}
                      helperLabel="Período previsto de início e término das aulas"
                      minDate={minDateTurma}
                      required
                      className="md:col-span-2"
                    />
                    <SelectCustom
                      label="Turno"
                      options={TURNO_OPTIONS}
                      value={turno}
                      onChange={(v) => setTurno(v)}
                      required
                      className="md:col-span-1"
                    />
                    <SelectCustom
                      label="Modalidade"
                      placeholder="Selecione a modalidade"
                      options={METODO_OPTIONS}
                      value={metodo}
                      onChange={(v) => setMetodo(v)}
                      required
                      className="md:col-span-1"
                    />
                  </div>

                  {/* Linha 3: Vagas e status */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <SelectCustom
                      label="Vagas"
                      options={[
                        { value: "ILIMITADAS", label: "Ilimitadas" },
                        { value: "LIMITAR", label: "Limitar vagas" },
                      ]}
                      value={vagasIlimitadas ? "ILIMITADAS" : "LIMITAR"}
                      onChange={(v) => {
                        const ilimitadas = v === "ILIMITADAS";
                        setVagasIlimitadas(ilimitadas);
                        if (ilimitadas) setVagasTotais("");
                      }}
                      required
                    />
                    <SelectCustom
                      label="Status"
                      placeholder="Selecionar"
                      options={STATUS_OPTIONS}
                      value={status}
                      onChange={(v) => setStatus((v as any) || "RASCUNHO")}
                      required
                    />
                    {!vagasIlimitadas ? (
                      <InputCustom
                        label="Vagas totais"
                        type="number"
                        value={vagasTotais}
                        onChange={(e) => setVagasTotais(e.target.value)}
                        placeholder="Ex.: 40"
                        min="1"
                        required
                      />
                    ) : (
                      <div className="hidden md:block md:col-span-2" />
                    )}
                  </div>

                </div>
              </StepperContent>

              <StepperContent value={3} className="space-y-4">
                <div className="mb-10">
                  <h3 className="!mb-0">Estrutura</h3>
                  <p className="!text-sm">
                    Monte a estrutura (módulos e aulas).
                  </p>
                </div>
                <BuilderManager
                  value={curriculum}
                  onChange={setCurriculum}
                  allowModules={estruturaTipo !== "PADRAO"}
                  allowStandaloneItems={estruturaTipo !== "MODULAR"}
                  template={(estruturaTipo as any) || undefined}
                  instructorOptions={instrutores}
                  modalidade={metodo as any}
                  periodMinDate={dataInicio ? new Date(dataInicio) : undefined}
                  periodMaxDate={dataFim ? new Date(dataFim) : undefined}
                  aulaTemplates={aulaTemplates}
                  avaliacaoTemplates={avaliacaoTemplates}
                />
                {/* Datas removidas desta etapa; Inscrições foram movidas para a etapa 2 */}
              </StepperContent>

              <StepperContent value={4} className="space-y-4">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Revisar e confirmar
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Confira os dados antes de criar a turma.
                  </p>
                </div>

                {/* Informações Gerais */}
                <div className="rounded-lg border border-gray-200 bg-white">
                  <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <h4 className="text-sm font-semibold text-gray-900">
                      Informações Gerais
                    </h4>
                  </div>
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-xs font-medium text-gray-500">
                          Curso
                        </span>
                        <div className="mt-1 text-gray-900">
                          {cursos.find((c) => c.value === cursoId)?.label ||
                            "—"}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500">
                          Nome da Turma
                        </span>
                        <div className="mt-1 text-gray-900">{nome || "—"}</div>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500">
                          Turno
                        </span>
                        <div className="mt-1 text-gray-900">
                          {TURNO_OPTIONS.find((o) => o.value === turno)
                            ?.label || "—"}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500">
                          Modalidade
                        </span>
                        <div className="mt-1 text-gray-900">
                          {METODO_OPTIONS.find((o) => o.value === metodo)
                            ?.label || "—"}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500">
                          Status
                        </span>
                        <div className="mt-1 text-gray-900">
                          {STATUS_OPTIONS.find((o) => o.value === status)
                            ?.label || "Rascunho"}
                        </div>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500">
                          Vagas
                        </span>
                        <div className="mt-1 text-gray-900">
                          {!vagasIlimitadas &&
                          vagasTotais &&
                          Number(vagasTotais) > 0
                            ? vagasTotais
                            : "Ilimitadas"}
                      </div>
                    </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500">
                          Tipo de turma
                        </span>
                        <div className="mt-1 text-gray-900">
                          {TEMPLATE_OPTIONS.find(
                            (o) => o.value === estruturaTipo
                          )?.label || "—"}
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-xs font-medium text-gray-500">
                          Período de Inscrições
                        </span>
                        <div className="mt-1 text-gray-900">
                          {dataInscricaoInicio || dataInscricaoFim
                            ? `${
                                dataInscricaoInicio
                                  ? new Date(
                                      dataInscricaoInicio
                                    ).toLocaleDateString("pt-BR")
                                  : "…"
                              } - ${
                                dataInscricaoFim
                                  ? new Date(
                                      dataInscricaoFim
                                    ).toLocaleDateString("pt-BR")
                                  : "…"
                              }`
                            : "—"}
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-xs font-medium text-gray-500">
                          Período da Turma
                        </span>
                        <div className="mt-1 text-gray-900">
                          {dataInicio || dataFim
                            ? `${
                                dataInicio
                                  ? new Date(dataInicio).toLocaleDateString(
                                      "pt-BR"
                                    )
                                  : "…"
                              } - ${
                                dataFim
                                  ? new Date(dataFim).toLocaleDateString("pt-BR")
                                  : "…"
                              }`
                            : "—"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Estrutura do Curso */}
                <div className="rounded-lg border border-gray-200 bg-white">
                  <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-gray-900">
                        Estrutura do Curso
                      </h4>
                      {(() => {
                        const totalModulos = curriculum.modules.length;
                        const totalItens = curriculum.modules.reduce(
                          (acc, m) => acc + m.items.length,
                          0
                        );

                        if (totalModulos === 0 && totalItens === 0) return null;

                        return (
                          <span className="text-xs text-gray-500">
                            {totalModulos} módulo{totalModulos !== 1 ? "s" : ""}{" "}
                            · {totalItens} {totalItens === 1 ? "item" : "itens"}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="md:col-span-2">
                      <div className="space-y-3">
                        {curriculum.modules.map((m, i) => (
                          <div
                            key={m.id}
                            className="rounded border border-gray-200 bg-gray-50"
                          >
                            <div className="px-3 py-2 border-b border-gray-200 bg-white">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-gray-500">
                                    Módulo {i + 1}
                                  </span>
                                  <span className="text-sm font-medium text-gray-900">
                                    {m.title}
                                  </span>
                                </div>
                                {m.items.length > 0 && (
                                  <span className="text-xs text-gray-500">
                                    {m.items.length}{" "}
                                    {m.items.length === 1 ? "item" : "itens"}
                                  </span>
                                )}
                              </div>
                            </div>
                            {m.items.length > 0 ? (
                              <div className="p-2 space-y-1">
                                {m.items.map((it) => (
                                  <div
                                    key={it.id}
                                    className="flex items-center gap-2 px-2 py-1.5 text-sm"
                                  >
                                    <Icon
                                      name={
                                        it.type === "AULA"
                                          ? "GraduationCap"
                                          : it.type === "ATIVIDADE"
                                          ? "Paperclip"
                                          : "FileText"
                                      }
                                      className="h-3.5 w-3.5 text-gray-400"
                                    />
                                    <span className="text-gray-700">
                                      {it.title}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      (
                                      {it.type === "AULA"
                                        ? "aula"
                                        : it.type === "ATIVIDADE"
                                        ? "atividade"
                                        : "prova"}
                                      )
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-3 text-center text-xs text-gray-500">
                                Nenhum item neste módulo
                              </div>
                            )}
                          </div>
                        ))}
                        {curriculum.standaloneItems &&
                          curriculum.standaloneItems.length > 0 && (
                            <div className="rounded border border-dashed border-gray-300 bg-gray-50">
                              <div className="px-3 py-2 border-b border-gray-200 bg-white">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium text-gray-500">
                                    Itens fora de módulos
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {curriculum.standaloneItems.length}{" "}
                                    {curriculum.standaloneItems.length === 1
                                      ? "item"
                                      : "itens"}
                                  </span>
                                </div>
                              </div>
                              <div className="p-2 space-y-1">
                                {curriculum.standaloneItems.map((it) => (
                                  <div
                                    key={it.id}
                                    className="flex items-center gap-2 px-2 py-1.5 text-sm"
                                  >
                                    <Icon
                                      name={
                                        it.type === "AULA"
                                          ? "GraduationCap"
                                          : it.type === "ATIVIDADE"
                                          ? "Paperclip"
                                          : "FileText"
                                      }
                                      className="h-3.5 w-3.5 text-gray-400"
                                    />
                                    <span className="text-gray-700">
                                      {it.title}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      (
                                      {it.type === "AULA"
                                        ? "aula"
                                        : it.type === "ATIVIDADE"
                                        ? "atividade"
                                        : "prova"}
                                      )
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        {curriculum.modules.length === 0 &&
                          (!curriculum.standaloneItems ||
                            curriculum.standaloneItems.length === 0) && (
                            <div className="rounded border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                              <Icon
                                name="Inbox"
                                className="mx-auto mb-2 h-8 w-8 text-gray-400"
                              />
                              <p className="text-sm text-gray-500">
                                Nenhuma estrutura definida
                              </p>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              </StepperContent>
            </StepperPanel>

            <footer className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-6">
              {!isFirstStep && (
                <ButtonCustom
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setStep((s) => Math.max(1, s - 1))}
                  disabled={isSubmitting}
                >
                  Voltar
                </ButtonCustom>
              )}

              {!isLastStep && (
                <ButtonCustom
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={() => {
                    if (step === 1) {
                      // Selecionei tipo? Precarregar template na próxima etapa
                      if (estruturaTipo) {
                        setCurriculum(getDefaultBuilder(estruturaTipo as any));
                      }
                      if (validateStep(1)) setStep(2);
                    } else if (step === 2) {
                      if (validateStep(2)) setStep(3);
                    } else if (step === 3) {
                      if (validateStep(3)) setStep(4);
                    }
                  }}
                  disabled={isSubmitting}
                  withAnimation
                >
                  Avançar
                </ButtonCustom>
              )}

              {isLastStep && (
                <ButtonCustom
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                  withAnimation
                >
                  {isSubmitting ? "Cadastrando..." : "Cadastrar Turma"}
                </ButtonCustom>
              )}
            </footer>
          </form>
        </Stepper>
      </div>
    </div>
  );
}

"use client";

import React, { useMemo, useState } from "react";
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
import { createTurma, type CreateTurmaPayload } from "@/api/cursos";
import { BuilderManager } from "@/components/ui/custom/builder-manager/BuilderManager";
import {
  type BuilderData,
  getDefaultBuilder,
} from "@/components/ui/custom/builder-manager/types";
import { useCursosForSelect } from "../hooks/useCursosForSelect";
import { useInstrutoresForSelect } from "../hooks/useInstrutoresForSelect";
import { UserList } from "@/components/ui/custom";
import { Badge } from "@/components/ui/badge";

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

const ADICIONAR_INSTRUTOR_OPTIONS = [
  { value: "SIM", label: "Adicionar agora" },
  { value: "NAO", label: "Depois" },
];

const TEMPLATE_OPTIONS = [
  {
    value: "MODULARIZADA",
    label: "Modular",
    helper: "Curso organizado por módulos",
  },
  { value: "DINAMICA", label: "Dinâmica", helper: "Módulos + aulas avulsas" },
  { value: "PADRAO", label: "Padrão", helper: "Aulas sem módulos" },
] as const;

type TemplateOptionValue = (typeof TEMPLATE_OPTIONS)[number]["value"];

const ACCENT_BY_TEMPLATE: Record<TemplateOptionValue, string> = {
  MODULARIZADA: "#6366f1", // indigo
  DINAMICA: "#06b6d4", // cyan
  PADRAO: "#22c55e", // emerald
};

const ACCENTS: Record<
  TemplateOptionValue,
  { solid: string; from: string; to: string }
> = {
  MODULARIZADA: { solid: "#6366f1", from: "#a78bfa", to: "#6366f1" }, // violet -> indigo
  DINAMICA: { solid: "#06b6d4", from: "#67e8f9", to: "#06b6d4" }, // sky -> cyan
  PADRAO: { solid: "#22c55e", from: "#86efac", to: "#22c55e" }, // light emerald -> emerald
};

const TEMPLATE_PREVIEW: Record<TemplateOptionValue, string> = {
  MODULARIZADA: "/images/templates/modular.svg",
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
  MODULARIZADA: (
    <div className="w-auto">
      <div
        className="text-[13px] font-semibold mt-3"
        style={{ color: ACCENTS.MODULARIZADA.to }}
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
  const { cursos, isLoading: loadingCursos } = useCursosForSelect();
  const { instrutores, isLoading: loadingInstrutores } =
    useInstrutoresForSelect();

  const [cursoId, setCursoId] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [instrutorIds, setInstrutorIds] = useState<string[]>([]);
  const [instrutoresSelecionados, setInstrutoresSelecionados] = useState<any[]>(
    []
  );
  const MAX_INSTRUTOR_BADGES = 4;
  const [turno, setTurno] = useState<string | null>(null);
  const [metodo, setMetodo] = useState<string | null>(null);
  const [templateTipo, setTemplateTipo] = useState<string | null>(null);
  const [vagasTotais, setVagasTotais] = useState<string>("");
  const [curriculum, setCurriculum] = useState<BuilderData>({
    modules: [],
    standaloneItems: [],
  });
  // Builder agora é apenas no modo lista
  const [addInstrutorNow, setAddInstrutorNow] = useState<boolean>(false);
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

  const TEST_MODE = true; // modo teste: desativa validações dos steps

  const validate = (): boolean => {
    if (TEST_MODE) return true;
    if (!cursoId) {
      toastCustom.error({
        title: "Curso obrigatório",
        description: "Selecione o curso da turma.",
      });
      return false;
    }
    if (!nome.trim()) {
      toastCustom.error({
        title: "Nome obrigatório",
        description: "Informe o nome da turma.",
      });
      return false;
    }
    if (!turno || !metodo) {
      toastCustom.error({
        title: "Turno e modalidade obrigatórios",
        description: "Selecione o turno e a modalidade.",
      });
      return false;
    }
    if (!dataInscricaoInicio || !dataInscricaoFim) {
      toastCustom.error({
        title: "Período de inscrições obrigatório",
        description: "Informe o início e término das inscrições.",
      });
      return false;
    }
    if (instrutorIds.length === 0) {
      toastCustom.error({
        title: "Instrutor obrigatório",
        description: "Adicione pelo menos um instrutor à turma.",
      });
      return false;
    }
    // Vagas totais: se vazio ou 0 = infinito (permitido)
    if (!templateTipo) {
      toastCustom.error({
        title: "Tipo de turma obrigatório",
        description: "Selecione o tipo de template da turma.",
      });
      return false;
    }
    // Validações básicas de datas
    const now = Date.now();
    if (dataInicio) {
      const start = new Date(dataInicio).getTime();
      if (start < now) {
        toastCustom.error({
          title: "Data inválida",
          description: "Data de início não pode ser anterior a agora.",
        });
        return false;
      }
    }
    if (dataFim) {
      const end = new Date(dataFim).getTime();
      if (end < now) {
        toastCustom.error({
          title: "Data inválida",
          description: "Data de término não pode ser anterior a agora.",
        });
        return false;
      }
    }
    if (dataInicio && dataFim) {
      const start = new Date(dataInicio).getTime();
      const end = new Date(dataFim).getTime();
      if (start > end) {
        toastCustom.error({
          title: "Período inválido",
          description: "Data de término deve ser após o início.",
        });
        return false;
      }
    }
    if (dataInscricaoInicio && new Date(dataInscricaoInicio).getTime() < now) {
      toastCustom.error({
        title: "Inscrições inválidas",
        description: "Início das inscrições não pode ser anterior a agora.",
      });
      return false;
    }
    if (dataInscricaoFim && new Date(dataInscricaoFim).getTime() < now) {
      toastCustom.error({
        title: "Inscrições inválidas",
        description: "Término das inscrições não pode ser anterior a agora.",
      });
      return false;
    }
    if (dataInscricaoInicio && dataInscricaoFim) {
      const s = new Date(dataInscricaoInicio).getTime();
      const e = new Date(dataInscricaoFim).getTime();
      if (s > e) {
        toastCustom.error({
          title: "Inscrições inválidas",
          description: "Término das inscrições deve ser após o início.",
        });
        return false;
      }
    }
    return true;
  };

  const validateStep = (current: number): boolean => {
    if (TEST_MODE) return true;
    if (current === 1) {
      if (!templateTipo) {
        toastCustom.error("Selecione um template de estrutura.");
        return false;
      }
    }
    if (current === 2) {
      if (!cursoId || !nome.trim()) {
        toastCustom.error("Informe curso e nome da turma.");
        return false;
      }
      if (!turno || !metodo) {
        toastCustom.error("Informe turno e modalidade.");
        return false;
      }
      if (!dataInscricaoInicio || !dataInscricaoFim) {
        toastCustom.error("Informe o período de inscrições.");
        return false;
      }
      if (instrutorIds.length === 0) {
        toastCustom.error("Adicione pelo menos um instrutor.");
        return false;
      }
      // Vagas totais: se vazio ou 0 = infinito (permitido)
    }
    if (current === 3) {
      // Validar se tem pelo menos um módulo ou item na estrutura
      const hasModules = curriculum.modules && curriculum.modules.length > 0;
      const hasStandaloneItems =
        curriculum.standaloneItems && curriculum.standaloneItems.length > 0;

      if (!hasModules && !hasStandaloneItems) {
        toastCustom.error(
          "Adicione pelo menos um módulo ou item à estrutura do curso."
        );
        return false;
      }

      // Validar se os módulos têm pelo menos um item (opcional, mas recomendado)
      if (hasModules) {
        const emptyModules = curriculum.modules.filter(
          (m) => !m.items || m.items.length === 0
        );
        if (emptyModules.length === curriculum.modules.length) {
          toastCustom.error(
            "Adicione pelo menos um item (aula, atividade ou prova) em um dos módulos."
          );
          return false;
        }
      }

      // Datas opcionais com validação de ordem
      const now = Date.now();
      if (dataInicio && new Date(dataInicio).getTime() < now) {
        toastCustom.error("Início não pode ser anterior a agora.");
        return false;
      }
      if (dataFim && new Date(dataFim).getTime() < now) {
        toastCustom.error("Término não pode ser anterior a agora.");
        return false;
      }
      if (dataInicio && dataFim && new Date(dataInicio) > new Date(dataFim)) {
        toastCustom.error("Data de término deve ser após o início.");
        return false;
      }
      if (
        dataInscricaoInicio &&
        dataInscricaoFim &&
        new Date(dataInscricaoInicio) > new Date(dataInscricaoFim)
      ) {
        toastCustom.error("Inscrições: término deve ser após o início.");
        return false;
      }
    }
    return true;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setLoadingStep("Criando turma...");
    try {
      const payload: CreateTurmaPayload = {
        nome: nome.trim(),
        ...(instrutorIds.length > 0 ? { instrutorId: instrutorIds[0] } : {}),
        turno: turno as any,
        metodo: metodo as any,
        // Vagas totais: se vazio ou 0 = 999999 (infinito)
        vagasTotais:
          vagasTotais && Number(vagasTotais) > 0 ? Number(vagasTotais) : 999999,
        dataInicio: dataInicio ? new Date(dataInicio).toISOString() : undefined,
        dataFim: dataFim ? new Date(dataFim).toISOString() : undefined,
        dataInscricaoInicio: dataInscricaoInicio
          ? new Date(dataInscricaoInicio).toISOString()
          : undefined,
        dataInscricaoFim: dataInscricaoFim
          ? new Date(dataInscricaoFim).toISOString()
          : undefined,
        estrutura: {
          modules: curriculum.modules.map((m) => {
            const base: any = {
              title: (m.title || "").trim() || "Módulo",
              items: m.items.map((it) => {
                const itemBase: any = {
                  title:
                    it.title.trim() ||
                    (it.type === "PROVA"
                      ? "Prova"
                      : it.type === "ATIVIDADE"
                      ? "Atividade"
                      : "Aula"),
                  type: it.type,
                };
                if (it.startDate) itemBase.startDate = it.startDate;
                if (it.endDate) itemBase.endDate = it.endDate;
                if (it.instructorId) itemBase.instructorId = it.instructorId;
                return itemBase;
              }),
            };
            if (m.startDate) base.startDate = m.startDate;
            if (m.endDate) base.endDate = m.endDate;
            if (m.instructorIds && m.instructorIds.length > 0)
              base.instructorIds = m.instructorIds;
            else if (m.instructorId) base.instructorId = m.instructorId;
            return base;
          }),
          standaloneItems:
            curriculum.standaloneItems?.map((it) => {
              const itemBase: any = {
                title:
                  it.title.trim() ||
                  (it.type === "PROVA"
                    ? "Prova"
                    : it.type === "ATIVIDADE"
                    ? "Atividade"
                    : "Aula"),
                type: it.type,
              };
              if (it.startDate) itemBase.startDate = it.startDate;
              if (it.endDate) itemBase.endDate = it.endDate;
              if (it.instructorId) itemBase.instructorId = it.instructorId;
              return itemBase;
            }) || [],
        },
      };
      setLoadingStep("Salvando turma...");
      await createTurma(cursoId!, payload);
      setLoadingStep("Finalizando...");
      toastCustom.success({ title: "Turma criada com sucesso" });
      onSuccess?.();
    } catch (err: any) {
      toastCustom.error({
        title: "Erro ao criar turma",
        description: err?.message || "Tente novamente.",
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
                    const isActive = templateTipo === opt.value;
                    const theme =
                      opt.value === "MODULARIZADA"
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
                            setTemplateTipo(opt.value);
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
                    Informe curso, nome, turno, modalidade e vagas. Se desejar,
                    adicione instrutores.
                  </p>
                </div>
                <div className="space-y-4">
                  {/* Curso, Nome e Inscrições na mesma linha */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <SelectCustom
                      label="Curso"
                      placeholder={
                        loadingCursos ? "Carregando..." : "Selecionar"
                      }
                      options={cursos}
                      value={cursoId}
                      onChange={(v) => setCursoId(v)}
                      required
                    />
                    <InputCustom
                      label="Nome da Turma"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Ex.: Turma 01 - Manhã"
                      className="md:col-span-2"
                      required
                    />
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
                    />
                  </div>

                  {/* Turno, Modalidade, Vagas e decisão sobre instrutor */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <SelectCustom
                      label="Turno"
                      options={TURNO_OPTIONS}
                      value={turno}
                      onChange={(v) => setTurno(v)}
                      required
                    />
                    <SelectCustom
                      label="Modalidade"
                      placeholder="Selecione a modalidade"
                      options={METODO_OPTIONS}
                      value={metodo}
                      onChange={(v) => setMetodo(v)}
                      required
                    />
                    <InputCustom
                      label="Vagas totais"
                      type="number"
                      value={vagasTotais}
                      onChange={(e) => setVagasTotais(e.target.value)}
                      placeholder="Deixe vazio para ilimitado"
                    />
                    <SelectCustom
                      label="Adicionar instrutor?"
                      options={ADICIONAR_INSTRUTOR_OPTIONS}
                      value={addInstrutorNow ? "SIM" : "NAO"}
                      onChange={(v) => setAddInstrutorNow(v === "SIM")}
                      required
                    />
                  </div>

                  {/* Inscrições já estão na primeira linha */}
                  {addInstrutorNow && (
                    <div className="mt-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Instrutores
                      </Label>
                      <UserList
                        roles={["INSTRUTOR"]}
                        pageSize={8}
                        mode="multiple"
                        value={instrutorIds}
                        onChange={(v) => setInstrutorIds((v as string[]) || [])}
                        onSelectionChange={(users) =>
                          setInstrutoresSelecionados(users as any[])
                        }
                        className="mt-2"
                      />
                    </div>
                  )}
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
                  allowStandaloneItems={true}
                  template={(templateTipo as any) || undefined}
                  instructorOptions={instrutores}
                  modalidade={metodo as any}
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
                          Vagas totais
                        </span>
                        <div className="mt-1 text-gray-900">
                          {vagasTotais && Number(vagasTotais) > 0
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
                            (o) => o.value === templateTipo
                          )?.label || "—"}
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-xs font-medium text-gray-500">
                          Instrutores
                        </span>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {instrutoresSelecionados &&
                          instrutoresSelecionados.length > 0 ? (
                            <>
                              {instrutoresSelecionados
                                .slice(0, MAX_INSTRUTOR_BADGES)
                                .map((u) => (
                                  <Badge
                                    key={String(u.id)}
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {u?.nome ||
                                      u?.email ||
                                      u?.codUsuario ||
                                      u?.id}
                                  </Badge>
                                ))}
                              {instrutoresSelecionados.length >
                                MAX_INSTRUTOR_BADGES && (
                                <Badge variant="outline" className="text-xs">
                                  +
                                  {instrutoresSelecionados.length -
                                    MAX_INSTRUTOR_BADGES}
                                </Badge>
                              )}
                            </>
                          ) : (
                            <span className="text-gray-900">—</span>
                          )}
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
                      if (templateTipo) {
                        setCurriculum(getDefaultBuilder(templateTipo as any));
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

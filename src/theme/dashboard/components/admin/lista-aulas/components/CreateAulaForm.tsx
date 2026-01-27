"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  InputCustom,
  SelectCustom,
  ButtonCustom,
  toastCustom,
  TimeInputCustom,
} from "@/components/ui/custom";
import { RichTextarea } from "@/components/ui/custom/text-area";
import { DatePickerCustom } from "@/components/ui/custom/date-picker";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Video, Info, Circle } from "lucide-react";
import { FormLoadingModal } from "@/components/ui/custom/form-loading-modal";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileUploadMultiple,
  type FileUploadItem,
  type AcceptedFileType,
} from "@/components/ui/custom/file-upload";
import { cn } from "@/lib/utils";
import {
  createAula,
  updateAula,
  MATERIAIS_CONFIG,
  type CreateAulaPayload,
  type UpdateAulaPayload,
  type Aula,
  type Modalidade,
  type TipoLink,
} from "@/api/aulas";
import {
  uploadFile,
  deleteFiles,
  type FileUploadResult,
} from "@/services/upload";
import {
  useTurmasForSelect,
  type TurmaSelectOption,
} from "../hooks/useTurmasForSelect";
import { useInstrutoresForSelect } from "../hooks/useInstrutoresForSelect";
import { useCursosForSelect } from "../../lista-turmas/hooks/useCursosForSelect";
import { useAuth } from "@/hooks/useAuth";
import { queryKeys } from "@/lib/react-query/queryKeys";

const MODALIDADE_OPTIONS = [
  { value: "ONLINE", label: "Online (YouTube)" },
  { value: "PRESENCIAL", label: "Presencial" },
  { value: "AO_VIVO", label: "Ao Vivo (Google Meet)" },
  { value: "SEMIPRESENCIAL", label: "Semipresencial" },
];

const TIPO_LINK_OPTIONS = [
  { value: "YOUTUBE", label: "Link do YouTube" },
  { value: "MEET", label: "Criar link do Google Meet" },
];

function computeDuracaoFromHoras(inicio: string, fim: string): number | null {
  if (!inicio || !fim) return null;
  const [horaIni, minIni] = inicio.split(":").map(Number);
  const [horaFim, minFim] = fim.split(":").map(Number);
  if (
    [horaIni, minIni, horaFim, minFim].some((x) => !Number.isFinite(x) || x < 0)
  ) {
    return null;
  }
  const minutosInicio = horaIni * 60 + minIni;
  const minutosFim = horaFim * 60 + minFim;
  const diff = minutosFim - minutosInicio;
  return diff > 0 ? diff : null;
}

/**
 * Converte o método da turma para a modalidade da aula
 * Turma: ONLINE | PRESENCIAL | LIVE | SEMIPRESENCIAL
 * Aula:  ONLINE | PRESENCIAL | AO_VIVO | SEMIPRESENCIAL
 */
function turmaMetodoToAulaModalidade(
  metodo: TurmaSelectOption["metodo"]
): Modalidade {
  if (metodo === "LIVE") return "AO_VIVO";
  return metodo as Modalidade;
}

interface FormData {
  titulo: string;
  descricao: string;
  modalidade: Modalidade | "";
  tipoLink: TipoLink | "";
  youtubeUrl: string;
  turmaId: string;
  instrutorId: string; // Novo campo para Admin/Mod/Ped
  moduloId: string;
  dataAula: Date | null; // Data da aula (um dia)
  horaInicio: string; // Hora início (HH:mm)
  horaFim: string; // Hora fim (HH:mm)
  sala: string; // Sala física (apenas PRESENCIAL)
  obrigatoria: boolean;
  duracaoMinutos: string;
  status: "RASCUNHO" | "PUBLICADA";
  gravarAula: boolean; // Novo campo para AO_VIVO
}

const initialFormData: FormData = {
  titulo: "",
  descricao: "",
  modalidade: "",
  tipoLink: "",
  youtubeUrl: "",
  turmaId: "",
  instrutorId: "",
  moduloId: "",
  dataAula: null,
  horaInicio: "",
  horaFim: "",
  sala: "",
  obrigatoria: true,
  duracaoMinutos: "",
  status: "PUBLICADA",
  gravarAula: true, // Default: gravar aula ao vivo
};

export interface CreateAulaFormProps {
  mode?: "create" | "edit";
  aulaId?: string;
  initialData?: Aula;
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * Retorna a data de amanhã (hoje + 1 dia) com horário zerado
 * Usado para garantir que apenas datas futuras possam ser selecionadas
 */
const getTomorrowDate = (): Date => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
};

export function CreateAulaForm({
  mode = "create",
  aulaId,
  initialData,
  onSuccess,
  onCancel,
}: CreateAulaFormProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [selectedCursoId, setSelectedCursoId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [materialFiles, setMaterialFiles] = useState<FileUploadItem[]>([]);
  const [isInitializing, setIsInitializing] = useState(mode === "edit");
  const modalidadeAtualizadaRef = useRef(false); // Rastrear se já atualizamos a modalidade
  const duracaoManualOverrideRef = useRef(false);

  // Verificar roles
  const isInstrutor = user?.role === "INSTRUTOR";
  const isAdminModPed = ["ADMIN", "MODERADOR", "PEDAGOGICO"].includes(
    user?.role || ""
  );

  const { cursos, isLoading: loadingCursos } = useCursosForSelect();
  const { turmas, isLoading: loadingTurmas } = useTurmasForSelect({
    cursoId: isAdminModPed ? selectedCursoId : null,
    enabled: isAdminModPed ? Boolean(selectedCursoId) : true,
    includeCursoNameInLabel: !isAdminModPed,
  });
  const { instrutores, isLoading: loadingInstrutores } =
    useInstrutoresForSelect();

  // Mostrar campo turma apenas se instrutor tem múltiplas turmas ou se é Admin/Mod/Ped
  const showTurmaField = isAdminModPed || turmas.length > 1;
  const showCursoField = isAdminModPed && showTurmaField;
  // Mostrar campo instrutor apenas para Admin/Mod/Ped
  const showInstrutorField = isAdminModPed;
  // Turma é obrigatória para instrutor
  const turmaRequired = isInstrutor || (showCursoField && Boolean(selectedCursoId));
  const turmaDisabled = Boolean(showCursoField && !selectedCursoId);

  // Carregar dados iniciais no modo de edição
  useEffect(() => {
    if (mode === "edit") {
      if (initialData && initialData.id) {
        const aula = initialData;
        setSelectedCursoId(
          aula.turma?.curso?.id ? String(aula.turma.curso.id) : null
        );

        // ✅ DEBUG: Log para verificar se a descrição está vindo da API
        if (process.env.NODE_ENV === "development") {
          console.log("[CREATE_AULA_FORM] Dados recebidos da API:", {
            id: aula.id,
            titulo: aula.titulo,
            descricao: aula.descricao,
            descricaoLength: aula.descricao?.length || 0,
            descricaoType: typeof aula.descricao,
            descricaoIsEmpty: !aula.descricao || aula.descricao.trim() === "",
          });
        }

        // Extrair data e horários
        let dataAula: Date | null = null;
        let horaInicio = "";
        let horaFim = "";

        // Preferir usar horaInicio e horaFim separados da API (formato HH:MM)
        if (aula.horaInicio) {
          horaInicio = aula.horaInicio;
        } else if (aula.dataInicio) {
          // Fallback: extrair da data ISO se horaInicio não estiver disponível
          const dataInicio = new Date(aula.dataInicio);
          horaInicio = `${String(dataInicio.getHours()).padStart(
            2,
            "0"
          )}:${String(dataInicio.getMinutes()).padStart(2, "0")}`;
        }

        if (aula.horaFim) {
          horaFim = aula.horaFim;
        } else if (aula.dataFim) {
          // Fallback: extrair da data ISO se horaFim não estiver disponível
          const dataFim = new Date(aula.dataFim);
          horaFim = `${String(dataFim.getHours()).padStart(2, "0")}:${String(
            dataFim.getMinutes()
          ).padStart(2, "0")}`;
        }

        // Extrair apenas a data (sem hora) de dataInicio
        if (aula.dataInicio) {
          const dataInicio = new Date(aula.dataInicio);
          // Criar nova data apenas com dia/mês/ano (zerar horas)
          dataAula = new Date(
            dataInicio.getFullYear(),
            dataInicio.getMonth(),
            dataInicio.getDate()
          );
        }

        // Se há turma vinculada, não preencher modalidade aqui - será preenchida pelo useEffect quando turmas carregarem
        // Se não há turma vinculada, usar a modalidade da aula
        const modalidadeInicial: Modalidade | "" = aula.turma?.id
          ? "" // Será preenchida pelo useEffect quando turmas carregarem
          : (aula.modalidade as Modalidade) || "";

        // ✅ Garantir que descricao seja sempre uma string (não null/undefined)
        const descricaoInicial = aula.descricao || "";

        // ✅ PRESERVAR tipoLink e youtubeUrl mesmo quando há turma vinculada
        // Esses campos são importantes para modalidade ONLINE e SEMIPRESENCIAL
        const tipoLinkInicial = (aula.tipoLink as TipoLink) || "";
        const youtubeUrlInicial = aula.youtubeUrl || "";

        // ✅ DEBUG: Log para verificar o valor que será setado
        if (process.env.NODE_ENV === "development") {
          console.log(
            "[CREATE_AULA_FORM] Valores que serão setados no formData:",
            {
              descricaoInicial,
              descricaoInicialLength: descricaoInicial.length,
              descricaoInicialType: typeof descricaoInicial,
              tipoLinkInicial,
              youtubeUrlInicial,
              modalidadeInicial,
              temTurma: !!aula.turma?.id,
            }
          );
        }

        const newFormData: FormData = {
          titulo: aula.titulo || "",
          descricao: descricaoInicial,
          modalidade: modalidadeInicial,
          tipoLink: tipoLinkInicial,
          youtubeUrl: youtubeUrlInicial,
          turmaId: aula.turma?.id || "",
          instrutorId: aula.instrutor?.id || "",
          moduloId: aula.modulo?.id || "",
          dataAula,
          horaInicio,
          horaFim,
          sala: aula.sala || "",
          obrigatoria: aula.obrigatoria ?? true,
          duracaoMinutos: aula.duracaoMinutos
            ? String(aula.duracaoMinutos)
            : "",
          status: aula.status === "RASCUNHO" ? "RASCUNHO" : "PUBLICADA",
          gravarAula: aula.gravarAula ?? false,
        };

        // ✅ DEBUG: Log para verificar o formData que será setado
        if (process.env.NODE_ENV === "development") {
          console.log("[CREATE_AULA_FORM] formData que será setado:", {
            descricao: newFormData.descricao,
            descricaoLength: newFormData.descricao.length,
            descricaoType: typeof newFormData.descricao,
            titulo: newFormData.titulo,
          });
        }

        setFormData(newFormData);

        // ✅ DEBUG: Log após setFormData (usar setTimeout para capturar após atualização)
        if (process.env.NODE_ENV === "development") {
          setTimeout(() => {
            console.log("[CREATE_AULA_FORM] formData após setFormData:", {
              descricao: formData.descricao,
              descricaoLength: formData.descricao?.length || 0,
            });
          }, 100);
        }

        setIsInitializing(false);
        modalidadeAtualizadaRef.current = false; // Resetar flag quando inicializa
      } else {
        // Se não há initialData válido, manter loading
        setIsInitializing(true);
      }
    } else {
      setIsInitializing(false);
      modalidadeAtualizadaRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, initialData]); // formData.descricao não é necessário aqui (apenas monitoramento de inicialização)

  const handleCursoChange = useCallback(
    (cursoId: string | null) => {
      const nextCursoId = cursoId || null;
      setSelectedCursoId(nextCursoId);

      setFormData((prev) => {
        if (!prev.turmaId) return prev;
        return {
          ...prev,
          turmaId: "",
          modalidade: "",
          tipoLink: "",
          youtubeUrl: "",
          ...(mode === "create" && {
            dataAula: null,
            horaInicio: "",
            horaFim: "",
          }),
          gravarAula: false,
        };
      });

      setErrors((prev) => {
        if (!prev.turmaId) return prev;
        const { turmaId: _turmaId, ...rest } = prev;
        return rest;
      });
    },
    [mode]
  );

  // Auto-select turma se instrutor tem apenas 1 turma
  useEffect(() => {
    if (
      isInstrutor &&
      turmas.length === 1 &&
      !formData.turmaId &&
      mode === "create"
    ) {
      const turma = turmas[0];
      const modalidade = turmaMetodoToAulaModalidade(turma.metodo);
      setFormData((prev) => ({
        ...prev,
        turmaId: turma.value,
        modalidade,
        gravarAula: modalidade === "AO_VIVO" ? true : false,
      }));
    }
  }, [turmas, formData.turmaId, isInstrutor, mode]);

  // Preencher modalidade automaticamente quando turma é carregada no modo de edição
  // Este useEffect força a atualização quando as turmas terminam de carregar
  useEffect(() => {
    // Só executar no modo de edição, quando turmas terminaram de carregar e não está inicializando
    if (
      mode === "edit" &&
      !loadingTurmas &&
      !isInitializing &&
      turmas.length > 0
    ) {
      // Se há turma vinculada, SEMPRE usar a modalidade da turma (forçar atualização)
      if (formData.turmaId) {
        const selectedTurma = turmas.find((t) => t.value === formData.turmaId);
        if (selectedTurma) {
          const modalidadeDaTurma = turmaMetodoToAulaModalidade(
            selectedTurma.metodo
          );

          // SEMPRE atualizar modalidade quando há turma vinculada (vem da turma, não da aula)
          // A API agora valida e força a modalidade baseada na turma, mas preencher aqui
          // garante melhor UX (usuário vê a modalidade correta imediatamente)
          setFormData((prev) => {
            // Se a modalidade atual não corresponde à modalidade da turma, atualizar
            if (prev.modalidade !== modalidadeDaTurma) {
              modalidadeAtualizadaRef.current = true; // Marcar como atualizada

              // ✅ PRESERVAR tipoLink e youtubeUrl quando modalidade é ONLINE ou SEMIPRESENCIAL
              // Se estamos no modo de edição e a modalidade da turma permite tipoLink/youtubeUrl,
              // preservar os valores existentes do initialData
              const preservarLinks =
                mode === "edit" &&
                (modalidadeDaTurma === "ONLINE" ||
                  modalidadeDaTurma === "SEMIPRESENCIAL") &&
                initialData?.tipoLink &&
                initialData?.youtubeUrl;

              return {
                ...prev,
                modalidade: modalidadeDaTurma,
                // ✅ Preservar tipoLink e youtubeUrl se modalidade permite e existem no initialData
                tipoLink: preservarLinks
                  ? (initialData.tipoLink as TipoLink) || prev.tipoLink
                  : prev.tipoLink,
                youtubeUrl: preservarLinks
                  ? initialData.youtubeUrl || prev.youtubeUrl
                  : prev.youtubeUrl,
                gravarAula:
                  modalidadeDaTurma === "AO_VIVO"
                    ? prev.gravarAula ?? true
                    : prev.gravarAula,
              };
            } else {
              // Mesmo se já está correto, marcar como atualizada
              modalidadeAtualizadaRef.current = true;
            }
            return prev;
          });
        }
      } else {
        // Se não há turma vinculada e modalidade está vazia, usar a modalidade da aula
        // A API sempre retorna AO_VIVO quando turma tem método LIVE, então podemos confiar
        setFormData((prev) => {
          if (!prev.modalidade && initialData?.modalidade) {
            return {
              ...prev,
              modalidade: initialData.modalidade,
            };
          }
          return prev;
        });
      }
    }
  }, [
    mode,
    formData.turmaId,
    turmas, // Usar turmas completo para garantir que execute quando turmas mudam
    loadingTurmas,
    isInitializing,
    initialData?.modalidade,
    initialData?.tipoLink,
    initialData?.youtubeUrl,
  ]);

  // ✅ Regra atualizada (API): Instrutor é opcional para publicação
  // - Se não tiver turma, força status para RASCUNHO
  // - Se tiver turma, pode ser PUBLICADA ou RASCUNHO (instrutor é opcional)
  // - Google Meet só será criado quando instrutor for adicionado
  useEffect(() => {
    const temTurma = !!formData.turmaId;
    const podePublicar = temTurma; // ✅ Apenas turma é necessária para publicação

    if (!podePublicar && formData.status === "PUBLICADA") {
      // Se não pode publicar (sem turma) e está como PUBLICADA, força RASCUNHO
      setFormData((prev) => ({
        ...prev,
        status: "RASCUNHO",
      }));
    }
    // ✅ Removido: não força PUBLICADA automaticamente quando tem turma
    // O usuário escolhe se quer publicar ou manter como rascunho
  }, [formData.turmaId, formData.status]);

  // ✅ VALIDAÇÃO: Se modalidade é PRESENCIAL e há turmaId, limpar tipoLink e youtubeUrl automaticamente
  useEffect(() => {
    if (formData.modalidade === "PRESENCIAL" && formData.turmaId) {
      // Se há tipoLink ou youtubeUrl preenchidos, limpar
      if (formData.tipoLink || formData.youtubeUrl) {
        setFormData((prev) => ({
          ...prev,
          tipoLink: "",
          youtubeUrl: "",
        }));
      }
    }
  }, [
    formData.modalidade,
    formData.turmaId,
    formData.tipoLink,
    formData.youtubeUrl,
  ]);

  // ✅ DEBUG: Monitorar mudanças no formData.descricao
  useEffect(() => {
    if (process.env.NODE_ENV === "development" && mode === "edit") {
      console.log("[CREATE_AULA_FORM] formData.descricao mudou:", {
        descricao: formData.descricao,
        descricaoLength: formData.descricao?.length || 0,
        isInitializing,
        mode,
      });
    }
  }, [formData.descricao, isInitializing, mode]);

  const handleInputChange = (field: keyof FormData, value: any) => {
    if (field === "duracaoMinutos") {
      const nextValue = String(value ?? "").trim();
      duracaoManualOverrideRef.current = Boolean(nextValue);
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleModalidadeChange = (value: string | null) => {
    const modalidade = (value as Modalidade) || "";
    setFormData((prev) => {
      // ✅ PRESERVAR tipoLink e youtubeUrl quando modalidade é ONLINE ou SEMIPRESENCIAL
      // e estamos no modo de edição (para não perder dados existentes)
      const preservarLinks =
        mode === "edit" &&
        (modalidade === "ONLINE" || modalidade === "SEMIPRESENCIAL") &&
        (prev.tipoLink || prev.youtubeUrl);

      return {
        ...prev,
        modalidade,
        // ✅ Preservar links se modalidade permite e já existem
        tipoLink: preservarLinks ? prev.tipoLink : "",
        youtubeUrl: preservarLinks ? prev.youtubeUrl : "",
        // No modo de edição, manter data, hora e descrição se já existirem
        // No modo de criação, resetar para forçar o usuário a escolher
        dataAula: mode === "edit" ? prev.dataAula : null,
        horaInicio: mode === "edit" ? prev.horaInicio : "",
        horaFim: mode === "edit" ? prev.horaFim : "",
        // Manter descrição sempre (tanto em criação quanto em edição)
        descricao: prev.descricao,
        // Se mudar para AO_VIVO, ativar gravarAula por padrão
        gravarAula: modalidade === "AO_VIVO" ? true : prev.gravarAula,
      };
    });
  };

  // Handler para mudança de turma - preenche modalidade automaticamente
  const handleTurmaChange = (turmaId: string | null) => {
    const selectedTurma = turmas.find((t) => t.value === turmaId);

    if (selectedTurma) {
      const modalidade = turmaMetodoToAulaModalidade(selectedTurma.metodo);

      // No modo de edição, não resetar campos se a turma já estava selecionada
      if (mode === "edit" && formData.turmaId === turmaId) {
        // Apenas atualizar modalidade se necessário
        setFormData((prev) => ({
          ...prev,
          turmaId: turmaId || "",
          modalidade: prev.modalidade || modalidade,
          gravarAula:
            modalidade === "AO_VIVO"
              ? prev.gravarAula ?? true
              : prev.gravarAula,
        }));
      } else {
        // No modo de criação ou quando muda de turma, resetar campos
        setFormData((prev) => ({
          ...prev,
          turmaId: turmaId || "",
          modalidade,
          // Reset campos dependentes da modalidade apenas no modo de criação
          ...(mode === "create" && {
            tipoLink: "",
            youtubeUrl: "",
            dataAula: null,
            horaInicio: "",
            horaFim: "",
          }),
          gravarAula: modalidade === "AO_VIVO" ? true : false,
        }));
      }
    } else {
      // Nenhuma turma selecionada - limpa modalidade para permitir seleção manual
      setFormData((prev) => ({
        ...prev,
        turmaId: "",
        modalidade: "",
        tipoLink: "",
        youtubeUrl: "",
        ...(mode === "create" && {
          dataAula: null,
          horaInicio: "",
          horaFim: "",
        }),
        gravarAula: false,
      }));
    }

    // Limpar erro de turma
    if (errors.turmaId) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.turmaId;
        return newErrors;
      });
    }
  };

  const handleTipoLinkChange = (value: string | null) => {
    const tipoLink = (value as TipoLink) || "";
    setFormData((prev) => ({
      ...prev,
      tipoLink,
      youtubeUrl: tipoLink === "MEET" ? "" : prev.youtubeUrl,
      // Se selecionar MEET, ativar gravarAula por padrão
      gravarAula: tipoLink === "MEET" ? true : false,
    }));
  };

  // Computed values for conditional rendering
  const showYouTubeField =
    formData.modalidade === "ONLINE" ||
    (formData.modalidade === "SEMIPRESENCIAL" &&
      formData.tipoLink === "YOUTUBE");

  const showMeetInfo =
    formData.modalidade === "AO_VIVO" ||
    (formData.modalidade === "SEMIPRESENCIAL" && formData.tipoLink === "MEET");

  const showPeriodoField =
    formData.modalidade === "PRESENCIAL" ||
    formData.modalidade === "AO_VIVO" ||
    (formData.modalidade === "SEMIPRESENCIAL" && formData.tipoLink === "MEET");

  const showTipoLinkField = formData.modalidade === "SEMIPRESENCIAL";

  const showGravarAulaField =
    formData.modalidade === "AO_VIVO" ||
    (formData.modalidade === "SEMIPRESENCIAL" && formData.tipoLink === "MEET");

  // UX: calcular duração automaticamente quando o usuário informar hora início + hora fim.
  // Se o usuário editar a duração manualmente, não sobrescreve (até ele limpar o campo).
  useEffect(() => {
    if (!showPeriodoField) return;

    const duracao = computeDuracaoFromHoras(
      formData.horaInicio,
      formData.horaFim
    );
    if (!duracao) return;

    if (duracaoManualOverrideRef.current && formData.duracaoMinutos.trim()) {
      return;
    }

    const duracaoStr = String(duracao);
    setFormData((prev) => {
      if (duracaoManualOverrideRef.current && prev.duracaoMinutos.trim()) {
        return prev;
      }
      if (prev.duracaoMinutos.trim() === duracaoStr) return prev;
      return { ...prev, duracaoMinutos: duracaoStr };
    });
  }, [
    formData.horaInicio,
    formData.horaFim,
    formData.duracaoMinutos,
    showPeriodoField,
  ]);

  const validateForm = (): {
    valid: boolean;
    errors: Record<string, string>;
  } => {
    const newErrors: Record<string, string> = {};

    const tituloTrim = formData.titulo.trim();
    if (!tituloTrim || tituloTrim.length < 3) {
      newErrors.titulo = "Título deve ter no mínimo 3 caracteres";
    } else if (tituloTrim.length > 255) {
      newErrors.titulo = "Título deve ter no máximo 255 caracteres";
    }

    const descricaoTrim = formData.descricao.trim();
    if (!descricaoTrim || descricaoTrim.length < 1) {
      newErrors.descricao = "Descrição é obrigatória";
    } else if (descricaoTrim.length > 5000) {
      newErrors.descricao = "Descrição deve ter no máximo 5000 caracteres";
    }

    if (!formData.modalidade) {
      newErrors.modalidade = "Selecione a modalidade";
    }

    if (turmaRequired && !formData.turmaId) {
      newErrors.turmaId = "Selecione a turma";
    }

    if (showTipoLinkField && !formData.tipoLink) {
      newErrors.tipoLink = "Selecione o tipo de link";
    }

    if (showPeriodoField) {
      if (!formData.dataAula) {
        newErrors.dataAula = "Selecione a data da aula";
      }
      if (!formData.horaInicio) {
        newErrors.horaInicio = "Hora de início é obrigatória";
      }
      if (!formData.horaFim) {
        newErrors.horaFim = "Hora de término é obrigatória";
      }
    }

    // Duração é obrigatória (int > 0). Pode ser calculada se houver horário.
    const duracaoNum = Number.parseInt(formData.duracaoMinutos, 10);
    const hasHoras = Boolean(formData.horaInicio && formData.horaFim);
    if ((!Number.isFinite(duracaoNum) || duracaoNum <= 0) && !hasHoras) {
      newErrors.duracaoMinutos = "Duração é obrigatória e deve ser maior que 0";
    }

    const youtubeIsRequired =
      formData.modalidade === "ONLINE" ||
      (formData.modalidade === "SEMIPRESENCIAL" && formData.tipoLink === "YOUTUBE");

    if (youtubeIsRequired && !formData.youtubeUrl.trim()) {
      newErrors.youtubeUrl = "Link do YouTube é obrigatório";
    }

    // Validar URL do YouTube
    if (formData.youtubeUrl) {
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//;
      if (!youtubeRegex.test(formData.youtubeUrl)) {
        newErrors.youtubeUrl = "URL do YouTube inválida";
      }
    }

    // Validar horas
    if (!showPeriodoField) {
      // (opcional) - quando visível apenas por preenchimento manual
      if (
        (formData.horaInicio && !formData.horaFim) ||
        (!formData.horaInicio && formData.horaFim)
      ) {
        newErrors.horaFim = "Informe hora de início e término";
      }
    }
    if (formData.horaInicio && formData.horaFim) {
      if (formData.horaInicio >= formData.horaFim) {
        newErrors.horaFim = "Hora de término deve ser após hora de início";
      }
    }

    setErrors(newErrors);
    return { valid: Object.keys(newErrors).length === 0, errors: newErrors };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateForm();

    if (!validation.valid) {
      // Mostrar quais campos estão com erro
      console.error("❌ Campos com erro:", validation.errors);

      const primeiroErro = Object.values(validation.errors)[0];

      toastCustom.error({
        title: "Verifique os campos obrigatórios",
        description: primeiroErro,
      });
      return;
    }

    const normalizeOptionalId = (raw: string): string | undefined => {
      const trimmed = raw.trim();
      return trimmed ? trimmed : undefined;
    };

    const tituloTrim = formData.titulo.trim();
    const descricaoTrim = formData.descricao.trim();

    const duracaoFromInput = Number.parseInt(formData.duracaoMinutos, 10);
    const duracaoFromHoras = computeDuracaoFromHoras(
      formData.horaInicio,
      formData.horaFim
    );
    const duracaoMinutos =
      (Number.isFinite(duracaoFromInput) && duracaoFromInput > 0
        ? duracaoFromInput
        : null) ?? duracaoFromHoras;

    if (!duracaoMinutos) {
      setErrors((prev) => ({
        ...prev,
        duracaoMinutos: "Duração é obrigatória e deve ser maior que 0",
      }));
      toastCustom.error({
        title: "Verifique os campos obrigatórios",
        description: "Informe uma duração válida (em minutos).",
      });
      return;
    }

    const turmaId = normalizeOptionalId(formData.turmaId);
    const instrutorId = normalizeOptionalId(formData.instrutorId);
    const moduloId = normalizeOptionalId(formData.moduloId);
    const statusFinal = turmaId ? formData.status : "RASCUNHO";

    // API espera data no formato YYYY-MM-DD (sem timezone) e horas separadas (HH:mm)
    const formatDateToYmd = (date: Date | null): string | undefined => {
      if (!date) return undefined;
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    };

    const dataInicio = formatDateToYmd(formData.dataAula);
    const dataFim = formData.horaFim ? formatDateToYmd(formData.dataAula) : undefined;
    const cursoId = showCursoField ? (selectedCursoId ?? undefined) : undefined;
    const sala =
      formData.modalidade === "PRESENCIAL" && formData.sala.trim()
        ? formData.sala.trim()
        : undefined;
    const youtubeUrl =
      showYouTubeField && formData.youtubeUrl.trim()
        ? formData.youtubeUrl.trim()
        : undefined;
    const shouldSendGravarAula = showGravarAulaField;

    setIsLoading(true);

    try {
      if (mode === "edit" && aulaId) {
        const updatePayload: UpdateAulaPayload = {
          titulo: tituloTrim,
          descricao: descricaoTrim,
          modalidade: formData.modalidade as Modalidade,
          cursoId,
          tipoLink: formData.tipoLink ? (formData.tipoLink as TipoLink) : undefined,
          youtubeUrl,
          dataInicio,
          dataFim,
          horaInicio: formData.horaInicio || undefined,
          horaFim: formData.horaFim || undefined,
          sala,
          duracaoMinutos,
          obrigatoria: formData.obrigatoria,
          ...(shouldSendGravarAula ? { gravarAula: formData.gravarAula } : {}),
          status: statusFinal,
          ...(turmaId ? { turmaId } : {}),
          ...(instrutorId ? { instrutorId } : {}),
          ...(moduloId ? { moduloId } : {}),
        };

        setLoadingStep("Salvando alterações...");
        const updatedAula = await updateAula(aulaId, updatePayload);
        setLoadingStep("Finalizando...");

        // Debug: Log para verificar a resposta da API
        if (process.env.NODE_ENV === "development") {
          console.log("[UPDATE_AULA] Resposta da API:", {
            id: updatedAula?.id,
            titulo: updatedAula?.titulo,
            modalidade: updatedAula?.modalidade,
            status: updatedAula?.status,
            turma: updatedAula?.turma?.nome || null,
            instrutor: updatedAula?.instrutor?.nome || null,
            payload: updatePayload,
          });
        }

        const detailKey = queryKeys.aulas.detail(aulaId);

        // ✅ Remover dados antigos do cache ANTES de invalidar
        queryClient.removeQueries({
          queryKey: detailKey,
          exact: false, // Remove todas as variações da query
        });

        // ✅ Atualizar cache com os dados retornados pela API (otimistic update)
        queryClient.setQueryData(detailKey, updatedAula);

        // ✅ Invalidar queries de listagem também
        await queryClient.invalidateQueries({
          queryKey: ["aulas"],
          exact: false,
          refetchType: "all",
        });

        // ✅ Invalidar todas as queries relacionadas a aulas
        await queryClient.invalidateQueries({
          queryKey: ["admin-aula-detail"],
          exact: false,
          refetchType: "all",
        });

        toastCustom.success("Aula atualizada com sucesso!");

        // Pequeno delay para garantir que a atualização do cache seja processada
        await new Promise((resolve) => setTimeout(resolve, 300));
      } else {
        // Modo de criação
        // Se houver arquivos para anexar, fazer upload para blob ANTES de criar a aula
        const filesWithData = materialFiles.filter((item) => item.file);
        const uploadedFiles: FileUploadResult[] = [];

        if (filesWithData.length > 0) {
          try {
            setLoadingStep(
              `Fazendo upload de ${filesWithData.length} arquivo(s)...`
            );
            // Passo 1: Upload de todos os arquivos para o blob storage
            for (let i = 0; i < filesWithData.length; i++) {
              const materialFile = filesWithData[i];
              setUploadProgress(
                Math.round(((i + 1) / filesWithData.length) * 100)
              );
              const result = await uploadFile(
                materialFile.file!,
                "materiais/aulas"
              );
              uploadedFiles.push(result);
            }
          } catch (error) {
            // Se falhar o upload para blob, não continua
            console.error("Erro ao fazer upload dos arquivos:", error);
            toastCustom.error(
              "Erro ao fazer upload dos arquivos. Tente novamente."
            );
            setIsLoading(false);
            setLoadingStep("");
            setUploadProgress(0);
            return;
          }
        }

        const materiais =
          uploadedFiles.length > 0
            ? uploadedFiles.map((uploadedFile) => ({
                url: uploadedFile.url,
                titulo: uploadedFile.originalName.replace(/\.[^/.]+$/, ""),
              }))
            : undefined;

        const createPayload: CreateAulaPayload = {
          titulo: tituloTrim,
          descricao: descricaoTrim,
          modalidade: formData.modalidade as Modalidade,
          cursoId,
          tipoLink: formData.tipoLink ? (formData.tipoLink as TipoLink) : undefined,
          youtubeUrl,
          dataInicio,
          dataFim,
          horaInicio: formData.horaInicio || undefined,
          horaFim: formData.horaFim || undefined,
          sala,
          duracaoMinutos,
          obrigatoria: formData.obrigatoria,
          ...(shouldSendGravarAula ? { gravarAula: formData.gravarAula } : {}),
          status: statusFinal,
          ...(turmaId ? { turmaId } : {}),
          ...(instrutorId ? { instrutorId } : {}),
          ...(moduloId ? { moduloId } : {}),
          ...(materiais ? { materiais } : {}),
        };

        // Passo 2: Criar a aula (já com materiais)
        setLoadingStep("Criando aula...");
        setUploadProgress(0);
        let response;
        try {
          response = await createAula(createPayload);
        } catch (error) {
          // Se falhou ao criar a aula, fazer rollback dos arquivos do blob
          if (uploadedFiles.length > 0) {
            setLoadingStep("Revertendo upload de arquivos...");
            await deleteFiles(uploadedFiles.map((f) => f.url));
          }
          throw error;
        }

        setLoadingStep("Finalizando...");
        toastCustom.success(
          uploadedFiles.length > 0
            ? `Aula criada com ${uploadedFiles.length} material(is)!`
            : "Aula criada com sucesso!"
        );

        if (response.meetUrl) {
          toastCustom.info(`Sala Google Meet criada: ${response.meetUrl}`);
        }
      }

      // Invalidar todas as queries de aulas para atualizar a lista imediatamente
      await queryClient.invalidateQueries({
        queryKey: ["aulas"],
        exact: false, // Invalida todas as queries que começam com ["aulas"]
      });

      // Se estiver no modo de edição, também invalidar a query de detalhes
      if (mode === "edit" && aulaId) {
        const detailKey = queryKeys.aulas.detail(aulaId);
        await queryClient.invalidateQueries({
          queryKey: detailKey,
          exact: true,
        });
        await queryClient.refetchQueries({
          queryKey: detailKey,
          exact: true,
        });
      }

      // Limpar loading e chamar onSuccess
      setIsLoading(false);
      setLoadingStep("");
      setUploadProgress(0);

      // Aguardar um pouco para garantir que a invalidação foi processada
      await new Promise((resolve) => setTimeout(resolve, 200));

      onSuccess?.();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : mode === "edit"
          ? "Erro ao atualizar aula"
          : "Erro ao criar aula";
      toastCustom.error(errorMessage);
      setIsLoading(false);
      setLoadingStep("");
      setUploadProgress(0);
    }
  };

  // Mostrar skeleton enquanto está inicializando no modo de edição
  if (isInitializing && mode === "edit") {
    return (
      <div className="bg-white rounded-3xl p-6 relative">
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-gray-400/20">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-5 w-48" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>

          {/* Form Fields Skeleton */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 relative">
      <FormLoadingModal
        isLoading={isLoading}
        title={mode === "edit" ? "Salvando..." : "Criando aula..."}
        loadingStep={
          loadingStep ||
          (uploadProgress > 0 ? `${uploadProgress}% completo` : undefined)
        }
        icon={Video}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <fieldset disabled={isLoading} className="space-y-6">
          {/* Alerta de Erros de Validação */}
          {Object.keys(errors).length > 0 && (
            <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <Info className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm! font-semibold! text-red-900! mb-0!">
                    {Object.keys(errors).length === 1
                      ? "1 campo precisa de atenção"
                      : `${
                          Object.keys(errors).length
                        } campos precisam de atenção`}
                  </h4>
                  <div className="space-y-1.5">
                    {Object.entries(errors).map(([campo, mensagem]) => (
                      <div
                        key={campo}
                        className="flex items-start gap-2 text-sm! text-red-700!"
                      >
                        <Circle className="h-1.5 w-1.5 fill-red-500 text-red-500 mt-1.5 shrink-0" />
                        <span className="mb-0!">{mensagem}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Header - Configurações da Aula */}
          <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-gray-400/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg border bg-blue-50 text-blue-600 border-blue-200">
                <Video className="h-4 w-4" />
              </div>
              <span className="text-md font-medium text-foreground">
                Configurações da Aula
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Label
                htmlFor="status"
                className={cn(
                  "text-xs font-medium px-2 py-1 rounded-full transition-colors",
                  formData.status === "PUBLICADA"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-red-100 text-red-700"
                )}
              >
                {formData.status === "PUBLICADA" ? "Publicada" : "Rascunho"}
              </Label>
              <Switch
                id="status"
                checked={formData.status === "PUBLICADA"}
                onCheckedChange={(checked) =>
                  handleInputChange(
                    "status",
                    checked ? "PUBLICADA" : "RASCUNHO"
                  )
                }
                disabled={
                  isLoading ||
                  !formData.turmaId ||
                  (isInstrutor && !formData.turmaId)
                  // ✅ Instrutor não é mais obrigatório para publicação
                }
              />
            </div>
          </div>

          {/* Alerta: Precisa ter turma para publicar */}
          {!formData.turmaId && (
            <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Info className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm! font-semibold! text-amber-900! mb-1!">
                    Aula será salva como rascunho
                  </h4>
                  <p className="text-sm! text-amber-700! mb-0!">
                    Para publicar a aula, é necessário vincular uma{" "}
                    <strong>turma</strong>. O instrutor pode ser definido
                    depois.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ✅ Alerta: Turma vinculada mas sem instrutor - Google Meet será criado depois */}
          {formData.turmaId && !formData.instrutorId && (
            <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Info className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm! font-semibold! text-blue-900! mb-1!">
                    Instrutor opcional
                  </h4>
                  <p className="text-sm! text-blue-700! mb-0!">
                    Você pode publicar a aula sem instrutor. O{" "}
                    <strong>Google Meet</strong> será criado automaticamente
                    quando o instrutor for adicionado.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Título da Aula */}
            <InputCustom
              label="Título da Aula"
              name="titulo"
              value={formData.titulo}
              onChange={(e) => handleInputChange("titulo", e.target.value)}
              error={errors.titulo}
              required
              placeholder="Ex.: Introdução ao Node.js"
              maxLength={255}
            />

            {/* Linha 1: Curso, Turma, Instrutor e Modalidade */}
            <div className="flex flex-col md:flex-row gap-4 w-full">
              {/* Campo Curso - Apenas para Admin/Mod/Ped (facilita filtrar turmas) */}
              {showCursoField && (
                <div className="flex-1 min-w-0">
                  {loadingCursos ? (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Curso
                      </Label>
                      <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                  ) : (
                    <SelectCustom
                      label="Curso"
                      placeholder="Selecione o curso"
                      options={cursos}
                      value={selectedCursoId}
                      onChange={handleCursoChange}
                      clearable
                    />
                  )}
                </div>
              )}

              {/* Campo Turma - Oculto se instrutor tem só 1 turma */}
              {showTurmaField && (
                <div className="flex-1 min-w-0">
                  {loadingTurmas ? (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Turma{" "}
                        {turmaRequired && (
                          <span className="text-red-500">*</span>
                        )}
                      </Label>
                      <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                  ) : (
                    <SelectCustom
                      label="Turma"
                      placeholder={
                        showCursoField && !selectedCursoId
                          ? "Selecione um curso primeiro"
                          : "Selecione a turma"
                      }
                      options={[
                        ...(isAdminModPed && !turmaRequired
                          ? [
                              {
                                value: "",
                                label: "Sem turma (vincular depois)",
                              },
                            ]
                          : []),
                        ...turmas,
                      ]}
                      value={formData.turmaId}
                      onChange={handleTurmaChange}
                      error={errors.turmaId}
                      required={turmaRequired}
                      disabled={turmaDisabled}
                    />
                  )}
                </div>
              )}

              {/* Campo Instrutor - Apenas para Admin/Mod/Ped */}
              {showInstrutorField && (
                <div className="flex-1 min-w-0">
                  {loadingInstrutores ? (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Instrutor
                      </Label>
                      <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                  ) : (
                    <SelectCustom
                      label="Instrutor"
                      placeholder="Selecione o instrutor"
                      options={[
                        { value: "", label: "Sem instrutor (vincular depois)" },
                        ...instrutores,
                      ]}
                      value={formData.instrutorId}
                      onChange={(val) =>
                        handleInputChange("instrutorId", val || "")
                      }
                      error={errors.instrutorId}
                    />
                  )}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <SelectCustom
                  label="Modalidade"
                  options={MODALIDADE_OPTIONS}
                  value={formData.modalidade}
                  onChange={handleModalidadeChange}
                  placeholder={
                    formData.turmaId
                      ? "Definida pela turma"
                      : "Selecione a modalidade"
                  }
                  error={errors.modalidade}
                  required
                  disabled={!!formData.turmaId}
                  helperText={
                    formData.turmaId
                      ? "A modalidade é definida pela turma selecionada"
                      : undefined
                  }
                />
              </div>
            </div>

            {/* Tipo de Link (Semipresencial) */}
            {showTipoLinkField && (
              <SelectCustom
                label="Tipo de Link"
                options={TIPO_LINK_OPTIONS}
                value={formData.tipoLink}
                onChange={handleTipoLinkChange}
                placeholder="Selecione o tipo de link"
                error={errors.tipoLink}
                required
              />
            )}

            {/* YouTube URL */}
            {showYouTubeField && (
              <InputCustom
                label="Link do YouTube"
                value={formData.youtubeUrl}
                onChange={(e) =>
                  handleInputChange("youtubeUrl", e.target.value)
                }
                placeholder="https://www.youtube.com/watch?v=..."
                error={errors.youtubeUrl}
                required={
                  formData.modalidade === "ONLINE" ||
                  (formData.modalidade === "SEMIPRESENCIAL" &&
                    formData.tipoLink === "YOUTUBE")
                }
              />
            )}

            {/* Info sobre período por modalidade */}
            {formData.modalidade === "ONLINE" && (
              <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <Info className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm! font-semibold! text-amber-900! mb-1!">
                      Aula Online (YouTube)
                    </h4>
                    <p className="text-sm! text-amber-700! mb-0!">
                      Vídeo gravado ficará sempre disponível. Não é necessário
                      definir período.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Meet Info */}
            {showMeetInfo && (
              <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Info className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm! font-semibold! text-blue-900! mb-1!">
                      Google Meet
                    </h4>
                    <p className="text-sm! text-blue-700! mb-0!">
                      O link da sala será criado automaticamente quando você
                      salvar a aula.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Linha: Data da aula, horários, duração e obrigatória */}
            {showPeriodoField ? (
              <>
                <div
                  className={cn(
                    "grid grid-cols-1 gap-4 w-full",
                    formData.modalidade === "PRESENCIAL"
                      ? "md:grid-cols-6"
                      : "md:grid-cols-5"
                  )}
                >
                  <DatePickerCustom
                    label="Data da Aula"
                    value={formData.dataAula}
                    onChange={(date) => handleInputChange("dataAula", date)}
                    placeholder="Selecione"
                    error={errors.dataAula}
                    minDate={getTomorrowDate()}
                    required
                  />

                  <TimeInputCustom
                    label="Hora de Início"
                    name="horaInicio"
                    value={formData.horaInicio}
                    onChange={(value) => handleInputChange("horaInicio", value)}
                    error={errors.horaInicio}
                    disabled={isLoading}
                    placeholder="00:00"
                    required
                  />

                  <TimeInputCustom
                    label="Hora de Término"
                    name="horaFim"
                    value={formData.horaFim}
                    onChange={(value) => handleInputChange("horaFim", value)}
                    error={errors.horaFim}
                    disabled={isLoading}
                    placeholder="00:00"
                    required
                  />

                  <InputCustom
                    label="Duração (minutos)"
                    type="number"
                    value={formData.duracaoMinutos}
                    onChange={(e) =>
                      handleInputChange("duracaoMinutos", e.target.value)
                    }
                    placeholder="Ex: 60"
                    required
                    error={errors.duracaoMinutos}
                  />

                  <SelectCustom
                    label="Aula obrigatória"
                    options={[
                      { value: "true", label: "Sim" },
                      { value: "false", label: "Não" },
                    ]}
                    value={String(formData.obrigatoria)}
                    onChange={(val) =>
                      handleInputChange("obrigatoria", val === "true")
                    }
                    required
                  />

                  {formData.modalidade === "PRESENCIAL" && (
                    <InputCustom
                      label="Sala"
                      placeholder="Ex: Lab 101"
                      value={formData.sala}
                      onChange={(e) => handleInputChange("sala", e.target.value)}
                      maxLength={100}
                    />
                  )}
                </div>

                {/* Campo Gravar Aula (apenas para AO_VIVO) */}
                {showGravarAulaField && (
                  <label
                    className={cn(
                      "group relative flex items-center gap-4 rounded-xl border-2 p-4 transition-all duration-200 cursor-pointer select-none",
                      formData.gravarAula
                        ? "border-red-400 bg-linear-to-r from-red-50 to-rose-50 shadow-sm"
                        : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100"
                    )}
                  >
                    {/* Ícone de gravação */}
                    <div
                      className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition-all duration-200",
                        formData.gravarAula
                          ? "bg-red-100"
                          : "bg-gray-200 group-hover:bg-gray-300"
                      )}
                    >
                      <Circle
                        className={cn(
                          "h-6 w-6 transition-all duration-200",
                          formData.gravarAula
                            ? "fill-red-500 text-red-500 animate-pulse"
                            : "fill-gray-400 text-gray-400"
                        )}
                      />
                    </div>

                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm! font-semibold! transition-colors! duration-200! mb-0!",
                          formData.gravarAula
                            ? "text-red-700!"
                            : "text-gray-700!"
                        )}
                      >
                        Gravar aula automaticamente
                      </p>
                      <p
                        className={cn(
                          "text-xs! transition-colors! duration-200! mb-0!",
                          formData.gravarAula
                            ? "text-red-600/80!"
                            : "text-gray-500!"
                        )}
                      >
                        A gravação ficará disponível no Google Drive após o
                        término
                      </p>
                    </div>

                    {/* Switch */}
                    <Switch
                      checked={formData.gravarAula}
                      onCheckedChange={(checked) => {
                        handleInputChange("gravarAula", checked);
                      }}
                      className="shrink-0"
                    />

                    {/* Badge de status */}
                    {formData.gravarAula && (
                      <span className="absolute -top-2 -right-2 flex h-5 items-center gap-1 rounded-full bg-red-500 px-2 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                        <Circle className="h-2 w-2 fill-white animate-pulse" />
                        REC
                      </span>
                    )}
                  </label>
                )}
              </>
            ) : (
              <div className="flex flex-col md:flex-row gap-4 w-full">
                <div className="flex-[0.5] min-w-0">
                  <InputCustom
                    label="Duração (minutos)"
                    type="number"
                    value={formData.duracaoMinutos}
                    onChange={(e) =>
                      handleInputChange("duracaoMinutos", e.target.value)
                    }
                    placeholder="Ex: 60"
                    required
                    error={errors.duracaoMinutos}
                  />
                </div>
                <div className="flex-[0.5] min-w-0">
                  <SelectCustom
                    label="Aula obrigatória"
                    options={[
                      { value: "true", label: "Sim" },
                      { value: "false", label: "Não" },
                    ]}
                    value={String(formData.obrigatoria)}
                    onChange={(val) =>
                      handleInputChange("obrigatoria", val === "true")
                    }
                    required
                  />
                </div>
              </div>
            )}

            {/* Seção de Materiais Complementares (acima da descrição) */}
            {mode === "create" && (
              <div className="space-y-2!">
                {/* Header da seção */}
                <div className="flex! items-baseline! gap-2!">
                  <Label className="text-sm! font-medium! text-foreground! mb-0!">
                    Materiais Complementares
                  </Label>
                </div>

                {/* FileUploadMultiple component */}
                <FileUploadMultiple
                  files={materialFiles}
                  onFilesChange={setMaterialFiles}
                  maxFiles={MATERIAIS_CONFIG.MAX_POR_AULA}
                  maxSize={MATERIAIS_CONFIG.MAX_TAMANHO_ARQUIVO}
                  accept={
                    MATERIAIS_CONFIG.EXTENSOES_PERMITIDAS as unknown as AcceptedFileType[]
                  }
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Descrição */}
            <RichTextarea
              key={`descricao-${mode}-${aulaId || "new"}`}
              label="Descrição"
              placeholder="Descreva o conteúdo da aula"
              value={formData.descricao}
              onChange={(e) =>
                handleInputChange(
                  "descricao",
                  (e.target as HTMLTextAreaElement).value
                )
              }
              maxLength={5000}
              showCharCount
              error={errors.descricao}
              required
            />
          </div>

          {/* Botões */}
          <div className="flex items-center justify-end gap-2">
            <ButtonCustom
              type="button"
              size="md"
              variant="outline"
              onClick={() => onCancel?.()}
              disabled={isLoading}
            >
              Cancelar
            </ButtonCustom>
            <ButtonCustom
              type="submit"
              size="md"
              variant="primary"
              isLoading={isLoading}
            >
              {isLoading
                ? mode === "edit"
                  ? "Salvando..."
                  : "Criando..."
                : mode === "edit"
                ? "Salvar Alterações"
                : "Criar Aula"}
            </ButtonCustom>
          </div>
        </fieldset>
      </form>
    </div>
  );
}

export default CreateAulaForm;

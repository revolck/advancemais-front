"use client";

import React, { useState, useEffect, useRef } from "react";
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
  createMaterialArquivoFromUrl,
  publicarAula,
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [materialFiles, setMaterialFiles] = useState<FileUploadItem[]>([]);
  const [isInitializing, setIsInitializing] = useState(mode === "edit");
  const modalidadeAtualizadaRef = useRef(false); // Rastrear se já atualizamos a modalidade

  const { turmas, isLoading: loadingTurmas } = useTurmasForSelect();
  const { instrutores, isLoading: loadingInstrutores } =
    useInstrutoresForSelect();

  // Verificar roles
  const isInstrutor = user?.role === "INSTRUTOR";
  const isAdminModPed = ["ADMIN", "MODERADOR", "PEDAGOGICO"].includes(
    user?.role || ""
  );

  // Mostrar campo turma apenas se instrutor tem múltiplas turmas ou se é Admin/Mod/Ped
  const showTurmaField = isAdminModPed || turmas.length > 1;
  // Mostrar campo instrutor apenas para Admin/Mod/Ped
  const showInstrutorField = isAdminModPed;
  // Turma é obrigatória para instrutor
  const turmaRequired = isInstrutor;

  // Carregar dados iniciais no modo de edição
  useEffect(() => {
    if (mode === "edit") {
      if (initialData && initialData.id) {
        const aula = initialData;

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
        const modalidadeInicial = aula.turma?.id
          ? "" // Será preenchida pelo useEffect quando turmas carregarem
          : aula.modalidade || "";

        setFormData({
          titulo: aula.titulo || "",
          descricao: aula.descricao || "",
          modalidade: modalidadeInicial,
          tipoLink: aula.tipoLink || "",
          youtubeUrl: aula.youtubeUrl || "",
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
        });

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
  }, [mode, initialData]);

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
              return {
                ...prev,
                modalidade: modalidadeDaTurma,
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
  ]);

  // Regra: Se não tiver turma, força status para RASCUNHO
  // Se tiver turma, define como PUBLICADA por padrão (instrutor não é obrigatório para rascunho)
  useEffect(() => {
    const temTurma = !!formData.turmaId;
    const podePublicar = temTurma; // Apenas turma é obrigatória para publicação

    if (!podePublicar && formData.status === "PUBLICADA") {
      // Se não pode publicar e está como PUBLICADA, força RASCUNHO
      setFormData((prev) => ({
        ...prev,
        status: "RASCUNHO",
      }));
    } else if (podePublicar && formData.status === "RASCUNHO") {
      // Se pode publicar e está como RASCUNHO, define como PUBLICADA por padrão
      setFormData((prev) => ({
        ...prev,
        status: "PUBLICADA",
      }));
    }
  }, [formData.turmaId, formData.status]);

  const handleInputChange = (field: keyof FormData, value: any) => {
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
    setFormData((prev) => ({
      ...prev,
      modalidade,
      tipoLink: "",
      youtubeUrl: "",
      dataAula: null,
      horaInicio: "",
      horaFim: "",
      // Se mudar para AO_VIVO, ativar gravarAula por padrão
      gravarAula: modalidade === "AO_VIVO" ? true : false,
    }));
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

  const validateForm = (): {
    valid: boolean;
    errors: Record<string, string>;
  } => {
    const newErrors: Record<string, string> = {};

    // Validações básicas (sempre obrigatórias)
    if (!formData.titulo.trim() || formData.titulo.length < 3) {
      newErrors.titulo = "Título deve ter no mínimo 3 caracteres";
    }

    if (!formData.descricao.trim() || formData.descricao.length < 10) {
      newErrors.descricao =
        "Descrição é obrigatória e deve ter no mínimo 10 caracteres";
    }

    if (!formData.modalidade) {
      newErrors.modalidade = "Selecione a modalidade";
    }

    // Turma é obrigatória apenas para Instrutor
    if (isInstrutor && !formData.turmaId) {
      newErrors.turmaId = "Selecione a turma";
    }

    // Duração é obrigatória para modalidades SEM período (ONLINE, SEMIPRESENCIAL com YouTube)
    // Para modalidades COM período (PRESENCIAL, AO_VIVO), será calculada automaticamente
    const modalidadeSemPeriodo =
      formData.modalidade === "ONLINE" ||
      (formData.modalidade === "SEMIPRESENCIAL" &&
        formData.tipoLink === "YOUTUBE");

    if (modalidadeSemPeriodo) {
      if (!formData.duracaoMinutos || Number(formData.duracaoMinutos) <= 0) {
        newErrors.duracaoMinutos =
          "Duração é obrigatória e deve ser maior que 0";
      }
    }

    // Validações específicas por modalidade
    if (formData.modalidade === "ONLINE") {
      // ONLINE: YouTube obrigatório, período NÃO é usado
      if (!formData.youtubeUrl) {
        newErrors.youtubeUrl =
          "Link do YouTube é obrigatório para aulas online";
      }
    }

    if (formData.modalidade === "PRESENCIAL") {
      // PRESENCIAL: Data e horários obrigatórios
      if (!formData.dataAula) {
        newErrors.dataAula = "Data da aula é obrigatória";
      }
      if (!formData.horaInicio) {
        newErrors.horaInicio = "Hora de início é obrigatória";
      }
      if (!formData.horaFim) {
        newErrors.horaFim = "Hora de término é obrigatória";
      }
      if (
        formData.horaInicio &&
        formData.horaFim &&
        formData.horaInicio >= formData.horaFim
      ) {
        newErrors.horaFim = "Hora de término deve ser após hora de início";
      }

      // Verificar se é no futuro (amanhã ou depois)
      if (formData.dataAula) {
        const dataAula = new Date(formData.dataAula);
        dataAula.setHours(0, 0, 0, 0);
        const amanha = getTomorrowDate();

        if (dataAula < amanha) {
          newErrors.dataAula = "Aula deve ser agendada para amanhã ou depois";
        }
      }
    }

    if (formData.modalidade === "AO_VIVO") {
      // AO_VIVO: Data e horários obrigatórios no futuro
      if (!formData.dataAula) {
        newErrors.dataAula = "Data da aula ao vivo é obrigatória";
      }
      if (!formData.horaInicio) {
        newErrors.horaInicio = "Hora de início é obrigatória";
      }
      if (!formData.horaFim) {
        newErrors.horaFim = "Hora de término é obrigatória";
      }
      if (
        formData.horaInicio &&
        formData.horaFim &&
        formData.horaInicio >= formData.horaFim
      ) {
        newErrors.horaFim = "Hora de término deve ser após hora de início";
      }

      // Verificar se é no futuro (amanhã ou depois)
      if (formData.dataAula) {
        const dataAula = new Date(formData.dataAula);
        dataAula.setHours(0, 0, 0, 0);
        const amanha = getTomorrowDate();

        if (dataAula < amanha) {
          newErrors.dataAula = "Aula deve ser agendada para amanhã ou depois";
        }
      }
    }

    if (formData.modalidade === "SEMIPRESENCIAL") {
      // SEMIPRESENCIAL: Tipo de link obrigatório
      if (!formData.tipoLink) {
        newErrors.tipoLink = "Selecione o tipo de link";
      }
      if (formData.tipoLink === "YOUTUBE" && !formData.youtubeUrl) {
        newErrors.youtubeUrl = "Link do YouTube é obrigatório";
      }
      if (formData.tipoLink === "MEET") {
        if (!formData.dataAula) {
          newErrors.dataAula = "Data da aula é obrigatória";
        }
        if (!formData.horaInicio) {
          newErrors.horaInicio = "Hora de início é obrigatória";
        }
        if (!formData.horaFim) {
          newErrors.horaFim = "Hora de término é obrigatória";
        }

        // Verificar se é no futuro (amanhã ou depois)
        if (formData.dataAula) {
          const dataAula = new Date(formData.dataAula);
          dataAula.setHours(0, 0, 0, 0);
          const amanha = getTomorrowDate();

          if (dataAula < amanha) {
            newErrors.dataAula = "Aula deve ser agendada para amanhã ou depois";
          }
        }
      }
    }

    // Validar URL do YouTube
    if (formData.youtubeUrl) {
      const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//;
      if (!youtubeRegex.test(formData.youtubeUrl)) {
        newErrors.youtubeUrl = "URL do YouTube inválida";
      }
    }

    setErrors(newErrors);
    return { valid: Object.keys(newErrors).length === 0, errors: newErrors };
  };

  /**
   * Formata uma data para o formato YYYY-MM-DD
   */
  const formatDateForAPI = (date: Date | string | null): string | undefined => {
    if (!date) return undefined;

    const dateObj = typeof date === "string" ? new Date(date) : date;

    // Se já é YYYY-MM-DD, retorna como está
    if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }

    // Converte para YYYY-MM-DD
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
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

    setIsLoading(true);

    try {
      // Construir dataInicio e dataFim se houver data e horários
      // Enviar apenas a data (YYYY-MM-DD) e as horas separadamente (HH:MM)
      let dataInicio: string | undefined;
      let dataFim: string | undefined;
      let horaInicio: string | undefined;
      let horaFim: string | undefined;
      let hasPeriodo = false;

      if (formData.dataAula && formData.horaInicio && formData.horaFim) {
        // Data apenas no formato YYYY-MM-DD
        dataInicio = formatDateForAPI(formData.dataAula);

        // Horas separadas no formato HH:MM
        horaInicio = formData.horaInicio;
        horaFim = formData.horaFim;

        // Para dataFim, usar a mesma data (aula acontece em um único dia)
        // Se precisar de dataFim diferente, seria necessário um campo separado
        dataFim = formatDateForAPI(formData.dataAula);

        hasPeriodo = true;
      }

      if (mode === "edit" && aulaId) {
        // Modo de edição
        // Detectar se turma foi removida (estava preenchida antes e agora está vazia)
        const turmaFoiRemovida = initialData?.turma?.id && !formData.turmaId;

        // Detectar se instrutor foi removido
        const instrutorFoiRemovido =
          initialData?.instrutor?.id && !formData.instrutorId;

        const updatePayload: UpdateAulaPayload = {
          titulo: formData.titulo.trim(),
          descricao: formData.descricao.trim(),
          modalidade: formData.modalidade as Modalidade,
          tipoLink: (formData.tipoLink as TipoLink) || undefined,
          youtubeUrl: formData.youtubeUrl || undefined,
          // Se turma foi removida, não enviar o campo (API deve tratar como remoção)
          // Se turma foi selecionada, enviar o ID
          // Se não foi alterado, não enviar (undefined)
          ...(turmaFoiRemovida
            ? {} // Não enviar turmaId quando removido
            : formData.turmaId
            ? { turmaId: formData.turmaId }
            : {}),
          // Se instrutor foi removido, não enviar o campo (API deve tratar como remoção)
          ...(instrutorFoiRemovido
            ? {} // Não enviar instrutorId quando removido
            : formData.instrutorId
            ? { instrutorId: formData.instrutorId }
            : {}),
          ...(formData.moduloId && { moduloId: formData.moduloId }),
          ...(dataInicio && { dataInicio }),
          ...(dataFim && { dataFim }),
          ...(horaInicio && { horaInicio }),
          ...(horaFim && { horaFim }),
          obrigatoria: formData.obrigatoria,
          ...(hasPeriodo
            ? {}
            : { duracaoMinutos: Number(formData.duracaoMinutos) }),
          status: formData.status,
          ...((formData.modalidade === "AO_VIVO" ||
            (formData.modalidade === "SEMIPRESENCIAL" &&
              formData.tipoLink === "MEET")) && {
            gravarAula: formData.gravarAula,
          }),
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
            dataInicio: updatedAula?.dataInicio,
            horaInicio: updatedAula?.horaInicio,
            payload: updatePayload,
          });
        }

        const detailKey = queryKeys.aulas.detail(aulaId);

        // ✅ Remover dados antigos do cache antes de invalidar
        queryClient.removeQueries({
          queryKey: detailKey,
          exact: true,
        });

        // ✅ Invalidar e forçar refetch completo da query de detalhes
        await queryClient.invalidateQueries({
          queryKey: detailKey,
          exact: true,
          refetchType: "all", // Força refetch de todas as queries (ativas e inativas)
        });

        // ✅ Forçar refetch explícito para garantir dados atualizados
        await queryClient.refetchQueries({
          queryKey: detailKey,
          exact: true,
        });

        // Invalidar queries de listagem também
        await queryClient.invalidateQueries({
          queryKey: ["aulas"],
          exact: false,
          refetchType: "all",
        });

        toastCustom.success("Aula atualizada com sucesso!");

        // Pequeno delay para garantir que o refetch seja processado
        await new Promise((resolve) => setTimeout(resolve, 200));
      } else {
        // Modo de criação
        // Calcular duração quando há período (horaInicio e horaFim)
        let duracaoMinutos = Number(formData.duracaoMinutos) || 60;
        if (hasPeriodo && horaInicio && horaFim) {
          const [horaIni, minIni] = horaInicio.split(":").map(Number);
          const [horaFimNum, minFim] = horaFim.split(":").map(Number);

          const minutosInicio = horaIni * 60 + minIni;
          const minutosFim = horaFimNum * 60 + minFim;

          // Se horaFim for menor que horaInicio, significa que passou da meia-noite
          // Mas para aulas do mesmo dia, isso não deve acontecer
          duracaoMinutos = minutosFim - minutosInicio;

          // Garantir que a duração seja positiva
          if (duracaoMinutos <= 0) {
            duracaoMinutos = 60; // Fallback para 1 hora
          }
        }

        const createPayload: CreateAulaPayload = {
          titulo: formData.titulo.trim(),
          descricao: formData.descricao.trim(),
          modalidade: formData.modalidade as Modalidade,
          duracaoMinutos, // OBRIGATÓRIO - sempre enviar
          // Campos opcionais
          ...(formData.turmaId && { turmaId: formData.turmaId }), // Opcional para Admin/Mod/Ped
          ...(formData.tipoLink && { tipoLink: formData.tipoLink as TipoLink }),
          ...(formData.youtubeUrl && { youtubeUrl: formData.youtubeUrl }),
          ...(formData.instrutorId && { instrutorId: formData.instrutorId }),
          ...(formData.moduloId && { moduloId: formData.moduloId }),
          ...(dataInicio && { dataInicio }),
          ...(dataFim && { dataFim }),
          ...(horaInicio && { horaInicio }),
          ...(horaFim && { horaFim }),
          ...(formData.sala &&
            formData.modalidade === "PRESENCIAL" && {
              sala: formData.sala.trim(),
            }),
          obrigatoria: formData.obrigatoria,
          status: "RASCUNHO", // ✅ SEMPRE criar como RASCUNHO - publicação é feita via endpoint específico
          ...((formData.modalidade === "AO_VIVO" ||
            (formData.modalidade === "SEMIPRESENCIAL" &&
              formData.tipoLink === "MEET")) && {
            gravarAula: formData.gravarAula,
          }),
        };

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

        // Passo 2: Criar a aula
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

        // Passo 3: Criar os materiais na API com as URLs do blob
        if (uploadedFiles.length > 0) {
          try {
            setLoadingStep(`Anexando ${uploadedFiles.length} material(is)...`);
            const materialPromises = uploadedFiles.map((uploadedFile) =>
              createMaterialArquivoFromUrl(response.aula.id, {
                titulo: uploadedFile.originalName.replace(/\.[^/.]+$/, ""), // Nome sem extensão
                arquivoUrl: uploadedFile.url,
                arquivoNome: uploadedFile.originalName,
                arquivoTamanho: uploadedFile.size,
                arquivoMimeType: uploadedFile.mimeType,
                obrigatorio: false,
              })
            );

            await Promise.all(materialPromises);
            setLoadingStep("Finalizando...");
            toastCustom.success(
              `Aula criada com ${uploadedFiles.length} material(is) anexado(s)!`
            );
          } catch (error) {
            // Se falhou ao criar materiais na API, fazer rollback do blob
            console.error("Erro ao anexar materiais:", error);
            setLoadingStep("Revertendo upload de arquivos...");
            await deleteFiles(uploadedFiles.map((f) => f.url));
            toastCustom.warning(
              "Aula criada, mas houve erro ao anexar os materiais. Você pode adicioná-los depois na página de detalhes."
            );
          }
        } else {
          setLoadingStep("Finalizando...");
          toastCustom.success("Aula criada com sucesso!");
        }

        if (response.meetUrl) {
          toastCustom.info(`Sala Google Meet criada: ${response.meetUrl}`);
        }

        // Se o usuário tinha selecionado "PUBLICADA", publicar automaticamente após criar
        if (formData.status === "PUBLICADA") {
          try {
            setLoadingStep("Publicando aula...");
            await publicarAula(response.aula.id, true);
            toastCustom.success("Aula criada e publicada com sucesso!");
          } catch (error) {
            // Se falhar ao publicar, a aula já foi criada como RASCUNHO
            console.error("Erro ao publicar aula:", error);
            toastCustom.warning(
              "Aula criada como rascunho. Você pode publicá-la depois na página de detalhes."
            );
          }
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
      {/* Overlay de Loading Compacto */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-5 w-80">
            <div className="flex items-center gap-4">
              {/* Spinner compacto */}
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full border-3 border-gray-200" />
                <div className="absolute inset-0 w-12 h-12 rounded-full border-3 border-primary border-t-transparent animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Video className="h-5 w-5 text-primary" />
                </div>
              </div>

              {/* Título e descrição ao lado */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm! font-semibold! text-gray-900! mb-0.5!">
                  {mode === "edit" ? "Salvando..." : "Criando aula..."}
                </h3>
                <p className="text-xs! text-gray-600! mb-0!">
                  {loadingStep || "Processando"}
                </p>

                {/* Barra de progresso inline */}
                {uploadProgress > 0 && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-[10px]! text-gray-500! mt-0.5! mb-0!">
                      {uploadProgress}% completo
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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
              maxLength={200}
            />

            {/* Linha 1: Turma, Instrutor e Modalidade */}
            <div className="flex flex-col md:flex-row gap-4 w-full">
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
                      placeholder="Selecione a turma"
                      options={[
                        ...(isAdminModPed
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
                required
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

            {/* Linha: Data, Horários e Obrigatória (para modalidades com período) */}
            {showPeriodoField && (
              <>
                <div
                  className={cn(
                    "grid grid-cols-1 gap-4 w-full",
                    formData.modalidade === "PRESENCIAL"
                      ? "md:grid-cols-5" // Data, Hora Início, Hora Fim, Sala, Obrigatória
                      : "md:grid-cols-4" // Data, Hora Início, Hora Fim, Obrigatória
                  )}
                >
                  {/* Data da Aula */}
                  <div>
                    <DatePickerCustom
                      label="Data da Aula"
                      value={formData.dataAula}
                      onChange={(date) => handleInputChange("dataAula", date)}
                      placeholder="Selecione"
                      error={errors.dataAula}
                      required
                      minDate={getTomorrowDate()}
                    />
                  </div>

                  {/* Hora de Início */}
                  <div>
                    <TimeInputCustom
                      label="Hora de Início"
                      name="horaInicio"
                      value={formData.horaInicio}
                      onChange={(value) =>
                        handleInputChange("horaInicio", value)
                      }
                      error={errors.horaInicio}
                      required
                      disabled={isLoading}
                      placeholder="00:00"
                    />
                  </div>

                  {/* Hora de Término */}
                  <div>
                    <TimeInputCustom
                      label="Hora de Término"
                      name="horaFim"
                      value={formData.horaFim}
                      onChange={(value) => handleInputChange("horaFim", value)}
                      error={errors.horaFim}
                      required
                      disabled={isLoading}
                      placeholder="00:00"
                    />
                  </div>

                  {/* Sala (apenas PRESENCIAL) */}
                  {formData.modalidade === "PRESENCIAL" && (
                    <div>
                      <InputCustom
                        label="Sala"
                        placeholder="Ex: Lab 101"
                        value={formData.sala}
                        onChange={(e) =>
                          handleInputChange("sala", e.target.value)
                        }
                        maxLength={100}
                      />
                    </div>
                  )}

                  {/* Aula Obrigatória */}
                  <div>
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

                {/* Alerta: Duração será calculada */}
                <div className="rounded-xl border-2 border-green-200 bg-green-50 p-4">
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Info className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm! font-semibold! text-green-900! mb-1!">
                        Duração
                      </h4>
                      <p className="text-sm! text-green-700! mb-0!">
                        Será calculada automaticamente baseada no horário de
                        início e término.
                      </p>
                    </div>
                  </div>
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
            )}

            {/* Duração e Obrigatória (para modalidades SEM período) */}
            {!showPeriodoField && (
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
              label="Descrição"
              placeholder="Descreva o conteúdo da aula"
              value={formData.descricao}
              onChange={(e) =>
                handleInputChange(
                  "descricao",
                  (e.target as HTMLTextAreaElement).value
                )
              }
              maxLength={500}
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

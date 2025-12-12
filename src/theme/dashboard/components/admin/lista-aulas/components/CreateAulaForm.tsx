"use client";

import React, { useState, useEffect } from "react";
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
    if (mode === "edit" && initialData) {
      const aula = initialData;

      // Extrair data e horários
      let dataAula: Date | null = null;
      let horaInicio = "";
      let horaFim = "";

      if (aula.dataInicio) {
        const dataInicio = new Date(aula.dataInicio);
        dataAula = dataInicio;
        horaInicio = `${String(dataInicio.getHours()).padStart(
          2,
          "0"
        )}:${String(dataInicio.getMinutes()).padStart(2, "0")}`;
      }

      if (aula.dataFim) {
        const dataFim = new Date(aula.dataFim);
        horaFim = `${String(dataFim.getHours()).padStart(2, "0")}:${String(
          dataFim.getMinutes()
        ).padStart(2, "0")}`;
      }

      setFormData({
        titulo: aula.titulo || "",
        descricao: aula.descricao || "",
        modalidade: aula.modalidade || "",
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
        duracaoMinutos: aula.duracaoMinutos ? String(aula.duracaoMinutos) : "",
        status: aula.status === "RASCUNHO" ? "RASCUNHO" : "PUBLICADA",
        gravarAula: aula.gravarAula ?? false,
      });
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
      setFormData((prev) => ({
        ...prev,
        turmaId: turmaId || "",
        modalidade,
        // Reset campos dependentes da modalidade
        tipoLink: "",
        youtubeUrl: "",
        dataAula: null,
        horaInicio: "",
        horaFim: "",
        gravarAula: modalidade === "AO_VIVO" ? true : false,
      }));
    } else {
      // Nenhuma turma selecionada - limpa modalidade para permitir seleção manual
      setFormData((prev) => ({
        ...prev,
        turmaId: "",
        modalidade: "",
        tipoLink: "",
        youtubeUrl: "",
        dataAula: null,
        horaInicio: "",
        horaFim: "",
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

      // Verificar se é no futuro
      if (formData.dataAula && formData.horaInicio) {
        const dataHoraInicio = new Date(formData.dataAula);
        const [hora, minuto] = formData.horaInicio.split(":");
        dataHoraInicio.setHours(Number(hora), Number(minuto), 0, 0);

        if (dataHoraInicio < new Date()) {
          newErrors.dataAula = "Aula ao vivo deve ser agendada para o futuro";
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

        // Verificar se é no futuro
        if (formData.dataAula && formData.horaInicio) {
          const dataHoraInicio = new Date(formData.dataAula);
          const [hora, minuto] = formData.horaInicio.split(":");
          dataHoraInicio.setHours(Number(hora), Number(minuto), 0, 0);

          if (dataHoraInicio < new Date()) {
            newErrors.dataAula =
              "Aula com Meet deve ser agendada para o futuro";
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
      let dataInicio: string | undefined;
      let dataFim: string | undefined;
      let hasPeriodo = false;

      if (formData.dataAula && formData.horaInicio && formData.horaFim) {
        const dataBase = new Date(formData.dataAula);

        // Data de início
        const [horaIni, minIni] = formData.horaInicio.split(":");
        const dtInicio = new Date(dataBase);
        dtInicio.setHours(Number(horaIni), Number(minIni), 0, 0);
        dataInicio = dtInicio.toISOString();

        // Data de fim
        const [horaFim, minFim] = formData.horaFim.split(":");
        const dtFim = new Date(dataBase);
        dtFim.setHours(Number(horaFim), Number(minFim), 0, 0);
        dataFim = dtFim.toISOString();

        hasPeriodo = true;
      }

      if (mode === "edit" && aulaId) {
        // Modo de edição
        const updatePayload: UpdateAulaPayload = {
          titulo: formData.titulo.trim(),
          descricao: formData.descricao.trim(),
          modalidade: formData.modalidade as Modalidade,
          tipoLink: (formData.tipoLink as TipoLink) || undefined,
          youtubeUrl: formData.youtubeUrl || undefined,
          turmaId: formData.turmaId || undefined,
          instrutorId: formData.instrutorId || undefined,
          moduloId: formData.moduloId || undefined,
          dataInicio,
          dataFim,
          obrigatoria: formData.obrigatoria,
          duracaoMinutos: hasPeriodo
            ? undefined
            : Number(formData.duracaoMinutos),
          status: formData.status,
          ...((formData.modalidade === "AO_VIVO" ||
            (formData.modalidade === "SEMIPRESENCIAL" &&
              formData.tipoLink === "MEET")) && {
            gravarAula: formData.gravarAula,
          }),
        };

        setLoadingStep("Salvando alterações...");
        await updateAula(aulaId, updatePayload);
        setLoadingStep("Finalizando...");
        toastCustom.success("Aula atualizada com sucesso!");
      } else {
        // Modo de criação
        // Calcular duração quando há período (dataInicio e dataFim)
        let duracaoMinutos = Number(formData.duracaoMinutos) || 60;
        if (hasPeriodo && dataInicio && dataFim) {
          const inicio = new Date(dataInicio);
          const fim = new Date(dataFim);
          duracaoMinutos = Math.round(
            (fim.getTime() - inicio.getTime()) / (1000 * 60)
          );
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
          ...(formData.sala &&
            formData.modalidade === "PRESENCIAL" && {
              sala: formData.sala.trim(),
            }),
          obrigatoria: formData.obrigatoria,
          status: formData.status,
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
      }

      // Refetch queries para atualizar a lista imediatamente
      await queryClient.refetchQueries({ queryKey: ["aulas"] });

      // Limpar loading e chamar onSuccess
      setIsLoading(false);
      setLoadingStep("");
      setUploadProgress(0);

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
                disabled={isLoading}
              />
            </div>
          </div>

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
                  <SelectCustom
                    label="Turma"
                    placeholder={
                      loadingTurmas ? "Carregando..." : "Selecione a turma"
                    }
                    options={[
                      ...(isAdminModPed
                        ? [{ value: "", label: "Sem turma (vincular depois)" }]
                        : []),
                      ...turmas,
                    ]}
                    value={formData.turmaId}
                    onChange={handleTurmaChange}
                    error={errors.turmaId}
                    required={turmaRequired}
                    disabled={loadingTurmas}
                  />
                </div>
              )}

              {/* Campo Instrutor - Apenas para Admin/Mod/Ped */}
              {showInstrutorField && (
                <div className="flex-1 min-w-0">
                  <SelectCustom
                    label="Instrutor"
                    placeholder={
                      loadingInstrutores
                        ? "Carregando..."
                        : "Selecione o instrutor"
                    }
                    options={[
                      { value: "", label: "Sem instrutor (vincular depois)" },
                      ...instrutores,
                    ]}
                    value={formData.instrutorId}
                    onChange={(val) =>
                      handleInputChange("instrutorId", val || "")
                    }
                    error={errors.instrutorId}
                    disabled={loadingInstrutores}
                  />
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
                      minDate={
                        formData.modalidade === "AO_VIVO" ||
                        (formData.modalidade === "SEMIPRESENCIAL" &&
                          formData.tipoLink === "MEET")
                          ? new Date()
                          : undefined
                      }
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

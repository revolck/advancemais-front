"use client";

import React, { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  InputCustom,
  SelectCustom,
  ButtonCustom,
  toastCustom,
  TimeInputCustom,
  QuestoesBuilder,
  TextoBuilder,
  type QuestaoItem,
  type TextoItem,
} from "@/components/ui/custom";
import { DatePickerRangeCustom } from "@/components/ui/custom/date-picker";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, ClipboardList, Circle } from "lucide-react";
import { FormLoadingModal } from "@/components/ui/custom/form-loading-modal";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  createProva,
  createAvaliacao,
  updateProva,
  listModulos,
  listInscricoes,
  createProvaToken,
  type CreateProvaPayload,
  type UpdateProvaPayload,
  type TurmaProva,
  type CursoModulo,
  type AvaliacaoQuestaoInput,
  type CreateAvaliacaoPayload,
} from "@/api/cursos";
import {
  useTurmasForSelect,
  type TurmaSelectOption,
} from "../hooks/useTurmasForSelect";
import { useInstrutoresForSelect } from "../hooks/useInstrutoresForSelect";
import { useCursosForSelect } from "../hooks/useCursosForSelect";
import { useAuth } from "@/hooks/useAuth";
import { queryKeys } from "@/lib/react-query/queryKeys";
import { useQuery } from "@tanstack/react-query";
import type { Modalidade } from "@/api/aulas";

const LOCALIZACAO_OPTIONS = [
  { value: "TURMA", label: "Turma" },
  { value: "MODULO", label: "Módulo" },
];

const TIPO_OPTIONS = [
  { value: "PROVA", label: "Prova" },
  { value: "ATIVIDADE", label: "Atividade" },
];

const TIPO_ATIVIDADE_OPTIONS = [
  { value: "QUESTOES", label: "Questões" },
  { value: "TEXTO", label: "Pergunta e Resposta" },
];

const MODALIDADE_OPTIONS = [
  { value: "ONLINE", label: "Online" },
  { value: "PRESENCIAL", label: "Presencial" },
  { value: "AO_VIVO", label: "Ao Vivo" },
  { value: "SEMIPRESENCIAL", label: "Semipresencial" },
];

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

const toAvaliacaoQuestoes = (questoes?: QuestaoItem[]): AvaliacaoQuestaoInput[] | undefined => {
  if (!questoes || questoes.length === 0) return undefined;
  return questoes.map((q) => ({
    enunciado: q.titulo.trim(),
    tipo: "MULTIPLA_ESCOLHA",
    alternativas: q.alternativas.map((a) => ({
      texto: a.texto.trim(),
      correta: q.respostaCorreta === a.id,
    })),
  }));
};

interface FormData {
  tipo: "PROVA" | "ATIVIDADE" | "";
  tipoAtividade?: "QUESTOES" | "TEXTO" | ""; // Apenas para ATIVIDADE
  titulo: string;
  etiqueta: string;
  valeNota: boolean;
  peso: string;
  valePonto: boolean;
  recuperacaoFinal: boolean;
  localizacao: "TURMA" | "MODULO" | "";
  cursoId: string; // Usado quando não há turma (template)
  turmaId: string;
  moduloId: string;
  modalidade: Modalidade | "";
  instrutorId: string;
  dataInicio: Date | null;
  dataFim: Date | null;
  horaInicio: string;
  horaFim: string;
  duracaoMinutos: string;
  obrigatoria: boolean;
  status: "RASCUNHO" | "PUBLICADA";
  // Dados específicos por tipo de atividade
  questoes?: QuestaoItem[];
  texto?: TextoItem;
}

const initialFormData: FormData = {
  tipo: "ATIVIDADE",
  tipoAtividade: "",
  titulo: "",
  etiqueta: "",
  valeNota: true,
  peso: "",
  valePonto: true,
  recuperacaoFinal: false,
  localizacao: "TURMA",
  cursoId: "",
  turmaId: "",
  moduloId: "",
  modalidade: "",
  instrutorId: "",
  dataInicio: null,
  dataFim: null,
  horaInicio: "",
  horaFim: "",
  duracaoMinutos: "",
  obrigatoria: true,
  status: "PUBLICADA",
  questoes: [],
  texto: { titulo: "" },
};

export interface CreateProvaFormProps {
  mode?: "create" | "edit";
  provaId?: string;
  initialData?: TurmaProva;
  defaultTipo?: "PROVA" | "ATIVIDADE";
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateProvaForm({
  mode = "create",
  provaId,
  initialData,
  defaultTipo,
  onSuccess,
  onCancel,
}: CreateProvaFormProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [formData, setFormData] = useState<FormData>(() => {
    if (mode === "create" && defaultTipo) {
      return { ...initialFormData, tipo: defaultTipo };
    }
    return initialFormData;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>("");
  const [isInitializing, setIsInitializing] = useState(mode === "edit");

  const { cursos, isLoading: loadingCursos } = useCursosForSelect();
  const {
    turmas,
    isLoading: loadingTurmas,
    rawData: turmasRawData,
    error: turmasError,
  } = useTurmasForSelect(formData.cursoId || null); // Filtra turmas pelo curso selecionado
  const { instrutores, isLoading: loadingInstrutores } =
    useInstrutoresForSelect();

  // Obter cursoId da turma selecionada
  const cursoIdFromTurma = React.useMemo(() => {
    if (!formData.turmaId || !turmasRawData) return null;
    const turmaSelecionada = turmasRawData.find(
      (t) => t.id === formData.turmaId
    );
    return turmaSelecionada?.cursoId ? Number(turmaSelecionada.cursoId) : null;
  }, [formData.turmaId, turmasRawData]);

  // Obter modalidade da turma selecionada (mapeamento metodo -> modalidade)
  const modalidadeFromTurma = React.useMemo((): Modalidade | null => {
    if (!formData.turmaId || !turmasRawData) return null;
    const turmaSelecionada = turmasRawData.find(
      (t) => t.id === formData.turmaId
    );
    if (!turmaSelecionada?.metodo) return null;

    // Mapeamento: metodo da turma -> modalidade da prova/atividade
    const metodoToModalidade: Record<string, Modalidade> = {
      ONLINE: "ONLINE",
      PRESENCIAL: "PRESENCIAL",
      LIVE: "AO_VIVO",
      SEMIPRESENCIAL: "SEMIPRESENCIAL",
    };

    return metodoToModalidade[turmaSelecionada.metodo] || null;
  }, [formData.turmaId, turmasRawData]);

  // Obter instrutorId da turma selecionada
  const instrutorIdFromTurma = React.useMemo(() => {
    if (!formData.turmaId || !turmasRawData) return null;
    const turmaSelecionada = turmasRawData.find(
      (t) => t.id === formData.turmaId
    );
    return turmaSelecionada?.instrutorId || null;
  }, [formData.turmaId, turmasRawData]);

  // Quando a turma mudar, atualizar a modalidade e instrutor automaticamente
  useEffect(() => {
    if (formData.turmaId) {
      setFormData((prev) => {
        const updates: Partial<FormData> = {};
        
        // Herdar modalidade da turma
        if (modalidadeFromTurma) {
          updates.modalidade = modalidadeFromTurma;
        }
        
        // Herdar instrutor da turma apenas se não houver instrutor selecionado
        if (instrutorIdFromTurma && !prev.instrutorId) {
          updates.instrutorId = instrutorIdFromTurma;
        }
        
        return { ...prev, ...updates };
      });
    }
  }, [modalidadeFromTurma, instrutorIdFromTurma, formData.turmaId]);

  // Auto-fill de instrutorId para role INSTRUTOR
  useEffect(() => {
    if (user?.role === "INSTRUTOR" && user?.id && !formData.instrutorId) {
      setFormData((prev) => ({
        ...prev,
        instrutorId: user.id,
      }));
    }
  }, [user?.role, user?.id, formData.instrutorId]);

  // Buscar módulos da turma quando localização for MODULO
  const { data: modulosDaTurma, isLoading: loadingModulos } = useQuery({
    queryKey: ["modulos", cursoIdFromTurma, formData.turmaId],
    queryFn: async () => {
      if (!cursoIdFromTurma || !formData.turmaId) return [];
      return listModulos(cursoIdFromTurma, formData.turmaId);
    },
    enabled:
      !!cursoIdFromTurma &&
      !!formData.turmaId &&
      formData.localizacao === "MODULO",
  });

  // Verificar roles
  const isAdminModPed = ["ADMIN", "MODERADOR", "PEDAGOGICO"].includes(
    user?.role || ""
  );

  // Carregar dados iniciais no modo de edição
  useEffect(() => {
    if (mode === "edit") {
      if (initialData && initialData.id) {
        const prova = initialData;
        // Extrair datas de início e fim
        const dataInicio = prova.dataInicio ? new Date(prova.dataInicio) : null;
        const dataFim = prova.dataFim ? new Date(prova.dataFim) : null;

        setFormData({
          tipo: (prova.tipo === "PROVA" || prova.tipo === "ATIVIDADE"
            ? prova.tipo
            : "") as "PROVA" | "ATIVIDADE" | "",
          tipoAtividade: (prova as any).tipoAtividade || "",
          titulo: prova.titulo || "",
          etiqueta: prova.etiqueta || "",
          valeNota: (prova as any).valeNota !== false,
          peso: prova.peso?.toString() || "",
          // Se vale nota, sempre conta para média (valePonto = true)
          valePonto:
            (prova as any).valeNota !== false
              ? true
              : prova.valePonto !== false,
          recuperacaoFinal: (prova as any).recuperacaoFinal === true,
          localizacao: prova.localizacao || "TURMA",
          cursoId: (prova as any).cursoId || "",
          turmaId: prova.turmaId || "",
          moduloId: prova.moduloId || "",
          modalidade: (prova.modalidade as Modalidade) || "",
          instrutorId: prova.instrutorId || "",
          dataInicio: dataInicio,
          dataFim: dataFim,
          horaInicio: (prova as any).horaInicio || "",
          horaFim: (prova as any).horaFim || "",
          duracaoMinutos: (prova as any).duracaoMinutos?.toString() || "",
          obrigatoria: (prova as any).obrigatoria !== false,
          status: (prova.status === "RASCUNHO" ? "RASCUNHO" : "PUBLICADA") as
            | "RASCUNHO"
            | "PUBLICADA",
          questoes: (prova as any).questoes || [],
          texto: (prova as any).texto || { titulo: "" },
        });
        setIsInitializing(false);
      } else {
        setIsInitializing(true);
      }
    } else {
      setIsInitializing(false);
    }
  }, [mode, initialData]);

  // Regra: Se não tiver turma, força status para RASCUNHO
  useEffect(() => {
    const temTurma = !!formData.turmaId;
    const podePublicar = temTurma;

    if (!podePublicar && formData.status === "PUBLICADA") {
      setFormData((prev) => ({
        ...prev,
        status: "RASCUNHO",
      }));
    }
  }, [formData.turmaId, formData.status]);

  const isRecuperacaoFinalProva =
    formData.tipo === "PROVA" && formData.recuperacaoFinal === true;

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

  const handleTurmaChange = (turmaId: string | null) => {
    // Buscar a turma selecionada para obter o cursoId
    const turmaSelecionada = turmasRawData?.find((t) => t.id === turmaId);
    
    setFormData((prev) => ({
      ...prev,
      turmaId: turmaId || "",
      moduloId: "", // Limpar módulo quando turma mudar
      // Se TEM turma, preencher cursoId automaticamente
      ...(turmaId && turmaSelecionada && {
        cursoId: turmaSelecionada.cursoId,
      }),
      // Se não tem turma, limpar localização e modalidade
      ...((!turmaId || turmaId === "") && {
        localizacao: "" as "TURMA" | "MODULO" | "",
        modalidade: "" as Modalidade | "",
      }),
    }));

    if (errors.turmaId) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.turmaId;
        delete newErrors.cursoId; // Limpar erro de cursoId também
        return newErrors;
      });
    }
  };

  const validateForm = (): {
    valid: boolean;
    errors: Record<string, string>;
  } => {
    const newErrors: Record<string, string> = {};

    if (!formData.tipo) {
      newErrors.tipo = "Tipo é obrigatório";
    }

    if (!formData.titulo.trim()) {
      newErrors.titulo = "Título é obrigatório";
    }

    // Curso NÃO é obrigatório
    // Turma NÃO é obrigatória

    // Vale nota é obrigatório (sempre terá um valor, então não precisa validar)

    // Peso é obrigatório SE vale ponto for sim (valeNota implica valePonto=true)
    const valePontoEfetivo = formData.valeNota ? true : formData.valePonto;
    if (valePontoEfetivo) {
      if (!formData.peso || formData.peso.trim() === "") {
        newErrors.peso = "Peso é obrigatório quando vale ponto";
      } else {
        const pesoNumero = Number(formData.peso);
        if (isNaN(pesoNumero)) {
          newErrors.peso = "Peso deve ser um número válido";
        } else if (pesoNumero < 0) {
          newErrors.peso = "Peso não pode ser menor que 0";
        } else if (pesoNumero > 10) {
          newErrors.peso = "Peso não pode ser maior que 10";
        }
      }
    }

    // Localização é obrigatória apenas se turma foi selecionada
    if (formData.turmaId && !formData.localizacao) {
      newErrors.localizacao = "Localização é obrigatória";
    }

    // Módulo é obrigatório quando localização é MODULO e turma está selecionada
    if (
      formData.turmaId &&
      formData.localizacao === "MODULO" &&
      !formData.moduloId
    ) {
      newErrors.moduloId = "Módulo é obrigatório quando localização é Módulo";
    }

    // Modalidade é obrigatória
    if (!formData.modalidade) {
      newErrors.modalidade = "Modalidade é obrigatória";
    }

    // Data de início é obrigatória
    if (!formData.dataInicio) {
      newErrors.dataInicio = "Data de início é obrigatória";
    }

    // Data de fim é obrigatória
    if (!formData.dataFim) {
      newErrors.dataFim = "Data de término é obrigatória";
    }

    // Validar que data de fim é após data de início
    if (formData.dataInicio && formData.dataFim) {
      if (formData.dataFim < formData.dataInicio) {
        newErrors.dataFim = "Data de término deve ser após a data de início";
      }
    }

    // Hora de início é obrigatória
    if (!formData.horaInicio) {
      newErrors.horaInicio = "Hora de início é obrigatória";
    }

    // Hora de término é obrigatória
    if (!formData.horaFim) {
      newErrors.horaFim = "Hora de término é obrigatória";
    }

    // Validar que hora de término é após hora de início
    if (formData.horaInicio && formData.horaFim) {
      if (formData.horaInicio >= formData.horaFim) {
        newErrors.horaFim = "Hora de término deve ser após a hora de início";
      }
    }

    // Obrigatória é obrigatório informar (sempre terá um valor, então não precisa validar)

    // Validação específica para atividades
    if (formData.tipo === "ATIVIDADE") {
      if (!formData.tipoAtividade) {
        newErrors.tipoAtividade = "Tipo de atividade é obrigatório";
      } else {
        // Validações específicas por tipo
        if (formData.tipoAtividade === "QUESTOES") {
          if (!formData.questoes || formData.questoes.length === 0) {
            newErrors.questoes = "É necessário adicionar pelo menos 1 questão";
          } else {
            // Validar cada questão
            formData.questoes.forEach((questao, index) => {
              if (!questao.titulo.trim()) {
                newErrors[`questao-${index}-titulo`] = `Questão ${
                  index + 1
                }: título é obrigatório`;
              }
              if (questao.alternativas.length < 2) {
                newErrors[`questao-${index}-alternativas`] = `Questão ${
                  index + 1
                }: é necessário pelo menos 2 alternativas`;
              }
              if (!questao.respostaCorreta) {
                newErrors[`questao-${index}-resposta`] = `Questão ${
                  index + 1
                }: selecione a resposta correta`;
              }
              questao.alternativas.forEach((alt, altIndex) => {
                if (!alt.texto.trim()) {
                  newErrors[`questao-${index}-alt-${altIndex}`] = `Questão ${
                    index + 1
                  }, Alternativa ${altIndex + 1}: texto é obrigatório`;
                }
              });
            });
          }
        } else if (formData.tipoAtividade === "TEXTO") {
          if (!formData.texto?.titulo?.trim()) {
            newErrors.textoTitulo = "Pergunta é obrigatória";
          }
        }
      }
    }

    // Validação específica para provas
    if (formData.tipo === "PROVA") {
      if (!formData.questoes || formData.questoes.length === 0) {
        newErrors.questoes = "É necessário adicionar pelo menos 1 questão";
      } else {
        // Validar cada questão
        formData.questoes.forEach((questao, index) => {
          if (!questao.titulo.trim()) {
            newErrors[`questao-${index}-titulo`] = `Questão ${
              index + 1
            }: título é obrigatório`;
          }
          if (questao.alternativas.length < 2) {
            newErrors[`questao-${index}-alternativas`] = `Questão ${
              index + 1
            }: é necessário pelo menos 2 alternativas`;
          }
          if (!questao.respostaCorreta) {
            newErrors[`questao-${index}-resposta`] = `Questão ${
              index + 1
            }: selecione a resposta correta`;
          }
          questao.alternativas.forEach((alt, altIndex) => {
            if (!alt.texto.trim()) {
              newErrors[`questao-${index}-alt-${altIndex}`] = `Questão ${
                index + 1
              }, Alternativa ${altIndex + 1}: texto é obrigatório`;
            }
          });
        });
      }
    }

    setErrors(newErrors);
    return {
      valid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  };

  // Função para formatar data para API (apenas YYYY-MM-DD)
  const formatDateForAPI = (date: Date | string | null): string | undefined => {
    if (!date) return undefined;
    const dateObj = typeof date === "string" ? new Date(date) : date;
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateForm();
    if (!validation.valid) {
      toastCustom.error("Por favor, corrija os erros no formulário");
      return;
    }

    setIsLoading(true);
    setLoadingStep("Salvando prova...");

    try {
      // Calcular duração quando há período (horaInicio e horaFim)
      let duracaoMinutos = Number(formData.duracaoMinutos) || 60;
      if (formData.dataInicio && formData.horaInicio && formData.horaFim) {
        const [horaIni, minIni] = formData.horaInicio.split(":").map(Number);
        const [horaFimNum, minFim] = formData.horaFim.split(":").map(Number);

        const minutosInicio = horaIni * 60 + minIni;
        const minutosFim = horaFimNum * 60 + minFim;

        duracaoMinutos = minutosFim - minutosInicio;

        // Garantir que a duração seja positiva
        if (duracaoMinutos <= 0) {
          duracaoMinutos = 60; // Fallback para 1 hora
        }
      }

      const dataInicio = formData.dataInicio
        ? formatDateForAPI(formData.dataInicio)
        : undefined;
      const dataFim = formData.dataFim
        ? formatDateForAPI(formData.dataFim)
        : undefined;

      const payload: CreateProvaPayload | UpdateProvaPayload = {
        titulo: formData.titulo.trim(),
        etiqueta: formData.etiqueta.trim() || undefined,
        tipo: formData.tipo
          ? (formData.tipo as "PROVA" | "ATIVIDADE")
          : undefined,
        ...(formData.tipo === "PROVA" && {
          recuperacaoFinal: formData.recuperacaoFinal,
        }),
        peso: formData.peso ? Number(formData.peso) : undefined,
        valeNota: formData.valeNota,
        // Se vale nota, sempre conta para média (valePonto = true)
        valePonto: formData.valeNota ? true : formData.valePonto,
        localizacao: formData.localizacao as "TURMA" | "MODULO",
        moduloId: formData.moduloId || undefined,
        dataInicio,
        dataFim,
        horaInicio: formData.horaInicio || undefined,
        horaFim: formData.horaFim || undefined,
        duracaoMinutos: duracaoMinutos || undefined,
        modalidade: formData.modalidade
          ? (formData.modalidade as Modalidade)
          : undefined,
        instrutorId: formData.instrutorId || undefined,
        obrigatoria: formData.obrigatoria,
        status: formData.status,
        // Dados específicos de atividade (legado)
        ...(formData.tipo === "ATIVIDADE" && {
            tipoAtividade: formData.tipoAtividade as
              | "QUESTOES"
              | "TEXTO"
              | undefined,
            ...(formData.tipoAtividade === "QUESTOES" &&
              formData.questoes && {
                questoes: formData.questoes,
              }),
            ...(formData.tipoAtividade === "TEXTO" &&
              formData.texto && {
                texto: formData.texto,
              }),
          }),
        // Dados específicos de prova (legado)
        ...(formData.tipo === "PROVA" && formData.questoes && {
            questoes: formData.questoes,
          }),
      };

      // Se TEM turma: validar cursoId da turma
      if (formData.turmaId && !cursoIdFromTurma) {
        toastCustom.error(
          "Não foi possível identificar o curso da turma selecionada. Por favor, selecione uma turma válida."
        );
        setIsLoading(false);
        setLoadingStep("");
        return;
      }

        if (mode === "create") {
          let provaCriada: any;

          // Se TEM turma: usar endpoint antigo (vinculado a turma)
          if (formData.turmaId && cursoIdFromTurma) {
            provaCriada = await createProva(
              cursoIdFromTurma,
              formData.turmaId,
              payload as CreateProvaPayload
            );
          } 
          // Se NÃO TEM turma: usar endpoint novo (template/biblioteca)
          else {
          const valePontoEfetivo = formData.valeNota ? true : formData.valePonto;
          const tipoAtividadeApi =
            formData.tipo === "ATIVIDADE" && formData.tipoAtividade
              ? formData.tipoAtividade === "QUESTOES"
                ? "QUESTOES"
                : "PERGUNTA_RESPOSTA"
              : undefined;

          const avaliacaoPayload: CreateAvaliacaoPayload = {
            tipo: formData.tipo as "PROVA" | "ATIVIDADE",
            titulo: formData.titulo.trim(),
            modalidade: formData.modalidade as any,
            obrigatoria: formData.obrigatoria,
            valePonto: valePontoEfetivo,
            ...(valePontoEfetivo && formData.peso ? { peso: Number(formData.peso) } : {}),
            etiqueta: formData.etiqueta.trim() || undefined,
            cursoId: formData.cursoId || undefined,
            instrutorId: formData.instrutorId || undefined,
            dataInicio: dataInicio as string,
            dataFim: dataFim as string,
            horaInicio: formData.horaInicio,
            horaTermino: formData.horaFim,
            ...(duracaoMinutos ? { duracaoMinutos } : {}),
            ...(formData.tipo === "PROVA" ? { recuperacaoFinal: formData.recuperacaoFinal } : {}),
            ...(formData.tipo === "ATIVIDADE" ? { tipoAtividade: tipoAtividadeApi as any } : {}),
            ...(formData.tipo === "ATIVIDADE" && tipoAtividadeApi === "PERGUNTA_RESPOSTA"
              ? { descricao: formData.texto?.titulo?.trim() || undefined }
              : {}),
            ...((formData.tipo === "PROVA" ||
              (formData.tipo === "ATIVIDADE" && tipoAtividadeApi === "QUESTOES")) && {
              questoes: toAvaliacaoQuestoes(formData.questoes),
            }),
          };

          provaCriada = await createAvaliacao(avaliacaoPayload);
        }
        const tipoLabel =
          formData.tipo === "PROVA"
            ? "Prova"
            : formData.tipo === "ATIVIDADE"
            ? "Atividade"
            : "Prova/Atividade";

        // Se a modalidade for ONLINE ou AO_VIVO, gerar tokens únicos para cada inscrição
        const modalidadeOnlineOuAoVivo =
          formData.modalidade === "ONLINE" || formData.modalidade === "AO_VIVO";
        const provaCriadaId = (provaCriada as any)?.id as string | undefined;

        if (modalidadeOnlineOuAoVivo && provaCriadaId && formData.turmaId && cursoIdFromTurma) {
          setLoadingStep("Gerando tokens únicos para os alunos...");

          try {
            // Buscar todas as inscrições da turma
            const inscricoes = await listInscricoes(
              cursoIdFromTurma!,
              formData.turmaId
            );

            if (inscricoes && inscricoes.length > 0) {
              // Gerar token para cada inscrição
              const promises = inscricoes.map((inscricao) =>
                createProvaToken(
                  cursoIdFromTurma!,
                  formData.turmaId,
                  provaCriadaId,
                  { inscricaoId: inscricao.id }
                ).catch((error) => {
                  console.error(
                    `Erro ao gerar token para inscrição ${inscricao.id}:`,
                    error
                  );
                  return null; // Continua gerando tokens para outras inscrições mesmo se uma falhar
                })
              );

              await Promise.allSettled(promises);
              toastCustom.success(
                `${tipoLabel} criada com sucesso! ${inscricoes.length} token(s) único(s) gerado(s) para os alunos.`
              );
            } else {
              toastCustom.success(
                `${tipoLabel} criada com sucesso! Nenhuma inscrição encontrada na turma para gerar tokens.`
              );
            }
          } catch (error: any) {
            console.error("Erro ao gerar tokens únicos:", error);
            toastCustom.warning(
              `${tipoLabel} criada com sucesso, mas houve um erro ao gerar tokens únicos. Você pode gerá-los manualmente depois.`
            );
          }
        } else {
          if (modalidadeOnlineOuAoVivo && formData.turmaId && cursoIdFromTurma && !provaCriadaId) {
            console.warn(
              "[CreateProvaForm] Prova/Atividade criada sem id no retorno. Tokens não serão gerados automaticamente."
            );
          }
          toastCustom.success(`${tipoLabel} criada com sucesso!`);
        }
      } else {
        if (!provaId) {
          throw new Error("ID da prova é necessário para edição");
        }
        if (!cursoIdFromTurma || !formData.turmaId) {
          throw new Error("Curso e turma são necessários para edição");
        }
        await updateProva(
          cursoIdFromTurma,
          formData.turmaId,
          provaId,
          payload as UpdateProvaPayload
        );
        const tipoLabel =
          formData.tipo === "PROVA"
            ? "Prova"
            : formData.tipo === "ATIVIDADE"
            ? "Atividade"
            : "Prova/Atividade";
        toastCustom.success(`${tipoLabel} atualizada com sucesso!`);
      }

      // Invalidar cache (listagem de atividades/provas usa essa queryKey)
      queryClient.invalidateQueries({ queryKey: ["avaliacoes", "dashboard"] });

      setIsLoading(false);
      setLoadingStep("");

      // Aguardar um pouco para garantir que a invalidação foi processada
      await new Promise((resolve) => setTimeout(resolve, 200));

      onSuccess?.();
    } catch (error: any) {
      const errorMessage =
        error?.message || "Erro ao salvar prova. Tente novamente.";
      toastCustom.error(errorMessage);
      console.error("Erro ao salvar prova:", error);
      setIsLoading(false);
      setLoadingStep("");
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
        title={
          mode === "edit"
            ? "Salvando..."
            : formData.tipo === "PROVA"
            ? "Criando prova..."
            : formData.tipo === "ATIVIDADE"
            ? "Criando atividade..."
            : "Criando prova/atividade..."
        }
        loadingStep={loadingStep}
        icon={ClipboardList}
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

          {/* Header - Configurações da Prova/Atividade */}
          <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-gray-400/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg border bg-blue-50 text-blue-600 border-blue-200">
                <ClipboardList className="h-4 w-4" />
              </div>
              <span className="text-md font-medium text-foreground">
                {formData.tipo === "PROVA"
                  ? "Configurações da Prova"
                  : formData.tipo === "ATIVIDADE"
                  ? "Configurações da Atividade"
                  : "Configurações da Prova/Atividade"}
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
                disabled={isLoading || !formData.turmaId}
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
                    {formData.tipo === "PROVA"
                      ? "Prova será salva como rascunho"
                      : formData.tipo === "ATIVIDADE"
                      ? "Atividade será salva como rascunho"
                      : "Será salvo como rascunho"}
                  </h4>
                  <p className="text-sm! text-amber-700! mb-0!">
                    Para publicar{" "}
                    {formData.tipo === "PROVA"
                      ? "a prova"
                      : formData.tipo === "ATIVIDADE"
                      ? "a atividade"
                      : ""}
                    , é necessário vincular uma <strong>turma</strong>. O
                    instrutor pode ser definido depois.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Linha 1: Tipo e Título */}
            <div className="flex flex-col md:flex-row gap-4 w-full">
              {/* Campo Tipo */}
              <div className="flex-[0.4] min-w-0">
                <SelectCustom
                  label="Tipo"
                  placeholder="Selecione o tipo"
                  options={TIPO_OPTIONS}
                  value={formData.tipo}
                  onChange={(value) => {
                    const novoTipo = value as "PROVA" | "ATIVIDADE" | "";
                    handleInputChange("tipo", novoTipo);
                    // Limpar dados quando mudar de tipo
                    if (novoTipo === "PROVA") {
                      // Limpar tipo de atividade e dados específicos de atividade
                      handleInputChange("tipoAtividade", "");
                      handleInputChange("texto", { titulo: "" });
                    } else if (novoTipo === "ATIVIDADE") {
                      handleInputChange("recuperacaoFinal", false);
                      // Limpar questões se não for tipo questões
                      if (formData.tipoAtividade !== "QUESTOES") {
                        handleInputChange("questoes", []);
                      }
                    } else {
                      handleInputChange("recuperacaoFinal", false);
                    }
                  }}
                  error={errors.tipo}
                  required
                />
              </div>

              {/* Título da Prova/Atividade */}
              <div className="flex-1 min-w-0">
                <InputCustom
                  label={`Título da ${
                    formData.tipo === "PROVA"
                      ? "Prova"
                      : formData.tipo === "ATIVIDADE"
                      ? "Atividade"
                      : "Prova/Atividade"
                  }`}
                  name="titulo"
                  value={formData.titulo}
                  onChange={(e) => handleInputChange("titulo", e.target.value)}
                  error={errors.titulo}
                  required
                  placeholder={`Ex.: ${
                    formData.tipo === "PROVA"
                      ? "Prova de Matemática"
                      : formData.tipo === "ATIVIDADE"
                      ? "Atividade de Revisão"
                      : "Prova/Atividade"
                  }`}
                  maxLength={200}
                />
              </div>

              {/* Recuperação final - apenas para PROVA */}
              {formData.tipo === "PROVA" && (
                <div className="flex-[0.4] min-w-0">
                  <SelectCustom
                    label="Recuperação final?"
                    required
                    options={[
                      { value: "false", label: "Não" },
                      { value: "true", label: "Sim" },
                    ]}
                    value={String(formData.recuperacaoFinal)}
                    onChange={(val) =>
                      {
                        const isRecuperacaoFinal = val === "true";
                        handleInputChange("recuperacaoFinal", isRecuperacaoFinal);
                        if (isRecuperacaoFinal) {
                          handleInputChange("valeNota", true);
                          handleInputChange("valePonto", true);
                          if (!formData.etiqueta || formData.etiqueta.trim() === "") {
                            handleInputChange("etiqueta", "REC");
                          }
                        }
                      }}
                  />
                </div>
              )}
            </div>

            {/* Linha 2: Curso, Turma, Vale nota, Etiqueta e Peso */}
            <div className="flex flex-col md:flex-row gap-4 w-full">
              {/* Campo Curso - Opcional */}
              <div className="flex-1 min-w-0">
                <SelectCustom
                  label="Curso"
                  placeholder={
                    loadingCursos
                      ? "Carregando cursos..."
                      : cursos.length === 0
                      ? "Nenhum curso disponível"
                      : "Selecione o curso"
                  }
                  options={[
                    { value: "", label: "Sem curso (vincular depois)" },
                    ...cursos,
                  ]}
                  value={formData.cursoId}
                  onChange={(value) => {
                    handleInputChange("cursoId", value);
                    // Limpar turma quando curso mudar
                    if (formData.turmaId) {
                      handleInputChange("turmaId", "");
                    }
                  }}
                  error={errors.cursoId}
                  disabled={loadingCursos}
                />
              </div>

              {/* Campo Turma - Opcional */}
              <div className="flex-1 min-w-0">
                <SelectCustom
                  label="Turma"
                  placeholder={
                    !formData.cursoId
                      ? "Selecione um curso primeiro"
                      : 
                    loadingTurmas
                      ? "Carregando turmas..."
                      : turmas.length === 0
                      ? "Nenhuma turma disponível"
                      : "Selecione a turma"
                  }
                  options={[
                    { value: "", label: "Sem turma (vincular depois)" },
                    ...turmas,
                  ]}
                  value={formData.turmaId}
                  onChange={handleTurmaChange}
                  error={errors.turmaId}
                  disabled={loadingTurmas || !formData.cursoId}
                />
              </div>

              {/* Vale nota */}
              <div className="flex-[0.5] min-w-0">
                <SelectCustom
                  label="Vale nota?"
                  options={[
                    { value: "true", label: "Sim" },
                    { value: "false", label: "Não" },
                  ]}
                  required
                  value={String(formData.valeNota)}
                  onChange={(val) => {
                    if (formData.tipo === "PROVA" && formData.recuperacaoFinal) {
                      // Recuperação final sempre vale nota/ponto
                      handleInputChange("valeNota", true);
                      handleInputChange("valePonto", true);
                      return;
                    }
                    const valeNota = val === "true";
                    handleInputChange("valeNota", valeNota);
                    // Se vale nota, sempre conta para média (valePonto = true)
                    if (valeNota) {
                      handleInputChange("valePonto", true);
                    } else {
                      // Limpar campos relacionados se valeNota for false
                      handleInputChange("etiqueta", "");
                      handleInputChange("peso", "");
                      handleInputChange("valePonto", false);
                    }
                  }}
                  disabled={formData.tipo === "PROVA" && formData.recuperacaoFinal}
                />
              </div>

              {/* Etiqueta - Mostra apenas se valeNota for true */}
              {formData.valeNota && (
                <div className="flex-1 min-w-0">
                  <InputCustom
                    label="Etiqueta"
                    placeholder="Ex: P1, P2, Atividade 1"
                    value={formData.etiqueta}
                    onChange={(e) =>
                      handleInputChange("etiqueta", e.target.value)
                    }
                    maxLength={50}
                  />
                </div>
              )}

              {/* Peso - Mostra apenas se valeNota for true, obrigatório */}
              {formData.valeNota && (
                <div className="flex-[0.5] min-w-0">
                  <InputCustom
                    label="Peso"
                    type="text"
                    inputMode="decimal"
                    value={formData.peso}
                    onKeyDown={(e) => {
                      // Permitir: backspace, delete, tab, escape, enter, ponto, setas
                      const allowedKeys = [
                        "Backspace",
                        "Delete",
                        "Tab",
                        "Escape",
                        "Enter",
                        "ArrowLeft",
                        "ArrowRight",
                        "ArrowUp",
                        "ArrowDown",
                        "Home",
                        "End",
                        ".",
                      ];

                      if (allowedKeys.includes(e.key)) {
                        // Se for ponto, verificar se já existe um ponto
                        if (e.key === "." && formData.peso.includes(".")) {
                          e.preventDefault();
                        }
                        return;
                      }

                      // Permitir Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                      if (
                        e.ctrlKey &&
                        ["a", "c", "v", "x"].includes(e.key.toLowerCase())
                      ) {
                        return;
                      }

                      // Bloquear se não for número
                      if (!/^\d$/.test(e.key)) {
                        e.preventDefault();
                        return;
                      }

                      // Simular o valor que seria gerado
                      const input = e.target as HTMLInputElement;
                      const selectionStart = input.selectionStart ?? 0;
                      const selectionEnd = input.selectionEnd ?? 0;
                      const currentValue = formData.peso;
                      const newValue =
                        currentValue.substring(0, selectionStart) +
                        e.key +
                        currentValue.substring(selectionEnd);

                      // Verificar se o novo valor seria maior que 10
                      const numValue = Number(newValue);
                      if (!isNaN(numValue) && numValue > 10) {
                        e.preventDefault();
                        return;
                      }

                      // Verificar casas decimais (máximo 2)
                      const parts = newValue.split(".");
                      if (parts.length === 2 && parts[1].length > 2) {
                        e.preventDefault();
                        return;
                      }
                    }}
                    onChange={(e) => {
                      let value = e.target.value;

                      // Permitir campo vazio
                      if (value === "") {
                        handleInputChange("peso", "");
                        return;
                      }

                      // Remover caracteres não numéricos exceto ponto
                      value = value.replace(/[^0-9.]/g, "");

                      // Remover pontos extras (manter apenas o primeiro)
                      const firstDotIndex = value.indexOf(".");
                      if (firstDotIndex !== -1) {
                        value =
                          value.substring(0, firstDotIndex + 1) +
                          value.substring(firstDotIndex + 1).replace(/\./g, "");
                      }

                      // Limitar a 2 casas decimais
                      const parts = value.split(".");
                      if (parts.length === 2 && parts[1].length > 2) {
                        value = parts[0] + "." + parts[1].substring(0, 2);
                      }

                      // Verificar se é um número válido e está entre 0 e 10
                      const numValue = Number(value);
                      if (!isNaN(numValue) && numValue >= 0 && numValue <= 10) {
                        handleInputChange("peso", value);
                      } else if (numValue > 10) {
                        // Se for maior que 10, setar como 10
                        handleInputChange("peso", "10");
                      }
                    }}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pastedText = e.clipboardData.getData("text");

                      // Limpar o valor colado
                      let cleanValue = pastedText.replace(/[^0-9.]/g, "");

                      // Remover pontos extras
                      const firstDotIndex = cleanValue.indexOf(".");
                      if (firstDotIndex !== -1) {
                        cleanValue =
                          cleanValue.substring(0, firstDotIndex + 1) +
                          cleanValue
                            .substring(firstDotIndex + 1)
                            .replace(/\./g, "");
                      }

                      // Limitar a 2 casas decimais
                      const parts = cleanValue.split(".");
                      if (parts.length === 2 && parts[1].length > 2) {
                        cleanValue = parts[0] + "." + parts[1].substring(0, 2);
                      }

                      // Verificar se é um número válido e está entre 0 e 10
                      const numValue = Number(cleanValue);
                      if (!isNaN(numValue) && numValue >= 0 && numValue <= 10) {
                        handleInputChange("peso", cleanValue);
                      } else if (numValue > 10) {
                        handleInputChange("peso", "10");
                      }
                    }}
                    placeholder="Ex: 0.5, 2.5, 10"
                    error={errors.peso}
                    required
                  />
                </div>
              )}
            </div>

            {/* Linha 3: Localização (se turma), Tipo de Atividade, Modalidade, Instrutor e Módulo */}
            <div className="flex flex-col md:flex-row gap-4 w-full">
              {/* Localização - Apenas se turma for selecionada */}
              {formData.turmaId && (
                <div className="flex-1 min-w-0">
                  <SelectCustom
                    label="Localização"
                    options={LOCALIZACAO_OPTIONS}
                    value={formData.localizacao}
                    onChange={(value) => {
                      handleInputChange(
                        "localizacao",
                        value as "TURMA" | "MODULO"
                      );
                      if (value === "TURMA") {
                        handleInputChange("moduloId", "");
                      }
                    }}
                    placeholder="Selecione a localização"
                    error={errors.localizacao}
                    required
                  />
                </div>
              )}

              {/* Tipo de Atividade - Apenas para ATIVIDADE */}
              {formData.tipo === "ATIVIDADE" && (
                <div className="flex-1 min-w-0">
                  <SelectCustom
                    label="Tipo de Atividade"
                    placeholder="Selecione o tipo de atividade"
                    options={TIPO_ATIVIDADE_OPTIONS}
                    value={formData.tipoAtividade || ""}
                    onChange={(value) => {
                      handleInputChange(
                        "tipoAtividade",
                        value as "QUESTOES" | "TEXTO" | ""
                      );
                      // Limpar dados do tipo anterior ao mudar
                      if (value !== "QUESTOES") {
                        handleInputChange("questoes", []);
                      }
                      if (value !== "TEXTO") {
                        handleInputChange("texto", { titulo: "" });
                      }
                    }}
                    error={errors.tipoAtividade}
                    required
                  />
                </div>
              )}

              {/* Modalidade - bloqueada se turma selecionada (vem da turma) */}
              <div className="flex-1 min-w-0">
                <SelectCustom
                  label="Modalidade"
                  options={MODALIDADE_OPTIONS}
                  value={formData.modalidade}
                  onChange={(value) => {
                    const novaModalidade = value as Modalidade | "";
                    handleInputChange("modalidade", novaModalidade);
                  }}
                  placeholder="Selecione a modalidade"
                  error={errors.modalidade}
                  required
                  disabled={!!formData.turmaId && !!modalidadeFromTurma}
                />
              </div>

              {/* Instrutor */}
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
                    onChange={(value) =>
                      handleInputChange("instrutorId", value || "")
                    }
                    error={errors.instrutorId}
                    disabled={user?.role === "INSTRUTOR"}
                    helperText={
                      user?.role === "INSTRUTOR"
                        ? "Seu ID será automaticamente atribuído"
                        : undefined
                    }
                  />
                )}
              </div>

              {/* Módulo (se localização for MODULO e turma selecionada) */}
              {formData.turmaId && formData.localizacao === "MODULO" && (
                <div className="flex-1 min-w-0">
                  {loadingModulos ? (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Módulo <span className="text-red-500">*</span>
                      </Label>
                      <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                  ) : (
                    <SelectCustom
                      label="Módulo"
                      placeholder={
                        modulosDaTurma && modulosDaTurma.length === 0
                          ? "Nenhum módulo encontrado nesta turma"
                          : "Selecione o módulo"
                      }
                      options={
                        modulosDaTurma && modulosDaTurma.length > 0
                          ? modulosDaTurma.map((modulo) => ({
                              value: modulo.id,
                              label: modulo.nome,
                            }))
                          : []
                      }
                      value={formData.moduloId}
                      onChange={(value) =>
                        handleInputChange("moduloId", value || "")
                      }
                      error={errors.moduloId}
                      required
                      disabled={modulosDaTurma && modulosDaTurma.length === 0}
                      helperText={
                        modulosDaTurma && modulosDaTurma.length === 0
                          ? "Esta turma não possui módulos cadastrados"
                          : undefined
                      }
                    />
                  )}
                </div>
              )}
            </div>

            {/* Linha 4: Período (Data Início e Fim), Horários e Obrigatória */}
            <div className="flex flex-col md:flex-row gap-4 w-full">
              {/* Período da Prova/Atividade (Data Início e Fim) */}
              <div className="flex-1 min-w-0">
                <DatePickerRangeCustom
                  label="Período"
                  value={{
                    from: formData.dataInicio,
                    to: formData.dataFim,
                  }}
                  onChange={(range) => {
                    handleInputChange("dataInicio", range.from);
                    handleInputChange("dataFim", range.to);
                  }}
                  placeholder="Selecione o período"
                  error={errors.dataInicio || errors.dataFim}
                  minDate={getTomorrowDate()}
                  required
                  clearable
                />
              </div>

              {/* Hora de Início */}
              <div className="flex-1 min-w-0">
                <TimeInputCustom
                  label="Hora de Início"
                  name="horaInicio"
                  value={formData.horaInicio}
                  onChange={(value) => handleInputChange("horaInicio", value)}
                  placeholder="00:00"
                  error={errors.horaInicio}
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Hora de Término */}
              <div className="flex-1 min-w-0">
                <TimeInputCustom
                  label="Hora de Término"
                  name="horaFim"
                  value={formData.horaFim}
                  onChange={(value) => handleInputChange("horaFim", value)}
                  placeholder="00:00"
                  error={errors.horaFim}
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Obrigatória */}
              <div className="flex-[0.6] min-w-0">
                <SelectCustom
                  label={`${
                    formData.tipo === "ATIVIDADE" ? "Atividade" : "Prova"
                  } é obrigatória?`}
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

            {/* Builders de Questões - Para PROVA e ATIVIDADE do tipo Questões */}
            {(() => {
              const isProva = formData.tipo === "PROVA";
              const isAtividadeQuestoes =
                formData.tipo === "ATIVIDADE" &&
                formData.tipoAtividade === "QUESTOES";

              if (!isProva && !isAtividadeQuestoes) {
                return null;
              }

              return (
                <div className="space-y-4">
                  {/* Builder de Questões para PROVA */}
                  {isProva && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                      <QuestoesBuilder
                        questoes={formData.questoes || []}
                        onChange={(questoes) =>
                          handleInputChange("questoes", questoes)
                        }
                        maxQuestoes={10}
                        minQuestoes={1}
                        maxAlternativas={4}
                      />
                    </div>
                  )}

                  {/* Builder de Questões para ATIVIDADE */}
                  {isAtividadeQuestoes && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                      <QuestoesBuilder
                        questoes={formData.questoes || []}
                        onChange={(questoes) =>
                          handleInputChange("questoes", questoes)
                        }
                        maxQuestoes={10}
                        minQuestoes={1}
                        maxAlternativas={4}
                      />
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Builder de Texto - Apenas para ATIVIDADE */}
            {formData.tipo === "ATIVIDADE" &&
              formData.tipoAtividade === "TEXTO" && (
                <div className="space-y-4">
                  <TextoBuilder
                    texto={formData.texto || { titulo: "" }}
                    onChange={(texto) => handleInputChange("texto", texto)}
                  />
                </div>
              )}
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
                : formData.tipo === "PROVA"
                ? "Criar Prova"
                : formData.tipo === "ATIVIDADE"
                ? "Criar Atividade"
                : "Criar Prova/Atividade"}
            </ButtonCustom>
          </div>
        </fieldset>
      </form>
    </div>
  );
}

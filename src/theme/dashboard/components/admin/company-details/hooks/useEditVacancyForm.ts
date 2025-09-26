import { useState, useEffect, useCallback } from "react";
import type { AdminCompanyVagaItem } from "@/api/empresas/admin/types";

export interface VagaUpdateInput {
  usuarioId?: string;
  areaInteresseId?: number;
  subareaInteresseId?: number;
  modoAnonimo?: boolean;
  regimeDeTrabalho?: string;
  modalidade?: string;
  titulo?: string;
  slug?: string;
  paraPcd?: boolean;
  vagaEmDestaque?: boolean;
  numeroVagas?: number;
  descricao?: string;
  requisitos?: {
    obrigatorios?: string[];
    desejaveis?: string[];
  } | null;
  atividades?: {
    principais?: string[];
    extras?: string[];
  } | null;
  beneficios?: {
    lista?: string[];
    observacoes?: string;
  } | null;
  observacoes?: string;
  jornada?: string;
  senioridade?: string;
  inscricoesAte?: string;
  inseridaEm?: string;
  status?: string;
  localizacao?: {
    cidade?: string;
    estado?: string;
    formato?: string;
  } | null;
  salarioMin?: string | number;
  salarioMax?: string | number;
  salarioConfidencial?: boolean;
  maxCandidaturasPorUsuario?: number | null;
}

interface UseEditVacancyFormProps {
  vacancy: AdminCompanyVagaItem | null;
  onSuccess?: (updatedVacancy: AdminCompanyVagaItem) => void;
  onError?: (error: string) => void;
}

export function useEditVacancyForm({
  vacancy,
  onSuccess,
  onError,
}: UseEditVacancyFormProps) {
  const [formData, setFormData] = useState<VagaUpdateInput>({});
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Inicializar dados do formulário quando a vaga muda
  useEffect(() => {
    if (vacancy) {
      setFormData({
        titulo: vacancy.titulo || "",
        descricao: vacancy.descricao || "",
        numeroVagas: vacancy.numeroVagas || 1,
        modalidade: vacancy.modalidade || "",
        regimeDeTrabalho: vacancy.regimeDeTrabalho || "",
        jornada: vacancy.jornada || "",
        senioridade: vacancy.senioridade || "",
        paraPcd: vacancy.paraPcd || false,
        vagaEmDestaque: vacancy.vagaEmDestaque || false,
        modoAnonimo: vacancy.modoAnonimo || false,
        salarioMin: vacancy.salarioMin || "",
        salarioMax: vacancy.salarioMax || "",
        salarioConfidencial: vacancy.salarioConfidencial || false,
        maxCandidaturasPorUsuario: vacancy.maxCandidaturasPorUsuario || null,
        inscricoesAte: vacancy.inscricoesAte ? new Date(vacancy.inscricoesAte).toISOString().split('T')[0] : "",
        status: vacancy.status || "",
        observacoes: vacancy.observacoes || "",
        localizacao: vacancy.localizacao ? {
          cidade: vacancy.localizacao.cidade || "",
          estado: vacancy.localizacao.estado || "",
          formato: vacancy.localizacao.formato || "",
        } : null,
        requisitos: vacancy.requisitos ? {
          obrigatorios: Array.isArray(vacancy.requisitos) ? vacancy.requisitos : [],
          desejaveis: [],
        } : null,
        atividades: vacancy.atividades ? {
          principais: Array.isArray(vacancy.atividades) ? vacancy.atividades : [],
          extras: [],
        } : null,
        beneficios: vacancy.beneficios ? {
          lista: Array.isArray(vacancy.beneficios) ? vacancy.beneficios : [],
          observacoes: "",
        } : null,
      });
      setErrors({});
    }
  }, [vacancy]);

  // Atualizar campo específico
  const updateField = useCallback((field: keyof VagaUpdateInput, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Limpar erro do campo quando ele é atualizado
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  // Atualizar campo de array (requisitos, atividades, beneficios)
  const updateArrayField = useCallback((
    field: 'requisitos' | 'atividades' | 'beneficios',
    subField: string,
    value: string[]
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [subField]: value,
      },
    }));
  }, []);

  // Converter string para array (para campos de texto que devem ser arrays)
  const parseTextToArray = (text: string): string[] => {
    if (!text.trim()) return [];
    return text.split('\n').map(item => item.trim()).filter(item => item.length > 0);
  };

  // Converter array para string (para exibição em textarea)
  const parseArrayToText = (arr: string[] | undefined): string => {
    if (!arr || arr.length === 0) return "";
    return arr.join('\n');
  };

  // Validar formulário
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    // Validações básicas
    if (!formData.titulo?.trim()) {
      newErrors.titulo = "Título é obrigatório";
    }

    if (!formData.descricao?.trim()) {
      newErrors.descricao = "Descrição é obrigatória";
    }

    if (formData.numeroVagas && formData.numeroVagas < 1) {
      newErrors.numeroVagas = "Número de vagas deve ser maior que 0";
    }

    if (formData.areaInteresseId && !formData.subareaInteresseId) {
      newErrors.subareaInteresseId = "Subárea é obrigatória quando área é selecionada";
    }

    if (formData.salarioMin && formData.salarioMax) {
      const min = parseFloat(String(formData.salarioMin));
      const max = parseFloat(String(formData.salarioMax));
      if (min > max) {
        newErrors.salarioMax = "Salário máximo deve ser maior que o mínimo";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Preparar dados para envio
  const prepareDataForSubmission = useCallback((): VagaUpdateInput => {
    const data: VagaUpdateInput = { ...formData };

    // Converter strings para arrays onde necessário
    if (data.requisitos) {
      data.requisitos = {
        obrigatorios: parseTextToArray(parseArrayToText(data.requisitos.obrigatorios)),
        desejaveis: parseTextToArray(parseArrayToText(data.requisitos.desejaveis)),
      };
    }

    if (data.atividades) {
      data.atividades = {
        principais: parseTextToArray(parseArrayToText(data.atividades.principais)),
        extras: parseTextToArray(parseArrayToText(data.atividades.extras)),
      };
    }

    if (data.beneficios) {
      data.beneficios = {
        lista: parseTextToArray(parseArrayToText(data.beneficios.lista)),
        observacoes: data.beneficios.observacoes || "",
      };
    }

    // Converter datas para formato ISO
    if (data.inscricoesAte) {
      data.inscricoesAte = new Date(data.inscricoesAte).toISOString();
    }

    if (data.inseridaEm) {
      data.inseridaEm = new Date(data.inseridaEm).toISOString();
    }

    // Remover campos vazios
    Object.keys(data).forEach(key => {
      const value = data[key as keyof VagaUpdateInput];
      if (value === "" || value === null || value === undefined) {
        delete data[key as keyof VagaUpdateInput];
      }
    });

    return data;
  }, [formData]);

  // Submeter formulário
  const submitForm = useCallback(async () => {
    if (!vacancy) return;

    if (!validateForm()) {
      onError?.("Por favor, corrija os erros no formulário");
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const dataToSubmit = prepareDataForSubmission();
      
      // Verificar se há pelo menos um campo para atualizar
      if (Object.keys(dataToSubmit).length === 0) {
        onError?.("Informe ao menos um campo para atualização da vaga");
        return;
      }

      console.log("Dados para envio:", dataToSubmit);

      // TODO: Implementar chamada à API
      // const response = await updateVacancy(vacancy.id, dataToSubmit);
      // onSuccess?.(response);

      // Simular sucesso por enquanto
      setTimeout(() => {
        setIsLoading(false);
        onSuccess?.(vacancy);
      }, 1000);

    } catch (error) {
      console.error("Erro ao atualizar vaga:", error);
      onError?.(error instanceof Error ? error.message : "Erro ao atualizar vaga");
      setIsLoading(false);
    }
  }, [vacancy, validateForm, prepareDataForSubmission, onSuccess, onError]);

  return {
    formData,
    errors,
    isLoading,
    updateField,
    updateArrayField,
    parseTextToArray,
    parseArrayToText,
    submitForm,
    validateForm,
  };
}

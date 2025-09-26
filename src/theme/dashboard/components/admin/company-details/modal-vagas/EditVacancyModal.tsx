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
import { InputCustom } from "@/components/ui/custom/input";
import { SimpleTextarea } from "@/components/ui/custom/text-area";
import { SelectCustom } from "@/components/ui/custom/select";
import { useEditVacancyForm } from "../hooks/useEditVacancyForm";
import { updateVacancy } from "@/api/empresas/admin/update-vacancy";
import type { AdminCompanyVagaItem } from "@/api/empresas/admin/types";
import { useState } from "react";
import { toast } from "sonner";

interface EditVacancyModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  vacancy: AdminCompanyVagaItem | null;
  onSave?: (vacancy: AdminCompanyVagaItem) => void;
  onVacancyUpdated?: (updatedVacancy: AdminCompanyVagaItem) => void;
}

export function EditVacancyModal({
  isOpen,
  onOpenChange,
  vacancy,
  onSave,
  onVacancyUpdated,
}: EditVacancyModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    formData,
    errors,
    isLoading,
    updateField,
    updateArrayField,
    parseTextToArray,
    parseArrayToText,
    submitForm,
  } = useEditVacancyForm({
    vacancy,
    onSuccess: (updatedVacancy) => {
      toast.success("Vaga atualizada com sucesso!");
      onVacancyUpdated?.(updatedVacancy);
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSave = async () => {
    if (!vacancy) return;

    setIsSubmitting(true);
    try {
      const dataToSubmit = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        numeroVagas: formData.numeroVagas,
        modalidade: formData.modalidade,
        regimeDeTrabalho: formData.regimeDeTrabalho,
        jornada: formData.jornada,
        senioridade: formData.senioridade,
        paraPcd: formData.paraPcd,
        vagaEmDestaque: formData.vagaEmDestaque,
        modoAnonimo: formData.modoAnonimo,
        salarioMin: formData.salarioMin,
        salarioMax: formData.salarioMax,
        salarioConfidencial: formData.salarioConfidencial,
        maxCandidaturasPorUsuario: formData.maxCandidaturasPorUsuario,
        inscricoesAte: formData.inscricoesAte
          ? new Date(formData.inscricoesAte).toISOString()
          : undefined,
        status: formData.status,
        observacoes: formData.observacoes,
        localizacao: formData.localizacao,
        requisitos: formData.requisitos,
        atividades: formData.atividades,
        beneficios: formData.beneficios,
      };

      // Remover campos vazios
      const cleanedData = Object.fromEntries(
        Object.entries(dataToSubmit).filter(
          ([_, value]) => value !== "" && value !== null && value !== undefined
        )
      );

      if (Object.keys(cleanedData).length === 0) {
        toast.error("Informe ao menos um campo para atualização da vaga");
        return;
      }

      const updatedVacancy = await updateVacancy(vacancy.id, cleanedData);
      toast.success("Vaga atualizada com sucesso!");
      onVacancyUpdated?.(updatedVacancy);
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao atualizar vaga:", error);
      toast.error("Erro ao atualizar vaga. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="2xl"
      backdrop="blur"
      scrollBehavior="inside"
    >
      <ModalContentWrapper key={vacancy?.id ?? "nova"}>
        {vacancy ? (
          <>
            <ModalHeader className="space-y-1">
              <ModalTitle>Editar vaga</ModalTitle>
              <ModalDescription>
                {vacancy.codigo
                  ? `Código: ${vacancy.codigo}`
                  : `ID: ${vacancy.id}`}
              </ModalDescription>
            </ModalHeader>
            <ModalBody className="max-h-[65vh] pr-1">
              <form
                className="space-y-6"
                onSubmit={(event) => event.preventDefault()}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <SelectCustom
                    label="Status"
                    mode="single"
                    value={formData.status || null}
                    onChange={(value) => updateField("status", value)}
                    placeholder="Selecione o status"
                    options={[
                      { value: "RASCUNHO", label: "Rascunho" },
                      { value: "EM_ANALISE", label: "Em análise" },
                      { value: "PUBLICADO", label: "Publicado" },
                      { value: "EXPIRADO", label: "Expirado" },
                      { value: "DESPUBLICADA", label: "Despublicada" },
                      { value: "PAUSADA", label: "Pausada" },
                      { value: "ENCERRADA", label: "Encerrada" },
                    ]}
                    size="md"
                  />
                  <InputCustom
                    label="Nome da vaga"
                    name="titulo"
                    id="titulo"
                    value={formData.titulo || ""}
                    onChange={(e) => updateField("titulo", e.target.value)}
                    placeholder="Digite o nome da vaga"
                    error={errors.titulo}
                    required
                    size="md"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <SelectCustom
                    label="Modalidade"
                    mode="single"
                    value={formData.modalidade || null}
                    onChange={(value) => updateField("modalidade", value)}
                    placeholder="Selecione a modalidade"
                    options={[
                      { value: "PRESENCIAL", label: "Presencial" },
                      { value: "REMOTO", label: "Remoto" },
                      { value: "HIBRIDO", label: "Híbrido" },
                    ]}
                    size="md"
                  />
                  <SelectCustom
                    label="Regime de trabalho"
                    mode="single"
                    value={formData.regimeDeTrabalho || null}
                    onChange={(value) => updateField("regimeDeTrabalho", value)}
                    placeholder="Selecione o regime"
                    options={[
                      { value: "CLT", label: "CLT" },
                      { value: "TEMPORARIO", label: "Temporário" },
                      { value: "ESTAGIO", label: "Estágio" },
                      { value: "PJ", label: "PJ" },
                      { value: "HOME_OFFICE", label: "Home Office" },
                      { value: "JOVEM_APRENDIZ", label: "Jovem Aprendiz" },
                    ]}
                    size="md"
                  />
                  <SelectCustom
                    label="Jornada"
                    mode="single"
                    value={formData.jornada || null}
                    onChange={(value) => updateField("jornada", value)}
                    placeholder="Selecione a jornada"
                    options={[
                      { value: "INTEGRAL", label: "Integral" },
                      { value: "MEIO_PERIODO", label: "Meio período" },
                      { value: "FLEXIVEL", label: "Flexível" },
                      { value: "TURNOS", label: "Turnos" },
                      { value: "NOTURNO", label: "Noturno" },
                    ]}
                    size="md"
                  />
                  <InputCustom
                    label="Inscrições até"
                    name="inscricoesAte"
                    id="inscricoesAte"
                    type="date"
                    value={formData.inscricoesAte || ""}
                    onChange={(e) =>
                      updateField("inscricoesAte", e.target.value)
                    }
                    size="md"
                  />
                </div>

                <SimpleTextarea
                  label="Descrição"
                  name="descricao"
                  id="descricao"
                  value={formData.descricao || ""}
                  onChange={(e) => updateField("descricao", e.target.value)}
                  placeholder="Descreva a vaga, responsabilidades e oportunidades..."
                  className="min-h-[120px]"
                  maxLength={1000}
                  showCharCount
                  required
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <SimpleTextarea
                    label="Atividades Principais"
                    name="atividades-principais"
                    id="atividades-principais"
                    value={parseArrayToText(formData.atividades?.principais)}
                    onChange={(e) =>
                      updateArrayField(
                        "atividades",
                        "principais",
                        parseTextToArray(e.target.value)
                      )
                    }
                    placeholder="Liste as principais atividades da vaga (uma por linha)..."
                    className="min-h-[100px]"
                    maxLength={500}
                    showCharCount
                  />
                  <SimpleTextarea
                    label="Requisitos Obrigatórios"
                    name="requisitos-obrigatorios"
                    id="requisitos-obrigatorios"
                    value={parseArrayToText(formData.requisitos?.obrigatorios)}
                    onChange={(e) =>
                      updateArrayField(
                        "requisitos",
                        "obrigatorios",
                        parseTextToArray(e.target.value)
                      )
                    }
                    placeholder="Liste os requisitos obrigatórios (um por linha)..."
                    className="min-h-[100px]"
                    maxLength={500}
                    showCharCount
                  />
                  <SimpleTextarea
                    label="Benefícios"
                    name="beneficios-lista"
                    id="beneficios-lista"
                    value={parseArrayToText(formData.beneficios?.lista)}
                    onChange={(e) =>
                      updateArrayField(
                        "beneficios",
                        "lista",
                        parseTextToArray(e.target.value)
                      )
                    }
                    placeholder="Liste os benefícios oferecidos (um por linha)..."
                    className="min-h-[100px]"
                    maxLength={500}
                    showCharCount
                  />
                  <SimpleTextarea
                    label="Observações"
                    name="observacoes"
                    id="observacoes"
                    value={formData.observacoes || ""}
                    onChange={(e) => updateField("observacoes", e.target.value)}
                    placeholder="Informações adicionais sobre a vaga..."
                    className="min-h-[100px]"
                    maxLength={500}
                    showCharCount
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-1">
                  <InputCustom
                    label="Número de vagas"
                    name="numeroVagas"
                    id="numeroVagas"
                    type="number"
                    value={formData.numeroVagas || ""}
                    onChange={(e) =>
                      updateField("numeroVagas", parseInt(e.target.value) || 1)
                    }
                    placeholder="Quantidade de vagas"
                    error={errors.numeroVagas}
                    size="md"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <InputCustom
                    label="Salário mínimo"
                    name="salarioMin"
                    id="salarioMin"
                    type="number"
                    value={formData.salarioMin || ""}
                    onChange={(e) => updateField("salarioMin", e.target.value)}
                    placeholder="0.00"
                    size="md"
                  />
                  <InputCustom
                    label="Salário máximo"
                    name="salarioMax"
                    id="salarioMax"
                    type="number"
                    value={formData.salarioMax || ""}
                    onChange={(e) => updateField("salarioMax", e.target.value)}
                    placeholder="0.00"
                    error={errors.salarioMax}
                    size="md"
                  />
                  <InputCustom
                    label="Máx. candidaturas por usuário"
                    name="maxCandidaturasPorUsuario"
                    id="maxCandidaturasPorUsuario"
                    type="number"
                    value={formData.maxCandidaturasPorUsuario || ""}
                    onChange={(e) =>
                      updateField(
                        "maxCandidaturasPorUsuario",
                        parseInt(e.target.value) || null
                      )
                    }
                    placeholder="1"
                    size="md"
                  />
                </div>
              </form>
            </ModalBody>
            <ModalFooter className="pt-2">
              <ButtonCustom
                variant="ghost"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancelar
              </ButtonCustom>
              <ButtonCustom
                onClick={handleSave}
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting ? "Salvando..." : "Salvar alterações"}
              </ButtonCustom>
            </ModalFooter>
          </>
        ) : (
          <>
            <ModalBody className="py-6 text-center text-sm text-slate-500">
              Nenhuma vaga selecionada.
            </ModalBody>
            <ModalFooter className="pt-2">
              <ButtonCustom variant="ghost" onClick={handleClose}>
                Fechar
              </ButtonCustom>
            </ModalFooter>
          </>
        )}
      </ModalContentWrapper>
    </ModalCustom>
  );
}

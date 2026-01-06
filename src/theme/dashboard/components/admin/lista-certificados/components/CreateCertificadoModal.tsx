"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/custom/modal";
import {
  ButtonCustom,
  SelectCustom,
  toastCustom,
} from "@/components/ui/custom";
import type { SelectOption } from "@/components/ui/custom/select/types";
import { createCertificado } from "@/api/cursos";
import { useCursosForSelect } from "../../lista-turmas/hooks/useCursosForSelect";
import { useTurmaOptions } from "../../lista-alunos/hooks/useTurmaOptions";
import { useAlunosForTurmaSelect } from "../hooks/useAlunosForTurmaSelect";

interface CreateCertificadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCursoId?: string | null;
  defaultTurmaId?: string | null;
  onSuccess?: () => void;
}

interface FormErrors {
  cursoId?: string;
  turmaId?: string;
  alunoId?: string;
}

export function CreateCertificadoModal({
  isOpen,
  onClose,
  defaultCursoId = null,
  defaultTurmaId = null,
  onSuccess,
}: CreateCertificadoModalProps) {
  const [cursoId, setCursoId] = useState<string | null>(defaultCursoId);
  const [turmaId, setTurmaId] = useState<string | null>(defaultTurmaId);
  const [alunoId, setAlunoId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const cursosQuery = useCursosForSelect();
  const turmasQuery = useTurmaOptions(cursoId);
  const alunosQuery = useAlunosForTurmaSelect({ cursoId, turmaId });

  useEffect(() => {
    if (!isOpen) return;
    setCursoId(defaultCursoId);
    setTurmaId(defaultTurmaId);
    setAlunoId(null);
    setErrors({});
  }, [defaultCursoId, defaultTurmaId, isOpen]);

  useEffect(() => {
    if (!cursoId) {
      setTurmaId(null);
      setAlunoId(null);
    }
  }, [cursoId]);

  useEffect(() => {
    if (!turmaId) setAlunoId(null);
  }, [turmaId]);

  const cursosOptions = useMemo(
    () => cursosQuery.cursos ?? [],
    [cursosQuery.cursos]
  );
  const turmasOptions = useMemo(
    () => turmasQuery.turmas ?? [],
    [turmasQuery.turmas]
  );

  const alunosOptions: SelectOption[] = useMemo(() => {
    return alunosQuery.alunos ?? [];
  }, [alunosQuery.alunos]);

  const validate = (): boolean => {
    const next: FormErrors = {};

    if (!cursoId) next.cursoId = "Selecione um curso";
    if (!turmaId) next.turmaId = "Selecione uma turma";
    if (!alunoId) next.alunoId = "Selecione um aluno";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleClose = () => {
    if (isSaving) return;
    setErrors({});
    onClose();
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (!cursoId || !turmaId || !alunoId) return;

    setIsSaving(true);
    try {
      await createCertificado(cursoId, turmaId, { alunoId });

      toastCustom.success({
        title: "Certificado cadastrado",
        description: "O certificado foi emitido para o aluno selecionado.",
      });

      onSuccess?.();
      onClose();
    } catch (error: any) {
      const message =
        error?.message ||
        "Não foi possível cadastrar o certificado. Tente novamente.";
      toastCustom.error({
        title: "Erro ao cadastrar certificado",
        description: message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ModalCustom
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
      backdrop="blur"
    >
      <ModalContentWrapper className="max-w-xl">
        <ModalHeader>
          <ModalTitle>Cadastrar certificado</ModalTitle>
        </ModalHeader>

        <ModalBody>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <SelectCustom
                label="Curso"
                options={cursosOptions}
                value={cursoId}
                onChange={(value) => {
                  setCursoId(value || null);
                  setErrors((prev) => ({ ...prev, cursoId: undefined }));
                }}
                placeholder={
                  cursosQuery.isLoading ? "Carregando..." : "Selecionar"
                }
                disabled={cursosQuery.isLoading}
                error={errors.cursoId}
                fullWidth
                required
              />

              <SelectCustom
                label="Turma"
                options={turmasOptions}
                value={turmaId}
                onChange={(value) => {
                  setTurmaId(value || null);
                  setErrors((prev) => ({ ...prev, turmaId: undefined }));
                }}
                placeholder={
                  !cursoId
                    ? "Selecione um curso"
                    : turmasQuery.isLoading
                    ? "Carregando..."
                    : "Selecionar"
                }
                disabled={!cursoId || turmasQuery.isLoading}
                error={errors.turmaId}
                fullWidth
                required
              />

              <SelectCustom
                label="Aluno"
                options={alunosOptions}
                value={alunoId}
                onChange={(value) => {
                  setAlunoId(value || null);
                  setErrors((prev) => ({ ...prev, alunoId: undefined }));
                }}
                placeholder={
                  !turmaId
                    ? "Selecione uma turma"
                    : alunosQuery.isLoading || alunosQuery.isFetching
                    ? "Carregando..."
                    : alunosOptions.length === 0
                    ? "Nenhum aluno encontrado"
                    : "Selecionar"
                }
                disabled={
                  !turmaId || alunosQuery.isLoading || alunosQuery.isFetching
                }
                error={errors.alunoId}
                fullWidth
                required
              />
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <ButtonCustom
            variant="outline"
            onClick={handleClose}
            disabled={isSaving}
          >
            Cancelar
          </ButtonCustom>
          <ButtonCustom
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSaving}
            disabled={isSaving}
          >
            Cadastrar
          </ButtonCustom>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}

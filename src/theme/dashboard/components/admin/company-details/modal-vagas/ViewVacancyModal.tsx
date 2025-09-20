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
import type {
  AdminCompanyDetail,
  AdminCompanyVacancyListItem,
} from "@/api/empresas/admin/types";
import { formatDate, formatVacancyStatus } from "../utils";

interface ViewVacancyModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  vacancy: AdminCompanyVacancyListItem | null;
  company: AdminCompanyDetail;
  onEditVacancy?: (vacancy: AdminCompanyVacancyListItem) => void;
}

export function ViewVacancyModal({
  isOpen,
  onOpenChange,
  vacancy,
  company,
  onEditVacancy,
}: ViewVacancyModalProps) {
  const handleClose = () => onOpenChange(false);

  if (!vacancy) {
    return (
      <ModalCustom
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="2xl"
        backdrop="blur"
        scrollBehavior="inside"
      >
        <ModalContentWrapper>
          <ModalBody className="py-6 text-center text-sm text-slate-500">
            Nenhuma vaga selecionada.
          </ModalBody>
          <ModalFooter className="pt-2">
            <ButtonCustom variant="ghost" onClick={handleClose}>
              Fechar
            </ButtonCustom>
          </ModalFooter>
        </ModalContentWrapper>
      </ModalCustom>
    );
  }

  const vacancyTitle =
    vacancy.titulo ?? vacancy.nome ?? `Vaga ${vacancy.id.slice(0, 8)}`;
  const vacancyCode = vacancy.codigo ?? vacancy.id;
  const vacancyCompany = vacancy.empresa;

  const detailFields = [
    {
      label: "Código da vaga",
      value: vacancyCode,
    },
    {
      label: "Status",
      value: formatVacancyStatus(vacancy.status),
    },
    {
      label: "Modalidade",
      value: vacancy.modalidade ?? "—",
    },
    {
      label: "Regime",
      value: vacancy.regimeDeTrabalho ?? "—",
    },
    {
      label: "Acesso",
      value: vacancy.modoAnonimo ? "Anônima" : "Pública",
    },
    {
      label: "Para PCD",
      value: vacancy.paraPcd ? "Sim" : "Não",
    },
    {
      label: "Criada em",
      value: formatDate(vacancy.inseridaEm),
    },
    {
      label: "Atualizada em",
      value: formatDate(vacancy.atualizadoEm),
    },
    {
      label: "Inscrições até",
      value: formatDate(vacancy.inscricoesAte),
    },
    {
      label: "Carga horária",
      value: vacancy.cargaHoraria ?? "—",
    },
    {
      label: "Empresa",
      value:
        vacancyCompany?.nome ??
        company.nome ??
        vacancy.nomeExibicao ??
        "—",
    },
    {
      label: "Código do usuário",
      value: vacancyCompany?.codUsuario ?? "—",
    },
  ];

  const detailSections = [
    {
      label: "Descrição",
      content: vacancy.descricao ?? vacancy.descricaoExibicao ?? "",
    },
    {
      label: "Atividades",
      content: vacancy.atividades ?? "",
    },
    {
      label: "Requisitos",
      content: vacancy.requisitos ?? "",
    },
    {
      label: "Benefícios",
      content: vacancy.beneficios ?? "",
    },
    {
      label: "Observações",
      content: vacancy.observacoes ?? "",
    },
  ].filter((section) => section.content && section.content.trim().length > 0);

  const handleEditClick = () => {
    onEditVacancy?.(vacancy);
    onOpenChange(false);
  };

  return (
    <ModalCustom
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="2xl"
      backdrop="blur"
      scrollBehavior="inside"
    >
      <ModalContentWrapper>
        <ModalHeader className="space-y-2">
          <ModalTitle>{vacancyTitle}</ModalTitle>
          <ModalDescription className="text-xs uppercase tracking-[0.3em] text-slate-400">
            {`Código: ${vacancyCode}`}
          </ModalDescription>
        </ModalHeader>
        <ModalBody className="max-h-[60vh] space-y-6 pr-1">
          {detailFields.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {detailFields.map((field) => (
                <div
                  key={field.label}
                  className="rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-3"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {field.label}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {field.value}
                  </p>
                </div>
              ))}
            </div>
          )}

          {detailSections.length > 0 && (
            <div className="space-y-4">
              {detailSections.map((section) => (
                <div
                  key={section.label}
                  className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm"
                >
                  <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    {section.label}
                  </h4>
                  <p className="mt-2 whitespace-pre-line text-sm text-slate-700">
                    {section.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ModalBody>
        <ModalFooter className="pt-2">
          <ButtonCustom variant="ghost" onClick={handleClose}>
            Fechar
          </ButtonCustom>
          <ButtonCustom onClick={handleEditClick}>Editar vaga</ButtonCustom>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}

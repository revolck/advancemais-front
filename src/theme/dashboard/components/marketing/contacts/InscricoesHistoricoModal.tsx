"use client";

import type {
  PopupContactHistoryItem,
  PopupLeadDetail,
} from "@/api/websites/components/popups";
import {
  ButtonCustom,
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/custom";

interface InscricoesHistoricoModalProps {
  isOpen: boolean;
  onClose: () => void;
  contactDetail: PopupLeadDetail | null;
  contactHistory: PopupContactHistoryItem[];
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function renderPayloadValue(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  return String(value);
}

function formatPayloadKey(key: string) {
  return key
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/^./, (char) => char.toUpperCase());
}

function normalizeComparableValue(value: unknown) {
  if (value === null || value === undefined) return "";
  return String(value).trim().toLowerCase();
}

export function InscricoesHistoricoModal({
  isOpen,
  onClose,
  contactDetail,
  contactHistory,
}: InscricoesHistoricoModalProps) {
  return (
    <ModalCustom isOpen={isOpen} onClose={onClose} size="3xl" backdrop="blur">
      <ModalContentWrapper>
        <ModalHeader>
          <ModalTitle>Inscrições</ModalTitle>
          <ModalDescription>Capturas deste contato.</ModalDescription>
        </ModalHeader>

        <ModalBody className="max-h-[72vh] space-y-5 overflow-y-auto pr-1">
          {contactDetail && (
            <div className="pb-1">
              <div className="!text-sm font-semibold text-slate-950">
                {contactDetail.nome || "Sem nome informado"}
              </div>
              <div className="mt-1 !text-sm text-slate-500">
                {contactDetail.email ||
                  contactDetail.telefone ||
                  contactDetail.whatsapp ||
                  "Sem identificador principal"}
              </div>
            </div>
          )}

          {contactHistory.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 px-4 py-5 !text-sm text-slate-500">
              Nenhuma inscrição encontrada para este contato.
            </div>
          ) : null}

          {contactHistory.map((item, index) => {
            const primaryValue = item.email || item.telefone || item.whatsapp;
            const duplicateValues = new Set(
              [item.email, item.telefone, item.whatsapp, item.tag]
                .map(normalizeComparableValue)
                .filter(Boolean),
            );
            const payloadEntries = Object.entries(item.payload ?? {}).filter(
              ([, value]) => !duplicateValues.has(normalizeComparableValue(value)),
            );

            return (
              <section
                key={item.id}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="!mb-0 !text-sm font-semibold text-slate-950">
                      {item.popupNome || `Inscrição ${index + 1}`}
                    </h3>
                    <p className="mt-1 !text-sm text-slate-500">
                      {formatDate(item.criadoEm)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                  {primaryValue ? (
                    <div className="!text-sm text-slate-700">{primaryValue}</div>
                  ) : (
                    <div className="!text-sm text-slate-400">
                      Sem dado principal informado.
                    </div>
                  )}

                  {(item.origemPath || item.tag) && (
                    <div className="flex flex-wrap gap-2">
                      {item.origemPath ? (
                        <span className="rounded-full border border-slate-200 px-2.5 py-1 !text-xs text-slate-500">
                          {item.origemPath}
                        </span>
                      ) : null}
                      {item.tag ? (
                        <span className="rounded-full border border-slate-200 px-2.5 py-1 !text-xs text-slate-500">
                          {item.tag}
                        </span>
                      ) : null}
                    </div>
                  )}

                  {payloadEntries.length > 0 ? (
                    <div className="space-y-2">
                      {payloadEntries.map(([key, value]) => (
                        <div
                          key={key}
                          className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                        >
                          <span className="!text-xs text-slate-400">
                            {formatPayloadKey(key)}
                          </span>
                          <span className="break-words text-left !text-sm text-slate-600 sm:max-w-[70%] sm:text-right">
                            {renderPayloadValue(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </section>
            );
          })}
        </ModalBody>

        <ModalFooter>
          <ButtonCustom variant="outline" onClick={onClose}>
            Fechar
          </ButtonCustom>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}

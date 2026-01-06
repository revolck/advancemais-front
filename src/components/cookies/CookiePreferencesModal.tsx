"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ButtonCustom,
  Icon,
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/custom";
import { Switch } from "@/components/ui/switch";
import {
  type CookieConsentPreferencesDraft,
  useCookieConsent,
} from "./CookieConsentProvider";

function PreferenceRow({
  title,
  description,
  checked,
  disabled,
  onCheckedChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-gray-200 bg-white p-3">
      <div className="min-w-0">
        <p className="mb-1! text-sm! font-semibold! text-gray-900!">{title}</p>
        <p className="mb-0! text-xs! leading-relaxed! text-gray-600!">
          {description}
        </p>
      </div>
      <div className="pt-0.5">
        <Switch
          checked={checked}
          disabled={disabled}
          onCheckedChange={onCheckedChange}
          aria-label={title}
        />
      </div>
    </div>
  );
}

export function CookiePreferencesModal() {
  const {
    isPreferencesOpen,
    closePreferences,
    preferences,
    savePreferences,
  } = useCookieConsent();

  const [draft, setDraft] =
    useState<CookieConsentPreferencesDraft>(preferences);

  useEffect(() => {
    if (isPreferencesOpen) {
      setDraft(preferences);
    }
  }, [isPreferencesOpen, preferences]);

  const hasChanges =
    draft.functional !== preferences.functional ||
    draft.analytics !== preferences.analytics ||
    draft.marketing !== preferences.marketing;

  return (
    <ModalCustom
      isOpen={isPreferencesOpen}
      onClose={closePreferences}
      backdrop="blur"
      size="lg"
      classNames={{
        closeButton:
          "text-white hover:text-white focus-visible:ring-white/40 focus-visible:ring-offset-0",
      }}
    >
      <ModalContentWrapper className="p-0! gap-0! overflow-hidden">
        <ModalHeader className="bg-gradient-to-br from-[var(--primary-color)] via-[var(--primary-color)]/95 to-[var(--primary-color)]/85 px-5 py-4 space-y-2">
          <div className="flex items-start gap-4">
            <div className="mt-0.5 flex size-11 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/20 backdrop-blur-sm">
              <Icon name="Cookie" size={20} />
            </div>
            <div className="min-w-0">
              <ModalTitle className="pt-2! text-lg! font-semibold! text-white! leading-tight! mb-0!">
                Preferências de Cookies
              </ModalTitle>
              <ModalDescription className="text-sm! text-white/80! mb-0!">
                Escolha quais cookies opcionais podemos utilizar. Essenciais são
                sempre necessários.
              </ModalDescription>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <p className="mb-0! text-xs! text-white/70!">
              Cookies essenciais sempre ativos.
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setDraft({
                    functional: true,
                    analytics: true,
                    marketing: true,
                  })
                }
                className="text-xs! font-semibold! text-white/85 hover:text-white hover:underline underline-offset-4"
              >
                Marcar todos
              </button>
              <span className="text-white/30">•</span>
              <button
                type="button"
                onClick={() =>
                  setDraft({
                    functional: false,
                    analytics: false,
                    marketing: false,
                  })
                }
                className="text-xs! font-semibold! text-white/85 hover:text-white hover:underline underline-offset-4"
              >
                Somente essenciais
              </button>
            </div>
          </div>
        </ModalHeader>

        <ModalBody className="space-y-2 px-5 py-4">
          <PreferenceRow
            title="Essenciais"
            description="Necessários para o funcionamento do site e segurança."
            checked={true}
            disabled
          />

          <PreferenceRow
            title="Funcionais"
            description="Lembram preferências e ajudam a personalizar sua experiência."
            checked={draft.functional}
            onCheckedChange={(checked) =>
              setDraft((prev) => ({ ...prev, functional: checked }))
            }
          />

          <PreferenceRow
            title="Analíticos"
            description="Nos ajudam a entender o uso do site para melhorar performance e conteúdo."
            checked={draft.analytics}
            onCheckedChange={(checked) =>
              setDraft((prev) => ({ ...prev, analytics: checked }))
            }
          />

          <PreferenceRow
            title="Marketing"
            description="Usados para medir campanhas e exibir conteúdo mais relevante."
            checked={draft.marketing}
            onCheckedChange={(checked) =>
              setDraft((prev) => ({ ...prev, marketing: checked }))
            }
          />

          <p className="mb-0! pt-1 text-xs! text-gray-500!">
            Saiba mais em{" "}
            <Link
              href="/cookies"
              className="font-medium! text-[var(--primary-color)]! hover:underline"
            >
              Preferências de Cookies
            </Link>
            .
          </p>
        </ModalBody>

        <ModalFooter className="border-t border-gray-100 px-5 py-3 bg-gray-50/50 flex-row! items-center! justify-end! gap-2!">
          <ButtonCustom
            variant="ghost"
            size="sm"
            withAnimation={false}
            onClick={closePreferences}
          >
            Cancelar
          </ButtonCustom>
          <ButtonCustom
            variant="primary"
            size="sm"
            withAnimation={false}
            onClick={() => savePreferences(draft)}
            disabled={!hasChanges}
            className="px-4!"
          >
            Salvar
          </ButtonCustom>
        </ModalFooter>
      </ModalContentWrapper>
    </ModalCustom>
  );
}

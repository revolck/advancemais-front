"use client";

import React from "react";
import { Send, ShieldCheck } from "lucide-react";

import { getSandboxEmailRotinas, sendSandboxEmail } from "@/api/brevo";
import type {
  BrevoSandboxEmailRotina,
  BrevoSandboxEmailRotinaItem,
} from "@/api/brevo/types";
import { getUserProfile } from "@/api/usuarios";
import {
  ButtonCustom,
  InputCustom,
  SelectCustom,
} from "@/components/ui/custom";
import {
  ModalBody,
  ModalContentWrapper,
  ModalCustom,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/custom/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { toastCustom } from "@/components/ui/custom/toast";
import { useAuth } from "@/hooks/useAuth";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function errorMessageFor(error: unknown) {
  const code = (error as { details?: { code?: string } })?.details?.code;

  if (code === "INVALID_PASSWORD") return "Senha inválida.";
  if (code === "INSUFFICIENT_PERMISSIONS") {
    return "Apenas administradores podem enviar emails pelo sandbox.";
  }
  if (code === "INVALID_SANDBOX_ROUTINE") return "Rotina inválida.";
  if (code === "INVALID_EMAIL") return "Email de destino inválido.";
  if (code === "BREVO_DELIVERY_FAILED") {
    return "A Brevo recusou o envio. Verifique a configuração e tente novamente.";
  }

  return error instanceof Error
    ? error.message
    : "Não foi possível enviar o email de sandbox.";
}

export function SandboxEmailPanel() {
  const { user } = useAuth();
  const [rotinas, setRotinas] = React.useState<BrevoSandboxEmailRotinaItem[]>(
    [],
  );
  const [rotina, setRotina] = React.useState<BrevoSandboxEmailRotina | null>(
    null,
  );
  const [recipient, setRecipient] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [sending, setSending] = React.useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;

    async function loadRotinas() {
      setLoading(true);
      try {
        const response = await getSandboxEmailRotinas();
        if (!mounted) return;
        setRotinas(response.data);
        setRotina((current) => current ?? response.data[0]?.value ?? null);
      } catch (error) {
        if (!mounted) return;
        toastCustom.error({
          title: "Sandbox indisponível",
          description:
            error instanceof Error
              ? error.message
              : "Não foi possível carregar as rotinas.",
        });
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadRotinas();

    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    let mounted = true;

    async function loadProfileEmail() {
      try {
        const profile = await getUserProfile();
        if (!mounted || !profile.success || !("usuario" in profile)) return;
        setRecipient((current) =>
          !current || current === user?.email
            ? profile.usuario.email || ""
            : current,
        );
      } catch {
        if (!mounted) return;
        setRecipient((current) => current || user?.email || "");
      }
    }

    void loadProfileEmail();

    return () => {
      mounted = false;
    };
  }, [user?.email]);

  React.useEffect(() => {
    if (recipient) return;
    if (user?.email) setRecipient(user.email);
  }, [recipient, user?.email]);

  const selectedRotina = React.useMemo(
    () => rotinas.find((item) => item.value === rotina) ?? null,
    [rotina, rotinas],
  );

  const options = React.useMemo(
    () =>
      rotinas.map((item) => ({
        value: item.value,
        label: `${item.group} - ${item.label}`,
      })),
    [rotinas],
  );

  const openPasswordModal = () => {
    if (!rotina) {
      toastCustom.error({
        title: "Selecione uma rotina",
        description: "Escolha o template que deseja enviar.",
      });
      return;
    }

    if (!isValidEmail(recipient.trim())) {
      toastCustom.error({
        title: "Email inválido",
        description: "Informe um email de destino válido.",
      });
      return;
    }

    setPassword("");
    setPasswordModalOpen(true);
  };

  const closePasswordModal = () => {
    if (sending) return;
    setPassword("");
    setPasswordModalOpen(false);
  };

  const handleSend = async () => {
    if (!rotina) return;
    if (!password.trim()) {
      toastCustom.error({
        title: "Senha obrigatória",
        description: "Digite sua senha para confirmar o envio.",
      });
      return;
    }

    setSending(true);
    try {
      const response = await sendSandboxEmail({
        rotina,
        destinatarioEmail: recipient.trim(),
        senha: password,
      });

      if (!response.success) {
        throw new Error(response.message || "Envio não concluído.");
      }

      toastCustom.success({
        title: "Email enviado",
        description: `${selectedRotina?.label ?? rotina} enviado para ${
          response.data.recipient
        }.`,
      });
      setPassword("");
      setPasswordModalOpen(false);
    } catch (error) {
      toastCustom.error({
        title: "Erro no envio",
        description: errorMessageFor(error),
      });
    } finally {
      setSending(false);
      setPassword("");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-56" />
        <div className="space-y-6">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
        <div className="mt-10 flex justify-end border-t border-border pt-6">
          <Skeleton className="h-12 w-32" />
        </div>
      </div>
    );
  }

  return (
    <section className="flex flex-col">
      <div className="space-y-6">
        <SelectCustom
          mode="single"
          label="Rotina"
          value={rotina}
          onChange={(next) => setRotina(next as BrevoSandboxEmailRotina | null)}
          options={options}
          placeholder="Selecione a rotina"
          searchable
          required
        />

        <InputCustom
          label="E-mail de destino"
          type="email"
          value={recipient}
          onChange={(event) => setRecipient(event.target.value)}
          placeholder="nome@empresa.com"
          required
          className="h-12"
        />
      </div>

      {selectedRotina?.description ? (
        <p className="mt-4 text-sm text-muted-foreground">
          {selectedRotina.description}
        </p>
      ) : null}

      <footer className="mt-10 flex flex-wrap items-center justify-end gap-3 border-t border-border pt-6">
        <ButtonCustom
          type="button"
          variant="primary"
          size="md"
          onClick={openPasswordModal}
          disabled={!rotina || rotinas.length === 0}
          withAnimation={false}
          className="h-12"
        >
          <Send className="h-4 w-4" />
          Enviar
        </ButtonCustom>
      </footer>

      <ModalCustom
        isOpen={passwordModalOpen}
        onOpenChange={(open) => !open && closePasswordModal()}
        onClose={closePasswordModal}
        size="md"
        backdrop="blur"
      >
        <ModalContentWrapper>
          <ModalHeader className="space-y-2">
            <ModalTitle>Confirmar envio</ModalTitle>
          </ModalHeader>

          <ModalBody className="space-y-4 pt-1">
            <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Digite sua senha de administrador para enviar{" "}
                <strong>{selectedRotina?.label ?? rotina}</strong> para{" "}
                <strong>{recipient}</strong>.
              </span>
            </div>

            <InputCustom
              label="Senha"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Digite sua senha"
              autoComplete="current-password"
              required
              showPasswordToggle
              className="bg-white"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handleSend();
                }
              }}
            />
          </ModalBody>

          <ModalFooter className="pt-2">
            <div className="flex w-full justify-end gap-3">
              <ButtonCustom
                type="button"
                variant="outline"
                onClick={closePasswordModal}
                disabled={sending}
              >
                Cancelar
              </ButtonCustom>
              <ButtonCustom
                type="button"
                variant="primary"
                onClick={handleSend}
                isLoading={sending}
                loadingText="Enviando..."
              >
                Enviar
              </ButtonCustom>
            </div>
          </ModalFooter>
        </ModalContentWrapper>
      </ModalCustom>
    </section>
  );
}

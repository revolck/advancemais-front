// src/theme/website/components/checkout/hooks/useCheckoutData.ts

"use client";

import { useEffect, useState, useRef } from "react";
import { getUserProfile } from "@/api/usuarios";
import { getVisaoGeralEmpresa } from "@/api/empresas/dashboard";
import { formatCNPJ, formatCPF } from "../utils/formatters";
import type { PayerAddress } from "../components/PayerDataForm";

/**
 * Hook para carregar dados do usuário logado para o checkout.
 *
 * Usa apenas o endpoint /api/v1/usuarios/perfil que é acessível
 * para qualquer usuário autenticado, independente do role.
 *
 * Os dados da empresa (CNPJ, razão social) são obtidos através
 * do perfil do usuário, não de endpoints administrativos.
 */
export function useCheckoutData() {
  const [userId, setUserId] = useState<string | null>(null);
  const [payerEmail, setPayerEmail] = useState("");
  const [payerDocument, setPayerDocument] = useState("");
  const [documentType, setDocumentType] = useState<"CPF" | "CNPJ">("CNPJ");
  const [cardHolder, setCardHolder] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Estado do endereço para boleto
  const [payerAddress, setPayerAddress] = useState<PayerAddress>({
    zipCode: "",
    streetName: "",
    streetNumber: "",
    neighborhood: "",
    city: "",
    federalUnit: "",
  });

  // Ref para evitar chamadas duplicadas em StrictMode
  const hasFetched = useRef(false);

  function onlyDigits(value: unknown): string {
    if (value === null || value === undefined) return "";
    return String(value).replace(/\D/g, "");
  }

  function applyDocumentAutofill(type: "CPF" | "CNPJ", digits: string) {
    if (!digits) return;
    const expectedLength = type === "CPF" ? 11 : 14;
    if (digits.length !== expectedLength) return;

    setDocumentType(type);
    setPayerDocument(type === "CPF" ? formatCPF(digits) : formatCNPJ(digits));
  }

  // Busca dados do perfil do usuário logado
  useEffect(() => {
    if (hasFetched.current) return;

    const fetchUserProfile = async () => {
      try {
        const token = document.cookie
          .split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1];

        if (!token) {
          setIsLoading(false);
          return;
        }

        hasFetched.current = true;
        const profile = await getUserProfile(token);

        if (profile?.success && "usuario" in profile && profile.usuario) {
          const usuario = profile.usuario as any;
          const { id, email, nomeCompleto, role, tipoUsuario } = usuario;

          // Armazena o userId
          if (id) {
            setUserId(id);
          }

          // Preenche email
          if (email) {
            setPayerEmail((current) => current || email);
          }

          // Preenche nome no cartão
          if (nomeCompleto) {
            setCardHolder((current) => current || nomeCompleto.toUpperCase());
          }

          // Tenta obter CNPJ/CPF do perfil
          // O backend pode retornar esses campos dependendo do tipo de usuário
          const cnpjDigits = onlyDigits(
            usuario.cnpj ??
              usuario.documento ??
              usuario.documentoCnpj ??
              usuario.cnpjEmpresa ??
              usuario.empresa?.cnpj
          );
          const cpfDigits = onlyDigits(
            usuario.cpf ?? usuario.documentoCpf ?? usuario.cpfCnpj
          );
          const razaoSocial =
            usuario.razaoSocial || usuario.nomeEmpresa || usuario.empresa?.nome;

          // Se for empresa e tiver razão social, usa como nome no cartão
          if (role === "EMPRESA" && razaoSocial) {
            setCardHolder(razaoSocial.toUpperCase());
          }

          // Preenche documento (não sobrescreve se o usuário já digitou)
          if (!payerDocument) {
            const isCompany =
              role === "EMPRESA" || tipoUsuario === "PESSOA_JURIDICA";

            if (isCompany && cnpjDigits.length === 14) {
              applyDocumentAutofill("CNPJ", cnpjDigits);
            } else if (!isCompany && cpfDigits.length === 11) {
              applyDocumentAutofill("CPF", cpfDigits);
            } else if (cnpjDigits.length === 14) {
              applyDocumentAutofill("CNPJ", cnpjDigits);
            } else if (cpfDigits.length === 11) {
              applyDocumentAutofill("CPF", cpfDigits);
            } else if (isCompany) {
              // Fallback: tenta buscar dados da empresa (cnpj) no dashboard
              try {
                const visao = await getVisaoGeralEmpresa();
                const dashboardCnpjDigits = onlyDigits(
                  visao?.data?.empresa?.cnpj
                );
                if (dashboardCnpjDigits.length === 14) {
                  applyDocumentAutofill("CNPJ", dashboardCnpjDigits);
                }
              } catch {
                // não bloqueia o checkout
              }
            }
          }

          // Preenche endereço se disponível no perfil
          const primaryAddress =
            Array.isArray(usuario.enderecos) && usuario.enderecos.length > 0
              ? usuario.enderecos.find((e: any) => e?.principal) ||
                usuario.enderecos[0]
              : null;

          const cep = primaryAddress?.cep || usuario.cep;
          const logradouro = primaryAddress?.logradouro || usuario.logradouro;
          const numeroEndereco =
            primaryAddress?.numero ||
            primaryAddress?.streetNumber ||
            usuario.numeroEndereco;
          const bairro = primaryAddress?.bairro || usuario.bairro;
          const cidade = primaryAddress?.cidade || usuario.cidade;
          const estado = primaryAddress?.estado || usuario.estado;

          if (cep || logradouro || cidade) {
            setPayerAddress({
              zipCode: cep || "",
              streetName: logradouro || "",
              streetNumber: numeroEndereco || "",
              neighborhood: bairro || "",
              city: cidade || "",
              federalUnit: estado || "",
            });
          }
        }
      } catch (error) {
        console.warn("Erro ao carregar perfil do usuário:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [payerDocument]);

  return {
    userId,
    payerEmail,
    setPayerEmail,
    payerDocument,
    setPayerDocument,
    documentType,
    setDocumentType,
    cardHolder,
    setCardHolder,
    payerAddress,
    setPayerAddress,
    isLoading,
  };
}

// src/theme/website/components/checkout/hooks/useCheckoutData.ts

"use client";

import { useEffect, useState, useRef } from "react";
import { getUserProfile } from "@/api/usuarios";
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
          const { id, email, nomeCompleto, role } = usuario;

          // Armazena o userId
          if (id) {
            setUserId(id);
          }

          // Preenche email
          if (email) {
            setPayerEmail(email);
          }

          // Preenche nome no cartão
          if (nomeCompleto) {
            setCardHolder(nomeCompleto.toUpperCase());
          }

          // Tenta obter CNPJ/CPF do perfil
          // O backend pode retornar esses campos dependendo do tipo de usuário
          const cnpj = usuario.cnpj || usuario.documento;
          const cpf = usuario.cpf;
          const razaoSocial = usuario.razaoSocial || usuario.nomeEmpresa;

          // Se for empresa e tiver razão social, usa como nome no cartão
          if (role === "EMPRESA" && razaoSocial) {
            setCardHolder(razaoSocial.toUpperCase());
          }

          // Preenche documento
          if (cnpj && cnpj.length >= 14) {
            setDocumentType("CNPJ");
            setPayerDocument(formatCNPJ(cnpj.replace(/\D/g, "")));
          } else if (cpf && cpf.length >= 11) {
            setDocumentType("CPF");
            setPayerDocument(formatCPF(cpf.replace(/\D/g, "")));
          }

          // Preenche endereço se disponível no perfil
          const cep = usuario.cep;
          const logradouro = usuario.logradouro;
          const numeroEndereco = usuario.numeroEndereco;
          const bairro = usuario.bairro;
          const cidade = usuario.cidade;
          const estado = usuario.estado;

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
  }, []);

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

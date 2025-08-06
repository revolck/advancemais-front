// src/theme/website/components/contact-form-section/components/ContactForm.tsx

"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, CheckCircle } from "lucide-react";
import { formatCep, formatPhone } from "../utils";
import { useContactForm } from "../hooks/useContactForm";
import type { ContactSectionData, ContactSubmitApiResponse } from "../types";

interface ContactFormProps {
  config: ContactSectionData;
  onSuccess?: (data: ContactSubmitApiResponse) => void;
  onError?: (error: string) => void;
}

export const ContactForm: React.FC<ContactFormProps> = ({
  config,
  onSuccess,
  onError,
}) => {
  const { formState, updateField, handleCepChange, submitForm, resetForm } =
    useContactForm(onSuccess, onError);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitForm();
  };

  const handleCepChangeWithFormat = (value: string) => {
    const formatted = formatCep(value);
    handleCepChange(formatted);
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    updateField("phone", formatted);
  };

  // Se formulário foi enviado com sucesso
  if (formState.isSuccess) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Enviado com sucesso!
        </h3>
        <p className="text-gray-600 mb-6">
          {config.successMessage}
        </p>
        <Button onClick={resetForm} variant="outline" className="mx-auto">
          Enviar nova mensagem
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-8">
      {/* Título */}
      <h2 className="text-2xl font-bold text-center mb-2 text-gray-900">
        {config.title}
      </h2>
      <hr className="border-t-2 border-gray-900 w-12 mx-auto mb-6" />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Primeira linha - Nome e Nome da Empresa */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              placeholder="Seu Nome"
              value={formState.formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              className="bg-white border-gray-300"
              disabled={formState.isSubmitting}
            />
            {formState.errors.name && (
              <p className="text-red-500 text-sm mt-1">
                {formState.errors.name}
              </p>
            )}
          </div>
          <div>
            <Input
              placeholder="Nome da Empresa"
              value={formState.formData.companyName}
              onChange={(e) => updateField("companyName", e.target.value)}
              className="bg-white border-gray-300"
              disabled={formState.isSubmitting}
            />
            {formState.errors.companyName && (
              <p className="text-red-500 text-sm mt-1">
                {formState.errors.companyName}
              </p>
            )}
          </div>
        </div>

        {/* Segunda linha - Email e Telefone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={formState.formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              className="bg-white border-gray-300"
              disabled={formState.isSubmitting}
            />
            {formState.errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {formState.errors.email}
              </p>
            )}
          </div>
          <div>
            <Input
              type="tel"
              placeholder="Telefone"
              value={formState.formData.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className="bg-white border-gray-300"
              disabled={formState.isSubmitting}
            />
            {formState.errors.phone && (
              <p className="text-red-500 text-sm mt-1">
                {formState.errors.phone}
              </p>
            )}
          </div>
        </div>

        {/* Terceira linha - CEP */}
        <div>
          <Input
            placeholder="CEP"
            value={formState.formData.cep}
            onChange={(e) => handleCepChangeWithFormat(e.target.value)}
            className="bg-white border-gray-300"
            disabled={formState.isSubmitting}
            maxLength={9}
          />
          {formState.errors.cep && (
            <p className="text-red-500 text-sm mt-1">{formState.errors.cep}</p>
          )}
        </div>

        {/* Quarta linha - Endereço e Cidade */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              placeholder="Endereço"
              value={formState.formData.address}
              onChange={(e) => updateField("address", e.target.value)}
              className="bg-white border-gray-300"
              disabled={formState.isSubmitting || formState.fieldsDisabled}
            />
            {formState.errors.address && (
              <p className="text-red-500 text-sm mt-1">
                {formState.errors.address}
              </p>
            )}
          </div>
          <div>
            <Input
              placeholder="Cidade"
              value={formState.formData.city}
              onChange={(e) => updateField("city", e.target.value)}
              className="bg-white border-gray-300"
              disabled={formState.isSubmitting || formState.fieldsDisabled}
            />
            {formState.errors.city && (
              <p className="text-red-500 text-sm mt-1">
                {formState.errors.city}
              </p>
            )}
          </div>
        </div>

        {/* Quinta linha - Estado */}
        <div>
          <Input
            placeholder="Estado"
            value={formState.formData.state}
            onChange={(e) => updateField("state", e.target.value)}
            className="bg-white border-gray-300"
            disabled={formState.isSubmitting || formState.fieldsDisabled}
          />
          {formState.errors.state && (
            <p className="text-red-500 text-sm mt-1">
              {formState.errors.state}
            </p>
          )}
        </div>

        {/* Textarea */}
        <div>
          <Textarea
            placeholder="Tem algo mais para informar?"
            value={formState.formData.additionalInfo}
            onChange={(e) => updateField("additionalInfo", e.target.value)}
            className="bg-white border-gray-300 min-h-[100px]"
            disabled={formState.isSubmitting}
            rows={4}
          />
        </div>

        {/* Botão */}
        <div className="flex justify-center">
          <Button
            type="submit"
            size="lg"
            disabled={formState.isSubmitting}
            className="bg-red-600 hover:bg-red-700 text-white py-3 px-8 rounded-full text-lg font-bold flex items-center gap-2 min-w-[150px]"
          >
            {formState.isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                {config.buttonText}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

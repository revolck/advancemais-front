"use client";

import React from "react";
import { ToasterCustom, toastCustom } from "@/components/ui/custom/toast";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/custom/Icons";

/**
 * Componente demonstrativo dos novos toasts
 * Mostra exemplos de uso com diferentes variantes e opções
 */
export default function ToastShowcase() {
  // Função para mostrar exemplos específicos da imagem
  const showImageExamples = () => {
    // Exemplo 1: "Credits purchased successfully!"
    toastCustom.credits(
      "You've successfully added credits to your account. Start generating images with more customization."
    );

    // Demonstração sequencial dos toasts com delays para melhor visualização
    const delays = [1000, 2000, 3000, 4000];

    // Exemplo 2: "Image generated in 4 secs!"
    setTimeout(() => {
      toastCustom.imageGenerated(4);
    }, delays[0]);

    // Exemplo 3: "Delete conversation?"
    setTimeout(() => {
      toastCustom.confirmDelete(
        "Intergalactic Concepts",
        () => console.log("Deleted!"),
        () => console.log("Cancelled!"),
        {
          description:
            "Deleting Intergalactic Concepts will permanently remove the chat memory and it's associated data (32 images & 2 files) from the server. Are you sure you want to continue?",
        }
      );
    }, delays[1]);

    // Exemplo 4: "32 images archived"
    setTimeout(() => {
      toastCustom.withUndo("32 images archived", () =>
        console.log("Undo clicked!")
      );
    }, delays[2]);

    // Exemplo 5: "We've moved things around"
    setTimeout(() => {
      toastCustom.withLink(
        "With new features in the horizon, we're updating few things.",
        "See what's changed",
        "#",
        {
          title: "We've moved things around",
          icon: <Icon name="Bell" size={20} className="text-orange-500" />,
        }
      );
    }, delays[3]);
  };

  // Exemplos de uso de promise para demonstração
  const showPromiseExample = () => {
    // Simulação de um carregamento de dados
    const mockPromise = new Promise<string>((resolve, reject) => {
      // 50% chance de sucesso ou erro para demonstração
      setTimeout(() => {
        if (Math.random() > 0.5) {
          resolve("Dados carregados com sucesso!");
        } else {
          reject(new Error("Falha ao carregar dados"));
        }
      }, 2000);
    });

    // Usar o toast.promise para exibir status
    toastCustom.promise(mockPromise, {
      loading: {
        title: "Carregando dados",
        description: "Por favor, aguarde enquanto carregamos os dados...",
        icon: <Icon name="Loader" size={20} className="animate-spin" />,
      },
      success: (data) => ({
        title: "Sucesso!",
        description: data,
        icon: (
          <Icon name="CheckCircle" size={20} className="text-emerald-500" />
        ),
      }),
      error: (err) => ({
        title: "Erro",
        description:
          err instanceof Error ? err.message : "Ocorreu um erro desconhecido",
        icon: (
          <Icon name="AlertCircle" size={20} className="text-destructive" />
        ),
      }),
    });
  };

  // Configurações comuns para os toasts para evitar redundância
  const toastDuration = 5000;

  // Definição dos exemplos de toast para evitar código repetitivo
  const toastExamples = [
    {
      label: "Default",
      action: () =>
        toastCustom.default({
          title: "Default Toast",
          description: "This is a default toast message.",
          duration: toastDuration,
        }),
    },
    {
      label: "Success",
      action: () =>
        toastCustom.success({
          title: "Success!",
          description: "Your operation was completed successfully.",
          icon: (
            <Icon name="CheckCircle" size={20} className="text-emerald-500" />
          ),
          duration: toastDuration,
        }),
    },
    {
      label: "Error",
      action: () =>
        toastCustom.error({
          title: "Error!",
          description: "There was an error processing your request.",
          icon: (
            <Icon name="AlertCircle" size={20} className="text-destructive" />
          ),
          duration: toastDuration,
        }),
    },
    {
      label: "Warning",
      action: () =>
        toastCustom.warning({
          title: "Warning!",
          description: "This action might have consequences.",
          icon: (
            <Icon name="AlertTriangle" size={20} className="text-amber-500" />
          ),
          duration: toastDuration,
        }),
    },
    {
      label: "Info",
      action: () =>
        toastCustom.info({
          title: "Information",
          description: "Here's some information you might find useful.",
          icon: <Icon name="Info" size={20} className="text-blue-500" />,
          duration: toastDuration,
        }),
    },
  ];

  // Exemplos de opções customizadas
  const customOptions = [
    {
      label: "Compact",
      action: () =>
        toastCustom.info({
          title: "Compact Toast",
          description: "This is a compact toast with lower prominence.",
          density: "compact",
          prominence: "low",
          duration: toastDuration,
        }),
    },
    {
      label: "High Prominence",
      action: () =>
        toastCustom.success({
          title: "High Prominence",
          description: "This toast has high prominence for important messages.",
          prominence: "high",
          duration: toastDuration,
        }),
    },
    {
      label: "With Action",
      action: () =>
        toastCustom.action({
          title: "With Action",
          description: "This toast has an action button.",
          duration: toastDuration,
          action: (
            <toastCustom.ActionButton
              onClick={() => console.log("Action clicked!")}
            >
              Action
            </toastCustom.ActionButton>
          ),
        }),
    },
    {
      label: "With Link",
      action: () =>
        toastCustom.withLink(
          "This toast has a link that you can click.",
          "Click here",
          "#",
          {
            title: "With Link",
            duration: toastDuration,
          }
        ),
    },
    {
      label: "Promise Toast",
      action: showPromiseExample,
    },
  ];

  // Exemplos de variantes especiais
  const specialVariants = [
    {
      label: "Action Variant",
      action: () =>
        toastCustom.action({
          title: "Action Required",
          description: "Please complete this action to continue.",
          icon: (
            <Icon name="CreditCard" size={20} className="text-purple-500" />
          ),
          duration: toastDuration,
        }),
    },
    {
      label: "Confirmation Variant",
      action: () =>
        toastCustom.confirmation({
          title: "Confirm Action",
          description: "Are you sure you want to proceed with this action?",
          icon: <Icon name="Trash2" size={20} className="text-indigo-500" />,
          duration: toastDuration * 2, // Maior duração para confirmações
          action: (
            <toastCustom.ActionButton
              onClick={() => console.log("Confirmed!")}
              variant="destructive"
            >
              Confirm
            </toastCustom.ActionButton>
          ),
          cancelText: "Cancel",
          onCancel: () => console.log("Cancelled!"),
        }),
    },
    {
      label: "Status Variant",
      action: () =>
        toastCustom.status({
          title: "Status Update",
          description: "Your task has been updated to 'In Progress'.",
          icon: <Icon name="Archive" size={20} className="text-gray-500" />,
          duration: toastDuration,
        }),
    },
    {
      label: "Image Generated",
      action: () =>
        toastCustom.imageGenerated(3, {
          description: "Your image is ready to view in the gallery.",
          duration: toastDuration,
        }),
    },
  ];

  // Componente reutilizável para seções de botões
  const ButtonSection = ({
    title,
    examples,
  }: {
    title: string;
    examples: { label: string; action: () => void }[];
  }) => (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="flex flex-wrap gap-2">
        {examples.map((example) => (
          <Button
            key={example.label}
            variant="outline"
            onClick={example.action}
          >
            {example.label}
          </Button>
        ))}
      </div>
    </div>
  );

  // Retorna um conjunto de botões para testar os diferentes tipos de toast
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Toast System Examples</h1>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Examples from Image</h2>
        <Button onClick={showImageExamples}>Show Image Examples</Button>
      </div>

      <ButtonSection title="Toast Variants" examples={toastExamples} />
      <ButtonSection title="Custom Options" examples={customOptions} />
      <ButtonSection title="Special Variants" examples={specialVariants} />

      {/* Renderiza o componente ToasterCustom para exibir os toasts */}
      <ToasterCustom
        position="top-right"
        gap={8} // Valor numérico em pixels
        theme="system"
        closeButton={true}
        richColors={true}
        maxToasts={5}
        defaultDuration={toastDuration}
      />
    </div>
  );
}

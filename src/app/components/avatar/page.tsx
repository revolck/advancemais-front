"use client";

import React, { useState } from "react";
import { AvatarCustom } from "@/components/ui/custom/avatar";

export default function AvatarDemo() {
  const [showExamples, setShowExamples] = useState(false);

  const pessoas = [
    { nome: "João Feitosa Fernandes", foto: "/avatars/joao.jpg" },
    { nome: "Maria Silva Santos", foto: null },
    { nome: "Pedro Oliveira", foto: "/avatars/pedro.jpg" },
    { nome: "Ana Costa", foto: null },
    { nome: "Carlos Eduardo Lima", foto: null },
    { nome: "Fernanda Rodrigues", foto: "/avatars/fernanda.jpg" },
  ];

  return (
    <div className="container mx-auto p-8 space-y-12">
      <header className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Avatar Custom Component</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Avatar inteligente com iniciais automáticas e cores aleatórias
          consistentes
        </p>
      </header>

      {/* Tamanhos */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Tamanhos Disponíveis</h2>
        <div className="flex flex-wrap items-end gap-4">
          {["xs", "sm", "md", "lg", "xl", "2xl", "3xl"].map((size) => (
            <div key={size} className="text-center space-y-2">
              <AvatarCustom name="João Feitosa Fernandes" size={size as any} />
              <span className="text-sm text-muted-foreground uppercase">
                {size}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Exemplos com nomes reais */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Exemplos com Nomes Reais</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {pessoas.map((pessoa, index) => (
            <div key={index} className="text-center space-y-3">
              <AvatarCustom
                name={pessoa.nome}
                src={pessoa.foto || undefined}
                size="lg"
                showStatus
                status={
                  index % 4 === 0
                    ? "online"
                    : index % 4 === 1
                    ? "away"
                    : index % 4 === 2
                    ? "busy"
                    : "offline"
                }
              />
              <div>
                <p className="font-medium text-sm">{pessoa.nome}</p>
                <p className="text-xs text-muted-foreground">
                  {pessoa.foto ? "Com foto" : "Só iniciais"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Estados */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Estados e Variações</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center space-y-3">
            <AvatarCustom
              name="Pedro Santos"
              size="lg"
              clickable
              onClick={() => alert("Avatar clicado!")}
            />
            <p className="text-sm font-medium">Clicável</p>
          </div>

          <div className="text-center space-y-3">
            <AvatarCustom
              name="Ana Silva"
              size="lg"
              withBorder
              showStatus
              status="online"
            />
            <p className="text-sm font-medium">Com borda e status</p>
          </div>

          <div className="text-center space-y-3">
            <AvatarCustom name="Carlos Lima" size="lg" isLoading />
            <p className="text-sm font-medium">Carregando</p>
          </div>

          <div className="text-center space-y-3">
            <AvatarCustom
              name="Maria Fernandes"
              size="lg"
              fixedColor="bg-gradient-to-br from-purple-500 to-pink-500"
            />
            <p className="text-sm font-medium">Cor customizada</p>
          </div>
        </div>
      </section>

      {/* Status indicators */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Indicadores de Status</h2>
        <div className="flex flex-wrap gap-6">
          {["online", "offline", "away", "busy"].map((status) => (
            <div key={status} className="text-center space-y-3">
              <AvatarCustom
                name="Usuário Teste"
                size="lg"
                showStatus
                status={status as any}
              />
              <p className="text-sm capitalize">{status}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Código de exemplo */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Código de Exemplo</h2>

        <div className="bg-gray-50 rounded-lg p-6 overflow-x-auto">
          <pre className="text-sm">
            <code>{`// Avatar básico com iniciais
<AvatarCustom name="João Feitosa Fernandes" />

// Avatar com imagem
<AvatarCustom 
  name="Maria Silva"
  src="/avatar.jpg"
  size="lg"
/>

// Avatar com status
<AvatarCustom
  name="Pedro Santos"
  showStatus
  status="online"
  clickable
  onClick={() => openProfile()}
/>

// Avatar com borda
<AvatarCustom
  name="Ana Costa"
  size="xl"
  withBorder
  showStatus
  status="away"
/>`}</code>
          </pre>
        </div>
      </section>
    </div>
  );
}

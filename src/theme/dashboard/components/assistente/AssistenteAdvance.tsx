"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { AcaoAssistente, Conversa } from "./assistente.fluxos";

interface AssistenteAdvanceProps {
  aberto: boolean;
  conversa: Conversa;
  /** Destaca o robô (bolinha) quando há algo novo para a empresa */
  temNovidade: boolean;
  onAbrir: () => void;
  onFechar: () => void;
  onAcao: (acao: AcaoAssistente) => void;
}

/** Robô no canto da tela com as mensagens em forma de chat */
export function AssistenteAdvance({
  aberto,
  conversa,
  temNovidade,
  onAbrir,
  onFechar,
  onAcao,
}: AssistenteAdvanceProps) {
  // Mensagens aparecem uma a uma, como se o assistente estivesse digitando
  const [visiveis, setVisiveis] = useState(0);
  useEffect(() => {
    if (!aberto) {
      setVisiveis(0);
      return;
    }
    setVisiveis(1);
    const timers = conversa.mensagens
      .slice(1)
      .map((_, i) => setTimeout(() => setVisiveis(i + 2), 700 * (i + 1)));
    return () => timers.forEach(clearTimeout);
  }, [aberto, conversa]);

  const digitando = aberto && visiveis < conversa.mensagens.length;

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {aberto && (
          <motion.section
            role="dialog"
            aria-label="Assistente Advance+"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
          >
            <header className="flex items-center justify-between bg-[var(--primary-color)] px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-full bg-white/15">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <p className="!mb-0 !text-sm font-semibold leading-tight !text-white">
                    Assistente Advance+
                  </p>
                  <p className="!mb-0 !text-[11px] leading-tight !text-white/75">
                    {digitando ? "digitando..." : "online"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onFechar}
                aria-label="Fechar assistente"
                className="rounded-md p-1 text-white/80 hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="max-h-[50vh] space-y-2 overflow-y-auto bg-gray-50 px-4 py-4">
              {conversa.mensagens.slice(0, visiveis).map((mensagem, i) => (
                <motion.p
                  key={`${conversa.motivo}-${i}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="!mb-0 w-fit max-w-[90%] rounded-2xl rounded-tl-sm bg-white px-3 py-2 text-sm leading-relaxed text-gray-800 shadow-sm"
                >
                  {mensagem}
                </motion.p>
              ))}
              {digitando && (
                <div className="flex w-fit gap-1 rounded-2xl rounded-tl-sm bg-white px-3 py-3 shadow-sm">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="size-1.5 rounded-full bg-gray-400"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              )}
            </div>

            {!digitando && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col gap-2 border-t border-gray-100 bg-white p-3"
              >
                {conversa.botoes.map((botao) => (
                  <button
                    key={botao.acao}
                    type="button"
                    onClick={() => onAcao(botao.acao)}
                    className={cn(
                      "w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      botao.principal
                        ? "bg-[var(--primary-color)] text-white hover:opacity-90"
                        : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    {botao.rotulo}
                  </button>
                ))}
              </motion.div>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={aberto ? onFechar : onAbrir}
        aria-label={aberto ? "Fechar assistente" : "Abrir assistente Advance+"}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        animate={temNovidade && !aberto ? { y: [0, -6, 0] } : { y: 0 }}
        transition={temNovidade && !aberto ? { duration: 1.2, repeat: Infinity } : {}}
        className="relative flex size-14 items-center justify-center rounded-full bg-[var(--primary-color)] text-white shadow-xl ring-4 ring-white"
      >
        <Bot className="h-7 w-7" />
        {temNovidade && !aberto && (
          <span className="absolute right-0 top-0 size-3.5 rounded-full border-2 border-white bg-rose-500" />
        )}
      </motion.button>
    </div>
  );
}

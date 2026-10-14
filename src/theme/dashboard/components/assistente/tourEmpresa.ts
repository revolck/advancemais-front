"use client";

import { driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";

/** Passos do tour da empresa: menu lateral + notificações */
export const PASSOS_TOUR_EMPRESA: { alvo: string; titulo: string; texto: string }[] = [
  {
    alvo: '[data-tour="/dashboard"]',
    titulo: "Visão geral",
    texto: "Seu resumo: vagas publicadas, rascunhos e candidaturas recebidas.",
  },
  {
    alvo: '[data-tour="/dashboard/empresas/vagas"]',
    titulo: "Vagas",
    texto: "Crie, publique e acompanhe suas vagas. É por aqui que tudo começa!",
  },
  {
    alvo: '[data-tour="/dashboard/empresas/candidatos"]',
    titulo: "Candidatos",
    texto: "Veja quem se candidatou e avance cada pessoa nas etapas do processo seletivo.",
  },
  {
    alvo: '[data-tour="/dashboard/empresas/pagamentos"]',
    titulo: "Assinatura",
    texto: "Seu plano, seus pagamentos e o upgrade ficam aqui.",
  },
  {
    alvo: '[data-tour="/dashboard/agenda"]',
    titulo: "Agenda",
    texto: "Conecte o Google Agenda para marcar entrevistas já com link do Meet.",
  },
  {
    alvo: '[data-tour="/dashboard/empresas/entrevistas"]',
    titulo: "Entrevistas",
    texto: "Acompanhe todas as entrevistas agendadas em um só lugar.",
  },
  {
    alvo: '[data-tour="notificacoes"]',
    titulo: "Notificações",
    texto: "Novos candidatos e avisos do seu plano chegam por aqui.",
  },
];

/** Elemento existe e está visível (no celular o menu lateral fica escondido) */
function visivel(seletor: string) {
  const elemento = document.querySelector<HTMLElement>(seletor);
  if (!elemento) return false;
  const caixa = elemento.getBoundingClientRect();
  return caixa.width > 0 && caixa.height > 0;
}

/**
 * Inicia o tour. `aoTerminar(concluiu)`: true se passou por todos os passos,
 * false se fechou no meio.
 */
export function iniciarTourEmpresa(aoTerminar: (concluiu: boolean) => void) {
  const steps: DriveStep[] = PASSOS_TOUR_EMPRESA.map((passo) => ({
    // Sem o elemento visível, o passo aparece no centro da tela
    element: visivel(passo.alvo) ? passo.alvo : undefined,
    popover: { title: passo.titulo, description: passo.texto },
  }));

  let chegouAoFim = false;
  const tour = driver({
    showProgress: true,
    progressText: "{{current}} de {{total}}",
    nextBtnText: "Próximo",
    prevBtnText: "Voltar",
    doneBtnText: "Concluir",
    allowClose: true,
    overlayOpacity: 0.55,
    stagePadding: 6,
    stageRadius: 8,
    steps,
    onNextClick: () => {
      if (tour.isLastStep()) {
        chegouAoFim = true;
        tour.destroy();
        return;
      }
      tour.moveNext();
    },
    onDestroyed: () => aoTerminar(chegouAoFim),
  });
  tour.drive();
  return tour;
}

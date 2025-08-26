// src/theme/website/components/testimonials-carousel/constants/index.ts

import type { TestimonialData } from "../types";

export const DEFAULT_TESTIMONIALS_DATA: TestimonialData[] = [
  {
    id: "carolina-lemelle",
    name: "Carolina Lemelle",
    position: "Gerente de Gente e Gestão",
    company: "Empresa ABC",
    testimonial:
      "Para a contratação, precisávamos ser assertivos. Com o suporte da Advance+, realizamos contratações mais rápidas e eficazes, otimizando nosso processo.",
    imageUrl: "/images/testemonials/face_1.png",
    rating: 5,
    order: 1,
    isActive: true,
  },
  {
    id: "kaique-barboza",
    name: "Kaique Barboza",
    position: "Coordenador de Gente & Cultura",
    company: "Empresa XYZ",
    testimonial:
      "A Advance+ trouxe automação e inovação para nosso processo seletivo. Conseguimos reduzir o tempo de contratação e focar mais no desenvolvimento dos colaboradores.",
    imageUrl: "/images/testemonials/face_2.png",
    rating: 5,
    order: 2,
    isActive: true,
  },
  {
    id: "rodolfo-martins",
    name: "Rodolfo Martins",
    position: "Coordenador Administrativo",
    company: "Empresa 123",
    testimonial:
      "Com as soluções da Advance+, otimizamos os processos internos e conseguimos atingir resultados que antes pareciam impossíveis.",
    imageUrl: "/images/testemonials/face_3.png",
    rating: 5,
    order: 3,
    isActive: true,
  },
  {
    id: "camilla-souza",
    name: "Camilla Souza",
    position: "Coordenadora de RH",
    company: "Empresa DEF",
    testimonial:
      "Com a Advance+, otimizamos todo o ciclo de recrutamento e seleção. Um processo que durava 45 dias agora é concluído em apenas 15.",
    imageUrl: "/images/testemonials/face_4.png",
    rating: 5,
    order: 4,
    isActive: true,
  },
  {
    id: "ricardo-silva",
    name: "Ricardo Silva",
    position: "Diretor de Operações",
    company: "Empresa GHI",
    testimonial:
      "A parceria com a Advance+ transformou nossa forma de trabalhar. Processos que antes eram manuais agora são automatizados e muito mais eficientes.",
    imageUrl: "/images/testemonials/face_5.png",
    rating: 5,
    order: 5,
    isActive: true,
  },
];

export const TESTIMONIALS_CONFIG = {
  api: {
    endpoint: "/api/testimonials",
    timeout: 5000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  carousel: {
    autoplay: true,
    autoplayDelay: 5000,
    loop: true,
    itemsPerView: {
      mobile: 1,
      desktop: 3,
    },
  },
  image: {
    quality: 90,
    sizes: "56px",
  },
} as const;

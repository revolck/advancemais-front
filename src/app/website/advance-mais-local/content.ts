export const advanceMaisLocalSite = {
  name: "AdvanceMais Local",
  companyName: "Advance+",
  routePath: "/advance-mais-local",
  routeUrl: "https://advancemais.com/advance-mais-local",
  privacyPath: "/advance-mais-local/politica-privacidade",
  privacyUrl: "https://local.advancemais.com/politica-privacidade",
  canonicalUrl: "https://local.advancemais.com",
  dashboardUrl: "https://app.advancemais.com",
  supportEmail: "contato@advancemais.com",
  dpoEmail: "contato@advancemais.com",
  contactPhone: "(82) 3234-1397",
  whatsappPhone: "(82) 98882-5559",
  address:
    "Av. Juca Sampaio, 2247, sala 30, Condomínio Shopping Miramar, Feitosa, Maceió/AL, CEP 57042-530",
  updatedAt: "30/03/2026",
  heroDescription:
    "AdvanceMais Local é o aplicativo web oficial da Advance+ para operação de recrutamento, entrevistas, cursos, aulas e rotinas administrativas em um único ambiente.",
  purpose:
    "A plataforma é usada por equipes autorizadas para organizar vagas, acompanhar candidatos, administrar turmas, registrar agendas e automatizar compromissos com Google Calendar e Google Meet quando a integração é habilitada.",
  googleSummary:
    "O acesso OAuth do Google é utilizado exclusivamente para identificar a conta autorizada e executar ações operacionais aprovadas pelo usuário dentro do AdvanceMais Local.",
} as const;

export const appCapabilities = [
  {
    title: "Gestão operacional centralizada",
    description:
      "Concentra vagas, candidaturas, entrevistas, empresas, turmas, aulas e processos internos em um único painel web.",
  },
  {
    title: "Agenda e entrevistas online",
    description:
      "Permite marcar entrevistas e compromissos com data, horário, modalidade presencial ou online e acompanhamento da execução.",
  },
  {
    title: "Integração com Google",
    description:
      "Quando autorizada, a integração cria e atualiza eventos, agendas e links do Google Meet necessários para a rotina operacional do app.",
  },
] as const;

export const googleUseCases = [
  {
    title: "Identificar a conta conectada",
    description:
      "Validar qual conta Google foi autorizada para uso institucional dentro do AdvanceMais Local.",
  },
  {
    title: "Criar e atualizar eventos",
    description:
      "Registrar compromissos de entrevistas, aulas e outras agendas operacionais no Google Calendar.",
  },
  {
    title: "Gerar reuniões online",
    description:
      "Criar links do Google Meet vinculados aos eventos que exigem atendimento ou aula online.",
  },
  {
    title: "Manter a operação sincronizada",
    description:
      "Exibir o status da integração e preservar os dados mínimos necessários para continuidade da agenda autorizada pelo usuário.",
  },
] as const;

export const trustHighlights = [
  "Nome público consistente com o OAuth: AdvanceMais Local.",
  "Link visível para a política de privacidade da aplicação.",
  "Descrição objetiva da finalidade do app e do uso do Google OAuth.",
  "Contato público para suporte, LGPD e validação institucional.",
] as const;

export const policySections = [
  {
    title: "1. Dados tratados pelo AdvanceMais Local",
    paragraphs: [
      "Tratamos dados cadastrais e operacionais necessários para o funcionamento da plataforma, como nome, e-mail, perfil de acesso, empresa vinculada, vagas, candidaturas, entrevistas, agendas, turmas, aulas e registros administrativos gerados dentro do sistema.",
      "Quando a integração com Google é autorizada, o AdvanceMais Local pode tratar dados mínimos ligados à conta conectada e aos eventos operacionais, como e-mail da conta autorizada, identificadores técnicos, tokens de acesso, metadados de agenda e informações necessárias para criação, atualização ou cancelamento de eventos e reuniões.",
    ],
  },
  {
    title: "2. Finalidade do tratamento",
    paragraphs: [
      "Os dados são utilizados para autenticar usuários, liberar recursos de acordo com o perfil de acesso, organizar processos seletivos, administrar cursos e rotinas internas, além de viabilizar o agendamento institucional de entrevistas, aulas e compromissos.",
      "No contexto do Google OAuth, a finalidade é exclusivamente operacional: identificar a conta conectada, integrar o Google Calendar, gerar links do Google Meet e manter sincronizadas as agendas autorizadas dentro do app.",
    ],
  },
  {
    title: "3. Compartilhamento e bases legais",
    paragraphs: [
      "Os dados podem ser compartilhados com provedores de infraestrutura, autenticação, comunicação e pagamentos estritamente necessários para execução da plataforma, sempre observando contrato, obrigação legal, legítimo interesse e, quando cabível, consentimento.",
      "Dados vinculados à integração Google são tratados apenas para executar a funcionalidade autorizada pelo usuário e não são utilizados para publicidade ou revenda de informações.",
    ],
  },
  {
    title: "4. Segurança e retenção",
    paragraphs: [
      "Aplicamos controles de acesso, registros de auditoria, proteção de sessão, criptografia em trânsito e medidas administrativas compatíveis com a natureza da plataforma.",
      "Os dados são mantidos pelo período necessário para execução do serviço, cumprimento de obrigações legais, continuidade operacional e defesa de direitos, com descarte ou anonimização quando aplicável.",
    ],
  },
  {
    title: "5. Direitos do titular e contato",
    paragraphs: [
      "Você pode solicitar informações sobre tratamento, correção, atualização, portabilidade, eliminação de dados, oposição quando cabível e revogação de consentimentos pelos canais oficiais da Advance+.",
      "Para solicitações de privacidade e LGPD, utilize o e-mail contato@advancemais.com ou os canais públicos disponibilizados no site institucional.",
    ],
  },
] as const;

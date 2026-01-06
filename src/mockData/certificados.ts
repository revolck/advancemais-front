/**
 * Mock de modelos de certificado
 * Baseado no modelo padrão da Advance+
 */

export interface CertificadoTemplate {
  id: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
  configuracao: CertificadoConfiguracao;
}

export interface CertificadoConfiguracao {
  // Cabeçalho
  tituloEmpresa: string;
  logoUrl?: string;
  
  // Texto de certificação
  textoCertificacao: string;
  
  // Campos dinâmicos
  campos: {
    nomeAluno: {
      destaque: boolean;
      tamanhoFonte?: "normal" | "grande" | "extra-grande";
    };
    nomeCurso: {
      destaque: boolean;
      tamanhoFonte?: "normal" | "grande" | "extra-grande";
    };
    cargaHoraria: {
      exibir: boolean;
      label: string;
    };
    periodo: {
      exibir: boolean;
      label: string;
      formato: "completo" | "resumido";
    };
  };
  
  // Rodapé
  rodape: {
    cnpj: string;
    local: string;
    slogan: string;
  };
  
  // Conteúdo programático
  conteudoProgramatico: {
    exibir: boolean;
    titulo: string;
  };
  
  // Estilo
  estilo: {
    corPrimaria: string;
    corSecundaria: string;
    fonte: string;
  };
}

export interface CertificadoDados {
  alunoNome: string;
  cursoNome: string;
  cargaHoraria: number;
  dataInicio: string;
  dataFim: string;
  conteudoProgramatico: string[];
  turmaNome?: string;
  codigo?: string;
}

/**
 * Modelo padrão baseado no PDF fornecido
 */
export const MODELO_CERTIFICADO_PADRAO: CertificadoTemplate = {
  id: "modelo-padrao-001",
  nome: "Modelo Padrão Advance+",
  descricao: "Modelo padrão de certificado da Advance+",
  ativo: true,
  configuracao: {
    tituloEmpresa: "ADVANCE+",
    textoCertificacao: "Certificamos que o aluno (a)",
    campos: {
      nomeAluno: {
        destaque: true,
        tamanhoFonte: "extra-grande",
      },
      nomeCurso: {
        destaque: true,
        tamanhoFonte: "extra-grande",
      },
      cargaHoraria: {
        exibir: true,
        label: "Com uma carga horária de",
      },
      periodo: {
        exibir: true,
        label: "realizado no período de",
        formato: "completo",
      },
    },
    rodape: {
      cnpj: "25.089.257/0001-92",
      local: "Maceió-AL",
      slogan: "ADVANCE+ | Construindo o seu amanhã hoje!",
    },
    conteudoProgramatico: {
      exibir: true,
      titulo: "Conteúdo Programático:",
    },
    estilo: {
      corPrimaria: "#001a57",
      corSecundaria: "#002d8f",
      fonte: "Inter, sans-serif",
    },
  },
};

/**
 * Modelo alternativo (mais simples)
 */
export const MODELO_CERTIFICADO_SIMPLES: CertificadoTemplate = {
  id: "modelo-simples-001",
  nome: "Modelo Simples",
  descricao: "Modelo simplificado de certificado",
  ativo: true,
  configuracao: {
    tituloEmpresa: "ADVANCE+",
    textoCertificacao: "Certificamos que",
    campos: {
      nomeAluno: {
        destaque: true,
        tamanhoFonte: "grande",
      },
      nomeCurso: {
        destaque: true,
        tamanhoFonte: "grande",
      },
      cargaHoraria: {
        exibir: true,
        label: "Carga horária:",
      },
      periodo: {
        exibir: true,
        label: "Período:",
        formato: "resumido",
      },
    },
    rodape: {
      cnpj: "25.089.257/0001-92",
      local: "Maceió-AL",
      slogan: "ADVANCE+ | Construindo o seu amanhã hoje!",
    },
    conteudoProgramatico: {
      exibir: false,
      titulo: "Conteúdo Programático:",
    },
    estilo: {
      corPrimaria: "#001a57",
      corSecundaria: "#002d8f",
      fonte: "Inter, sans-serif",
    },
  },
};

/**
 * Lista de todos os modelos disponíveis
 */
export const MODELOS_CERTIFICADO: CertificadoTemplate[] = [
  MODELO_CERTIFICADO_PADRAO,
  MODELO_CERTIFICADO_SIMPLES,
];

/**
 * Função para obter um modelo por ID
 */
export function getModeloCertificado(
  modeloId: string
): CertificadoTemplate | undefined {
  return MODELOS_CERTIFICADO.find((modelo) => modelo.id === modeloId);
}

/**
 * Função para obter o modelo padrão
 */
export function getModeloPadrao(): CertificadoTemplate {
  return MODELO_CERTIFICADO_PADRAO;
}

/**
 * Dados de exemplo para geração de certificado
 * Baseado no exemplo do PDF
 */
export const EXEMPLO_DADOS_CERTIFICADO: CertificadoDados = {
  alunoNome: "DANILLO AUGUSTO MONTEIRO SILVA",
  cursoNome: "Espanhol Instrumental",
  cargaHoraria: 48,
  dataInicio: "2024-11-12",
  dataFim: "2025-06-03",
  turmaNome: "Turma A - Manhã",
  codigo: "CERT-2025-001",
  conteudoProgramatico: [
    "Introdução ao Espanhol para Hotelaria",
    "- Noções básicas de pronúncia e entonação",
    "- Vocabulário essencial (saudações, despedidas, apresentações)",
    "- Frases úteis no atendimento inicial ao hóspede",
    "Código de conduta e política da empresa",
    "- Diálogos no processo de check-in e check-out",
    "- Perguntas frequentes dos hóspedes",
    "- Informações sobre horários, reservas e serviços do hotel",
    "Serviços de quarto e atendimento ao cliente",
    "- Vocabulário sobre serviços de quarto, amenities e facilidades",
    "- Como lidar com pedidos e reclamações dos hóspedes",
    "- Frases para recomendações e sugestões de passeios e serviços",
    "Restaurante e serviços de alimentos",
    "- Vocabulário relacionado a cardápios, alimentos e bebidas",
    "- Atendimento em restaurantes, bares e cafés do hotel",
    "- Como descrever pratos, sugerir opções e lidar com pedidos especiais",
    "Situações de emergência e atendimento especial",
    "- Vocabulário e frases para emergências gerais",
    "- Como lidar com hóspedes com necessidades especiais",
    "- Expressões de cortesia e formalidade no atendimento",
  ],
};

/**
 * Função para formatar período de datas
 */
export function formatarPeriodo(
  dataInicio: string,
  dataFim: string,
  formato: "completo" | "resumido" = "completo"
): string {
  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);
  
  const formatarDataCompleta = (data: Date): string => {
    const meses = [
      "janeiro",
      "fevereiro",
      "março",
      "abril",
      "maio",
      "junho",
      "julho",
      "agosto",
      "setembro",
      "outubro",
      "novembro",
      "dezembro",
    ];
    return `${data.getDate()} de ${meses[data.getMonth()]} de ${data.getFullYear()}`;
  };
  
  if (formato === "completo") {
    return `${formatarDataCompleta(inicio)} a ${formatarDataCompleta(fim)}.`;
  } else {
    // Formato resumido: DD/MM/YYYY a DD/MM/YYYY
    const formatarDataResumida = (data: Date): string => {
      const dia = String(data.getDate()).padStart(2, "0");
      const mes = String(data.getMonth() + 1).padStart(2, "0");
      return `${dia}/${mes}/${data.getFullYear()}`;
    };
    return `${formatarDataResumida(inicio)} a ${formatarDataResumida(fim)}`;
  }
}

/**
 * Função para gerar HTML do certificado (para visualização/preview)
 */
export function gerarHtmlCertificado(
  modelo: CertificadoTemplate,
  dados: CertificadoDados
): string {
  const periodoFormatado = formatarPeriodo(
    dados.dataInicio,
    dados.dataFim,
    modelo.configuracao.campos.periodo.formato
  );
  
  const tamanhoFonteAluno =
    modelo.configuracao.campos.nomeAluno.tamanhoFonte === "extra-grande"
      ? "48px"
      : modelo.configuracao.campos.nomeAluno.tamanhoFonte === "grande"
      ? "36px"
      : "24px";
  
  const tamanhoFonteCurso =
    modelo.configuracao.campos.nomeCurso.tamanhoFonte === "extra-grande"
      ? "48px"
      : modelo.configuracao.campos.nomeCurso.tamanhoFonte === "grande"
      ? "36px"
      : "24px";
  
  const conteudoProgramaticoHtml = modelo.configuracao.conteudoProgramatico
    .exibir && dados.conteudoProgramatico.length > 0
    ? `
      <div style="margin-top: 40px; padding-top: 30px; border-top: 2px solid #e5e7eb;">
        <h2 style="font-size: 20px; font-weight: 700; color: ${modelo.configuracao.estilo.corPrimaria}; margin-bottom: 20px;">
          ${modelo.configuracao.conteudoProgramatico.titulo}
        </h2>
        <ul style="list-style: none; padding: 0; margin: 0;">
          ${dados.conteudoProgramatico
            .map(
              (item) => `
            <li style="margin-bottom: 8px; font-size: 14px; color: #374151; line-height: 1.6;">
              ${item}
            </li>
          `
            )
            .join("")}
        </ul>
      </div>
    `
    : "";
  
  return `
    <div style="
      width: 210mm;
      min-height: 297mm;
      background-color: #ffffff;
      color: #1f2937;
      font-family: ${modelo.configuracao.estilo.fonte};
      padding: 60px 50px;
      box-sizing: border-box;
      line-height: 1.6;
    ">
      <!-- Título da Empresa -->
      <div style="text-align: center; margin-bottom: 50px;">
        <h1 style="
          font-size: 42px;
          font-weight: 800;
          color: ${modelo.configuracao.estilo.corPrimaria};
          margin: 0;
          letter-spacing: 2px;
        ">
          ${modelo.configuracao.tituloEmpresa}
        </h1>
      </div>
      
      <!-- Texto de Certificação -->
      <div style="text-align: center; margin-bottom: 30px;">
        <p style="font-size: 18px; color: #374151; margin: 0;">
          ${modelo.configuracao.textoCertificacao}
        </p>
      </div>
      
      <!-- Nome do Aluno -->
      <div style="text-align: center; margin: 40px 0;">
        <h2 style="
          font-size: ${tamanhoFonteAluno};
          font-weight: 700;
          color: ${modelo.configuracao.estilo.corPrimaria};
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 1px;
        ">
          ${dados.alunoNome}
        </h2>
      </div>
      
      <!-- Texto do Curso -->
      <div style="text-align: center; margin-bottom: 30px;">
        <p style="font-size: 18px; color: #374151; margin: 0;">
          concluiu o treinamento de
        </p>
      </div>
      
      <!-- Nome do Curso -->
      <div style="text-align: center; margin: 40px 0;">
        <h2 style="
          font-size: ${tamanhoFonteCurso};
          font-weight: 700;
          color: ${modelo.configuracao.estilo.corPrimaria};
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 1px;
        ">
          ${dados.cursoNome}
        </h2>
      </div>
      
      <!-- Carga Horária -->
      ${modelo.configuracao.campos.cargaHoraria.exibir ? `
        <div style="text-align: center; margin: 30px 0;">
          <p style="font-size: 16px; color: #374151; margin: 0;">
            ${modelo.configuracao.campos.cargaHoraria.label} ${dados.cargaHoraria} horas
          </p>
        </div>
      ` : ""}
      
      <!-- Período -->
      ${modelo.configuracao.campos.periodo.exibir ? `
        <div style="text-align: center; margin: 30px 0;">
          <p style="font-size: 16px; color: #374151; margin: 0;">
            ${modelo.configuracao.campos.periodo.label}
          </p>
          <p style="font-size: 16px; color: #374151; margin: 10px 0 0 0;">
            ${periodoFormatado}
          </p>
        </div>
      ` : ""}
      
      ${conteudoProgramaticoHtml}
      
      <!-- Rodapé -->
      <div style="
        margin-top: 60px;
        padding-top: 30px;
        border-top: 1px solid #e5e7eb;
        text-align: center;
        font-size: 14px;
        color: #6b7280;
      ">
        <p style="margin: 5px 0;">
          CNPJ: ${modelo.configuracao.rodape.cnpj}
        </p>
        <p style="margin: 5px 0;">
          ${modelo.configuracao.rodape.local}
        </p>
        <p style="margin: 20px 0 0 0; font-weight: 600; color: ${modelo.configuracao.estilo.corPrimaria};">
          ${modelo.configuracao.rodape.slogan}
        </p>
      </div>
    </div>
  `;
}


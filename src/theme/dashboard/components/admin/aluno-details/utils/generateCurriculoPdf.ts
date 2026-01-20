import type { Curriculo } from "@/api/candidatos/types";
import type { UsuarioGenerico } from "@/api/usuarios/types";
import { formatTelefone, getAlunoInitials } from "./formatters";

type ContactItem = {
  icon: string;
  label: string;
  content: string;
  href: string;
  external?: boolean;
};

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildContactItems(
  email?: string,
  telefone?: string,
  socialLinks?: UsuarioGenerico["socialLinks"]
): ContactItem[] {
  const items: ContactItem[] = [];

  if (email) {
    items.push({
      icon: "✉",
      label: "Email",
      content: email,
      href: `mailto:${email}`,
    });
  }

  if (telefone) {
    items.push({
      icon: "📱",
      label: "Telefone",
      content: formatTelefone(telefone),
      href: `tel:${telefone}`,
    });
  }

  if (socialLinks?.linkedin) {
    items.push({
      icon: "💼",
      label: "LinkedIn",
      content: socialLinks.linkedin.replace(/https?:\/\/(www\.)?linkedin\.com\/in\//, ""),
      href: socialLinks.linkedin,
      external: true,
    });
  }

  return items;
}

function buildPdfPreferences(curriculo: Curriculo): string[] {
  const prefs: string[] = [];
  if (curriculo.areasInteresse?.primaria) {
    prefs.push(curriculo.areasInteresse.primaria);
  }
  if (curriculo.preferencias?.regime) {
    prefs.push(curriculo.preferencias.regime);
  }
  if (curriculo.preferencias?.local) {
    prefs.push(curriculo.preferencias.local);
  }
  return prefs;
}

function createPdfElement(
  curriculo: Curriculo,
  usuarioNome: string,
  avatarDisplay: string | null,
  initials: string,
  contactItems: ContactItem[],
  pdfPreferences: string[]
): HTMLDivElement {
  const container = document.createElement("div");
  container.style.cssText = `
    position: absolute;
    top: -10000px;
    left: -10000px;
    width: 210mm;
    background-color: #ffffff;
    color: #1f2937;
    font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
    line-height: 1.6;
    font-size: 13px;
  `;

  const formacaoArray: any[] = Array.isArray((curriculo as any)?.formacao)
    ? ((curriculo as any).formacao as any[])
    : [];

  const cursosCertificacoesFlat: Array<{
    titulo?: string;
    instituicao?: string;
    periodo?: string;
  }> = (() => {
    const raw: any = (curriculo as any)?.cursosCertificacoes;
    const cursos = Array.isArray(raw)
      ? raw
      : raw && typeof raw === "object" && Array.isArray(raw.cursos)
        ? raw.cursos
        : [];
    const certificacoes =
      raw && typeof raw === "object" && Array.isArray(raw.certificacoes)
        ? raw.certificacoes
        : [];

    const normalizePeriodo = (inicio?: any, fim?: any) => {
      const start = typeof inicio === "string" ? inicio : "";
      const end = typeof fim === "string" ? fim : "";
      if (!start && !end) return "";
      if (start && end) return `${start} → ${end}`;
      return start || end;
    };

    const mappedCursos = (cursos as any[]).map((c) => ({
      titulo:
        (typeof c?.titulo === "string" && c.titulo) ||
        (typeof c?.nome === "string" && c.nome) ||
        "",
      instituicao: (typeof c?.instituicao === "string" && c.instituicao) || "",
      periodo:
        (typeof c?.periodo === "string" && c.periodo) ||
        (typeof c?.dataConclusao === "string" && c.dataConclusao) ||
        "",
    }));

    const mappedCertificacoes = (certificacoes as any[]).map((c) => ({
      titulo:
        (typeof c?.titulo === "string" && c.titulo) ||
        (typeof c?.nome === "string" && c.nome) ||
        "",
      instituicao:
        (typeof c?.organizacao === "string" && c.organizacao) ||
        (typeof c?.instituicao === "string" && c.instituicao) ||
        "",
      periodo:
        (typeof c?.periodo === "string" && c.periodo) ||
        normalizePeriodo(c?.dataEmissao, c?.dataExpiracao) ||
        (typeof c?.dataEmissao === "string" && c.dataEmissao) ||
        "",
    }));

    return [...mappedCursos, ...mappedCertificacoes].filter(
      (i) => Boolean(i.titulo) || Boolean(i.instituicao) || Boolean(i.periodo)
    );
  })();

  const premiosPublicacoesFlat: Array<{ titulo?: string; descricao?: string }> =
    (() => {
      const raw: any = (curriculo as any)?.premiosPublicacoes;
      const premios = Array.isArray(raw)
        ? raw
        : raw && typeof raw === "object" && Array.isArray(raw.premios)
          ? raw.premios
          : [];
      const publicacoes =
        raw && typeof raw === "object" && Array.isArray(raw.publicacoes)
          ? raw.publicacoes
          : [];

      const mappedPremios = (premios as any[]).map((p) => ({
        titulo: (typeof p?.titulo === "string" && p.titulo) || "",
        descricao: (typeof p?.descricao === "string" && p.descricao) || "",
      }));

      const mappedPublicacoes = (publicacoes as any[]).map((p) => {
        const titulo = (typeof p?.titulo === "string" && p.titulo) || "";
        const parts = [
          typeof p?.tipo === "string" ? p.tipo : "",
          typeof p?.veiculo === "string" ? p.veiculo : "",
          typeof p?.data === "string" ? p.data : "",
        ].filter(Boolean);
        const descricaoBase = parts.join(" • ");
        const url = typeof p?.url === "string" ? p.url : "";
        const descricao = [descricaoBase, url].filter(Boolean).join(" • ");
        return { titulo, descricao };
      });

      return [...mappedPremios, ...mappedPublicacoes].filter(
        (i) => Boolean(i.titulo) || Boolean(i.descricao)
      );
    })();

  // ==================== HEADER COM BACKGROUND ELEGANTE ====================
  const header = document.createElement("div");
  header.style.cssText = `
    background: linear-gradient(135deg, #001a57 0%, #002d8f 100%);
    color: #ffffff;
    padding: 40px 48px;
    display: flex;
    gap: 28px;
    align-items: center;
    box-shadow: 0 4px 20px rgba(0, 26, 87, 0.15);
    page-break-inside: avoid;
  `;

  // Avatar
  const avatarContainer = document.createElement("div");
  avatarContainer.style.cssText = `
    min-width: 120px;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    overflow: hidden;
    background: linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%);
    color: #001a57;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 42px;
    font-weight: 700;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
    border: 5px solid rgba(255, 255, 255, 0.2);
  `;

  if (avatarDisplay) {
    const img = document.createElement("img");
    img.src = avatarDisplay;
    img.alt = usuarioNome;
    img.style.cssText = "width: 100%; height: 100%; object-fit: cover;";
    img.crossOrigin = "anonymous";
    avatarContainer.appendChild(img);
  } else {
    avatarContainer.textContent = initials;
  }

  // Info Container
  const infoContainer = document.createElement("div");
  infoContainer.style.flex = "1";

  const name = document.createElement("h1");
  name.style.cssText = `
    margin: 0 0 6px 0;
    font-size: 34px;
    font-weight: 800;
    letter-spacing: -0.5px;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  `;
  name.textContent = usuarioNome;
  infoContainer.appendChild(name);

  if (curriculo.titulo) {
    const title = document.createElement("p");
    title.style.cssText = `
      margin: 0 0 20px 0;
      font-size: 16px;
      color: #e0e7ff;
      font-weight: 500;
    `;
    title.textContent = curriculo.titulo;
    infoContainer.appendChild(title);
  }

  // Contact Info com ícones
  const contactContainer = document.createElement("div");
  contactContainer.style.cssText = `
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    margin-top: 16px;
  `;

  contactItems.forEach((item) => {
    const contactItem = document.createElement("div");
    contactItem.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: #ffffff;
      background: rgba(255, 255, 255, 0.15);
      padding: 6px 14px;
      border-radius: 20px;
      backdrop-filter: blur(10px);
    `;
    contactItem.innerHTML = `
      <span style="font-size: 16px;">${item.icon}</span>
      <span style="font-weight: 500;">${item.content}</span>
    `;
    contactContainer.appendChild(contactItem);
  });

  infoContainer.appendChild(contactContainer);
  header.appendChild(avatarContainer);
  header.appendChild(infoContainer);
  container.appendChild(header);

  // ==================== CONTENT ====================
  const content = document.createElement("div");
  content.style.cssText = `
    padding: 48px;
    display: flex;
    flex-direction: column;
    gap: 32px;
  `;

  // Helper para criar seção
  const createSection = (title: string, icon: string) => {
    const section = document.createElement("section");
    section.style.cssText = `
      page-break-inside: avoid;
      margin-bottom: 8px;
    `;

    const titleContainer = document.createElement("div");
    titleContainer.style.cssText = `
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 3px solid #001a57;
    `;

    const iconSpan = document.createElement("span");
    iconSpan.style.cssText = `
      font-size: 24px;
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #001a57 0%, #002d8f 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 26, 87, 0.2);
    `;
    iconSpan.textContent = icon;

    const h2 = document.createElement("h2");
    h2.style.cssText = `
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      color: #001a57;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    `;
    h2.textContent = title;

    titleContainer.appendChild(iconSpan);
    titleContainer.appendChild(h2);
    section.appendChild(titleContainer);

    return section;
  };

  // Objetivo
  if (curriculo.objetivo) {
    const section = createSection("Objetivo Profissional", "🎯");
    const box = document.createElement("div");
    box.style.cssText = `
      background: linear-gradient(135deg, #f8faff 0%, #eef2ff 100%);
      padding: 20px;
      border-radius: 12px;
      border-left: 4px solid #001a57;
      font-size: 14px;
      line-height: 1.8;
      color: #374151;
    `;
    box.textContent = curriculo.objetivo;
    section.appendChild(box);
    content.appendChild(section);
  }

  // Resumo
  if (curriculo.resumo) {
    const section = createSection("Sobre Mim", "👤");
    const box = document.createElement("div");
    box.style.cssText = `
      background: #ffffff;
      padding: 20px;
      border-radius: 12px;
      border: 2px solid #e5e7eb;
      font-size: 14px;
      line-height: 1.8;
      color: #374151;
    `;
    box.textContent = curriculo.resumo;
    section.appendChild(box);
    content.appendChild(section);
  }

  const experienciasArray: any[] = Array.isArray(curriculo.experiencias)
    ? curriculo.experiencias
    : (curriculo.experiencias as any)?.experiencias || [];

  // Experiências
  if (experienciasArray.length > 0) {
    const section = createSection("Experiência Profissional", "💼");
    const timeline = document.createElement("div");
    timeline.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 24px;
    `;

    experienciasArray.forEach((exp, index) => {
      const expItem = document.createElement("div");
      expItem.style.cssText = `
        position: relative;
        padding: 20px;
        background: ${index % 2 === 0 ? "#ffffff" : "#f9fafb"};
        border-radius: 12px;
        border: 1px solid #e5e7eb;
        page-break-inside: avoid;
        transition: all 0.3s ease;
      `;

      const headerDiv = document.createElement("div");
      headerDiv.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: start;
        margin-bottom: 8px;
      `;

      const leftHeader = document.createElement("div");
      leftHeader.style.flex = "1";

      const cargo = document.createElement("div");
      cargo.style.cssText = `
        font-size: 16px;
        font-weight: 700;
        color: #001a57;
        margin-bottom: 4px;
      `;
      cargo.textContent = exp.cargo || "Cargo não informado";
      leftHeader.appendChild(cargo);

      if (exp.empresa) {
        const empresa = document.createElement("div");
        empresa.style.cssText = `
          font-size: 14px;
          color: #6b7280;
          font-weight: 500;
        `;
        empresa.textContent = exp.empresa;
        leftHeader.appendChild(empresa);
      }

      const periodo = document.createElement("div");
      periodo.style.cssText = `
        font-size: 12px;
        color: #ffffff;
        background: linear-gradient(135deg, #001a57 0%, #002d8f 100%);
        padding: 6px 14px;
        border-radius: 20px;
        font-weight: 600;
        white-space: nowrap;
      `;
      periodo.textContent =
        exp.periodo ||
        `${exp.dataInicio || "—"}${
          exp.atual ? " • Atual" : exp.dataFim ? ` → ${exp.dataFim}` : ""
        }`;

      headerDiv.appendChild(leftHeader);
      headerDiv.appendChild(periodo);
      expItem.appendChild(headerDiv);

      if (exp.descricao) {
        const desc = document.createElement("div");
        desc.style.cssText = `
          margin-top: 12px;
          font-size: 13px;
          line-height: 1.7;
          color: #4b5563;
          padding-left: 12px;
          border-left: 3px solid #e0e7ff;
        `;
        desc.textContent = exp.descricao;
        expItem.appendChild(desc);
      }

      timeline.appendChild(expItem);
    });

    section.appendChild(timeline);
    content.appendChild(section);
  }

  // Formação
  if (formacaoArray.length > 0) {
    const section = createSection("Formação Acadêmica", "🎓");
    const formacaoList = document.createElement("div");
    formacaoList.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 20px;
    `;

    formacaoArray.forEach((form, index) => {
      const formItem = document.createElement("div");
      formItem.style.cssText = `
        padding: 20px;
        background: ${index % 2 === 0 ? "#f9fafb" : "#ffffff"};
        border-radius: 12px;
        border: 1px solid #e5e7eb;
        page-break-inside: avoid;
      `;

      const headerDiv = document.createElement("div");
      headerDiv.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: start;
        margin-bottom: 6px;
      `;

      const leftHeader = document.createElement("div");
      leftHeader.style.flex = "1";

      const curso = document.createElement("div");
      curso.style.cssText = `
        font-size: 16px;
        font-weight: 700;
        color: #001a57;
        margin-bottom: 4px;
      `;
      curso.textContent = form.curso || "Curso não informado";
      leftHeader.appendChild(curso);

      if (form.instituicao) {
        const instituicao = document.createElement("div");
        instituicao.style.cssText = `
          font-size: 14px;
          color: #6b7280;
          font-weight: 500;
        `;
        instituicao.textContent = form.instituicao;
        leftHeader.appendChild(instituicao);
      }

      const periodo = document.createElement("div");
      periodo.style.cssText = `
        font-size: 12px;
        color: #001a57;
        background: #e0e7ff;
        padding: 6px 14px;
        border-radius: 20px;
        font-weight: 600;
        white-space: nowrap;
      `;
      periodo.textContent =
        form.periodo ||
        `${form.dataInicio || "—"}${
          form.status === "EM_ANDAMENTO" || form.status === "CURSANDO"
            ? " • Em andamento"
            : form.dataFim
              ? ` → ${form.dataFim}`
              : ""
        }`;

      headerDiv.appendChild(leftHeader);
      headerDiv.appendChild(periodo);
      formItem.appendChild(headerDiv);

      if (form.descricao) {
        const desc = document.createElement("div");
        desc.style.cssText = `
          margin-top: 12px;
          font-size: 13px;
          line-height: 1.7;
          color: #4b5563;
        `;
        desc.textContent = form.descricao;
        formItem.appendChild(desc);
      }

      formacaoList.appendChild(formItem);
    });

    section.appendChild(formacaoList);
    content.appendChild(section);
  }

  // Cursos e Certificações
  if (cursosCertificacoesFlat.length > 0) {
    const section = createSection("Cursos & Certificações", "📜");
    const cursosList = document.createElement("div");
    cursosList.style.cssText = `
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    `;

    cursosCertificacoesFlat.forEach((curso) => {
      const cursoItem = document.createElement("div");
      cursoItem.style.cssText = `
        padding: 16px;
        background: #ffffff;
        border-radius: 10px;
        border: 1px solid #e5e7eb;
        page-break-inside: avoid;
      `;

      const titulo = document.createElement("div");
      titulo.style.cssText = `
        font-weight: 600;
        font-size: 13px;
        color: #001a57;
        margin-bottom: 6px;
      `;
      titulo.textContent = curso.titulo ?? "Curso";
      cursoItem.appendChild(titulo);

      if (curso.instituicao) {
        const instituicao = document.createElement("div");
        instituicao.style.cssText = `
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 4px;
        `;
        instituicao.textContent = curso.instituicao;
        cursoItem.appendChild(instituicao);
      }

      if (curso.periodo) {
        const periodo = document.createElement("div");
        periodo.style.cssText = `
          font-size: 11px;
          color: #9ca3af;
        `;
        periodo.textContent = curso.periodo;
        cursoItem.appendChild(periodo);
      }

      cursosList.appendChild(cursoItem);
    });

    section.appendChild(cursosList);
    content.appendChild(section);
  }

  // Habilidades Técnicas
  if (
    curriculo.habilidades?.tecnicas &&
    curriculo.habilidades.tecnicas.length > 0
  ) {
    const section = createSection("Habilidades Técnicas", "⚡");
    const skillsContainer = document.createElement("div");
    skillsContainer.style.cssText = `
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      page-break-inside: avoid;
    `;

    curriculo.habilidades.tecnicas.forEach((skill) => {
      const label =
        typeof skill === "string"
          ? skill
          : `${skill?.nome ?? "Habilidade"}${
              skill?.nivel ? ` • ${skill.nivel}` : ""
            }${
              typeof skill?.anosExperiencia === "number"
                ? ` • ${skill.anosExperiencia} ano(s)`
                : ""
            }`;
      const badge = document.createElement("span");
      badge.style.cssText = `
        display: inline-block;
        padding: 8px 16px;
        background: linear-gradient(135deg, #001a57 0%, #002d8f 100%);
        color: #ffffff;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        box-shadow: 0 2px 8px rgba(0, 26, 87, 0.2);
      `;
      badge.textContent = label;
      skillsContainer.appendChild(badge);
    });

    section.appendChild(skillsContainer);
    content.appendChild(section);
  }

  // Idiomas
  if (curriculo.idiomas && curriculo.idiomas.length > 0) {
    const section = createSection("Idiomas", "🌍");
    const idiomasGrid = document.createElement("div");
    idiomasGrid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
      page-break-inside: avoid;
    `;

    curriculo.idiomas.forEach((idioma) => {
      const idiomaItem = document.createElement("div");
      idiomaItem.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 14px 18px;
        background: #f9fafb;
        border-radius: 10px;
        border: 1px solid #e5e7eb;
      `;

      const lang = document.createElement("span");
      lang.style.cssText = `
        font-weight: 600;
        font-size: 14px;
        color: #1f2937;
      `;
      lang.textContent = idioma.idioma || "Idioma";

      const nivel = document.createElement("span");
      nivel.style.cssText = `
        font-size: 12px;
        color: #ffffff;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        padding: 4px 12px;
        border-radius: 12px;
        font-weight: 600;
      `;
      nivel.textContent = idioma.nivel || "Nível";

      idiomaItem.appendChild(lang);
      idiomaItem.appendChild(nivel);
      idiomasGrid.appendChild(idiomaItem);
    });

    section.appendChild(idiomasGrid);
    content.appendChild(section);
  }

  // Prêmios e Publicações
  if (premiosPublicacoesFlat.length > 0) {
    const section = createSection("Prêmios & Publicações", "🏆");
    const premiosList = document.createElement("div");
    premiosList.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 16px;
    `;

    premiosPublicacoesFlat.forEach((premio) => {
      const premioItem = document.createElement("div");
      premioItem.style.cssText = `
        padding: 16px;
        background: #fffbeb;
        border-radius: 10px;
        border-left: 4px solid #f59e0b;
        page-break-inside: avoid;
      `;

      if (premio.titulo) {
        const titulo = document.createElement("div");
        titulo.style.cssText = `
          font-weight: 600;
          font-size: 14px;
          color: #92400e;
          margin-bottom: 6px;
        `;
        titulo.textContent = premio.titulo;
        premioItem.appendChild(titulo);
      }

      if (premio.descricao) {
        const desc = document.createElement("div");
        desc.style.cssText = `
          font-size: 13px;
          line-height: 1.6;
          color: #78350f;
        `;
        desc.textContent = premio.descricao;
        premioItem.appendChild(desc);
      }

      premiosList.appendChild(premioItem);
    });

    section.appendChild(premiosList);
    content.appendChild(section);
  }

  // Preferências (se houver)
  if (pdfPreferences.length > 0) {
    const section = createSection("Preferências", "⚙️");
    const prefsContainer = document.createElement("div");
    prefsContainer.style.cssText = `
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      page-break-inside: avoid;
    `;

    pdfPreferences.forEach((pref) => {
      const badge = document.createElement("span");
      badge.style.cssText = `
        display: inline-block;
        padding: 8px 16px;
        background: #e0e7ff;
        color: #001a57;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
      `;
      badge.textContent = pref;
      prefsContainer.appendChild(badge);
    });

    section.appendChild(prefsContainer);
    content.appendChild(section);
  }

  container.appendChild(content);

  // Footer
  const footer = document.createElement("div");
  footer.style.cssText = `
    text-align: center;
    padding: 24px;
    color: #9ca3af;
    font-size: 11px;
    border-top: 1px solid #e5e7eb;
    margin-top: 32px;
  `;
  footer.textContent = `Currículo gerado via Advance+ • ${new Date().toLocaleDateString("pt-BR")}`;
  container.appendChild(footer);

  return container;
}

export async function generateCurriculoPdf(
  curriculo: Curriculo,
  usuarioNome: string,
  usuarioData?: UsuarioGenerico | null
): Promise<void> {
  try {
    const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
      import("html2canvas"),
      import("jspdf"),
    ]);

    // Preparar dados
    const avatarUrl = usuarioData?.avatarUrl;
    const email = usuarioData?.email;
    const telefone = usuarioData?.telefone || usuarioData?.celular;
    const socialLinks = usuarioData?.socialLinks;
    const initials = getAlunoInitials(usuarioNome);

    // Buscar avatar como dataUrl se existir
    let avatarDisplay: string | null = null;
    if (avatarUrl) {
      try {
        const response = await fetch(avatarUrl);
        const blob = await response.blob();
        avatarDisplay = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.warn("Erro ao carregar avatar para PDF:", error);
      }
    }

    const contactItems = buildContactItems(email, telefone, socialLinks);
    const pdfPreferences = buildPdfPreferences(curriculo);

    // Criar elemento temporário
    const pdfElement = createPdfElement(
      curriculo,
      usuarioNome,
      avatarDisplay,
      initials,
      contactItems,
      pdfPreferences
    );

    // Adicionar ao DOM temporariamente
    document.body.appendChild(pdfElement);

    // Aguardar renderização
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Gerar canvas com alta qualidade
    const canvas = await html2canvas(pdfElement, {
      scale: 2.5, // Maior qualidade
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      imageTimeout: 0,
    });

    // Remover elemento do DOM
    document.body.removeChild(pdfElement);

    // Configuração do PDF
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    // Adicionar páginas com quebra inteligente
    let heightLeft = imgHeight;
    let position = 0;
    let page = 0;

    while (heightLeft > 0) {
      if (page > 0) {
        pdf.addPage();
      }

      pdf.addImage(
        imgData,
        "JPEG",
        0,
        position,
        imgWidth,
        imgHeight,
        undefined,
        "FAST"
      );

      heightLeft -= pdfHeight;
      position -= pdfHeight;
      page++;
    }

    // Salvar com nome formatado
    const fileName =
      slugify(usuarioNome || "curriculo") || "curriculo-profissional";
    pdf.save(`${fileName}.pdf`);
  } catch (error) {
    console.error("Erro ao gerar PDF do currículo:", error);
    throw error;
  }
}

import type { Curriculo } from "@/api/candidatos/types";
import type { UsuarioGenerico } from "@/api/usuarios/types";
import { formatTelefone, getCandidatoInitials } from "./formatters";

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
      icon: "Mail",
      label: "Email",
      content: email,
      href: `mailto:${email}`,
    });
  }

  if (telefone) {
    items.push({
      icon: "Phone",
      label: "Telefone",
      content: formatTelefone(telefone),
      href: `tel:${telefone}`,
    });
  }

  if (socialLinks?.linkedin) {
    items.push({
      icon: "Linkedin",
      label: "LinkedIn",
      content: socialLinks.linkedin,
      href: socialLinks.linkedin,
      external: true,
    });
  }

  if (socialLinks?.instagram) {
    items.push({
      icon: "Instagram",
      label: "Instagram",
      content: socialLinks.instagram,
      href: socialLinks.instagram,
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
    width: 794px;
    padding: 48px;
    background-color: #ffffff;
    color: #1f2937;
    font-family: 'Nunito', Arial, sans-serif;
    line-height: 1.6;
  `;

  const header = document.createElement("div");
  header.style.cssText = `
    display: flex;
    gap: 24px;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 32px;
    align-items: center;
  `;

  const avatarContainer = document.createElement("div");
  avatarContainer.style.cssText = `
    width: 110px;
    height: 110px;
    border-radius: 16px;
    overflow: hidden;
    background-color: #001a57;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    font-weight: 700;
  `;

  if (avatarDisplay) {
    const img = document.createElement("img");
    img.src = avatarDisplay;
    img.alt = usuarioNome;
    img.style.cssText = "width: 100%; height: 100%; object-fit: cover;";
    avatarContainer.appendChild(img);
  } else {
    avatarContainer.textContent = initials;
  }

  const infoContainer = document.createElement("div");
  infoContainer.style.flex = "1";

  const name = document.createElement("h1");
  name.style.cssText = "margin: 0; font-size: 28px; font-weight: 700;";
  name.textContent = usuarioNome;

  infoContainer.appendChild(name);

  if (curriculo.titulo) {
    const title = document.createElement("p");
    title.style.cssText = "margin: 4px 0 16px; color: #6b7280;";
    title.textContent = curriculo.titulo;
    infoContainer.appendChild(title);
  }

  const contactContainer = document.createElement("div");
  contactContainer.style.cssText = `
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    font-size: 12px;
    color: #374151;
  `;

  contactItems.forEach((item) => {
    const span = document.createElement("span");
    span.style.cssText = "display: flex; gap: 4px; align-items: center;";
    span.innerHTML = `<strong>${item.label}:</strong> <span>${item.content}</span>`;
    contactContainer.appendChild(span);
  });

  infoContainer.appendChild(contactContainer);
  header.appendChild(avatarContainer);
  header.appendChild(infoContainer);
  container.appendChild(header);

  const content = document.createElement("div");
  content.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding-top: 24px;
  `;

  // Objetivo
  if (curriculo.objetivo) {
    const section = document.createElement("section");
    const h2 = document.createElement("h2");
    h2.style.cssText = "font-size: 12px; letter-spacing: 0.1em;";
    h2.textContent = "OBJETIVO";
    const p = document.createElement("p");
    p.style.marginTop = "8px";
    p.textContent = curriculo.objetivo;
    section.appendChild(h2);
    section.appendChild(p);
    content.appendChild(section);
  }

  // Resumo
  if (curriculo.resumo) {
    const section = document.createElement("section");
    const h2 = document.createElement("h2");
    h2.style.cssText = "font-size: 12px; letter-spacing: 0.1em;";
    h2.textContent = "SOBRE";
    const p = document.createElement("p");
    p.style.marginTop = "8px";
    p.textContent = curriculo.resumo;
    section.appendChild(h2);
    section.appendChild(p);
    content.appendChild(section);
  }

  // Preferências
  if (pdfPreferences.length > 0) {
    const section = document.createElement("section");
    const h2 = document.createElement("h2");
    h2.style.cssText = "font-size: 12px; letter-spacing: 0.1em;";
    h2.textContent = "PREFERÊNCIAS";
    const p = document.createElement("p");
    p.style.marginTop = "8px";
    p.textContent = pdfPreferences.join(" • ");
    section.appendChild(h2);
    section.appendChild(p);
    content.appendChild(section);
  }

  // Experiências
  if (curriculo.experiencias && curriculo.experiencias.length > 0) {
    const section = document.createElement("section");
    const h2 = document.createElement("h2");
    h2.style.cssText = "font-size: 12px; letter-spacing: 0.1em;";
    h2.textContent = "EXPERIÊNCIA";
    const div = document.createElement("div");
    div.style.cssText = `
      margin-top: 12px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    `;

    curriculo.experiencias.forEach((exp) => {
      const expDiv = document.createElement("div");
      const headerDiv = document.createElement("div");
      headerDiv.style.cssText = `
        display: flex;
        justify-content: space-between;
        font-weight: 600;
      `;
      const cargo = document.createElement("span");
      cargo.textContent = exp.cargo;
      const periodo = document.createElement("span");
      periodo.style.cssText = "font-size: 11px; color: #6b7280;";
      periodo.textContent = exp.periodo;
      headerDiv.appendChild(cargo);
      headerDiv.appendChild(periodo);
      expDiv.appendChild(headerDiv);

      if (exp.empresa) {
        const empresa = document.createElement("p");
        empresa.style.cssText = "margin: 2px 0; color: #6b7280;";
        empresa.textContent = exp.empresa;
        expDiv.appendChild(empresa);
      }

      if (exp.descricao) {
        const desc = document.createElement("p");
        desc.style.margin = "0";
        desc.textContent = exp.descricao;
        expDiv.appendChild(desc);
      }

      div.appendChild(expDiv);
    });

    section.appendChild(h2);
    section.appendChild(div);
    content.appendChild(section);
  }

  // Formação
  if (curriculo.formacao && curriculo.formacao.length > 0) {
    const section = document.createElement("section");
    const h2 = document.createElement("h2");
    h2.style.cssText = "font-size: 12px; letter-spacing: 0.1em;";
    h2.textContent = "FORMAÇÃO";
    const div = document.createElement("div");
    div.style.cssText = `
      margin-top: 12px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    `;

    curriculo.formacao.forEach((form) => {
      const formDiv = document.createElement("div");
      const headerDiv = document.createElement("div");
      headerDiv.style.cssText = `
        display: flex;
        justify-content: space-between;
        font-weight: 600;
      `;
      const curso = document.createElement("span");
      curso.textContent = form.curso;
      const periodo = document.createElement("span");
      periodo.style.cssText = "font-size: 11px; color: #6b7280;";
      periodo.textContent = form.periodo;
      headerDiv.appendChild(curso);
      headerDiv.appendChild(periodo);
      formDiv.appendChild(headerDiv);

      if (form.instituicao) {
        const instituicao = document.createElement("p");
        instituicao.style.cssText = "margin: 2px 0; color: #6b7280;";
        instituicao.textContent = form.instituicao;
        formDiv.appendChild(instituicao);
      }

      if (form.descricao) {
        const desc = document.createElement("p");
        desc.style.margin = "0";
        desc.textContent = form.descricao;
        formDiv.appendChild(desc);
      }

      div.appendChild(formDiv);
    });

    section.appendChild(h2);
    section.appendChild(div);
    content.appendChild(section);
  }

  // Cursos e Certificações
  if (
    curriculo.cursosCertificacoes &&
    curriculo.cursosCertificacoes.length > 0
  ) {
    const section = document.createElement("section");
    const h2 = document.createElement("h2");
    h2.style.cssText = "font-size: 12px; letter-spacing: 0.1em;";
    h2.textContent = "CURSOS E CERTIFICAÇÕES";
    const div = document.createElement("div");
    div.style.cssText = `
      margin-top: 12px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    `;

    curriculo.cursosCertificacoes.forEach((curso) => {
      const cursoDiv = document.createElement("div");
      const titulo = document.createElement("div");
      titulo.style.fontWeight = "600";
      titulo.textContent = curso.titulo;
      cursoDiv.appendChild(titulo);

      if (curso.instituicao) {
        const instituicao = document.createElement("p");
        instituicao.style.cssText = "margin: 2px 0; color: #6b7280;";
        instituicao.textContent = curso.instituicao;
        cursoDiv.appendChild(instituicao);
      }

      if (curso.periodo) {
        const periodo = document.createElement("p");
        periodo.style.cssText = "margin: 0; font-size: 12px; color: #6b7280;";
        periodo.textContent = curso.periodo;
        cursoDiv.appendChild(periodo);
      }

      div.appendChild(cursoDiv);
    });

    section.appendChild(h2);
    section.appendChild(div);
    content.appendChild(section);
  }

  // Habilidades Técnicas
  if (
    curriculo.habilidades?.tecnicas &&
    curriculo.habilidades.tecnicas.length > 0
  ) {
    const section = document.createElement("section");
    const h2 = document.createElement("h2");
    h2.style.cssText = "font-size: 12px; letter-spacing: 0.1em;";
    h2.textContent = "HABILIDADES TÉCNICAS";
    const p = document.createElement("p");
    p.style.marginTop = "8px";
    p.textContent = curriculo.habilidades.tecnicas.join(" • ");
    section.appendChild(h2);
    section.appendChild(p);
    content.appendChild(section);
}

  // Idiomas
  if (curriculo.idiomas && curriculo.idiomas.length > 0) {
    const section = document.createElement("section");
    const h2 = document.createElement("h2");
    h2.style.cssText = "font-size: 12px; letter-spacing: 0.1em;";
    h2.textContent = "IDIOMAS";
    const div = document.createElement("div");
    div.style.cssText = `
      margin-top: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    `;

    curriculo.idiomas.forEach((idioma) => {
      const langDiv = document.createElement("div");
      langDiv.style.cssText = `
        display: flex;
        justify-content: space-between;
        font-size: 13px;
      `;
      const lang = document.createElement("span");
      lang.textContent = idioma.idioma;
      const nivel = document.createElement("span");
      nivel.style.color = "#6b7280";
      nivel.textContent = idioma.nivel;
      langDiv.appendChild(lang);
      langDiv.appendChild(nivel);
      div.appendChild(langDiv);
    });

    section.appendChild(h2);
    section.appendChild(div);
    content.appendChild(section);
  }

  // Prêmios e Publicações
  if (
    curriculo.premiosPublicacoes &&
    curriculo.premiosPublicacoes.length > 0
  ) {
    const section = document.createElement("section");
    const h2 = document.createElement("h2");
    h2.style.cssText = "font-size: 12px; letter-spacing: 0.1em;";
    h2.textContent = "PRÊMIOS E PUBLICAÇÕES";
    const div = document.createElement("div");
    div.style.cssText = `
      margin-top: 12px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    `;

    curriculo.premiosPublicacoes.forEach((premio) => {
      const premioDiv = document.createElement("div");
      if (premio.titulo) {
        const titulo = document.createElement("p");
        titulo.style.cssText = "margin: 0; font-weight: 600;";
        titulo.textContent = premio.titulo;
        premioDiv.appendChild(titulo);
      }
      if (premio.descricao) {
        const desc = document.createElement("p");
        desc.style.cssText = "margin: 4px 0 0;";
        desc.textContent = premio.descricao;
        premioDiv.appendChild(desc);
      }
      div.appendChild(premioDiv);
    });

    section.appendChild(h2);
    section.appendChild(div);
    content.appendChild(section);
  }

  container.appendChild(content);
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
    const initials = getCandidatoInitials(usuarioNome);

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

    await new Promise((resolve) => requestAnimationFrame(resolve));

    // Gerar canvas
    const canvas = await html2canvas(pdfElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
    });

    // Remover elemento do DOM
    document.body.removeChild(pdfElement);

    // Gerar PDF
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "pt", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    const totalPages = Math.ceil(imgHeight / pdfHeight);

    for (let i = 0; i < totalPages; i++) {
      if (i > 0) {
        pdf.addPage();
      }

      const positionY = -i * pdfHeight;

      pdf.addImage(
        imgData,
        "PNG",
        0,
        positionY,
        imgWidth,
        imgHeight,
        undefined,
        "FAST"
      );
    }

    const fileName =
      slugify(usuarioNome || "curriculo") || "curriculo-profissional";
    pdf.save(`${fileName}.pdf`);
  } catch (error) {
    console.error("Erro ao gerar PDF do currículo:", error);
    throw error;
  }
}


import type { Curriculo } from "@/api/candidatos/types";
import type { UsuarioGenerico } from "@/api/usuarios/types";

type ContactItem = {
  label: string;
  value: string;
};

type UnknownRecord = Record<string, any>;

type TimelineItem = {
  title: string;
  subtitle?: string;
  period?: string;
  description?: string;
};

const COLORS = {
  navy: "#06245f",
  blue: "#174ea6",
  gold: "#d99a22",
  ink: "#111827",
  muted: "#64748b",
  softText: "#475569",
  card: "#f8fafc",
  softBlue: "#edf4ff",
  border: "#dbe3ef",
  white: "#ffffff",
};

const PAGE = {
  marginX: 17,
  top: 16,
  bottom: 18,
};

function asRecord(value: unknown): UnknownRecord | null {
  return value && typeof value === "object" ? (value as UnknownRecord) : null;
}

function asArray(value: unknown): UnknownRecord[] {
  if (Array.isArray(value)) return value as UnknownRecord[];
  return [];
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatTelefone(telefone?: string | null): string {
  if (!telefone) return "";
  const digits = telefone.replace(/\D/g, "");

  if (digits.length === 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }

  if (digits.length === 11) {
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }

  return telefone;
}

function getInitials(nome: string): string {
  if (!nome) return "CV";

  const words = nome.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "CV";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

function formatDate(value: unknown): string {
  const raw = text(value);
  if (!raw) return "";

  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`;

  return raw;
}

function formatPeriod(item: UnknownRecord): string {
  const periodo = text(item.periodo);
  if (periodo) return periodo.replace(/\s*→\s*/g, " - ");

  const start = formatDate(
    item.dataInicio ?? item.inicio ?? item.iniciadoEm ?? item.dataEmissao,
  );
  const end = item.atual
    ? "Atual"
    : formatDate(
        item.dataFim ?? item.fim ?? item.finalizadoEm ?? item.dataExpiracao,
      );

  if (start && end) return `${start} - ${end}`;
  return start || end;
}

function buildContactItems(usuarioData?: UsuarioGenerico | null): ContactItem[] {
  const items: ContactItem[] = [];
  const email = text(usuarioData?.email);
  const telefone = formatTelefone(usuarioData?.telefone || usuarioData?.celular);
  const location = [text(usuarioData?.cidade), text(usuarioData?.estado)]
    .filter(Boolean)
    .join(", ");
  const linkedin = text(usuarioData?.socialLinks?.linkedin).replace(
    /^https?:\/\/(www\.)?linkedin\.com\/in\//,
    "",
  );

  if (email) items.push({ label: "Email", value: email });
  if (telefone) items.push({ label: "Telefone", value: telefone });
  if (location) items.push({ label: "Local", value: location });
  if (linkedin) items.push({ label: "LinkedIn", value: linkedin });

  return items;
}

function buildPdfPreferences(curriculo: Curriculo): string[] {
  return [
    text(curriculo.areasInteresse?.primaria),
    text(curriculo.preferencias?.regime),
    text(curriculo.preferencias?.local),
  ].filter(Boolean);
}

function flattenExperiencias(curriculo: Curriculo): TimelineItem[] {
  const raw = Array.isArray(curriculo.experiencias)
    ? curriculo.experiencias
    : asArray(asRecord(curriculo.experiencias)?.experiencias);

  return raw
    .map((item) => ({
      title: text(item.cargo) || text(item.titulo) || "Cargo não informado",
      subtitle: text(item.empresa) || text(item.organizacao),
      period: formatPeriod(item),
      description: text(item.descricao),
    }))
    .filter((item) => item.title || item.subtitle || item.description);
}

function flattenFormacao(curriculo: Curriculo): TimelineItem[] {
  return asArray((curriculo as UnknownRecord).formacao)
    .map((item) => ({
      title:
        text(item.curso) ||
        text(item.nome) ||
        text(item.titulo) ||
        "Curso não informado",
      subtitle: text(item.instituicao),
      period:
        formatPeriod(item) ||
        (item.status === "EM_ANDAMENTO" || item.status === "CURSANDO"
          ? "Em andamento"
          : ""),
      description: text(item.descricao),
    }))
    .filter((item) => item.title || item.subtitle || item.description);
}

function flattenCursosCertificacoes(curriculo: Curriculo): TimelineItem[] {
  const raw = (curriculo as UnknownRecord).cursosCertificacoes;
  const record = asRecord(raw);
  const cursos = Array.isArray(raw) ? asArray(raw) : asArray(record?.cursos);
  const certificacoes = asArray(record?.certificacoes);

  return [...cursos, ...certificacoes]
    .map((item) => ({
      title: text(item.titulo) || text(item.nome) || "Curso",
      subtitle:
        text(item.instituicao) ||
        text(item.organizacao) ||
        text(item.emissor),
      period:
        text(item.periodo) ||
        formatDate(item.dataConclusao) ||
        formatPeriod(item),
      description: text(item.descricao),
    }))
    .filter((item) => item.title || item.subtitle || item.description);
}

function flattenPremiosPublicacoes(curriculo: Curriculo): TimelineItem[] {
  const raw = (curriculo as UnknownRecord).premiosPublicacoes;
  const record = asRecord(raw);
  const premios = Array.isArray(raw) ? asArray(raw) : asArray(record?.premios);
  const publicacoes = asArray(record?.publicacoes);

  const mappedPremios = premios.map((item) => ({
    title: text(item.titulo) || "Reconhecimento",
    subtitle: text(item.organizacao),
    period: formatDate(item.data),
    description: text(item.descricao),
  }));

  const mappedPublicacoes = publicacoes.map((item) => ({
    title: text(item.titulo) || "Publicação",
    subtitle: [text(item.tipo), text(item.veiculo)].filter(Boolean).join(" • "),
    period: formatDate(item.data),
    description: [text(item.descricao), text(item.url)].filter(Boolean).join(" • "),
  }));

  return [...mappedPremios, ...mappedPublicacoes].filter(
    (item) => item.title || item.subtitle || item.description,
  );
}

function flattenSkills(curriculo: Curriculo): string[] {
  const tecnicas = Array.isArray(curriculo.habilidades?.tecnicas)
    ? curriculo.habilidades.tecnicas
    : [];
  const comportamentais = Array.isArray(curriculo.habilidades?.comportamentais)
    ? curriculo.habilidades.comportamentais
    : [];

  return [...tecnicas, ...comportamentais]
    .map((skill) => {
      if (typeof skill === "string") return skill.trim();
      const record = asRecord(skill);
      if (!record) return "";

      return [
        text(record.nome) || "Habilidade",
        text(record.nivel),
        typeof record.anosExperiencia === "number"
          ? `${record.anosExperiencia} ano(s)`
          : "",
      ]
        .filter(Boolean)
        .join(" • ");
    })
    .filter(Boolean);
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace("#", "");
  return [
    parseInt(normalized.slice(0, 2), 16),
    parseInt(normalized.slice(2, 4), 16),
    parseInt(normalized.slice(4, 6), 16),
  ];
}

function setFill(pdf: any, color: string) {
  pdf.setFillColor(...hexToRgb(color));
}

function setDraw(pdf: any, color: string) {
  pdf.setDrawColor(...hexToRgb(color));
}

function setText(pdf: any, color: string) {
  pdf.setTextColor(...hexToRgb(color));
}

function lineHeight(fontSize: number, factor = 1.35): number {
  return fontSize * 0.352778 * factor;
}

function drawWrappedText(
  pdf: any,
  lines: string[],
  x: number,
  startY: number,
  fontSize: number,
  maxLines?: number,
): number {
  const visibleLines = maxLines ? lines.slice(0, maxLines) : lines;
  const lh = lineHeight(fontSize);

  visibleLines.forEach((line, index) => {
    pdf.text(line, x, startY + index * lh);
  });

  return startY + visibleLines.length * lh;
}

async function loadAvatarDataUrl(url?: string | null): Promise<string | null> {
  if (!url) return null;

  try {
    const response = await fetch(url);
    const blob = await response.blob();

    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn("Erro ao carregar avatar para PDF:", error);
    return null;
  }
}

function getImageFormat(dataUrl: string): "PNG" | "JPEG" | "WEBP" {
  if (dataUrl.startsWith("data:image/png")) return "PNG";
  if (dataUrl.startsWith("data:image/webp")) return "WEBP";
  return "JPEG";
}

export async function generateCurriculoPdf(
  curriculo: Curriculo,
  usuarioNome: string,
  usuarioData?: UsuarioGenerico | null,
): Promise<void> {
  try {
    const { default: jsPDF } = await import("jspdf");
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const contentWidth = pageWidth - PAGE.marginX * 2;
    const avatarDataUrl = await loadAvatarDataUrl(usuarioData?.avatarUrl);
    const contactItems = buildContactItems(usuarioData);
    const preferences = buildPdfPreferences(curriculo);
    const experiencias = flattenExperiencias(curriculo);
    const formacoes = flattenFormacao(curriculo);
    const cursos = flattenCursosCertificacoes(curriculo);
    const premios = flattenPremiosPublicacoes(curriculo);
    const skills = flattenSkills(curriculo);
    const idiomas = Array.isArray(curriculo.idiomas) ? curriculo.idiomas : [];

    let y = 0;

    const drawFooter = (page: number, total: number) => {
      setDraw(pdf, COLORS.border);
      pdf.setLineWidth(0.2);
      pdf.line(PAGE.marginX, pageHeight - 12, pageWidth - PAGE.marginX, pageHeight - 12);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      setText(pdf, COLORS.muted);
      pdf.text("Advance+ Currículos", PAGE.marginX, pageHeight - 7);
      pdf.text(
        `${page}/${total}`,
        pageWidth - PAGE.marginX,
        pageHeight - 7,
        { align: "right" },
      );
    };

    const drawContinuationHeader = () => {
      setFill(pdf, COLORS.navy);
      pdf.rect(0, 0, pageWidth, 10, "F");
      setFill(pdf, COLORS.gold);
      pdf.rect(0, 10, pageWidth, 1.2, "F");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8.5);
      setText(pdf, COLORS.white);
      pdf.text(usuarioNome || "Currículo", PAGE.marginX, 6.5);
      y = PAGE.top + 2;
    };

    const addPage = () => {
      pdf.addPage();
      drawContinuationHeader();
    };

    const ensureSpace = (height: number) => {
      if (y + height > pageHeight - PAGE.bottom) {
        addPage();
      }
    };

    const split = (value: string, width: number, fontSize: number, style = "normal") => {
      pdf.setFont("helvetica", style);
      pdf.setFontSize(fontSize);
      return pdf.splitTextToSize(value, width) as string[];
    };

    const drawCoverHeader = () => {
      const headerHeight = 52;
      const avatarSize = 24;
      const avatarX = PAGE.marginX;
      const avatarY = 13;
      const textX = avatarX + avatarSize + 12;
      const textWidth = pageWidth - textX - PAGE.marginX;

      setFill(pdf, COLORS.navy);
      pdf.rect(0, 0, pageWidth, headerHeight, "F");
      setFill(pdf, COLORS.gold);
      pdf.rect(0, headerHeight - 1.2, pageWidth, 1.2, "F");

      setFill(pdf, COLORS.white);
      setDraw(pdf, COLORS.white);
      pdf.roundedRect(avatarX, avatarY, avatarSize, avatarSize, 6, 6, "FD");

      if (avatarDataUrl) {
        try {
          pdf.addImage(
            avatarDataUrl,
            getImageFormat(avatarDataUrl),
            avatarX + 1,
            avatarY + 1,
            avatarSize - 2,
            avatarSize - 2,
          );
        } catch {
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(15);
          setText(pdf, COLORS.navy);
          pdf.text(getInitials(usuarioNome), avatarX + avatarSize / 2, avatarY + 15.5, {
            align: "center",
          });
        }
      } else {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(15);
        setText(pdf, COLORS.navy);
        pdf.text(getInitials(usuarioNome), avatarX + avatarSize / 2, avatarY + 15.5, {
          align: "center",
        });
      }

      const nameLines = split(usuarioNome || "Currículo", textWidth, 19, "bold").slice(0, 2);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(nameLines.length > 1 ? 17 : 19);
      setText(pdf, COLORS.white);
      drawWrappedText(pdf, nameLines, textX, 20.5, nameLines.length > 1 ? 17 : 19);

      const titleY = 27.5 + (nameLines.length - 1) * 6.5;
      const title = text(curriculo.titulo) || "Currículo profissional";
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.8);
      setText(pdf, "#dbeafe");
      pdf.text(title, textX, titleY);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.6);
      setText(pdf, "#bfdbfe");

      const contactText = contactItems
        .map((item) => `${item.label}: ${item.value}`)
        .join("   |   ");
      const contactLines = contactText
        ? (pdf.splitTextToSize(contactText, textWidth) as string[]).slice(0, 2)
        : [];
      drawWrappedText(pdf, contactLines, textX, titleY + 7, 7.6);

      y = headerHeight + 10;
    };

    const drawSectionTitle = (title: string, minHeight = 18) => {
      ensureSpace(14 + minHeight);
      setFill(pdf, COLORS.gold);
      pdf.roundedRect(PAGE.marginX, y, 2.5, 9, 1.2, 1.2, "F");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11.5);
      setText(pdf, COLORS.navy);
      const sectionTitle = title.toUpperCase();
      const titleX = PAGE.marginX + 6;
      pdf.text(sectionTitle, titleX, y + 7);
      setDraw(pdf, COLORS.border);
      pdf.setLineWidth(0.35);
      const lineStart = titleX + pdf.getTextWidth(sectionTitle) + 5;
      if (lineStart < pageWidth - PAGE.marginX) {
        pdf.line(lineStart, y + 5.2, pageWidth - PAGE.marginX, y + 5.2);
      }
      y += 15;
    };

    const drawTextPanel = (value: string, fill = COLORS.card) => {
      const fontSize = 10;
      const lines = split(value, contentWidth - 11, fontSize);
      const panelHeight = Math.max(17, lines.length * lineHeight(fontSize) + 10);

      ensureSpace(panelHeight + 4);
      setFill(pdf, fill);
      setDraw(pdf, COLORS.border);
      pdf.setLineWidth(0.25);
      pdf.roundedRect(PAGE.marginX, y, contentWidth, panelHeight, 3, 3, "FD");
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(fontSize);
      setText(pdf, COLORS.softText);
      drawWrappedText(pdf, lines, PAGE.marginX + 5.5, y + 8.2, fontSize);
      y += panelHeight + 8;
    };

    const measureTimelineCard = (item: TimelineItem): number => {
      const periodWidth = item.period ? Math.min(pdf.getTextWidth(item.period) + 9, 45) : 0;
      const titleWidth = contentWidth - 13 - (periodWidth ? periodWidth + 8 : 0);
      const titleLines = split(item.title, Math.max(60, titleWidth), 11, "bold");
      const descriptionLines = item.description
        ? split(item.description, contentWidth - 18, 9.2)
        : [];
      return (
        11 +
        titleLines.length * lineHeight(11) +
        (item.subtitle ? 5.3 : 0) +
        (descriptionLines.length > 0 ? descriptionLines.length * lineHeight(9.2) + 7 : 0) +
        7
      );
    };

    const drawTimelineCard = (item: TimelineItem, index: number) => {
      const cardHeight = measureTimelineCard(item);
      ensureSpace(cardHeight + 5);

      const cardX = PAGE.marginX;
      const cardY = y;
      setFill(pdf, index % 2 === 0 ? COLORS.white : COLORS.card);
      setDraw(pdf, COLORS.border);
      pdf.setLineWidth(0.25);
      pdf.roundedRect(cardX, cardY, contentWidth, cardHeight, 3, 3, "FD");

      setFill(pdf, index % 2 === 0 ? COLORS.softBlue : COLORS.white);
      pdf.roundedRect(cardX + 3.5, cardY + 4, 2.2, cardHeight - 8, 1, 1, "F");

      const period = item.period || "";
      let periodWidth = 0;
      if (period) {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(8);
        periodWidth = Math.min(pdf.getTextWidth(period) + 8, 44);
      }

      const contentX = cardX + 9;
      const titleWidth = contentWidth - 13 - (periodWidth ? periodWidth + 8 : 0);
      const titleLines = split(item.title, Math.max(60, titleWidth), 11, "bold");

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      setText(pdf, COLORS.navy);
      let textY = cardY + 10;
      textY = drawWrappedText(pdf, titleLines, contentX, textY, 11);

      if (period) {
        const periodX = cardX + contentWidth - periodWidth - 5;
        setFill(pdf, COLORS.navy);
        pdf.roundedRect(periodX, cardY + 5, periodWidth, 7.5, 3.75, 3.75, "F");
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(7.8);
        setText(pdf, COLORS.white);
        pdf.text(period, periodX + periodWidth / 2, cardY + 10, { align: "center" });
      }

      if (item.subtitle) {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9.4);
        setText(pdf, COLORS.muted);
        pdf.text(item.subtitle, contentX, textY + 1);
        textY += 5.4;
      }

      if (item.description) {
        const descriptionLines = split(item.description, contentWidth - 18, 9.2);
        setDraw(pdf, "#c7d7f2");
        pdf.setLineWidth(0.6);
        pdf.line(contentX, textY + 3, contentX, textY + descriptionLines.length * lineHeight(9.2) + 2);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(9.2);
        setText(pdf, COLORS.softText);
        drawWrappedText(pdf, descriptionLines, contentX + 4, textY + 5.3, 9.2);
      }

      y += cardHeight + 6;
    };

    const drawTimelineSection = (title: string, items: TimelineItem[]) => {
      if (items.length === 0) return;

      drawSectionTitle(title, Math.min(measureTimelineCard(items[0]), 38));
      items.forEach((item, index) => drawTimelineCard(item, index));
      y += 2;
    };

    const drawChipCloud = (title: string, values: string[], variant: "primary" | "soft") => {
      if (values.length === 0) return;

      drawSectionTitle(title, 16);
      const chipHeight = 7.8;
      const gap = 3.2;
      let chipX = PAGE.marginX;

      ensureSpace(chipHeight + 4);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);

      values.forEach((value) => {
        const chipWidth = Math.min(pdf.getTextWidth(value) + 8, contentWidth);
        if (chipX + chipWidth > pageWidth - PAGE.marginX) {
          chipX = PAGE.marginX;
          y += chipHeight + gap;
          ensureSpace(chipHeight + 4);
        }

        setFill(pdf, variant === "primary" ? COLORS.navy : COLORS.softBlue);
        setDraw(pdf, variant === "primary" ? COLORS.navy : COLORS.border);
        pdf.roundedRect(chipX, y, chipWidth, chipHeight, 3.9, 3.9, "FD");
        setText(pdf, variant === "primary" ? COLORS.white : COLORS.navy);
        pdf.text(value, chipX + 4, y + 5.2);
        chipX += chipWidth + gap;
      });

      y += chipHeight + 10;
    };

    const drawIdiomas = () => {
      if (idiomas.length === 0) return;

      drawSectionTitle("Idiomas", 16);
      const colGap = 5;
      const colWidth = (contentWidth - colGap) / 2;
      const rowHeight = 12;
      let col = 0;

      idiomas.forEach((idioma) => {
        if (col === 0) ensureSpace(rowHeight + 4);
        const x = PAGE.marginX + col * (colWidth + colGap);
        const currentY = y;

        setFill(pdf, COLORS.card);
        setDraw(pdf, COLORS.border);
        pdf.roundedRect(x, currentY, colWidth, rowHeight, 2.5, 2.5, "FD");
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9.2);
        setText(pdf, COLORS.ink);
        pdf.text(text(idioma.idioma) || "Idioma", x + 4, currentY + 7.5);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8.2);
        setText(pdf, COLORS.muted);
        pdf.text(text(idioma.nivel) || "Nível", x + colWidth - 4, currentY + 7.5, {
          align: "right",
        });

        col += 1;
        if (col === 2) {
          col = 0;
          y += rowHeight + 4;
        }
      });

      if (col !== 0) y += rowHeight + 4;
      y += 4;
    };

    drawCoverHeader();

    if (curriculo.objetivo) {
      drawSectionTitle("Objetivo profissional", 22);
      drawTextPanel(curriculo.objetivo, COLORS.softBlue);
    }

    if (curriculo.resumo) {
      drawSectionTitle("Sobre mim", 22);
      drawTextPanel(curriculo.resumo, COLORS.white);
    }

    drawTimelineSection("Experiência profissional", experiencias);
    drawTimelineSection("Formação acadêmica", formacoes);
    drawTimelineSection("Cursos e certificações", cursos);
    drawChipCloud("Habilidades", skills, "primary");
    drawIdiomas();
    drawTimelineSection("Prêmios e publicações", premios);
    drawChipCloud("Preferências", preferences, "soft");

    const totalPages = pdf.getNumberOfPages();
    for (let page = 1; page <= totalPages; page += 1) {
      pdf.setPage(page);
      drawFooter(page, totalPages);
    }

    const fileName = slugify(usuarioNome || "curriculo") || "curriculo-profissional";
    pdf.save(`${fileName}.pdf`);
  } catch (error) {
    console.error("Erro ao gerar PDF do currículo:", error);
    throw error;
  }
}

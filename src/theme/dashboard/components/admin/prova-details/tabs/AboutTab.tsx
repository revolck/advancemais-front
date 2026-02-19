"use client";

import type { TurmaProva } from "@/api/cursos";

interface AboutTabProps {
  prova: TurmaProva;
}

/* ── helpers ─────────────────────────────────────────── */

const fmtDate = (v?: string) => {
  if (!v) return null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
};

const fmtHour = (v?: string) => (v ? v.slice(0, 5) : null);

const fmtTipoAtividade = (p: TurmaProva) => {
  if (p.tipo !== "ATIVIDADE") return null;
  if (p.tipoAtividade === "QUESTOES") return "Questões";
  if (p.tipoAtividade === "PERGUNTA_RESPOSTA" || p.tipoAtividade === "TEXTO")
    return "Pergunta e resposta";
  return null;
};

const fmtModalidade = (m?: TurmaProva["modalidade"]) => {
  const map: Record<string, string> = {
    AO_VIVO: "Ao vivo",
    ONLINE: "Online",
    PRESENCIAL: "Presencial",
    SEMIPRESENCIAL: "Semipresencial",
  };
  return m ? map[m] ?? null : null;
};

const fmtEscopo = (loc?: string) => {
  if (loc === "TURMA") return "Avulso na turma";
  if (loc === "MODULO") return "Vinculado a módulo";
  return null;
};

const getCurso = (p: TurmaProva) => {
  if (p.cursoNome) return p.cursoNome;
  if (typeof p.curso === "string" && p.curso.trim()) return p.curso;
  if (p.curso && typeof p.curso === "object")
    return p.curso.nome || p.curso.codigo || null;
  return p.cursoId ? String(p.cursoId) : null;
};

const getTurma = (p: TurmaProva) => {
  if (p.turmaNome) return p.turmaNome;
  if (typeof p.turma === "string" && p.turma.trim()) return p.turma;
  if (p.turma && typeof p.turma === "object")
    return p.turma.nome || p.turma.codigo || null;
  return p.turmaId || null;
};

const getInstrutor = (p: TurmaProva) => {
  if (typeof p.instrutor === "string" && p.instrutor.trim()) return p.instrutor;
  if (p.instrutor && typeof p.instrutor === "object")
    return p.instrutor.nome || p.instrutor.email || null;
  return p.instrutorId || null;
};

/* ── SVG illustration ────────────────────────────────── */

function Illustration({ isProva }: { isProva: boolean }) {
  return (
    <svg
      viewBox="0 0 200 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto"
      aria-hidden="true"
    >
      {/* bg */}
      <circle cx="100" cy="110" r="88" fill="#f8fafc" />
      <circle
        cx="100"
        cy="110"
        r="72"
        fill="none"
        stroke="#f1f5f9"
        strokeWidth="1"
        strokeDasharray="5 5"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 100 110"
          to="360 100 110"
          dur="60s"
          repeatCount="indefinite"
        />
      </circle>

      {/* document */}
      <rect x="62" y="58" width="64" height="82" rx="6" fill="white" stroke="#e2e8f0" strokeWidth="1.5" />
      <path d="M108 58h18v18h-18z" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="1" />
      <path d="M108 58l18 18" stroke="#e2e8f0" strokeWidth="1" />

      {/* text lines */}
      <rect x="73" y="82" width="38" height="3.5" rx="1.75" fill="#e2e8f0" />
      <rect x="73" y="92" width="28" height="3.5" rx="1.75" fill="#f1f5f9" />
      <rect x="73" y="102" width="34" height="3.5" rx="1.75" fill="#e2e8f0" />
      <rect x="73" y="112" width="22" height="3.5" rx="1.75" fill="#f1f5f9" />

      {isProva ? (
        <>
          <circle cx="104" cy="126" r="11" fill="#ecfdf5" stroke="#6ee7b7" strokeWidth="1.5" />
          <path
            d="M99 126l3 3 6-6"
            stroke="#059669"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      ) : (
        <>
          <circle cx="104" cy="126" r="11" fill="#eff6ff" stroke="#93c5fd" strokeWidth="1.5" />
          <path
            d="M100 129l.8-4.2 5.4-5.4 3.4 3.4-5.4 5.4z"
            fill="#bfdbfe"
            stroke="#3b82f6"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </>
      )}

      {/* floating particles */}
      <circle cx="148" cy="56" r="5" fill="#ddd6fe">
        <animate attributeName="cy" values="56;48;56" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="42" cy="80" r="4" fill="#bbf7d0">
        <animate attributeName="cy" values="80;72;80" dur="4s" repeatCount="indefinite" />
      </circle>
      <circle cx="160" cy="130" r="6" fill="#fde68a">
        <animate attributeName="cy" values="130;120;130" dur="3.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="36" cy="145" r="4.5" fill="#bfdbfe">
        <animate attributeName="cy" values="145;137;145" dur="2.8s" repeatCount="indefinite" />
      </circle>
      <circle cx="155" cy="170" r="3.5" fill="#fecdd3">
        <animate attributeName="cy" values="170;164;170" dur="3.8s" repeatCount="indefinite" />
      </circle>

      {/* decorative shapes */}
      <rect x="145" y="88" width="9" height="9" rx="2.5" fill="#fce7f3" transform="rotate(15 149 92)">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="4s" repeatCount="indefinite" />
      </rect>
      <rect x="44" y="50" width="7" height="7" rx="2" fill="#e0e7ff" transform="rotate(-12 47 53)">
        <animate attributeName="opacity" values="0.3;0.9;0.3" dur="3.2s" repeatCount="indefinite" />
      </rect>
      <circle cx="50" cy="170" r="3" fill="#d1fae5">
        <animate attributeName="r" values="3;4.5;3" dur="3s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

/* ── sub-components ──────────────────────────────────── */

function Chip({ label, value, color = "slate" }: { label: string; value: string; color?: string }) {
  const colors: Record<string, string> = {
    slate: "bg-slate-100 text-slate-700",
    blue: "bg-blue-50 text-blue-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    purple: "bg-purple-50 text-purple-700",
    rose: "bg-rose-50 text-rose-700",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 ${colors[color] ?? colors.slate}`}>
      <span className="text-[10px]! font-medium! opacity-60!">{label}</span>
      <span className="text-xs! font-semibold!">{value}</span>
    </span>
  );
}

function PropRow({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5 border-b border-dashed border-slate-100 last:border-0">
      <span className="text-xs! font-medium! text-slate-400! shrink-0">{label}</span>
      <span className={`text-sm! font-semibold! text-right! wrap-break-word! min-w-0 ${accent ?? "text-slate-900!"}`}>
        {value}
      </span>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px]! font-bold! uppercase! tracking-widest! text-slate-300! mb-1.5!">
      {children}
    </p>
  );
}

function RuleDot({ label, active, activeColor = "bg-emerald-500" }: { label: string; active: boolean; activeColor?: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`block h-2 w-2 rounded-full shrink-0 ${active ? activeColor : "bg-slate-200"}`} />
      <span className={`text-xs! font-medium! ${active ? "text-slate-800!" : "text-slate-400!"}`}>{label}</span>
    </div>
  );
}

/* ── main ────────────────────────────────────────────── */

export function AboutTab({ prova }: AboutTabProps) {
  const description = prova.descricao?.trim();
  const isProva = prova.tipo !== "ATIVIDADE";
  const tipo = isProva ? "Prova" : "Atividade";
  const tipoAtividade = fmtTipoAtividade(prova);
  const modalidade = fmtModalidade(prova.modalidade);
  const escopo = fmtEscopo(prova.localizacao);

  const inicio = fmtDate(prova.dataInicio);
  const fim = fmtDate(prova.dataFim);
  const hInicio = fmtHour(prova.horaInicio);
  const hFim = fmtHour(prova.horaTermino || prova.horaFim);

  const curso = getCurso(prova);
  const turma = getTurma(prova);
  const instrutor = getInstrutor(prova);

  const chips: { label: string; value: string; color: string }[] = [
    { label: "Tipo", value: tipo, color: "blue" },
  ];
  if (tipoAtividade) chips.push({ label: "Modelo", value: tipoAtividade, color: "purple" });
  if (modalidade) chips.push({ label: "Modalidade", value: modalidade, color: "emerald" });
  if (escopo) chips.push({ label: "Escopo", value: escopo, color: "amber" });
  if (prova.etiqueta) chips.push({ label: "Etiqueta", value: prova.etiqueta, color: "rose" });
  if (prova.codigo) chips.push({ label: "Código", value: prova.codigo, color: "slate" });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      {/* ── corpo principal: SVG esquerda + dados direita ── */}
      <div className="flex flex-col md:flex-row">
        {/* ilustração como sidebar visual */}
        <div className="hidden md:flex items-center justify-center border-r border-slate-100 p-6 md:w-52 lg:w-60 shrink-0 bg-slate-50/40">
          <Illustration isProva={isProva} />
        </div>

        {/* todo o conteúdo à direita */}
        <div className="flex-1 min-w-0 divide-y divide-slate-100">
          {/* chips */}
          <div className="flex flex-wrap items-center gap-2 px-6 py-4">
            {/* SVG inline no mobile */}
            <div className="md:hidden w-14 h-14 shrink-0 mr-1">
              <Illustration isProva={isProva} />
            </div>
            {chips.map((c) => (
              <Chip key={c.label} label={c.label} value={c.value} color={c.color} />
            ))}
          </div>

          {/* descrição */}
          {description && (
            <div className="px-6 py-4">
              <SectionLabel>Orientações</SectionLabel>
              <div className="border-l-2 border-slate-200 pl-4 mt-2">
                <p className="text-sm! text-slate-600! leading-relaxed! whitespace-pre-wrap! wrap-break-word! mb-0!">
                  {description}
                </p>
              </div>
            </div>
          )}

          {/* propriedades em 2 colunas */}
          <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {/* contexto */}
            <div className="px-6 py-4">
              <SectionLabel>Contexto</SectionLabel>
              <PropRow label="Curso" value={curso ?? "Não vinculado"} />
              <PropRow label="Turma" value={turma ?? "Não vinculada"} />
              <PropRow label="Instrutor" value={instrutor ?? "Não informado"} />
            </div>

            {/* agendamento */}
            <div className="px-6 py-4">
              <SectionLabel>Agendamento</SectionLabel>
              {inicio && fim ? (
                <PropRow label="Período" value={`${inicio}  —  ${fim}`} />
              ) : inicio ? (
                <PropRow label="Início" value={inicio} />
              ) : fim ? (
                <PropRow label="Fim" value={fim} />
              ) : (
                <PropRow label="Período" value="Não informado" />
              )}
              {hInicio && hFim ? (
                <PropRow label="Horário" value={`${hInicio} — ${hFim}`} />
              ) : hInicio ? (
                <PropRow label="Horário" value={`Início às ${hInicio}`} />
              ) : hFim ? (
                <PropRow label="Horário" value={`Término às ${hFim}`} />
              ) : (
                <PropRow label="Horário" value="Não definido" />
              )}
              {prova.duracaoMinutos && (
                <PropRow
                  label="Duração"
                  value={`${prova.duracaoMinutos} min`}
                  accent="text-blue-700!"
                />
              )}
            </div>
          </div>

          {/* regras */}
          <div className="px-6 py-4">
            <SectionLabel>Regras</SectionLabel>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-1">
              <RuleDot label="Obrigatória" active={!!prova.obrigatoria} activeColor="bg-amber-500" />
              <RuleDot label="Vale nota" active={!!prova.valePonto} activeColor="bg-emerald-500" />
              {prova.recuperacaoFinal && (
                <RuleDot label="Recuperação final" active activeColor="bg-blue-500" />
              )}
              {typeof prova.peso === "number" && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs! font-medium! text-slate-400!">Peso:</span>
                  <span className="text-sm! font-bold! text-slate-900!">{prova.peso}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

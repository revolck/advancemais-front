import { notFound, redirect } from "next/navigation";

import { getAvaliacao, getProvaById, type TurmaProva } from "@/api/cursos";
import { ProvaDetailsView } from "@/theme/dashboard/components/admin/prova-details";
import {
  requireDashboardAuth,
} from "@/lib/auth/server";

// Force this page to be a Server Component
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface ProvaDetailsPageProps {
  params: Promise<{ id: string }>;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isUuid = (value?: string | null): value is string =>
  Boolean(value && UUID_REGEX.test(value));

const isValidNumericId = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

function mapAvaliacaoToTurmaProva(avaliacao: Awaited<ReturnType<typeof getAvaliacao>>): TurmaProva {
  return {
    id: avaliacao.id,
    codigo: avaliacao.codigo,
    cursoId: avaliacao.cursoId ?? null,
    titulo: avaliacao.titulo || avaliacao.nome,
    nome: avaliacao.nome,
    descricao: avaliacao.descricao,
    tipo: avaliacao.tipo,
    tipoAtividade: avaliacao.tipoAtividade ?? null,
    recuperacaoFinal: avaliacao.recuperacaoFinal,
    status: avaliacao.status,
    dataInicio: avaliacao.dataInicio,
    dataFim: avaliacao.dataFim,
    horaInicio: avaliacao.horaInicio,
    horaFim: avaliacao.horaTermino,
    horaTermino: avaliacao.horaTermino,
    etiqueta: avaliacao.etiqueta,
    peso: avaliacao.peso ?? avaliacao.pesoNota,
    obrigatoria: avaliacao.obrigatoria,
    duracaoMinutos: avaliacao.duracaoMinutos,
    valeNota: avaliacao.valeNota,
    valePonto: avaliacao.valePonto,
    questoes: avaliacao.questoes,
    ativo: avaliacao.ativo,
    localizacao: avaliacao.localizacao,
    turmaId: avaliacao.turmaId ?? undefined,
    moduloId: avaliacao.moduloId ?? undefined,
    modalidade: avaliacao.modalidade as TurmaProva["modalidade"],
    instrutorId: avaliacao.instrutorId ?? undefined,
    curso: avaliacao.curso ?? null,
    cursoNome: avaliacao.cursoNome ?? null,
    turma: avaliacao.turma ?? null,
    turmaNome: avaliacao.turmaNome ?? null,
    instrutor: avaliacao.instrutor ?? null,
    criadoEm: avaliacao.criadoEm,
    atualizadoEm: avaliacao.atualizadoEm,
    criadoPor: avaliacao.criadoPor
      ? {
          nome: avaliacao.criadoPor.nome ?? null,
        }
      : null,
  };
}

export default async function ProvaDetailsPage({
  params,
}: ProvaDetailsPageProps) {
  const { id: provaId } = await params;

  if (!provaId || typeof provaId !== "string") {
    notFound();
  }

  const safeProvaPath = `/dashboard/cursos/atividades-provas/${encodeURIComponent(provaId)}`;
  const { authHeaders, loginUrl } = await requireDashboardAuth(safeProvaPath);

  let cursoId: number | string | null = null;
  let turmaId: string | null = null;
  let provaResponse: Awaited<ReturnType<typeof getProvaById>> | null = null;
  let error: Error | null = null;

  try {
    const avaliacaoBase = await getAvaliacao(provaId, {
      headers: authHeaders,
    });

    cursoId = avaliacaoBase.cursoId ?? null;
    turmaId = avaliacaoBase.turmaId ?? null;

    const hasValidCourseContext =
      isUuid(typeof cursoId === "string" ? cursoId : null) || isValidNumericId(cursoId);

    if (hasValidCourseContext && isUuid(turmaId)) {
      const provaContexto = await getProvaById(cursoId as number | string, turmaId, provaId, {
        headers: authHeaders,
      });
      provaResponse = {
        ...mapAvaliacaoToTurmaProva(avaliacaoBase),
        ...provaContexto,
      };
    } else {
      provaResponse = mapAvaliacaoToTurmaProva(avaliacaoBase);
    }
  } catch (err) {
    const apiError = err as { status?: number };
    const status = apiError?.status;

    if (status === 401) {
      redirect(loginUrl);
    }

    if (status === 403) {
      redirect("/dashboard/unauthorized");
    }

    if (status === 404) {
      notFound();
    }

    error = err instanceof Error ? err : new Error("Erro ao buscar prova");
    console.error("Erro ao buscar prova:", {
      error: err,
      provaId,
      cursoId,
      turmaId,
      scope: "dashboard-prova-details",
    });
  }

  if (!provaResponse && !error) {
    console.error("Prova não encontrada:", provaId);
    notFound();
  }

  if (error && !provaResponse) {
    return (
      <div className="space-y-8">
        <ProvaDetailsView
          cursoId={cursoId}
          turmaId={turmaId}
          provaId={provaId}
          initialProva={null}
          initialError={error}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ProvaDetailsView
        cursoId={cursoId}
        turmaId={turmaId}
        provaId={provaId}
        initialProva={provaResponse!}
      />
    </div>
  );
}

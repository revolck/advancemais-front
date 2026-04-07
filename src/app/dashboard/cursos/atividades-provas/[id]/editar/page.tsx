import { notFound, redirect } from "next/navigation";

import { getAvaliacao, getProvaById, type TurmaProva } from "@/api/cursos";
import { getUserProfile } from "@/api/usuarios";
import { UserRole } from "@/config/roles";
import { requireDashboardAuth } from "@/lib/auth/server";
import { CreateProvaForm } from "@/theme/dashboard/components/admin/lista-atividades-provas/components/CreateProvaForm";
import { isInstrutorOwnerOrCreator } from "@/theme/dashboard/components/admin/lista-atividades-provas/utils/instrutorScope";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface EditAtividadeProvaPageProps {
  params: Promise<{ id: string }>;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isUuid = (value?: string | null): value is string =>
  Boolean(value && UUID_REGEX.test(value));

const isValidNumericId = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

function mapAvaliacaoToTurmaProva(
  avaliacao: Awaited<ReturnType<typeof getAvaliacao>>
): TurmaProva {
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
    criadoPorId: avaliacao.criadoPorId ?? null,
    curso: avaliacao.curso ?? null,
    cursoNome: avaliacao.cursoNome ?? null,
    turma: avaliacao.turma ?? null,
    turmaNome: avaliacao.turmaNome ?? null,
    instrutor: avaliacao.instrutor ?? null,
    criadoEm: avaliacao.criadoEm,
    atualizadoEm: avaliacao.atualizadoEm,
    criadoPor: avaliacao.criadoPor
      ? {
          id: avaliacao.criadoPor.id ?? null,
          nome: avaliacao.criadoPor.nome ?? null,
        }
      : null,
  };
}

export default async function EditAtividadeProvaPage({
  params,
}: EditAtividadeProvaPageProps) {
  const { id } = await params;

  if (!id || typeof id !== "string") notFound();

  const safePath = `/dashboard/cursos/atividades-provas/${encodeURIComponent(
    id
  )}/editar`;
  const { authHeaders, loginUrl, token } = await requireDashboardAuth(safePath);

  try {
    const profileResponse = await getUserProfile(token);
    const profileUsuario =
      profileResponse && "usuario" in profileResponse
        ? profileResponse.usuario
        : null;
    const avaliacaoBase = await getAvaliacao(id, { headers: authHeaders });

    if (
      profileUsuario?.role === UserRole.INSTRUTOR &&
      !isInstrutorOwnerOrCreator(avaliacaoBase, profileUsuario.id)
    ) {
      redirect("/dashboard/unauthorized");
    }

    const cursoId = avaliacaoBase.cursoId ?? null;
    const turmaId = avaliacaoBase.turmaId ?? null;

    const hasValidCourseContext =
      isUuid(typeof cursoId === "string" ? cursoId : null) ||
      isValidNumericId(cursoId);

    const initialData =
      hasValidCourseContext && isUuid(turmaId)
        ? {
            ...mapAvaliacaoToTurmaProva(avaliacaoBase),
            ...(await getProvaById(cursoId as number | string, turmaId, id, {
              headers: authHeaders,
            })),
          }
        : mapAvaliacaoToTurmaProva(avaliacaoBase);

    return (
      <CreateProvaForm
        mode="edit"
        provaId={id}
        initialData={initialData}
        successRedirectTo={`/dashboard/cursos/atividades-provas/${id}`}
        cancelRedirectTo={`/dashboard/cursos/atividades-provas/${id}`}
      />
    );
  } catch (err) {
    const apiError = err as { status?: number };
    const status = apiError?.status;

    if (status === 401) redirect(loginUrl);
    if (status === 403) redirect("/dashboard/unauthorized");
    if (status === 404) notFound();

    console.error("Erro ao carregar avaliação para edição:", {
      error: err,
      avaliacaoId: id,
      scope: "dashboard-avaliacao-edit",
    });
    notFound();
  }
}

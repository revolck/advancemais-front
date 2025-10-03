"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getVagaById } from "@/api/vagas/admin";
import { VagaDetailsView } from "@/theme/dashboard/components/admin/vaga-details";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { VagaDetail } from "@/api/vagas/admin/types";

export default function VagaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [vaga, setVaga] = useState<VagaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const vagaId = params.id as string;

  useEffect(() => {
    const fetchVaga = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getVagaById(vagaId);
        const vagaData = "data" in response ? response.data : response;
        setVaga(vagaData);
      } catch (err) {
        console.error("Erro ao carregar vaga:", err);
        setError("Erro ao carregar os detalhes da vaga");
      } finally {
        setLoading(false);
      }
    };

    if (vagaId) {
      fetchVaga();
    }
  }, [vagaId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error || !vaga) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Detalhes da Vaga
            </h1>
            <p className="text-gray-600">Erro ao carregar informações</p>
          </div>
        </div>
        <Alert>
          <AlertDescription>{error || "Vaga não encontrada"}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return <VagaDetailsView vaga={vaga} />;
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { FileText } from "lucide-react";

type Plano = {
  id: number;
  nome_plano: string;
  duracao_dias: number;
  descricao: string | null;
};

export default function PlanosPage() {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/planos")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setPlanos(data);
      })
      .catch(() => toast.error("Erro ao carregar planos"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Planos</h1>

      {loading ? (
        <p className="text-gray-500">Carregando...</p>
      ) : planos.length === 0 ? (
        <Card className="border border-gray-200 bg-white">
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">
              Nenhum plano cadastrado. Execute <code className="rounded bg-gray-100 px-1.5 py-0.5 text-sm">npm run db:seed</code> para carregar os planos.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {planos.map((p) => (
            <Link key={p.id} href={`/dashboard/planos/${p.id}/contrato`}>
              <Card className="border border-gray-200 bg-white hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 capitalize mb-1">
                        {p.nome_plano.replace(/_/g, " ")}
                      </h3>
                      <p className="text-sm text-gray-600">{p.duracao_dias} dias</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-600 font-medium mt-4">
                    <FileText className="h-4 w-4" />
                    Ver contrato
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { FileText } from "lucide-react";
import { isConsultoriaOnlinePlano, tituloCardPlano } from "@/lib/planos";

type Plano = {
  id: number;
  nome_plano: string;
  duracao_dias: number;
  descricao: string | null;
};

function PlanoCard({ p }: { p: Plano }) {
  return (
    <Link href={`/dashboard/planos/${p.id}/contrato`}>
      <Card className="border border-gray-200 bg-white hover:shadow-md transition-shadow cursor-pointer h-full">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 capitalize mb-1">
                {tituloCardPlano(p.nome_plano, p.duracao_dias)}
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
  );
}

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

  const { presenciais, online } = useMemo(() => {
    const pres: Plano[] = [];
    const onl: Plano[] = [];
    for (const p of planos) {
      if (isConsultoriaOnlinePlano(p.nome_plano)) onl.push(p);
      else pres.push(p);
    }
    const ordem = (a: Plano, b: Plano) =>
      a.duracao_dias - b.duracao_dias;
    return { presenciais: pres, online: onl.sort(ordem) };
  }, [planos]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-gray-900">Planos</h1>

      {loading ? (
        <p className="text-gray-500">Carregando...</p>
      ) : planos.length === 0 ? (
        <Card className="border border-gray-200 bg-white">
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">
              Nenhum plano cadastrado. Verifique a conexão com o banco ou recarregue a página.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {presenciais.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-lg font-medium text-gray-800">Planos presenciais</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {presenciais.map((p) => (
                  <PlanoCard key={p.id} p={p} />
                ))}
              </div>
            </section>
          )}
          <section className="space-y-4">
            <h2 className="text-lg font-medium text-gray-800">Consultoria online</h2>
            {online.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {online.map((p) => (
                  <PlanoCard key={p.id} p={p} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-600">Carregando planos online… recarregue a página.</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}

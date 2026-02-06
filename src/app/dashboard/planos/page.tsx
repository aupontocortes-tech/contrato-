"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Planos</h1>
      <p className="text-muted-foreground">
        Planos disponíveis para contratação. Clique em um plano para ver o texto do contrato.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-muted-foreground">Carregando...</p>
        ) : planos.length === 0 ? (
          <p className="text-muted-foreground col-span-full">
            Nenhum plano cadastrado. Execute <code className="rounded bg-muted px-1.5 py-0.5 text-sm">npm run db:seed</code> na raiz do projeto (local) ou configure o banco e o seed na Vercel.
          </p>
        ) : (
          planos.map((p) => (
            <Link key={p.id} href={`/dashboard/planos/${p.id}/contrato`}>
              <Card className="transition-colors hover:bg-muted/50 cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="capitalize">{p.nome_plano.replace(/_/g, " ")}</CardTitle>
                  <CardDescription>{p.descricao ?? `${p.duracao_dias} dias`}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">Duração: {p.duracao_dias} dias</p>
                  <span className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium">
                    <FileText className="size-4" />
                    Ver contrato
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

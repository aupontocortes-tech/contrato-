"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Users, FileText, Clock, ArrowRight, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Stats = {
  totalAlunos: number;
  contratosAtivos: number;
  contratosPendentes: number;
};

function StatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  loading,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  loading: boolean;
}) {
  return (
    <Card className="border border-border bg-card shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold text-card-foreground tracking-tight">
              {loading ? (
                <span className="inline-block h-8 w-12 animate-pulse rounded-md bg-muted" />
              ) : (
                value
              )}
            </p>
          </div>
          <div className={`p-2.5 rounded-xl ${iconBg}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalAlunos: 0,
    contratosAtivos: 0,
    contratosPendentes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/alunos").then((r) => r.json()).catch(() => []),
      fetch("/api/contratos").then((r) => r.json()).catch(() => []),
    ])
      .then(([alunos, contratos]) => {
        const alunosArray = Array.isArray(alunos) ? alunos : [];
        const contratosArray = Array.isArray(contratos) ? contratos : [];

        setStats({
          totalAlunos: alunosArray.length,
          contratosAtivos: contratosArray.filter((c: any) => c.status === "assinado").length,
          contratosPendentes: contratosArray.filter((c: any) => c.status !== "assinado").length,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-foreground tracking-tight text-balance">
          Dashboard
        </h1>
        <p className="text-muted-foreground text-sm">
          Gerencie seus alunos, planos e contratos.
        </p>
      </div>

      {/* Logo section */}
      <Card className="border border-border bg-card shadow-sm overflow-hidden">
        <CardContent className="p-6 flex items-center justify-center">
          <div className="max-w-[260px] w-full">
            <Image
              src="/dashboard-logo.png"
              alt="Logo Natalia Personal"
              width={300}
              height={200}
              className="w-full h-auto object-contain"
              priority
              unoptimized
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total de Alunos"
          value={stats.totalAlunos}
          icon={Users}
          iconBg="bg-primary/10"
          iconColor="text-primary"
          loading={loading}
        />
        <StatCard
          label="Contratos Ativos"
          value={stats.contratosAtivos}
          icon={FileText}
          iconBg="bg-success/15"
          iconColor="text-success"
          loading={loading}
        />
        <StatCard
          label="Pendentes"
          value={stats.contratosPendentes}
          icon={Clock}
          iconBg="bg-warning/15"
          iconColor="text-warning"
          loading={loading}
        />
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard/contratos">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
            <Plus className="h-4 w-4" />
            Criar novo contrato
          </Button>
        </Link>
        <Link href="/dashboard/alunos">
          <Button variant="outline" className="gap-2">
            Gerenciar alunos
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, FileText, Clock } from "lucide-react";

type Stats = {
  totalAlunos: number;
  contratosAtivos: number;
  contratosPendentes: number;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalAlunos: 0,
    contratosAtivos: 0,
    contratosPendentes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/alunos").then((r) => r.json()),
      fetch("/api/contratos").then((r) => r.json()),
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
    <div style={{ padding: "24px" }}>
      <h1 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "24px", color: "#111827" }}>Dashboard</h1>
      <div className="space-y-6">
        {/* Cards informativos */}
        <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border border-gray-200 bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total de Alunos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? "..." : stats.totalAlunos}
                </p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Contratos Ativos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? "..." : stats.contratosAtivos}
                </p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? "..." : stats.contratosPendentes}
                </p>
              </div>
              <div className="p-2 bg-orange-50 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ação principal única */}
      <div className="pt-4">
        <Link href="/dashboard/contratos">
          <Button size="lg" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white">
            Criar novo contrato
          </Button>
        </Link>
      </div>
      </div>
    </div>
  );
}

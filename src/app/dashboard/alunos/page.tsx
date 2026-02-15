"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Trash2, Mail, Phone, CreditCard } from "lucide-react";
import { AlunoModal } from "@/components/aluno-modal";
import { ExcluirAlunoModal } from "@/components/excluir-aluno-modal";

type Aluno = {
  id: number;
  nome_completo: string;
  cpf: string;
  email: string;
  telefone: string | null;
};

export default function AlunosPage() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [excluirModalOpen, setExcluirModalOpen] = useState(false);
  const [alunoParaExcluir, setAlunoParaExcluir] = useState<{ id: number; nome: string } | null>(null);

  function loadAlunos() {
    setLoading(true);
    fetch("/api/alunos")
      .then((r) => r.json().then((data) => ({ ok: r.ok, data })))
      .then(({ ok, data }) => {
        if (ok && Array.isArray(data)) {
          setAlunos(data);
        } else if (!ok && data && typeof data.error === "string") {
          toast.error(data.error);
        } else {
          toast.error("Erro ao carregar alunos");
        }
      })
      .catch(() => toast.error("Erro ao carregar alunos"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadAlunos();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Alunos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loading ? "Carregando..." : `${alunos.length} aluno${alunos.length !== 1 ? "s" : ""} cadastrado${alunos.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Novo aluno</span>
          <span className="sm:hidden">Novo</span>
        </Button>
      </div>

      {/* List */}
      <Card className="border border-border bg-card shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col gap-4 p-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                    <div className="h-3 w-48 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : alunos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-foreground font-medium mb-1">Nenhum aluno cadastrado</p>
              <p className="text-muted-foreground text-sm mb-4">
                Comece cadastrando seu primeiro aluno.
              </p>
              <Button
                variant="outline"
                onClick={() => setModalOpen(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Cadastrar primeiro aluno
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {alunos.map((a) => (
                <div
                  key={a.id}
                  className="p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-primary font-semibold text-sm">
                        {a.nome_completo.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-card-foreground">{a.nome_completo}</p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Mail className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{a.email}</span>
                        </span>
                        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <CreditCard className="h-3.5 w-3.5 shrink-0" />
                          {a.cpf}
                        </span>
                        {a.telefone && (
                          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Phone className="h-3.5 w-3.5 shrink-0" />
                            {a.telefone}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                      onClick={() => {
                        setAlunoParaExcluir({ id: a.id, nome: a.nome_completo });
                        setExcluirModalOpen(true);
                      }}
                      title="Excluir aluno"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <AlunoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={loadAlunos}
      />

      {alunoParaExcluir && (
        <ExcluirAlunoModal
          open={excluirModalOpen}
          onOpenChange={(open) => {
            setExcluirModalOpen(open);
            if (!open) setAlunoParaExcluir(null);
          }}
          alunoId={alunoParaExcluir.id}
          alunoNome={alunoParaExcluir.nome}
          onSuccess={loadAlunos}
        />
      )}
    </div>
  );
}

function Users(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

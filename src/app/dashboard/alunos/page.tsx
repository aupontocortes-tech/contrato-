"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
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
      {/* Cabeçalho com título e botão */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Alunos</h1>
        <Button
          onClick={() => setModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo aluno
        </Button>
      </div>

      {/* Lista de alunos */}
      <Card className="border border-gray-200 bg-white shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-gray-500">Carregando...</p>
            </div>
          ) : alunos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-gray-600 mb-2">Nenhum aluno cadastrado.</p>
              <Button
                variant="outline"
                onClick={() => setModalOpen(true)}
                className="mt-2"
              >
                Cadastrar primeiro aluno
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {alunos.map((a) => (
                <div
                  key={a.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-600 font-medium text-sm">
                        {a.nome_completo.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">{a.nome_completo}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {a.email} · CPF {a.cpf}
                        {a.telefone && ` · ${a.telefone}`}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
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

      {/* Modal de cadastro */}
      <AlunoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSuccess={loadAlunos}
      />

      {/* Modal de exclusão */}
      {alunoParaExcluir && (
        <ExcluirAlunoModal
          open={excluirModalOpen}
          onOpenChange={(open) => {
            setExcluirModalOpen(open);
            if (!open) {
              setAlunoParaExcluir(null);
            }
          }}
          alunoId={alunoParaExcluir.id}
          alunoNome={alunoParaExcluir.nome}
          onSuccess={loadAlunos}
        />
      )}
    </div>
  );
}

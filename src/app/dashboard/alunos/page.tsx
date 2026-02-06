"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

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
  const [form, setForm] = useState({
    nome_completo: "",
    cpf: "",
    email: "",
    telefone: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/alunos")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setAlunos(data);
      })
      .catch(() => toast.error("Erro ao carregar alunos"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/alunos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          telefone: form.telefone || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erro ao cadastrar");
        return;
      }
      toast.success("Aluno cadastrado!");
      setAlunos((prev) => [...prev, data]);
      setForm({ nome_completo: "", cpf: "", email: "", telefone: "" });
    } catch {
      toast.error("Erro de conexão");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Alunos</h1>

      <Card>
        <CardHeader>
          <CardTitle>Novo aluno</CardTitle>
          <CardDescription>Preencha os dados para cadastrar um aluno.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Nome completo</Label>
              <Input
                value={form.nome_completo}
                onChange={(e) => setForm((f) => ({ ...f, nome_completo: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>CPF</Label>
              <Input
                value={form.cpf}
                onChange={(e) => setForm((f) => ({ ...f, cpf: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Telefone (opcional)</Label>
              <Input
                value={form.telefone}
                onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Salvando..." : "Cadastrar aluno"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de alunos</CardTitle>
          <CardDescription>{alunos.length} aluno(s) cadastrado(s).</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Carregando...</p>
          ) : alunos.length === 0 ? (
            <p className="text-muted-foreground">Nenhum aluno cadastrado.</p>
          ) : (
            <ul className="divide-y">
              {alunos.map((a) => (
                <li key={a.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{a.nome_completo}</p>
                    <p className="text-sm text-muted-foreground">{a.email} · CPF {a.cpf}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

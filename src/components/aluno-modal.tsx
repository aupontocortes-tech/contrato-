"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type AlunoForm = {
  nome_completo: string;
  cpf: string;
  email: string;
  telefone: string;
};

const formInicial: AlunoForm = {
  nome_completo: "",
  cpf: "",
  email: "",
  telefone: "",
};

export function AlunoModal({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState<AlunoForm>(formInicial);
  const [cpfNaoInformado, setCpfNaoInformado] = useState(false);
  const [saving, setSaving] = useState(false);

  function resetForm() {
    setForm(formInicial);
    setCpfNaoInformado(false);
  }

  function marcarCpfNaoInformado() {
    setCpfNaoInformado(true);
    setForm((f) => ({ ...f, cpf: "" }));
  }

  function desmarcarCpfNaoInformado() {
    setCpfNaoInformado(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/alunos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome_completo: form.nome_completo,
          email: form.email,
          telefone: form.telefone || undefined,
          cpf_nao_informado: cpfNaoInformado,
          cpf: cpfNaoInformado ? undefined : form.cpf,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erro ao cadastrar");
        return;
      }
      toast.success("Aluno cadastrado!");
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error("Erro de conexão");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) resetForm();
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Novo aluno</DialogTitle>
          <DialogDescription>
            Preencha os dados para cadastrar um aluno.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome completo</Label>
            <Input
              id="nome"
              value={form.nome_completo}
              onChange={(e) => setForm((f) => ({ ...f, nome_completo: e.target.value }))}
              required
              placeholder="Digite o nome completo"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cpf">CPF</Label>
            <Input
              id="cpf"
              value={form.cpf}
              onChange={(e) => {
                desmarcarCpfNaoInformado();
                setForm((f) => ({ ...f, cpf: e.target.value }));
              }}
              required={!cpfNaoInformado}
              disabled={cpfNaoInformado}
              placeholder={cpfNaoInformado ? "não informado" : "000.000.000-00"}
              className={cpfNaoInformado ? "bg-muted text-muted-foreground" : undefined}
            />
            <Button
              type="button"
              variant={cpfNaoInformado ? "default" : "outline"}
              size="sm"
              className="w-full"
              onClick={() =>
                cpfNaoInformado ? desmarcarCpfNaoInformado() : marcarCpfNaoInformado()
              }
            >
              {cpfNaoInformado ? "Informar CPF" : "CPF não informado"}
            </Button>
            {cpfNaoInformado && (
              <p className="text-xs text-muted-foreground">
                No contrato aparecerá: <strong>CPF: não informado</strong>
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
              placeholder="email@exemplo.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone (opcional)</Label>
            <Input
              id="telefone"
              value={form.telefone}
              onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
              placeholder="(00) 00000-0000"
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Salvando..." : "Cadastrar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

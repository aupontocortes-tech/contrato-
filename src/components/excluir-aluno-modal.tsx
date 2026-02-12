"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";

type ExcluirAlunoModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alunoId: number;
  alunoNome: string;
  onSuccess: () => void;
};

export function ExcluirAlunoModal({
  open,
  onOpenChange,
  alunoId,
  alunoNome,
  onSuccess,
}: ExcluirAlunoModalProps) {
  const [codigo, setCodigo] = useState("");
  const [excluindo, setExcluindo] = useState(false);

  async function handleExcluir() {
    if (!codigo.trim()) {
      toast.error("Digite o código de confirmação");
      return;
    }

    if (!["1", "2", "3", "4"].includes(codigo.trim())) {
      toast.error("Código inválido. Digite 1, 2, 3 ou 4");
      return;
    }

    setExcluindo(true);
    try {
      const res = await fetch(`/api/alunos/${alunoId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo: codigo.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        const errorMsg = data?.error || "Erro ao excluir aluno";
        toast.error(errorMsg);
        setExcluindo(false);
        return;
      }

      toast.success("Aluno excluído com sucesso!");
      setCodigo("");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Erro ao excluir aluno:", error);
      toast.error("Erro de conexão ao excluir aluno");
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Excluir Aluno
          </DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir o aluno <strong>{alunoNome}</strong>?
            <br />
            Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-2">
          <Label htmlFor="codigo" className="text-sm font-medium">
            Digite o código de confirmação (1, 2, 3 ou 4):
          </Label>
          <Input
            id="codigo"
            type="text"
            value={codigo}
            onChange={(e) => {
              const value = e.target.value;
              // Aceitar apenas números de 1 a 4
              if (value === "" || ["1", "2", "3", "4"].includes(value)) {
                setCodigo(value);
              }
            }}
            placeholder="Digite 1, 2, 3 ou 4"
            maxLength={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && codigo.trim()) {
                handleExcluir();
              }
            }}
            autoFocus
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              setCodigo("");
              onOpenChange(false);
            }}
            disabled={excluindo}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleExcluir}
            disabled={excluindo || !codigo.trim()}
          >
            {excluindo ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

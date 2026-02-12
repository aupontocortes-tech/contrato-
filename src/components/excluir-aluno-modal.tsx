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
  const [excluindo, setExcluindo] = useState(false);

  async function handleExcluir() {
    setExcluindo(true);
    try {
      const res = await fetch(`/api/alunos/${alunoId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo: "40" }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data?.error || `Erro ao excluir aluno (${res.status})`;
        toast.error(errorMsg);
        setExcluindo(false);
        return;
      }

      if (!data.ok) {
        const errorMsg = data?.error || "Erro ao excluir aluno";
        toast.error(errorMsg);
        setExcluindo(false);
        return;
      }

      toast.success("Aluno excluído com sucesso!");
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
            disabled={excluindo}
          >
            {excluindo ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

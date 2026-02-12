"use client";

import { useState, useEffect, useRef } from "react";
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
  const inputRef = useRef<HTMLInputElement>(null);

  // Limpar código quando o modal abrir
  useEffect(() => {
    if (open) {
      setCodigo("");
      // Focar no input após um pequeno delay para garantir que o modal está renderizado
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  async function handleExcluir() {
    const codigoLimpo = codigo.trim();
    
    if (!codigoLimpo) {
      toast.error("Digite o código de confirmação");
      return;
    }

    if (!["1", "2", "3", "4"].includes(codigoLimpo)) {
      toast.error("Código inválido. Digite 1, 2, 3 ou 4");
      return;
    }

    setExcluindo(true);
    try {
      console.log("Tentando excluir aluno:", alunoId, "com código:", codigoLimpo);
      
      const res = await fetch(`/api/alunos/${alunoId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo: codigoLimpo }),
      });

      const data = await res.json();
      console.log("Resposta da API:", { status: res.status, ok: res.ok, data });

      if (!res.ok) {
        const errorMsg = data?.error || `Erro ao excluir aluno (${res.status})`;
        console.error("Erro na resposta:", errorMsg);
        toast.error(errorMsg);
        setExcluindo(false);
        return;
      }

      if (!data.ok) {
        const errorMsg = data?.error || "Erro ao excluir aluno";
        console.error("Erro nos dados:", errorMsg);
        toast.error(errorMsg);
        setExcluindo(false);
        return;
      }

      console.log("Aluno excluído com sucesso!");
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
            ref={inputRef}
            id="codigo"
            type="text"
            inputMode="numeric"
            value={codigo}
            onChange={(e) => {
              const value = e.target.value;
              // Aceitar apenas números de 1 a 4
              if (value === "") {
                setCodigo("");
              } else {
                // Pegar apenas o último caractere se for 1, 2, 3 ou 4
                const lastChar = value.slice(-1);
                if (["1", "2", "3", "4"].includes(lastChar)) {
                  setCodigo(lastChar);
                } else {
                  // Se não for válido, manter o valor anterior
                  setCodigo(codigo);
                }
              }
            }}
            onKeyDown={(e) => {
              // Permitir Enter apenas se houver código válido
              if (e.key === "Enter" && codigo && ["1", "2", "3", "4"].includes(codigo)) {
                e.preventDefault();
                handleExcluir();
              }
            }}
            placeholder="Digite 1, 2, 3 ou 4"
            maxLength={1}
            autoFocus
            disabled={excluindo}
            className="text-center text-2xl font-bold"
            style={{ letterSpacing: "0.1em" }}
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
            disabled={excluindo || !codigo || !["1", "2", "3", "4"].includes(codigo.trim())}
          >
            {excluindo ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

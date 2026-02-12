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

    if (codigoLimpo !== "00" && codigoLimpo !== "0000") {
      toast.error("Código inválido. Digite 00 ou 0000");
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
            Digite o código de confirmação (00 ou 0000):
          </Label>
          <input
            ref={inputRef}
            id="codigo"
            type="text"
            inputMode="numeric"
            value={codigo}
            onChange={(e) => {
              const value = e.target.value;
              // Aceitar apenas números
              const numericValue = value.replace(/[^0-9]/g, "");
              // Limitar a 4 caracteres
              const limitedValue = numericValue.slice(0, 4);
              setCodigo(limitedValue);
            }}
            onKeyDown={(e) => {
              // Permitir Enter apenas se houver código válido
              if (e.key === "Enter" && (codigo === "00" || codigo === "0000")) {
                e.preventDefault();
                handleExcluir();
              }
            }}
            placeholder="Digite 00 ou 0000"
            maxLength={4}
            autoFocus
            disabled={excluindo}
            className="text-center text-2xl font-bold w-full h-9 rounded-md border border-gray-300 bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-blue-500 focus-visible:ring-blue-500/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
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
            disabled={excluindo || !codigo || (codigo !== "00" && codigo !== "0000")}
          >
            {excluindo ? "Excluindo..." : "Excluir"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

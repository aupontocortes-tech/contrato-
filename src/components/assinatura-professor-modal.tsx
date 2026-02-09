"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Upload, PenTool, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AssinaturaProfessorModal({
  open,
  onOpenChange,
  contratoId,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contratoId: number;
  onSuccess: () => void;
}) {
  const [modo, setModo] = useState<"colar" | "manual">("colar");
  const [imagemUrl, setImagemUrl] = useState<string>("");
  const [desenhou, setDesenhou] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (open && modo === "manual" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    }
  }, [open, modo]);

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            setImagemUrl(event.target?.result as string);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagemUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  function startDrawing(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  }

  function draw(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    setDesenhou(true);
  }

  function stopDrawing() {
    setIsDrawing(false);
  }

  function limparCanvas() {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      setDesenhou(false);
    }
  }

  async function handleSalvar() {
    setSalvando(true);
    try {
      let assinaturaDataUrl: string;

      if (modo === "colar") {
        if (!imagemUrl) {
          toast.error("Cole ou faça upload de uma imagem de assinatura");
          return;
        }
        assinaturaDataUrl = imagemUrl;
      } else {
        if (!desenhou || !canvasRef.current) {
          toast.error("Desenhe sua assinatura");
          return;
        }
        assinaturaDataUrl = canvasRef.current.toDataURL("image/png");
      }

      const res = await fetch(`/api/contratos/${contratoId}/assinatura-professor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assinatura: assinaturaDataUrl }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erro ao salvar assinatura");
        return;
      }

      toast.success("Assinatura do professor salva!");
      setImagemUrl("");
      setDesenhou(false);
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error("Erro de conexão");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Assinatura do Professor</DialogTitle>
          <DialogDescription>
            Cole uma imagem ou desenhe sua assinatura manualmente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Seleção de modo */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={modo === "colar" ? "default" : "outline"}
              onClick={() => {
                setModo("colar");
                setImagemUrl("");
                setDesenhou(false);
              }}
              className="flex-1"
            >
              <Upload className="h-4 w-4 mr-2" />
              Colar/Upload
            </Button>
            <Button
              type="button"
              variant={modo === "manual" ? "default" : "outline"}
              onClick={() => {
                setModo("manual");
                setImagemUrl("");
                setDesenhou(false);
              }}
              className="flex-1"
            >
              <PenTool className="h-4 w-4 mr-2" />
              Desenhar
            </Button>
          </div>

          {/* Modo Colar/Upload */}
          {modo === "colar" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Cole a imagem (Ctrl+V) ou faça upload</Label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center min-h-[200px] flex items-center justify-center"
                  onPaste={handlePaste}
                  tabIndex={0}
                >
                  {imagemUrl ? (
                    <div className="relative">
                      <img
                        src={imagemUrl}
                        alt="Assinatura"
                        className="max-h-48 max-w-full object-contain"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute -top-2 -right-2"
                        onClick={() => setImagemUrl("")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-gray-500">
                      <p className="mb-2">Cole uma imagem aqui (Ctrl+V)</p>
                      <p className="text-sm">ou</p>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="mt-2 max-w-xs mx-auto"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Modo Manual */}
          {modo === "manual" && (
            <div className="space-y-4">
              <div className="border-2 border-gray-300 rounded-lg p-4 bg-white">
                <canvas
                  ref={canvasRef}
                  width={500}
                  height={200}
                  className="w-full border border-gray-200 rounded cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={limparCanvas}
                className="w-full"
              >
                Limpar
              </Button>
            </div>
          )}

          {/* Botões de ação */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSalvar}
              disabled={salvando || (modo === "colar" && !imagemUrl) || (modo === "manual" && !desenhou)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {salvando ? "Salvando..." : "Salvar Assinatura"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

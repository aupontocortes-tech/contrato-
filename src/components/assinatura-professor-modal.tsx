"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Upload, PenLine, X, RotateCw } from "lucide-react";
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
  const desenhandoRef = useRef(false);
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    if (open && modo === "manual" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
      // Ajustar tamanho do canvas baseado no container e orientação
      const resizeCanvas = () => {
        if (!canvas || !canvas.parentElement) return;
        const container = canvas.parentElement;
        const containerWidth = container.clientWidth - 32; // padding
        
        // Em landscape, usar mais espaço vertical
        let canvasWidth = 800;
        let canvasHeight = isLandscape ? 400 : 300;
        
        // Se estiver em landscape real, aumentar ainda mais
        const isActuallyLandscape = window.innerWidth > window.innerHeight;
        if (isActuallyLandscape || isLandscape) {
          canvasHeight = Math.max(400, window.innerHeight * 0.4); // 40% da altura da tela
          canvasWidth = canvasHeight * 2; // Proporção 2:1
        }
        
        // Ajustar para caber no container
        const maxWidth = containerWidth;
        const scale = Math.min(1, maxWidth / canvasWidth);
        const finalWidth = canvasWidth * scale;
        const finalHeight = canvasHeight * scale;
        
        canvas.style.width = `${finalWidth}px`;
        canvas.style.height = `${finalHeight}px`;
      };
      
      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);
      window.addEventListener("orientationchange", resizeCanvas);
      
      return () => {
        window.removeEventListener("resize", resizeCanvas);
        window.removeEventListener("orientationchange", resizeCanvas);
      };
    }
  }, [open, modo, isLandscape]);

  // Limpar canvas quando modal fechar
  useEffect(() => {
    if (!open) {
      setDesenhou(false);
      setIsLandscape(false);
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
    }
  }, [open]);

  // Função para obter coordenadas tanto de mouse quanto de touch
  const getCoords = useCallback((e: React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0) return { x: 0, y: 0 };
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    if ("touches" in e && e.touches.length > 0) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: ((e as React.MouseEvent<HTMLCanvasElement>).clientX - rect.left) * scaleX,
      y: ((e as React.MouseEvent<HTMLCanvasElement>).clientY - rect.top) * scaleY,
    };
  }, []);

  // Função para rotacionar a tela para horizontal
  const toggleLandscape = useCallback(async () => {
    try {
      if (!isLandscape) {
        // Tentar usar Screen Orientation API (método moderno)
        if (screen.orientation && typeof (screen.orientation as any).lock === 'function') {
          try {
            await (screen.orientation as any).lock("landscape");
            setIsLandscape(true);
            toast.success("Tela rotacionada para horizontal");
            return;
          } catch (lockError) {
            console.log("Lock não disponível, tentando método alternativo");
          }
        }
        
        // Método alternativo usando fullscreen + orientação
        if (document.documentElement.requestFullscreen) {
          try {
            await document.documentElement.requestFullscreen();
            // Após entrar em fullscreen, tentar rotacionar
            if (screen.orientation && typeof (screen.orientation as any).lock === 'function') {
              await (screen.orientation as any).lock("landscape");
            }
            setIsLandscape(true);
            toast.success("Tela rotacionada para horizontal");
            return;
          } catch (fsError) {
            console.log("Fullscreen não disponível");
          }
        }
        
        // Fallback: instrução clara para o usuário
        toast.info("Por favor, rotacione seu dispositivo fisicamente para horizontal (deite o celular)", {
          duration: 5000,
        });
        setIsLandscape(true);
      } else {
        // Voltar para portrait
        if (screen.orientation && typeof (screen.orientation as any).unlock === 'function') {
          try {
            (screen.orientation as any).unlock();
            // Se estiver em fullscreen, sair também
            if (document.fullscreenElement) {
              await document.exitFullscreen();
            }
            setIsLandscape(false);
            toast.success("Tela voltou para vertical");
            return;
          } catch (unlockError) {
            console.log("Unlock não disponível");
          }
        }
        
        // Sair do fullscreen se estiver
        if (document.fullscreenElement) {
          try {
            await document.exitFullscreen();
          } catch (e) {
            console.log("Erro ao sair do fullscreen");
          }
        }
        
        toast.info("Por favor, rotacione seu dispositivo fisicamente para vertical", {
          duration: 5000,
        });
        setIsLandscape(false);
      }
    } catch (error) {
      console.error("Erro ao rotacionar:", error);
      toast.info("Por favor, rotacione seu dispositivo fisicamente", {
        duration: 5000,
      });
      setIsLandscape(!isLandscape);
    }
  }, [isLandscape]);

  // Listener para detectar mudanças de orientação
  useEffect(() => {
    if (!open || modo !== "manual") return;

    const handleOrientationChange = () => {
      const isCurrentlyLandscape = window.innerWidth > window.innerHeight;
      if (isCurrentlyLandscape !== isLandscape) {
        setIsLandscape(isCurrentlyLandscape);
      }
    };

    window.addEventListener("orientationchange", handleOrientationChange);
    window.addEventListener("resize", handleOrientationChange);

    return () => {
      window.removeEventListener("orientationchange", handleOrientationChange);
      window.removeEventListener("resize", handleOrientationChange);
    };
  }, [open, modo, isLandscape]);

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

  const startDrawing = useCallback((e: React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const { x, y } = getCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    desenhandoRef.current = true;
  }, [getCoords]);

  const draw = useCallback((e: React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!desenhandoRef.current || !isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setDesenhou(true);
  }, [isDrawing, getCoords]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    desenhandoRef.current = false;
  }, []);

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
              <PenLine className="h-4 w-4 mr-2" />
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
              <div className="flex justify-between items-center flex-wrap gap-2">
                <Label>Desenhe sua assinatura com o dedo</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={toggleLandscape}
                  className="flex items-center gap-2"
                >
                  <RotateCw className="h-4 w-4" />
                  {isLandscape ? "Voltar Vertical" : "Rotacionar para Horizontal"}
                </Button>
              </div>
              {!isLandscape && (
                <p className="text-xs text-muted-foreground">
                  💡 Dica: Rotacione para horizontal para ter mais espaço para assinar
                </p>
              )}
              <div className="border-2 border-gray-300 rounded-lg p-4 bg-white touch-none">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={isLandscape ? 400 : 300}
                  className="w-full border border-gray-200 rounded cursor-crosshair touch-none"
                  style={{ touchAction: "none" }}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  onTouchCancel={stopDrawing}
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

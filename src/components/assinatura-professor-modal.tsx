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
import { Upload, PenLine, X, RotateCw, ArrowLeft } from "lucide-react";
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
  const canvasImageRef = useRef<string | null>(null); // Para preservar assinatura ao mudar orientação

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
        
        // Em landscape, usar quase toda a tela
        if (isLandscape) {
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          
          // Deixar espaço para header (~52px) e botões (~120px) - mais espaço para botões ficarem visíveis
          const headerHeight = 52;
          const buttonsHeight = 120;
          const availableHeight = viewportHeight - headerHeight - buttonsHeight;
          const availableWidth = viewportWidth - 16; // padding mínimo (8px cada lado)
          
          // Usar toda a área disponível proporcionalmente
          const canvasWidth = availableWidth;
          const canvasHeight = availableHeight;
          
          // Atualizar dimensões reais do canvas (alta resolução)
          canvas.width = canvasWidth;
          canvas.height = canvasHeight;
          
          // Estilo para ocupar todo espaço disponível
          canvas.style.width = `${availableWidth}px`;
          canvas.style.height = `${availableHeight}px`;
          canvas.style.display = 'block';
          canvas.style.margin = '0';
          canvas.style.padding = '0';
          
          // Reconfigurar contexto após redimensionar
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 3;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
          }
          
          // Restaurar imagem se existir
          if (canvasImageRef.current) {
            const img = new Image();
            img.onload = () => {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              setDesenhou(true);
            };
            img.src = canvasImageRef.current;
          }
        } else {
          // Modo portrait - expandir proporcionalmente até os limites
          const viewportWidth = window.innerWidth;
          const viewportHeight = window.innerHeight;
          
          // Deixar espaço para header, botões e controles (~200px total)
          const availableHeight = viewportHeight - 200;
          const availableWidth = viewportWidth - 32; // padding lateral mínimo
          
          // Proporção ideal para assinatura (mais larga que alta)
          const idealRatio = 2.5; // largura 2.5x maior que altura
          let canvasWidth = availableWidth;
          let canvasHeight = canvasWidth / idealRatio;
          
          // Se altura calculada for maior que disponível, ajustar
          if (canvasHeight > availableHeight) {
            canvasHeight = availableHeight;
            canvasWidth = canvasHeight * idealRatio;
            // Se largura calculada exceder disponível, ajustar novamente
            if (canvasWidth > availableWidth) {
              canvasWidth = availableWidth;
              canvasHeight = canvasWidth / idealRatio;
            }
          }
          
          // Atualizar dimensões reais do canvas
          canvas.width = canvasWidth;
          canvas.height = canvasHeight;
          
          // Estilo para ocupar espaço proporcionalmente
          canvas.style.width = `${canvasWidth}px`;
          canvas.style.height = `${canvasHeight}px`;
          canvas.style.display = 'block';
          canvas.style.margin = '0 auto';
          canvas.style.padding = '0';
          
          // Reconfigurar contexto
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 3;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
          }
          
          // Restaurar imagem se existir
          if (canvasImageRef.current) {
            const img = new Image();
            img.onload = () => {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              setDesenhou(true);
            };
            img.src = canvasImageRef.current;
          }
        }
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
      canvasImageRef.current = null;
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
      // Salvar estado do canvas antes de mudar orientação
      if (canvasRef.current && desenhou) {
        canvasImageRef.current = canvasRef.current.toDataURL("image/png");
      }
      
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
  }, [isLandscape, desenhou]);

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
    // Salvar estado do canvas após desenhar
    canvasImageRef.current = canvas.toDataURL("image/png");
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
      canvasImageRef.current = null;
    }
  }

  // Função para restaurar imagem do canvas
  const restoreCanvasImage = useCallback(() => {
    if (!canvasRef.current || !canvasImageRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setDesenhou(true);
    };
    img.src = canvasImageRef.current;
  }, []);

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

      let data;
      try {
        data = await res.json();
      } catch (jsonError) {
        console.error("Erro ao parsear resposta:", jsonError);
        toast.error("Erro ao processar resposta do servidor");
        setSalvando(false);
        return;
      }

      if (!res.ok) {
        console.error("Erro na API:", data);
        toast.error(data.error || `Erro ao salvar assinatura (${res.status})`);
        setSalvando(false);
        return;
      }

      if (!data.ok) {
        toast.error(data.error || "Erro ao salvar assinatura");
        setSalvando(false);
        return;
      }

      toast.success("Assinatura do professor salva!");
      setImagemUrl("");
      setDesenhou(false);
      canvasImageRef.current = null;
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar assinatura:", error);
      toast.error(error instanceof Error ? error.message : "Erro de conexão");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={isLandscape && modo === "manual" 
          ? "sm:max-w-[100vw] sm:max-h-[100vh] sm:w-[100vw] sm:h-[100vh] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-none p-1 sm:p-2 m-0" 
          : modo === "manual"
          ? "sm:max-w-[95vw] sm:w-[95vw] p-2 sm:p-3"
          : "sm:max-w-[600px]"
        }
        style={isLandscape && modo === "manual" 
          ? { margin: 0, padding: '8px', maxWidth: '100vw', maxHeight: '100vh', width: '100vw', height: '100vh' }
          : modo === "manual"
          ? { maxWidth: '95vw', width: '95vw', margin: '0 auto' }
          : {}
        }
      >
        {isLandscape && modo === "manual" ? (
          <div className="flex flex-col h-full" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header compacto em landscape com botão Salvar */}
            <div className="flex items-center justify-between mb-2 pb-2 border-b" style={{ minHeight: '52px', flexShrink: 0, paddingBottom: '12px' }}>
              <h3 className="text-sm font-semibold">Assinatura do Professor</h3>
              <Button
                type="button"
                onClick={handleSalvar}
                disabled={salvando || !desenhou}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
                style={{ minHeight: '36px', padding: '8px 16px' }}
              >
                {salvando ? "Salvando..." : "Salvar Assinatura"}
              </Button>
            </div>
          </div>
        ) : (
          <DialogHeader>
            <DialogTitle>Assinatura do Professor</DialogTitle>
            <DialogDescription>
              Cole uma imagem ou desenhe sua assinatura manualmente.
            </DialogDescription>
          </DialogHeader>
        )}

        <div className={isLandscape && modo === "manual" ? "flex flex-col h-full" : "space-y-4 mt-4"}>
          {/* Seleção de modo - esconder em landscape */}
          {(!isLandscape || modo !== "manual") && (
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
          )}

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
            <div className={isLandscape ? "flex flex-col h-full flex-1" : "space-y-4"} style={isLandscape ? { height: '100%', display: 'flex', flexDirection: 'column', flex: 1 } : {}}>
              {!isLandscape && (
                <>
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
                      Rotacionar para Horizontal
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    💡 Dica: Rotacione para horizontal para ter mais espaço para assinar
                  </p>
                </>
              )}
              {/* Container do canvas - sem bordas, expandindo completamente */}
              <div 
                className={isLandscape 
                  ? "flex-1 flex flex-col bg-white touch-none min-h-0 w-full" 
                  : "border-2 border-gray-300 rounded-lg p-2 bg-white touch-none w-full"
                }
                style={isLandscape 
                  ? { 
                      flex: 1, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      minHeight: 0, 
                      width: '100%',
                      padding: 0,
                      margin: 0
                    } 
                  : {
                      width: '100%'
                    }
                }
              >
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={isLandscape ? 400 : 300}
                  className={isLandscape
                    ? "w-full h-full cursor-crosshair touch-none"
                    : "w-full border border-gray-200 rounded cursor-crosshair touch-none"
                  }
                  style={{ 
                    touchAction: "none",
                    width: isLandscape ? '100%' : '100%',
                    height: isLandscape ? '100%' : 'auto',
                    display: 'block'
                  }}
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
              {/* Botões - layout diferente em landscape */}
              {isLandscape ? (
                <div className="flex flex-col gap-2 mt-2" style={{ flexShrink: 0, marginTop: '8px' }}>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                      className="flex-1"
                      style={{ minHeight: '44px' }}
                    >
                      Sair
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={limparCanvas}
                      className="flex-1"
                      style={{ minHeight: '44px' }}
                    >
                      Limpar
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        // Salvar estado antes de mudar orientação
                        if (canvasRef.current && desenhou) {
                          canvasImageRef.current = canvasRef.current.toDataURL("image/png");
                        }
                        setIsLandscape(false);
                        if (screen.orientation && typeof (screen.orientation as any).unlock === 'function') {
                          (screen.orientation as any).unlock();
                        }
                        if (document.fullscreenElement) {
                          document.exitFullscreen();
                        }
                      }}
                      className="flex-1 flex items-center justify-center gap-2"
                      style={{ minHeight: '44px' }}
                    >
                      <RotateCw className="h-4 w-4" />
                      Voltar Vertical
                    </Button>
                    <Button
                      type="button"
                      onClick={handleSalvar}
                      disabled={salvando || !desenhou}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      style={{ minHeight: '44px' }}
                    >
                      {salvando ? "Salvando..." : "Salvar Assinatura"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
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
            </div>
          )}

          {/* Botões de ação - esconder em landscape manual */}
          {(!isLandscape || modo !== "manual") && (
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

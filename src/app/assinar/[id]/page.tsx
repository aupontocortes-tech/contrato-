"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DocumentoContrato } from "@/components/DocumentoContrato";
import { ContratoCorpoVisual } from "@/components/ContratoCorpoVisual";
import { toast } from "sonner";
import { PenLine, Eraser, RotateCw, Download, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getPointerFromEvent,
  restoreCanvasImage,
  setCanvasDimensions,
} from "@/lib/signature-pad";

type ContratoEstruturado = {
  titulo: string;
  logoPlaceholder: string;
  identificacaoTexto: string;
  nomeContratante: string;
  cpfContratante: string;
  telefone?: string | null;
  email?: string;
  clausulas: Array<{ numero: string; titulo: string; texto: string }>;
  assinaturaContratada: string;
  assinaturaContratante: string;
  blocoAssinaturaDigital?: string;
};

type Contrato = {
  id: number;
  status: string;
  assinatura_professor_url?: string | null;
  pdf_contrato_assinado_url?: string | null;
  aluno: { nome_completo: string };
  plano: { nome_plano: string };
};

export default function AssinarPage() {
  const params = useParams();
  const id = params.id as string;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [contrato, setContrato] = useState<Contrato | null>(null);
  const [conteudo, setConteudo] = useState<ContratoEstruturado | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [assinando, setAssinando] = useState(false);
  const [desenhou, setDesenhou] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const desenhandoRef = useRef(false);
  const [modo, setModo] = useState<"gov" | "manual">("manual");
  const [govSignedFileName, setGovSignedFileName] = useState<string>("");
  const [govSignedDataUrl, setGovSignedDataUrl] = useState<string>("");
  const [isLandscape, setIsLandscape] = useState(false);
  const canvasImageRef = useRef<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoadError(null);
    fetch(`/api/contratos/${id}/public-conteudo`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) {
          const msg = data?.error || "Erro ao carregar contrato.";
          const friendly =
            typeof msg === "string" && (msg.includes("DATABASE") || msg.includes("banco"))
              ? "O contrato não pôde ser carregado no momento. Tente novamente em alguns minutos ou avise seu professor."
              : msg;
          setLoadError(friendly);
          return;
        }
        if (data.contrato) setContrato(data.contrato);
        if (data.conteudo) setConteudo(data.conteudo);
      })
      .catch(() => setLoadError("Erro de conexão. Verifique o link e tente novamente."))
      .finally(() => setLoading(false));
  }, [id]);

  const startDrawing = useCallback((e: React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    const { x, y } = getPointerFromEvent(canvas, e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    desenhandoRef.current = true;
  }, []);

  const draw = useCallback((e: React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!desenhandoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getPointerFromEvent(canvas, e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setDesenhou(true);
    // Salvar estado do canvas após desenhar
    canvasImageRef.current = canvas.toDataURL("image/png");
  }, []);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    desenhandoRef.current = false;
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setDesenhou(false);
    canvasImageRef.current = null;
  }, []);

  const handleGovSignedUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!allowed) {
      toast.error("Envie o PDF assinado no GOV (arquivo .pdf).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setGovSignedDataUrl((event.target?.result as string) || "");
      setGovSignedFileName(file.name);
      setModo("gov");
      setDesenhou(true);
    };
    reader.readAsDataURL(file);
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
    if (!contrato || modo !== "manual") return;

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
  }, [contrato, modo, isLandscape]);

  useEffect(() => {
    if (!contrato || modo !== "manual" || !canvasRef.current) return;
    const canvas = canvasRef.current;
    
    const resizeCanvas = () => {
      if (!canvas || !canvas.parentElement) return;
      const saved = canvasImageRef.current;
      
      if (isLandscape) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const headerHeight = 52;
        const buttonsHeight = 120;
        const availableHeight = viewportHeight - headerHeight - buttonsHeight;
        const availableWidth = viewportWidth - 16;
        setCanvasDimensions(canvas, availableWidth, availableHeight, 3);
        canvas.style.display = "block";
        canvas.style.margin = "0";
      } else {
        const container = canvas.parentElement;
        if (!container) return;
        const containerWidth = container.clientWidth - 32;
        const isMobile = window.innerWidth < 640;
        const canvasHeight = isMobile ? 250 : 300;
        const canvasWidth = Math.min(containerWidth, isMobile ? containerWidth : 600);
        setCanvasDimensions(canvas, canvasWidth, canvasHeight, isMobile ? 3 : 2);
        canvas.style.display = "block";
        canvas.style.margin = "0 auto";
      }
      
      if (saved) {
        restoreCanvasImage(canvas, saved, () => setDesenhou(true));
      }
    };
    
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("orientationchange", resizeCanvas);
    
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("orientationchange", resizeCanvas);
    };
  }, [contrato, modo, isLandscape]);

  async function handleAssinar() {
    setAssinando(true);
    try {
      let assinaturaDataUrl: string;
      let signedPdfDataUrl: string | undefined;

      if (modo === "gov") {
        if (!govSignedDataUrl) {
          toast.error("Baixe, assine no GOV e envie o PDF assinado.");
          setAssinando(false);
          return;
        }
        assinaturaDataUrl = "";
        signedPdfDataUrl = govSignedDataUrl;
      } else {
        if (!canvasRef.current) {
          toast.error("Erro: Canvas não encontrado");
          setAssinando(false);
          return;
        }
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          toast.error("Erro: Contexto do canvas não encontrado");
          setAssinando(false);
          return;
        }
        
        // Verificar se há conteúdo desenhado no canvas
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const hasPixels = imageData.data.some((v, i) => i % 4 === 3 && v > 0);
        
        if (!hasPixels) {
          toast.error("Desenhe sua assinatura antes de salvar");
          setAssinando(false);
          return;
        }
        
        try {
          assinaturaDataUrl = canvas.toDataURL("image/png");
          
          if (!assinaturaDataUrl || assinaturaDataUrl === "data:," || assinaturaDataUrl.length < 100) {
            toast.error("Erro ao gerar imagem da assinatura");
            setAssinando(false);
            return;
          }
        } catch (canvasError) {
          console.error("Erro ao gerar imagem do canvas:", canvasError);
          toast.error("Erro ao gerar imagem da assinatura");
          setAssinando(false);
          return;
        }
      }

      const res = await fetch(`/api/contratos/${id}/assinar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signature: assinaturaDataUrl || undefined,
          signed_pdf: signedPdfDataUrl,
          signed_pdf_name: govSignedFileName || undefined,
          method: modo,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        const errorMsg = data?.error || `Erro ao salvar assinatura (${res.status})`;
        console.error("Erro ao salvar assinatura:", errorMsg);
        toast.error(errorMsg);
        setAssinando(false);
        return;
      }

      toast.success("Contrato assinado com sucesso!");
      setGovSignedDataUrl("");
      setGovSignedFileName("");
      setDesenhou(false);
      canvasImageRef.current = null;
      setContrato((c) => (c ? { ...c, status: "assinado" } : null));
    } catch (error) {
      console.error("Erro ao salvar assinatura:", error);
      toast.error(error instanceof Error ? error.message : "Erro de conexão");
    } finally {
      setAssinando(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <p className="text-muted-foreground">Carregando contrato...</p>
      </div>
    );
  }
  if (loadError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/30 gap-4">
        <p className="text-destructive font-medium text-center">{loadError}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Tente novamente
        </Button>
      </div>
    );
  }
  if (!contrato || !conteudo) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <p className="text-muted-foreground">Contrato não encontrado.</p>
      </div>
    );
  }

  if (contrato.status === "assinado" || contrato.pdf_contrato_assinado_url) {
    const handleDownload = () => {
      window.open(`/api/contratos/${id}/download-pdf`, "_blank");
    };

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 space-y-4">
            <p className="text-green-600 font-medium text-center">
              Contrato assinado com sucesso!
            </p>
            <p className="text-sm text-muted-foreground text-center">
              Você pode baixar uma cópia do contrato assinado abaixo.
            </p>
            <Button onClick={handleDownload} className="w-full" size="lg">
              <Download className="size-5 mr-2" />
              Baixar Contrato Assinado (PDF)
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Verifica se o professor já assinou (necessário para o aluno poder assinar)
  if (
    !contrato.pdf_contrato_assinado_url &&
    !contrato.assinatura_professor_url &&
    contrato.status !== "professor_assinado"
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-orange-600 font-medium text-center">
              Aguardando assinatura do professor.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col bg-muted/30">
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      <meta name="theme-color" content="hsl(var(--muted))" />

      {/* Contrato visível */}
      <section className="flex-1 p-4 pb-6 overflow-auto">
        <div className="max-w-2xl mx-auto">
          <DocumentoContrato compact>
            <ContratoCorpoVisual
              conteudo={conteudo}
              nomePlano={contrato.plano.nome_plano}
              compact
              hideAssinaturasGrid
              tituloClassName="text-lg md:text-xl font-bold text-center leading-tight uppercase tracking-tight text-neutral-900"
              childrenAfterClausulas={
                <p className="text-sm text-muted-foreground mt-6 text-center">
                  Role até o final da página para assinar de próprio punho.
                </p>
              }
            />
          </DocumentoContrato>
        </div>
      </section>

      {/* Bloco de assinatura do cliente — opção GOV + assinatura manual */}
      <section className="flex-shrink-0 p-4 pt-0 border-t border-border bg-background/95">
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-base font-semibold">Assinatura do cliente</h2>
          <p className="text-sm text-muted-foreground">
            Você pode assinar no GOV e enviar o PDF assinado ou assinar com o dedo aqui no app.
          </p>
          
          {/* Seleção de modo */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={modo === "gov" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setModo("gov");
                setDesenhou(!!govSignedDataUrl);
              }}
              className="flex-1"
            >
              <Download className="size-4 mr-2" />
              Assinar no GOV
            </Button>
            <Button
              type="button"
              variant={modo === "manual" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setModo("manual");
                setDesenhou(!!canvasImageRef.current);
              }}
              className="flex-1"
            >
              <PenLine className="size-4 mr-2" />
              Desenhar
            </Button>
          </div>

          {/* Modo GOV */}
          {modo === "gov" && (
            <div className="space-y-3">
              <div className="border rounded-lg p-4 bg-white space-y-3">
                <div className="grid gap-2">
                  <Label className="text-sm font-medium">1) Baixe o contrato</Label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.open(`/api/contratos/${id}/download-pdf`, "_blank")}
                  >
                    <Download className="size-4 mr-2" />
                    Baixar contrato (PDF)
                  </Button>
                </div>

                <div className="grid gap-2">
                  <Label className="text-sm font-medium">2) Assine no GOV e salve o PDF no celular/computador</Label>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="upload-assinatura-gov" className="text-sm font-medium">
                    3) Envie o PDF assinado para finalizar:
                  </Label>
                </div>
                <Input
                  id="upload-assinatura-gov"
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handleGovSignedUpload}
                />
                {govSignedDataUrl && (
                  <div className="rounded border border-emerald-200 bg-emerald-50 p-3">
                    <p className="text-sm font-medium text-emerald-800">
                      PDF assinado recebido: {govSignedFileName || "arquivo.pdf"}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setGovSignedDataUrl("");
                        setGovSignedFileName("");
                        setDesenhou(false);
                      }}
                      className="w-full mt-2"
                    >
                      <X className="size-4 mr-2" />
                      Remover PDF enviado
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Modo desenhar */}
          {modo === "manual" && (
            <div className={isLandscape ? "flex flex-col h-full flex-1" : "space-y-3"} style={isLandscape ? { height: '100%', display: 'flex', flexDirection: 'column', flex: 1 } : {}}>
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
              {/* Container do canvas - responsivo para desktop e mobile */}
              <div 
                className={isLandscape 
                  ? "flex-1 flex flex-col bg-white touch-none min-h-0 w-full border-2 border-gray-300 rounded-lg" 
                  : "border-2 border-gray-300 rounded-lg p-2 sm:p-4 bg-white touch-none w-full"
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
                      width: '100%',
                      minHeight: '200px'
                    }
                }
              >
                <canvas
                  ref={canvasRef}
                  className={isLandscape
                    ? "cursor-crosshair touch-none"
                    : "border border-gray-200 rounded cursor-crosshair touch-none mx-auto"
                  }
                  style={{
                    touchAction: "none",
                    display: "block",
                    maxWidth: "100%",
                    maxHeight: isLandscape ? "none" : "400px",
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
                      onClick={clearCanvas}
                      className="flex-1"
                      style={{ minHeight: '44px' }}
                    >
                      Limpar
                    </Button>
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
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={clearCanvas}
                    className="w-full"
                  >
                    <Eraser className="size-4 mr-2" />
                    Limpar e assinar de novo
                  </Button>
                </div>
              )}
            </div>
          )}

          <Button
            className="w-full h-12 text-base"
            size="lg"
            onClick={handleAssinar}
            disabled={assinando || (modo === "gov" ? !govSignedDataUrl : !desenhou)}
          >
            <PenLine className="size-5 mr-2" />
            {assinando ? "Registrando..." : modo === "gov" ? "Enviar PDF assinado e concluir" : "Confirmar assinatura"}
          </Button>
        </div>
      </section>
    </div>
  );
}

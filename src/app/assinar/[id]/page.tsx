"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DocumentoContrato } from "@/components/DocumentoContrato";
import { toast } from "sonner";
import { PenLine, Eraser, Upload, RotateCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const desenhandoRef = useRef(false);
  const [modo, setModo] = useState<"colar" | "manual">("manual");
  const [imagemUrl, setImagemUrl] = useState<string>("");
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

  const getCoords = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0) return { x: 0, y: 0 };
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      if ("touches" in e) {
        return {
          x: (e.touches[0].clientX - rect.left) * scaleX,
          y: (e.touches[0].clientY - rect.top) * scaleY,
        };
      }
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    },
    []
  );

  const draw = useCallback((x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineTo(x, y);
    ctx.stroke();
  }, []);

  const startDraw = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const { x, y } = getCoords(e);
      ctx.beginPath();
      ctx.moveTo(x, y);
      desenhandoRef.current = true;
      setDesenhou(true);
    },
    [getCoords]
  );

  const moveDraw = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();
      if (!desenhandoRef.current) return;
      const { x, y } = getCoords(e);
      draw(x, y);
      // Salvar estado do canvas após desenhar
      if (canvasRef.current) {
        canvasImageRef.current = canvasRef.current.toDataURL("image/png");
      }
    },
    [getCoords, draw]
  );

  const endDraw = useCallback(() => {
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
            setModo("colar");
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
        setModo("colar");
      };
      reader.readAsDataURL(file);
    }
  }

  // Função para rotacionar a tela para horizontal
  const toggleLandscape = useCallback(async () => {
    try {
      // Salvar estado do canvas antes de mudar orientação
      if (canvasRef.current && desenhou) {
        canvasImageRef.current = canvasRef.current.toDataURL("image/png");
      }
      
      if (!isLandscape) {
        // Tentar usar Screen Orientation API
        if (screen.orientation && typeof (screen.orientation as any).lock === 'function') {
          try {
            await (screen.orientation as any).lock("landscape");
            setIsLandscape(true);
            toast.success("Tela rotacionada para horizontal");
            return;
          } catch (lockError) {
            console.log("Lock não disponível");
          }
        }
        
        // Método alternativo usando fullscreen
        if (document.documentElement.requestFullscreen) {
          try {
            await document.documentElement.requestFullscreen();
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
        
        toast.info("Por favor, rotacione seu dispositivo para horizontal", {
          duration: 5000,
        });
        setIsLandscape(true);
      } else {
        // Voltar para portrait
        if (screen.orientation && typeof (screen.orientation as any).unlock === 'function') {
          try {
            (screen.orientation as any).unlock();
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
        
        if (document.fullscreenElement) {
          try {
            await document.exitFullscreen();
          } catch (e) {
            console.log("Erro ao sair do fullscreen");
          }
        }
        
        toast.info("Por favor, rotacione seu dispositivo para vertical", {
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
        // Restaurar imagem do canvas após mudança de orientação
        setTimeout(() => {
          if (canvasImageRef.current && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              const img = new Image();
              img.onload = () => {
                const currentCtx = canvas.getContext("2d");
                if (currentCtx) {
                  currentCtx.clearRect(0, 0, canvas.width, canvas.height);
                  currentCtx.drawImage(img, 0, 0, canvas.width, canvas.height);
                  setDesenhou(true);
                }
              };
              img.src = canvasImageRef.current;
            }
          }
        }, 100);
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
    const canvas = canvasRef.current;
    if (!canvas || !contrato || modo !== "manual") return;
    const container = canvas.parentElement;
    if (!container) return;

    const resizeCanvas = () => {
      if (!canvas || !container) return;
      
      // Em landscape, usar quase toda a tela
      if (isLandscape) {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const headerHeight = 52;
        const buttonsHeight = 200;
        const availableHeight = viewportHeight - headerHeight - buttonsHeight;
        const availableWidth = viewportWidth - 16;
        
        const canvasWidth = availableWidth;
        const canvasHeight = availableHeight;
        
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.width = `${availableWidth}px`;
        canvas.style.height = `${availableHeight}px`;
      } else {
        // Em portrait, usar tamanho padrão
        const w = container.clientWidth || 320;
        const h = 200;
        canvas.width = w;
        canvas.height = h;
        canvas.style.width = w + "px";
        canvas.style.height = h + "px";
      }
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
      
      // Restaurar imagem se existir
      if (canvasImageRef.current && ctx) {
        const img = new Image();
        img.onload = () => {
          const currentCtx = canvas.getContext("2d");
          if (currentCtx) {
            currentCtx.clearRect(0, 0, canvas.width, canvas.height);
            currentCtx.drawImage(img, 0, 0, canvas.width, canvas.height);
            setDesenhou(true);
          }
        };
        img.src = canvasImageRef.current;
      }
    };

    resizeCanvas();
    const ro = new ResizeObserver(resizeCanvas);
    ro.observe(container);
    return () => ro.disconnect();
  }, [contrato, modo, isLandscape]);

  async function handleAssinar() {
    setAssinando(true);
    try {
      let assinaturaDataUrl: string;

      if (modo === "colar") {
        if (!imagemUrl) {
          toast.error("Cole ou faça upload de uma imagem de assinatura");
          setAssinando(false);
          return;
        }
        assinaturaDataUrl = imagemUrl;
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
        body: JSON.stringify({ signature: assinaturaDataUrl }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        const errorMsg = data?.error || `Erro ao salvar assinatura (${res.status})`;
        console.error("Erro ao salvar assinatura:", errorMsg);
        toast.error(errorMsg);
        setAssinando(false);
        return;
      }

      toast.success("Excluído");
      setImagemUrl("");
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

  if (contrato.status === "assinado") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-green-600 font-medium text-center">
              Este contrato já foi assinado.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Verifica se o professor já assinou (necessário para o aluno poder assinar)
  if (!contrato.assinatura_professor_url && contrato.status !== "professor_assinado") {
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
              <h1 className="text-lg md:text-xl font-bold text-center leading-tight uppercase tracking-tight text-neutral-900">
                {conteudo.titulo.includes("\n") ? (
                  conteudo.titulo.split("\n").map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < conteudo.titulo.split("\n").length - 1 && <br />}
                    </span>
                  ))
                ) : (
                  <>
                    {conteudo.titulo.replace(/\s+DE\s+PERSONAL\s+TRAINER$/i, "").trim()}
                    <br />
                    <span className="text-base md:text-lg">DE PERSONAL TRAINER</span>
                  </>
                )}
              </h1>
              <p className="text-center mt-4 mb-6" aria-hidden> </p>
              <section className="mb-6 text-left">
                <h2 className="text-sm font-bold uppercase tracking-wide mb-3 text-left text-neutral-800">
                  Identificação das partes
                </h2>
                <p className="text-sm leading-relaxed mb-3 text-neutral-700">
                  {conteudo.identificacaoTexto}
                </p>
                <p className="text-sm text-neutral-800">
                  <strong className="font-semibold">Nome completo:</strong> {conteudo.nomeContratante}
                </p>
                <p className="text-sm text-neutral-800">
                  <strong className="font-semibold">CPF:</strong> {conteudo.cpfContratante}
                </p>
                {conteudo.telefone && (
                  <p className="text-sm text-neutral-800">
                    <strong className="font-semibold">Telefone:</strong> {conteudo.telefone}
                  </p>
                )}
                {conteudo.email && (
                  <p className="text-sm text-neutral-800">
                    <strong className="font-semibold">E-mail:</strong> {conteudo.email}
                  </p>
                )}
              </section>
              <div className="space-y-4 text-left">
                {conteudo.clausulas.map((cl) => (
                  <section key={cl.numero}>
                    <h3 className="text-sm font-bold uppercase tracking-wide mb-1 text-neutral-800">
                      Cláusula {cl.numero} – {cl.titulo}
                    </h3>
                    <p className="text-sm leading-relaxed text-neutral-700">{cl.texto}</p>
                  </section>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-6 text-center">
                Role até o final da página para assinar de próprio punho.
              </p>
          </DocumentoContrato>
        </div>
      </section>

      {/* Bloco de assinatura — cliente clica e assina aqui */}
      <section className="flex-shrink-0 p-4 pt-0 border-t border-border bg-background/95">
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="text-base font-semibold">Assinatura</h2>
          
          {/* Seleção de modo */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={modo === "colar" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setModo("colar");
                setDesenhou(!!imagemUrl);
              }}
              className="flex-1"
            >
              <Upload className="size-4 mr-2" />
              Colar assinatura (GOV)
            </Button>
            <Button
              type="button"
              variant={modo === "manual" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setModo("manual");
                setImagemUrl("");
              }}
              className="flex-1"
            >
              <PenLine className="size-4 mr-2" />
              Desenhar
            </Button>
          </div>

          {/* Modo colar */}
          {modo === "colar" && (
            <div className="space-y-3">
              <div
                onPaste={handlePaste}
                className="border-2 border-dashed border-muted-foreground/40 rounded-lg p-4 bg-white"
              >
                <Label htmlFor="upload-assinatura" className="text-sm font-medium block mb-2">
                  Cole a imagem da assinatura (Ctrl+V) ou faça upload:
                </Label>
                <Input
                  id="upload-assinatura"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="mb-2"
                />
                {imagemUrl && (
                  <div className="mt-3">
                    <img
                      src={imagemUrl}
                      alt="Assinatura colada"
                      className="max-w-full h-auto max-h-48 mx-auto border border-gray-300 rounded"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setImagemUrl("");
                        setDesenhou(false);
                      }}
                      className="w-full mt-2"
                    >
                      <X className="size-4 mr-2" />
                      Remover imagem
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Modo desenhar */}
          {modo === "manual" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Assine no quadro abaixo com o dedo.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={toggleLandscape}
                  className="flex items-center gap-2"
                >
                  <RotateCw className="size-4" />
                  {isLandscape ? "Vertical" : "Horizontal"}
                </Button>
              </div>
              <div className="w-full border-2 border-dashed border-muted-foreground/40 rounded-lg overflow-hidden bg-white touch-none" style={{ height: isLandscape ? "auto" : "200px", minHeight: isLandscape ? "300px" : "200px" }}>
                <canvas
                  ref={canvasRef}
                  className="block w-full cursor-crosshair"
                  style={{ touchAction: "none", height: isLandscape ? "100%" : "200px" }}
                  onMouseDown={startDraw}
                  onMouseMove={moveDraw}
                  onMouseUp={endDraw}
                  onMouseLeave={endDraw}
                  onTouchStart={startDraw}
                  onTouchMove={moveDraw}
                  onTouchEnd={endDraw}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearCanvas}
                className="w-full"
              >
                <Eraser className="size-4 mr-2" />
                Limpar e assinar de novo
              </Button>
            </div>
          )}

          <Button
            className="w-full h-12 text-base"
            size="lg"
            onClick={handleAssinar}
            disabled={assinando || (modo === "colar" ? !imagemUrl : !desenhou)}
          >
            <PenLine className="size-5 mr-2" />
            {assinando ? "Registrando..." : "Confirmar assinatura"}
          </Button>
        </div>
      </section>
    </div>
  );
}

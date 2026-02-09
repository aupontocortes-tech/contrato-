"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DocumentoContrato } from "@/components/DocumentoContrato";
import { toast } from "sonner";
import { PenLine, Eraser } from "lucide-react";

type ContratoEstruturado = {
  titulo: string;
  logoPlaceholder: string;
  identificacaoTexto: string;
  nomeContratante: string;
  cpfContratante: string;
  clausulas: Array<{ numero: string; titulo: string; texto: string }>;
  assinaturaContratada: string;
  assinaturaContratante: string;
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
  const [assinando, setAssinando] = useState(false);
  const [desenhou, setDesenhou] = useState(false);
  const desenhandoRef = useRef(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/contratos/${id}/public-conteudo`)
      .then((r) => r.json())
      .then((data) => {
        if (data.contrato) setContrato(data.contrato);
        if (data.conteudo) setConteudo(data.conteudo);
      })
      .catch(() => {})
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
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !contrato) return;
    const container = canvas.parentElement;
    if (!container) return;

    const init = () => {
      const w = container.clientWidth || 320;
      const h = 200;
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    };

    init();
    const ro = new ResizeObserver(init);
    ro.observe(container);
    return () => ro.disconnect();
  }, [contrato]);

  async function handleAssinar() {
    if (!desenhou || !canvasRef.current) return;
    setAssinando(true);
    try {
      const dataUrl = canvasRef.current.toDataURL("image/png");
      const res = await fetch(`/api/contratos/${id}/assinar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature: dataUrl }),
      });
      if (!res.ok) {
        toast.error("Erro ao registrar assinatura");
        return;
      }
      toast.success("Contrato assinado com sucesso!");
      setContrato((c) => (c ? { ...c, status: "assinado" } : null));
    } catch {
      toast.error("Erro de conexão");
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
                {conteudo.titulo.replace(/\s+DE\s+PERSONAL\s+TRAINER$/i, "").trim()}
                <br />
                <span className="text-base md:text-lg">DE PERSONAL TRAINER</span>
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
          <h2 className="text-base font-semibold">Assinatura de próprio punho</h2>
          <p className="text-sm text-muted-foreground">
            Assine no quadro abaixo com o dedo. No celular, use na horizontal para mais espaço.
          </p>
          <div className="w-full h-[200px] border-2 border-dashed border-muted-foreground/40 rounded-lg overflow-hidden bg-white touch-none">
            <canvas
              ref={canvasRef}
              className="block w-full h-[200px] cursor-crosshair"
              style={{ touchAction: "none" }}
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
          <Button
            className="w-full h-12 text-base"
            size="lg"
            onClick={handleAssinar}
            disabled={!desenhou || assinando}
          >
            <PenLine className="size-5 mr-2" />
            {assinando ? "Registrando..." : "Confirmar assinatura"}
          </Button>
        </div>
      </section>
    </div>
  );
}

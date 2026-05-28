/** Utilitários para assinatura manual — coordenadas alinhadas ao toque (CSS + DPR). */

export function configureSignatureContext(
  ctx: CanvasRenderingContext2D,
  lineWidth = 3,
  strokeStyle = "#000"
) {
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
}

/** Define buffer em device pixels e escala do contexto em CSS pixels. */
export function setCanvasDimensions(
  canvas: HTMLCanvasElement,
  cssWidth: number,
  cssHeight: number,
  lineWidth = 3,
  strokeStyle = "#000"
) {
  const dpr = window.devicePixelRatio || 1;
  const w = Math.max(1, Math.round(cssWidth));
  const h = Math.max(1, Math.round(cssHeight));
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    configureSignatureContext(ctx, lineWidth, strokeStyle);
  }
}

/** Ponto em coordenadas CSS (mesmo espaço do contexto após scale(dpr)). */
export function getCanvasPointer(
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
  };
}

export function getPointerFromEvent(
  canvas: HTMLCanvasElement,
  e: React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>
): { x: number; y: number } {
  if ("touches" in e) {
    const t =
      e.touches.length > 0
        ? e.touches[0]
        : e.changedTouches.length > 0
          ? e.changedTouches[0]
          : null;
    if (t) return getCanvasPointer(canvas, t.clientX, t.clientY);
    return { x: 0, y: 0 };
  }
  const me = e as React.MouseEvent<HTMLCanvasElement>;
  return getCanvasPointer(canvas, me.clientX, me.clientY);
}

export function restoreCanvasImage(
  canvas: HTMLCanvasElement,
  dataUrl: string | null,
  onRestored?: () => void
) {
  if (!dataUrl) return;
  const img = new Image();
  img.onload = () => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.width / dpr;
    const cssH = canvas.height / dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);
    ctx.drawImage(img, 0, 0, cssW, cssH);
    onRestored?.();
  };
  img.src = dataUrl;
}

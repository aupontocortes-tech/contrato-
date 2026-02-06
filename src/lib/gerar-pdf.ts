import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import path from "path";
import fs from "fs/promises";
import type { ContratoEstruturado } from "./contrato-template";

const LOGO_PATH = path.join(process.cwd(), "public", "logo.png");
const WATERMARK_PATH = path.join(process.cwd(), "public", "logo-watermark.png");
const WATERMARK_WIDTH_PT = 595 * 0.35; // 35% da largura da página (A4)

const CHARS_PER_LINE = 72;
const MARGIN = 56;
const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const LINE_HEIGHT = 14;
const FONT_SIZE_NORMAL = 11;
const FONT_SIZE_TITLE = 15;
const FONT_SIZE_HEADING = 11;

function wrapText(text: string): string[] {
  const lines: string[] = [];
  const words = text.split(/\s+/);
  let current = "";
  for (const w of words) {
    const trial = current ? `${current} ${w}` : w;
    if (trial.length > CHARS_PER_LINE && current) {
      lines.push(current);
      current = w;
    } else {
      current = trial;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawLines(
  doc: PDFDocument,
  page: ReturnType<PDFDocument["addPage"]>,
  font: Awaited<ReturnType<PDFDocument["embedFont"]>>,
  fontBold: Awaited<ReturnType<PDFDocument["embedFont"]>>,
  lines: string[],
  opts: { x: number; y: number; size?: number; bold?: boolean }
): { page: ReturnType<PDFDocument["addPage"]>; y: number } {
  let currentPage = page;
  let y = opts.y;
  const size = opts.size ?? FONT_SIZE_NORMAL;
  const fontToUse = opts.bold ? fontBold : font;
  for (const line of lines) {
    if (y < MARGIN + 40) {
      currentPage = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }
    currentPage.drawText(line, {
      x: opts.x,
      y,
      size,
      font: fontToUse,
      color: rgb(0, 0, 0),
    });
    y -= LINE_HEIGHT;
  }
  return { page: currentPage, y };
}

export async function gerarPdfFromContrato(contrato: ContratoEstruturado): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.TimesRoman);
  const fontBold = await doc.embedFont(StandardFonts.TimesRomanBold);
  let page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const width = page.getWidth();
  let y = PAGE_HEIGHT - MARGIN;

  // Marca d'água (só na primeira página, atrás do título)
  try {
    const wmBytes = await fs.readFile(WATERMARK_PATH);
    const wmImage = await doc.embedPng(wmBytes);
    const { width: wmW, height: wmH } = wmImage.scaleToFit(WATERMARK_WIDTH_PT, 280);
    page.drawImage(wmImage, {
      x: (width - wmW) / 2,
      y: y - 120 - wmH,
      width: wmW,
      height: wmH,
    });
  } catch {
    // logo-watermark.png ausente; segue sem marca d'água
  }

  // Título (centralizado, caixa alta, fonte serifada elegante)
  const tituloLines = wrapText(contrato.titulo);
  for (const ln of tituloLines) {
    const tw = fontBold.widthOfTextAtSize(ln, FONT_SIZE_TITLE);
    page.drawText(ln, {
      x: (width - tw) / 2,
      y,
      size: FONT_SIZE_TITLE,
      font: fontBold,
      color: rgb(0, 0, 0),
    });
    y -= LINE_HEIGHT + 2;
  }
  y -= LINE_HEIGHT * 2;

  // Identificação das partes
  page.drawText("IDENTIFICAÇÃO DAS PARTES", {
    x: MARGIN,
    y,
    size: FONT_SIZE_HEADING,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  y -= LINE_HEIGHT + 8;

  const idLines = wrapText(contrato.identificacaoTexto);
  const idResult = drawLines(doc, page, font, fontBold, idLines, { x: MARGIN, y });
  page = idResult.page;
  y = idResult.y - LINE_HEIGHT;

  const dados = [`Nome completo: ${contrato.nomeContratante}`, `CPF: ${contrato.cpfContratante}`];
  for (const d of dados) {
    page.drawText(d, { x: MARGIN, y, size: FONT_SIZE_NORMAL, font, color: rgb(0, 0, 0) });
    y -= LINE_HEIGHT;
  }
  y -= LINE_HEIGHT;

  // Cláusulas
  for (const cl of contrato.clausulas) {
    if (y < MARGIN + 60) {
      page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }
    const header = `CLÁUSULA ${cl.numero} – ${cl.titulo}`;
    page.drawText(header, {
      x: MARGIN,
      y,
      size: FONT_SIZE_HEADING,
      font: fontBold,
      color: rgb(0, 0, 0),
    });
    y -= LINE_HEIGHT + 2;
    const textoLines = wrapText(cl.texto);
    const clResult = drawLines(doc, page, font, fontBold, textoLines, { x: MARGIN, y });
    page = clResult.page;
    y = clResult.y - LINE_HEIGHT;
  }

  // Assinaturas (nova página se necessário)
  if (y < MARGIN + 80) {
    page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    y = PAGE_HEIGHT - MARGIN;
  }
  y -= LINE_HEIGHT * 2;
  const lineLen = 120;
  const centerX = width / 2;
  page.drawLine({
    start: { x: centerX - lineLen - 60, y },
    end: { x: centerX - 60, y },
    thickness: 0.5,
    color: rgb(0, 0, 0),
  });
  page.drawLine({
    start: { x: centerX + 20, y },
    end: { x: centerX + 20 + lineLen, y },
    thickness: 0.5,
    color: rgb(0, 0, 0),
  });
  y -= LINE_HEIGHT;
  const w1 = font.widthOfTextAtSize(contrato.assinaturaContratada, FONT_SIZE_NORMAL);
  const w2 = font.widthOfTextAtSize(contrato.assinaturaContratante, FONT_SIZE_NORMAL);
  page.drawText(contrato.assinaturaContratada, {
    x: centerX - lineLen - 60 + (lineLen - w1) / 2,
    y,
    size: FONT_SIZE_NORMAL,
    font,
    color: rgb(0, 0, 0),
  });
  page.drawText(contrato.assinaturaContratante, {
    x: centerX + 20 + (lineLen - w2) / 2,
    y,
    size: FONT_SIZE_NORMAL,
    font,
    color: rgb(0, 0, 0),
  });
  y -= LINE_HEIGHT;
  page.drawText("CONTRATADA", {
    x: centerX - lineLen - 60,
    y,
    size: 9,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  page.drawText("CONTRATANTE", {
    x: centerX + 20,
    y,
    size: 9,
    font,
    color: rgb(0.4, 0.4, 0.4),
  });
  y -= LINE_HEIGHT + 4;
  page.drawText("Data: ____/____/________", { x: centerX - lineLen - 60, y, size: 9, font, color: rgb(0, 0, 0) });
  page.drawText("Data: ____/____/________", { x: centerX + 20, y, size: 9, font, color: rgb(0, 0, 0) });

  return doc.save();
}

/** Compatibilidade: gera PDF a partir do texto completo (fallback). */
export async function gerarPdfBuffer(texto: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  let page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const height = page.getHeight();
  let y = height - MARGIN;

  const inputLines = texto.split("\n");
  for (const line of inputLines) {
    if (y < MARGIN) {
      page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = height - MARGIN;
    }
    const trimmed = line.trim();
    if (!trimmed) {
      y -= LINE_HEIGHT;
      continue;
    }
    const wrapped = wrapText(trimmed);
    for (const ln of wrapped) {
      if (y < MARGIN) {
        page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        y = height - MARGIN;
      }
      page.drawText(ln, {
        x: MARGIN,
        y,
        size: FONT_SIZE_NORMAL,
        font,
        color: rgb(0, 0, 0),
      });
      y -= LINE_HEIGHT;
    }
  }
  return doc.save();
}

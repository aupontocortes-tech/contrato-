/**
 * Gera public/logo-watermark.png: logo com ~5% opacidade em fundo branco,
 * largura ~35% da página A4 (208px), para uso como marca d'água no PDF.
 */
import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");
const logoPath = path.join(projectRoot, "public", "logo.png");
const outPath = path.join(projectRoot, "public", "logo-watermark.png");

const WATERMARK_WIDTH = 208;
const OPACITY = 0.05;

async function main() {
  const buf = await fs.readFile(logoPath);
  const { data, info } = await sharp(buf)
    .resize(WATERMARK_WIDTH, null, { fit: "inside" })
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width: nw, height: nh } = info;
  const out = Buffer.alloc(nw * nh * 3);
  for (let i = 0; i < data.length; i++) {
    const v = data[i];
    const blended = Math.round(255 * (1 - OPACITY) + v * OPACITY);
    const j = i * 3;
    out[j] = out[j + 1] = out[j + 2] = blended;
  }

  await sharp(out, { raw: { width: nw, height: nh, channels: 3 } })
    .png()
    .toFile(outPath);

  console.log("logo-watermark.png gerado em public/");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

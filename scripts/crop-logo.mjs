/**
 * Recorta apenas a área do logo do topo da imagem (contrato completo)
 * e salva como public/logo.png.
 * Uso: node scripts/crop-logo.mjs [caminho-da-imagem]
 * Sem argumentos: usa public/logo.png como origem (faz backup antes).
 */

import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");
const publicDir = path.join(projectRoot, "public");
const logoPath = path.join(publicDir, "logo.png");

const sourcePath = process.argv[2] || logoPath;

async function cropLogo() {
  if (!fs.existsSync(sourcePath)) {
    console.error("Imagem não encontrada:", sourcePath);
    process.exit(1);
  }

  if (sourcePath === logoPath) {
    const backup = path.join(publicDir, "logo-backup-full.png");
    fs.copyFileSync(logoPath, backup);
    console.log("Backup do contrato completo em public/logo-backup-full.png");
  }

  const image = sharp(sourcePath);
  const meta = await image.metadata();
  const w = meta.width || 800;
  const h = meta.height || 1200;

  // Logo fica no topo: recortar ~28% da altura (só o emblema, sem título/texto)
  const cropHeight = Math.round(h * 0.28);

  const buffer = await image
    .extract({ left: 0, top: 0, width: w, height: cropHeight })
    .png()
    .toBuffer();

  await sharp(buffer).toFile(logoPath);
  console.log("Logo recortado salvo em public/logo.png (altura:", cropHeight, "px)");
}

cropLogo().catch((err) => {
  console.error(err);
  process.exit(1);
});

/**
 * Gera public/icon-192.png a partir de public/icon-512.png (PWA).
 * Requer: public/icon-512.png já existir.
 */
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");
const srcPath = path.join(projectRoot, "public", "icon-512.png");
const outPath = path.join(projectRoot, "public", "icon-192.png");

async function main() {
  await sharp(srcPath).resize(192, 192).png().toFile(outPath);
  console.log("Gerado:", outPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

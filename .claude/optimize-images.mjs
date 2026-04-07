import sharp from "sharp";
import { readdir, stat, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imgDir = path.join(__dirname, "../publichttps://media.martynachojnacka.com/images/");

if (!existsSync(imgDir)) {
  console.log("No local images folder, skipping optimization.");
  process.exit(0);
}

const EXTENSIONS = [".png", ".jpg", ".jpeg", ".PNG", ".JPG", ".JPEG"];

async function convertToWebP(filePath) {
  const ext = path.extname(filePath);
  const base = filePath.slice(0, -ext.length);
  const outPath = base + ".webp";

  if (existsSync(outPath)) {
    console.log(`  skip (already exists): ${path.basename(outPath)}`);
    return;
  }

  const before = (await stat(filePath)).size;
  await sharp(filePath)
    .webp({ quality: 82 })
    .toFile(outPath);
  const after = (await stat(outPath)).size;
  const pct = Math.round((1 - after / before) * 100);
  console.log(`  ✓ ${path.basename(filePath)} → ${path.basename(outPath)}  (${(before/1024/1024).toFixed(1)}MB → ${(after/1024/1024).toFixed(1)}MB, -${pct}%)`);
}

const files = await readdir(imgDir);
const targets = files.filter(f => EXTENSIONS.includes(path.extname(f)));

console.log(`Converting ${targets.length} images in ${imgDir} …\n`);
for (const f of targets) {
  await convertToWebP(path.join(imgDir, f));
}
console.log("\nDone.");

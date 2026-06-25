import sharp from "sharp";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const brand = join(root, "brand");

async function png(svgFile, outFile, width) {
  const svg = readFileSync(join(brand, svgFile));
  await sharp(svg, { density: 800 })
    .resize({ width })
    .png()
    .toFile(join(brand, outFile));
  const meta = await sharp(join(brand, outFile)).metadata();
  console.log(`${outFile.padEnd(34)} ${meta.width}x${meta.height}  alpha:${meta.hasAlpha}`);
}

// Transparent standalone hawk mark
await png("tenanthawk-mark.svg", "tenanthawk-mark-1024.png", 1024);
await png("tenanthawk-mark.svg", "tenanthawk-mark-512.png", 512);
await png("tenanthawk-mark.svg", "tenanthawk-mark-256.png", 256);
await png("tenanthawk-mark.svg", "tenanthawk-mark-128.png", 128);

// App-tile icon (rounded slate tile + hawk), transparent around the corners
await png("tenanthawk-icon.svg", "tenanthawk-icon-512.png", 512);
await png("tenanthawk-icon.svg", "tenanthawk-icon-256.png", 256);

console.log("done");

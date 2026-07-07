import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svg = readFileSync(join(root, "brand/tenanthawk-icon.svg"));
const hawkSvg = readFileSync(join(root, "brand/tenanthawk-hawk.svg"));
const publicDir = join(root, "public");

const sizes = [
  { name: "apple-touch-icon.png", size: 180 },
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
];

for (const { name, size } of sizes) {
  await sharp(svg).resize(size, size).png().toFile(join(publicDir, name));
  console.log(`Wrote public/${name} (${size}x${size})`);
}

const pdfMark = await sharp(hawkSvg).resize(128, 128).png().toBuffer();
const brandMarkPath = join(root, "src/lib/export/brand-mark.ts");
writeFileSync(
  brandMarkPath,
  `/** PNG (128×128) generated from brand/tenanthawk-hawk.svg — run \`pnpm icons\` to refresh. */\nexport const HAWK_MARK_PNG_BASE64 =\n  "${pdfMark.toString("base64")}";\n`,
);
console.log(`Wrote ${brandMarkPath} (PDF export mark)`);

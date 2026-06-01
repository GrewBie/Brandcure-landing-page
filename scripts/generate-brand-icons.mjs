/**
 * Generates PNG icons from public/favicon.svg for Google Search & manifest.
 * Run: node scripts/generate-brand-icons.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svg = readFileSync(join(root, "public", "favicon.svg"));

const sizes = [
  { name: "icon-48.png", size: 48 },
  { name: "icon-192.png", size: 192 },
  { name: "logo-512.png", size: 512 },
];

for (const { name, size } of sizes) {
  const out = join(root, "public", name);
  await sharp(svg).resize(size, size).png().toFile(out);
  console.log(`Wrote ${name} (${size}×${size})`);
}

/**
 * Generates /public/og-card.png (1200×630) for Open Graph / LocalBusiness schema.
 * Run: node scripts/generate-og-card.mjs
 */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "public", "og-card.png");

const width = 1200;
const height = 630;

const svg = `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#0f0f0f"/>
  <text x="72" y="108" font-family="system-ui, sans-serif" font-size="36" font-weight="600" fill="#FAFAF8" letter-spacing="6">BRAND</text>
  <text x="248" y="118" font-family="Georgia, serif" font-size="52" font-style="italic" fill="#C4A26A">C</text>
  <text x="292" y="108" font-family="system-ui, sans-serif" font-size="36" font-weight="600" fill="#FAFAF8" letter-spacing="6">URE</text>
  <text x="600" y="330" text-anchor="middle" font-family="system-ui, sans-serif" font-size="56" font-weight="600" fill="#FFFFFF">AI-First Growth Partner</text>
  <text x="600" y="400" text-anchor="middle" font-family="system-ui, sans-serif" font-size="28" fill="#9CA3AF">Chennai · India</text>
  <text x="1120" y="580" text-anchor="end" font-family="system-ui, sans-serif" font-size="24" fill="#6B7280">brandcure.in</text>
</svg>
`;

await sharp(Buffer.from(svg)).png().toFile(out);
console.log(`Wrote ${out}`);

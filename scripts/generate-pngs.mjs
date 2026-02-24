import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = resolve(__dirname, '..', 'public', 'icons');
const publicDir = resolve(__dirname, '..', 'public');

const logoSvg = readFileSync(resolve(iconsDir, 'logo.svg'));
const maskableSvg = readFileSync(resolve(iconsDir, 'logo-maskable.svg'));
const faviconSvg = readFileSync(resolve(publicDir, 'favicon.svg'));

const icons = [
  { name: 'icon-192.png', svg: logoSvg, size: 192 },
  { name: 'icon-512.png', svg: logoSvg, size: 512 },
  { name: 'icon-maskable-192.png', svg: maskableSvg, size: 192 },
  { name: 'icon-maskable-512.png', svg: maskableSvg, size: 512 },
  { name: 'apple-touch-icon.png', svg: maskableSvg, size: 180 },
  { name: 'favicon-32.png', svg: faviconSvg, size: 32 },
  { name: 'favicon-16.png', svg: faviconSvg, size: 16 },
];

for (const icon of icons) {
  const output = resolve(iconsDir, icon.name);
  await sharp(icon.svg, { density: 300 })
    .resize(icon.size, icon.size)
    .png()
    .toFile(output);
  const stat = readFileSync(output);
  console.log(`Generated ${icon.name} (${stat.length} bytes)`);
}

console.log('All icons generated successfully.');

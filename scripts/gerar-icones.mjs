#!/usr/bin/env node
// Favicon e apple-touch-icon a partir do monograma (versão pequena: traço 18).
// Uso: node scripts/gerar-icones.mjs  → public/favicon.svg, favicon-32.png, apple-touch-icon.png
import { readFileSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';
import { paleta } from '../src/styles/tokens.mjs';

const mark = readFileSync('media-originais/marca/giyma-logo-mark.svg', 'utf8').replace(
  'stroke-width="11"',
  'stroke-width="18"',
);
const desenho = mark.match(/<g[\s\S]*<\/g>/)[0];

// SVG: cacau no claro, ouro claro no escuro do sistema.
writeFileSync(
  'public/favicon.svg',
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="150 50 354 415"><style>g{stroke:${paleta.cacau}}@media (prefers-color-scheme:dark){g{stroke:${paleta.ouroClaro}}}</style>${desenho.replace('stroke="currentColor"', '')}</svg>\n`,
);

// PNG: monograma em ouro claro sobre cacau, com respiro (o iOS arredonda os cantos).
async function png(lado, margem, destino) {
  const interno = Math.round(lado * (1 - 2 * margem));
  const svg = Buffer.from(mark.replace('stroke="currentColor"', `stroke="${paleta.ouroClaro}"`));
  const marca = await sharp(svg, { density: 600 })
    .resize({ height: interno, fit: 'inside' })
    .png()
    .toBuffer();
  const meta = await sharp(marca).metadata();
  await sharp({ create: { width: lado, height: lado, channels: 4, background: paleta.cacau } })
    .composite([
      {
        input: marca,
        left: Math.round((lado - meta.width) / 2),
        top: Math.round((lado - meta.height) / 2),
      },
    ])
    .png({ compressionLevel: 9 })
    .toFile(destino);
}
await png(180, 0.2, 'public/apple-touch-icon.png');
await png(32, 0.1, 'public/favicon-32.png');
console.log('ícones gerados');

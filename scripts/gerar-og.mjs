#!/usr/bin/env node
// Imagem de compartilhamento (Open Graph), 1200×630, gerada no build (prebuild):
// retrato real da Ester à esquerda, logo em ouro chapado e "LAGES/SC" em Josefin Sans
// (a família do logo) sobre o cacau. Sem degradê, sem efeito. JPEG: é o formato que
// todo leitor de link (WhatsApp, Instagram, Facebook, LinkedIn) aceita.
// Saída: public/media/og/giyma-og.jpg (fora do git; vai para o dist).
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { create } from 'fontkitten';
import sharp from 'sharp';

const RAIZ = process.cwd();
const W = 1200;
const H = 630;
const CACAU = '#231A16';
const OURO = '#B8975F';
const PEROLA = '#F3F1EE';
const RETRATO = join(RAIZ, 'public/media/img/retrato-3x4-852.webp');
const LOGO = join(RAIZ, 'public/media/marca/logo-horizontal.svg');
const FONTE = join(RAIZ, 'src/styles/fontes/josefin-sans-latin-wght-normal.woff2');
const SAIDA = join(RAIZ, 'public/media/og/giyma-og.jpg');

for (const f of [RETRATO, LOGO, FONTE]) {
  if (!existsSync(f)) {
    console.error(`gerar-og: falta ${f} (rode "pnpm media:prepare" antes).`);
    process.exit(1);
  }
}

const larguraFoto = Math.round((H * 3) / 4); // 3:4 na altura toda
const foto = await sharp(RETRATO).resize(larguraFoto, H, { fit: 'cover' }).toBuffer();

const painel = W - larguraFoto;
const larguraLogo = 520;
const svgLogo = readFileSync(LOGO, 'utf8').replaceAll('currentColor', OURO);
const logo = await sharp(Buffer.from(svgLogo), { density: 300 })
  .resize({ width: larguraLogo })
  .png()
  .toBuffer();
const { height: alturaLogo = 0 } = await sharp(logo).metadata();

// Texto em contorno (Josefin Sans, a família do logo): não depende de fonte instalada.
function texto(t, tamanho, cor, espacoEm) {
  // O woff2 é variável e abre na instância Thin; o getVariation do fontkitten não lê woff2.
  // Josefin é monolinear: um traço uniforme sobre o contorno Thin chega ao peso regular.
  const base = create(readFileSync(FONTE));
  const fonte = base;
  const escala = tamanho / base.unitsPerEm;
  let x = 1;
  const caminhos = [];
  for (const g of fonte.glyphsForString(t)) {
    caminhos.push(
      `<path transform="translate(${x.toFixed(2)} ${(base.ascent * escala).toFixed(2)}) scale(${escala} ${-escala})" d="${g.path.toSVG()}"/>`,
    );
    x += g.advanceWidth * escala + espacoEm * tamanho;
  }
  const largura = Math.ceil(x - espacoEm * tamanho);
  const altura = Math.ceil((base.ascent - base.descent) * escala) + 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${largura}" height="${altura}"><g fill="${cor}" stroke="${cor}" stroke-width="46" stroke-linejoin="round">${caminhos.join('')}</g></svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}
const lages = await texto('LAGES/SC', 30, PEROLA, 0.32);
const { width: larguraLages = 0, height: alturaLages = 0 } = await sharp(lages).metadata();

// Composição: logo e cidade centrados no painel; um fio de ouro de 1 px entre os dois.
const x0 = larguraFoto;
const blocoAltura = alturaLogo + 44 + 1 + 40 + alturaLages;
const yLogo = Math.round((H - blocoAltura) / 2);
const yFio = yLogo + alturaLogo + 44;
const yLages = yFio + 1 + 40;
const fio = await sharp({
  create: { width: 56, height: 1, channels: 4, background: OURO },
})
  .png()
  .toBuffer();

mkdirSync(join(RAIZ, 'public/media/og'), { recursive: true });
const info = await sharp({ create: { width: W, height: H, channels: 3, background: CACAU } })
  .composite([
    { input: foto, left: 0, top: 0 },
    { input: logo, left: x0 + Math.round((painel - larguraLogo) / 2), top: yLogo },
    { input: fio, left: x0 + Math.round((painel - 56) / 2), top: yFio },
    { input: lages, left: x0 + Math.round((painel - larguraLages) / 2), top: yLages },
  ])
  .jpeg({ quality: 86, mozjpeg: true })
  .toFile(SAIDA);
console.log(
  `gerar-og: ${SAIDA.replace(RAIZ + '/', '')} · ${info.width}×${info.height} · ${Math.round(info.size / 1024)} KB`,
);

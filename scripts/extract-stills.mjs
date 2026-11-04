#!/usr/bin/env node
// Stills limpos dos vídeos: um quadro (PNG sem perda) por registro "stills" do
// manifesto, no tamanho nativo (sem upscale). O recorte e os derivados AVIF/WebP
// ficam com o prepare-media. Rodando sozinho, gera também a folha de contato em
// docs/capturas/stills/ para conferência.
//
// Uso: pnpm exec node scripts/extract-stills.mjs

import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';
import { carregarManifesto, publicavel, RAIZ, validarManifesto } from './lib/manifesto.mjs';
import { assinatura, Cache, garantirPasta, hashArquivo, rodar } from './lib/midia.mjs';

export const PASTA_CACHE = join(RAIZ, '.cache', 'midia');

export function listarStills(manifesto) {
  return manifesto.itens
    .filter((item) => publicavel(item) && item.stills?.length)
    .flatMap((item) => item.stills.map((still) => ({ item, still })));
}

/** Extrai o quadro em `em` segundos. Busca exata (decodifica a partir do keyframe anterior). */
export async function extrairQuadro(video, em, destino) {
  garantirPasta(destino);
  await rodar('ffmpeg', [
    '-v',
    'error',
    '-y',
    '-ss',
    String(em),
    '-i',
    video,
    '-frames:v',
    '1',
    '-update',
    '1',
    destino,
  ]);
  return destino;
}

/** Garante o PNG de cada still no cache; devolve [{ item, still, png }]. */
export async function extrairStills(manifesto, cache) {
  const saida = [];
  for (const { item, still } of listarStills(manifesto)) {
    const video = join(RAIZ, item.arquivo);
    const png = join(PASTA_CACHE, 'stills', `${still.id}.png`);
    const ass = assinatura(await hashArquivo(video), still.em);
    await cache.garantir(`still-quadro:${still.id}`, ass, [png], () =>
      extrairQuadro(video, still.em, png).then(() => null),
    );
    saida.push({ item, still, png });
  }
  return saida;
}

/** Folha de contato: cada quadro inteiro com o recorte marcado e o tempo. */
export async function folhaDeStills(stills, destino) {
  const W = 240;
  const tiles = [];
  for (const { still, png } of stills) {
    const meta = await sharp(png).metadata();
    const k = W / meta.width;
    const H = Math.round(meta.height * k);
    const r = still.recorte;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H + 22}">
      <rect x="${r.x * k}" y="${r.y * k + 22}" width="${r.largura * k}" height="${r.altura * k}" fill="none" stroke="#B8975F" stroke-width="3"/>
      <rect width="${W}" height="22" fill="#231A16"/>
      <text x="4" y="16" font-family="sans-serif" font-size="13" fill="#F3F1EE">${still.id} · ${still.em}s</text></svg>`;
    const img = await sharp(png).resize({ width: W }).toBuffer();
    tiles.push(
      await sharp({ create: { width: W, height: H + 22, channels: 3, background: '#231A16' } })
        .composite([
          { input: img, top: 22, left: 0 },
          { input: Buffer.from(svg), top: 0, left: 0 },
        ])
        .png()
        .toBuffer(),
    );
  }
  if (!tiles.length) return null;
  const colunas = 5;
  const alturaTile = (await sharp(tiles[0]).metadata()).height;
  const linhas = Math.ceil(tiles.length / colunas);
  garantirPasta(destino);
  await sharp({
    create: { width: W * colunas, height: alturaTile * linhas, channels: 3, background: '#111' },
  })
    .composite(
      tiles.map((t, i) => ({
        input: t,
        left: (i % colunas) * W,
        top: Math.floor(i / colunas) * alturaTile,
      })),
    )
    .png()
    .toFile(destino);
  return destino;
}

async function main() {
  const manifesto = carregarManifesto();
  const erros = validarManifesto(manifesto);
  if (erros.length) {
    console.error(erros.join('\n'));
    process.exit(1);
  }
  const cache = new Cache(join(PASTA_CACHE, 'stills.cache.json'));
  const stills = await extrairStills(manifesto, cache);
  cache.salvar();
  const folha = await folhaDeStills(
    stills,
    join(RAIZ, 'docs', 'capturas', 'stills', 'folha-stills.png'),
  );
  console.log(
    `${stills.length} stills (${cache.feitos} extraídos, ${cache.pulados} do cache). Folha: ${folha}`,
  );
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

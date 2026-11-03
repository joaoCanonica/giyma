#!/usr/bin/env node
// Derivados de mídia a partir do media.manifest.json (roda em predev/prebuild).
// Idempotente: cada saída tem uma assinatura (hash do original + parâmetros);
// se a assinatura bate e o arquivo existe, nada é refeito.
//
// Saídas:
//   public/media/            derivados publicáveis (fora do git)
//   public/media/indice.json índice para as páginas (src, larguras, LQIP, pôsteres)
//   docs/capturas/pares/     folhas de contato dos antes e depois (locais, fora do git)
//   docs/capturas/stills/    folha de contato dos stills
//   docs/MIDIA_CATALOGO.md   tabela entre os marcadores <!-- tabela:inicio/fim -->
//
// Antes e depois sem consentimento=autorizado NUNCA vão para public/ (que é
// copiado inteiro para o dist). Ficam só nas folhas de contato locais.
//
// Uso: pnpm media:prepare [-- --forcar]

import { copyFileSync, existsSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { basename, join, relative } from 'node:path';
import sharp from 'sharp';
import { extrairQuadro, extrairStills, folhaDeStills, PASTA_CACHE } from './extract-stills.mjs';
import { carregarManifesto, publicavel, RAIZ, validarManifesto } from './lib/manifesto.mjs';
import {
  assinatura,
  Cache,
  derivadosImagem,
  escreverSeMudou,
  garantirPasta,
  hashArquivo,
  kb,
  rodar,
} from './lib/midia.mjs';

const PUBLICO = join(RAIZ, 'public', 'media');
const CAPTURAS = join(RAIZ, 'docs', 'capturas');
const CATALOGO = join(RAIZ, 'docs', 'MIDIA_CATALOGO.md');
const FORCAR = process.argv.includes('--forcar');

// Parâmetros de codificação (mudar aqui exige VERSAO_PIPELINE nova se for retroativo).
const H264 = { crf: 24, preset: 'slow' };
const VP9 = { crf: 36 };
const LOOP_CRFS = [24, 26, 28, 30, 32, 34];

const url = (abs) => '/' + relative(join(RAIZ, 'public'), abs).split('\\').join('/');

function urlsImagem(d) {
  if (!d) return d;
  const mapa = (l) => l.map(({ arquivo, ...r }) => ({ src: url(arquivo), ...r }));
  return { ...d, fontes: { avif: mapa(d.fontes.avif), webp: mapa(d.fontes.webp) } };
}

const log = (...a) => console.log('›', ...a);

// ---------- vídeo ----------

async function codificar({ video, inicio, fim, largura, recorte, destinoBase, crfH264, crfVp9 }) {
  const filtros = [];
  if (recorte) filtros.push(`crop=${recorte.largura}:${recorte.altura}:${recorte.x}:${recorte.y}`);
  filtros.push(`scale=${largura}:-2:flags=lanczos`, 'format=yuv420p');
  const comum = [
    '-v',
    'error',
    '-y',
    '-ss',
    String(inicio),
    '-i',
    video,
    '-t',
    (fim - inicio).toFixed(3),
    '-an',
    '-sn',
    '-map_metadata',
    '-1',
    '-vf',
    filtros.join(','),
  ];
  const mp4 = `${destinoBase}.mp4`;
  const webm = `${destinoBase}.webm`;
  garantirPasta(mp4);
  await rodar('ffmpeg', [
    ...comum,
    '-c:v',
    'libx264',
    '-preset',
    H264.preset,
    '-crf',
    String(crfH264),
    '-profile:v',
    'high',
    '-level',
    '4.0',
    '-tag:v',
    'avc1',
    '-movflags',
    '+faststart',
    mp4,
  ]);
  await rodar('ffmpeg', [
    ...comum,
    '-c:v',
    'libvpx-vp9',
    '-crf',
    String(crfVp9),
    '-b:v',
    '0',
    '-deadline',
    'good',
    '-cpu-used',
    '4',
    '-row-mt',
    '1',
    '-cues_to_front',
    '1',
    webm,
  ]);
  const [sonda] = JSON.parse(
    await rodar('ffprobe', [
      '-v',
      'error',
      '-select_streams',
      'v:0',
      '-show_entries',
      'stream=width,height',
      '-of',
      'json',
      mp4,
    ]),
  ).streams;
  return {
    largura: sonda.width,
    altura: sonda.height,
    mp4: { arquivo: mp4, kb: kb(mp4) },
    webm: { arquivo: webm, kb: kb(webm) },
    crf: { h264: crfH264, vp9: crfVp9 },
  };
}

/** Codifica respeitando o teto de peso (loops): sobe o CRF até caber. */
async function codificarComTeto(opcoes, pesoMaximoKB) {
  if (!pesoMaximoKB) return codificar({ ...opcoes, crfH264: H264.crf, crfVp9: VP9.crf });
  for (let i = 0; i < LOOP_CRFS.length; i++) {
    const crf = LOOP_CRFS[i];
    const r = await codificar({ ...opcoes, crfH264: crf, crfVp9: crf + 10 });
    if (r.mp4.kb <= pesoMaximoKB && r.webm.kb <= pesoMaximoKB) return r;
    if (i === LOOP_CRFS.length - 1)
      throw new Error(
        `${basename(opcoes.destinoBase)}: não coube em ${pesoMaximoKB} KB (mp4 ${r.mp4.kb} KB, webm ${r.webm.kb} KB)`,
      );
  }
}

/** Tempo do quadro mais nítido (maior variância do laplaciano), amostrado a 4 qps. */
async function quadroMaisNitido(video, inicio, fim, recorte) {
  const L = 270;
  const filtros = [];
  if (recorte) filtros.push(`crop=${recorte.largura}:${recorte.altura}:${recorte.x}:${recorte.y}`);
  filtros.push('fps=4', `scale=${L}:-2`, 'format=gray');
  const buf = await rodar(
    'ffmpeg',
    [
      '-v',
      'error',
      '-ss',
      String(inicio),
      '-i',
      video,
      '-t',
      (fim - inicio).toFixed(3),
      '-vf',
      filtros.join(','),
      '-f',
      'rawvideo',
      '-',
    ],
    { binario: true },
  );
  const [sonda] = JSON.parse(
    await rodar('ffprobe', [
      '-v',
      'error',
      '-select_streams',
      'v:0',
      '-show_entries',
      'stream=width,height',
      '-of',
      'json',
      video,
    ]),
  ).streams;
  const largOrig = recorte ? recorte.largura : sonda.width;
  const altOrig = recorte ? recorte.altura : sonda.height;
  const A = Math.round((altOrig * L) / largOrig / 2) * 2;
  const tamanho = L * A;
  const n = Math.floor(buf.length / tamanho);
  let melhor = { i: 0, v: -1 };
  // Ignora o primeiro e o último quarto de segundo (transições).
  for (let f = 1; f < Math.max(2, n - 1); f++) {
    const o = f * tamanho;
    if (o + tamanho > buf.length) break;
    let soma = 0;
    let soma2 = 0;
    let cont = 0;
    for (let y = 1; y < A - 1; y++) {
      for (let x = 1; x < L - 1; x++) {
        const p = o + y * L + x;
        const lap = buf[p - L] + buf[p + L] + buf[p - 1] + buf[p + 1] - 4 * buf[p];
        soma += lap;
        soma2 += lap * lap;
        cont++;
      }
    }
    const v = soma2 / cont - (soma / cont) ** 2;
    if (v > melhor.v) melhor = { i: f, v };
  }
  return Number((inicio + melhor.i / 4).toFixed(2));
}

async function poster({
  cache,
  chave,
  video,
  hashVideo,
  inicio,
  fim,
  posterCfg,
  janela,
  recorte,
  larguras,
  nome,
}) {
  const busca = janela ?? { inicio, fim };
  const tempo = await cache.garantir(
    `poster-tempo:${chave}`,
    assinatura(hashVideo, busca.inicio, busca.fim, posterCfg, recorte ?? null),
    [],
    async () =>
      posterCfg === 'auto' ? quadroMaisNitido(video, busca.inicio, busca.fim, recorte) : posterCfg,
  );
  const png = join(PASTA_CACHE, 'posters', `${nome}.png`);
  const pastaSaida = join(PUBLICO, 'video');
  const arquivos = larguras.flatMap((w) => [
    join(pastaSaida, `${nome}-poster-${w}.avif`),
    join(pastaSaida, `${nome}-poster-${w}.webp`),
  ]);
  const dados = await cache.garantir(
    `poster:${chave}`,
    assinatura(hashVideo, tempo, recorte ?? null, larguras),
    [png, ...arquivos],
    async () => {
      await extrairQuadro(video, tempo, png);
      return derivadosImagem({
        entrada: png,
        recorte,
        pastaSaida,
        nome: `${nome}-poster`,
        larguras,
      });
    },
  );
  return { em: tempo, ...urlsImagem(dados) };
}

async function trechoDeVideo({
  cache,
  item,
  trecho,
  video,
  hashVideo,
  inicio,
  fim,
  nome,
  larguras,
  recorte,
  pesoMaximoKB,
  posterCfg,
  janela,
}) {
  const saidas = [];
  for (const w of larguras) {
    const base = join(PUBLICO, 'video', `${nome}-${w}`);
    const r = await cache.garantir(
      `video:${nome}-${w}`,
      assinatura(
        hashVideo,
        inicio,
        fim,
        w,
        recorte ?? null,
        pesoMaximoKB ?? null,
        H264,
        VP9,
        LOOP_CRFS,
      ),
      [`${base}.mp4`, `${base}.webm`],
      () => {
        log(`codificando ${nome} ${w}px (${(fim - inicio).toFixed(1)} s)`);
        return codificarComTeto(
          { video, inicio, fim, largura: w, recorte, destinoBase: base },
          pesoMaximoKB,
        );
      },
    );
    saidas.push(r);
  }
  const p = await poster({
    cache,
    chave: nome,
    video,
    hashVideo,
    inicio,
    fim,
    posterCfg,
    janela,
    recorte,
    larguras,
    nome,
  });
  return {
    origem: item.id,
    trecho: trecho.id,
    inicio,
    fim,
    duracao: Number((fim - inicio).toFixed(3)),
    loop: Boolean(trecho.loop),
    mudo: !item.audioLiberado,
    fontes: {
      mp4: saidas.map((s) => ({
        src: url(s.mp4.arquivo),
        largura: s.largura,
        altura: s.altura,
        kb: s.mp4.kb,
      })),
      webm: saidas.map((s) => ({
        src: url(s.webm.arquivo),
        largura: s.largura,
        altura: s.altura,
        kb: s.webm.kb,
      })),
    },
    poster: p,
  };
}

// ---------- antes e depois ----------

async function folhaDoPar(item, destino) {
  const ad = item.antesDepois;
  const original = join(RAIZ, item.arquivo);
  const k = 600 / item.dimensoes.largura;
  const altura = Math.round(item.dimensoes.altura * k);
  const ret = (r, cor, rotulo) =>
    `<rect x="${r.x * k}" y="${r.y * k}" width="${r.largura * k}" height="${r.altura * k}" fill="none" stroke="${cor}" stroke-width="3"/>` +
    `<rect x="${r.x * k}" y="${r.y * k}" width="70" height="20" fill="${cor}"/><text x="${r.x * k + 5}" y="${r.y * k + 15}" font-family="sans-serif" font-size="13" fill="#fff">${rotulo}</text>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="${altura}">${ret(ad.antes, '#B8975F', 'ANTES')}${ret(ad.depois, '#A0522D', 'DEPOIS')}</svg>`;
  const esquerda = await sharp(original)
    .resize({ width: 600 })
    .composite([{ input: Buffer.from(svg) }])
    .png()
    .toBuffer();
  const par = await parLadoALado(original, ad, 12, '#F3F1EE');
  const parMeta = await sharp(par).metadata();
  const kp = Math.min(1, 900 / parMeta.width, altura / parMeta.height);
  const parRed = await sharp(par)
    .resize({ width: Math.round(parMeta.width * kp) })
    .png()
    .toBuffer();
  const parRedMeta = await sharp(parRed).metadata();
  const cab = 40;
  const legenda = `<svg xmlns="http://www.w3.org/2000/svg" width="${600 + 24 + parRedMeta.width}" height="${cab}">
    <text x="0" y="26" font-family="sans-serif" font-size="16" fill="#231A16">${item.id} · ${ad.procedimento ?? ad.procedimentoProvavel ?? 'procedimento pendente'} · consentimento: ${item.consentimento} · recorte ${ad.antes.largura}×${ad.antes.altura} (escala 1:1)</text></svg>`;
  garantirPasta(destino);
  await sharp({
    create: {
      width: 600 + 24 + parRedMeta.width,
      height: Math.max(altura, parRedMeta.height) + cab,
      channels: 3,
      background: '#F3F1EE',
    },
  })
    .composite([
      { input: Buffer.from(legenda), top: 0, left: 0 },
      { input: esquerda, top: cab, left: 0 },
      { input: parRed, top: cab, left: 624 },
    ])
    .png()
    .toFile(destino);
}

/** Antes | depois na mesma escala (1:1 do original), com um respiro entre os dois. */
async function parLadoALado(original, ad, respiro, fundo) {
  const corte = (r) =>
    sharp(original).extract({ left: r.x, top: r.y, width: r.largura, height: r.altura }).toBuffer();
  const [a, d] = await Promise.all([corte(ad.antes), corte(ad.depois)]);
  const { largura: w, altura: h } = ad.antes;
  return sharp({ create: { width: w * 2 + respiro, height: h, channels: 3, background: fundo } })
    .composite([
      { input: a, left: 0, top: 0 },
      { input: d, left: w + respiro, top: 0 },
    ])
    .png()
    .toBuffer();
}

// ---------- catálogo ----------

function tabelaCatalogo(manifesto, indice) {
  const curto = (a) => basename(a).replace(/^SaveClip\.App_(\d+)_.*$/, 'SaveClip…$1…');
  const esc = (s) =>
    String(s ?? '')
      .replaceAll('|', '\\|')
      .replaceAll('\n', ' ');
  const pesoImagens = (ids) => {
    let total = 0;
    for (const id of ids) {
      const im = indice.imagens[id];
      if (im) for (const f of [...im.fontes.avif, ...im.fontes.webp]) total += f.kb;
    }
    return total;
  };
  const linhas = [
    '| # | Arquivo | Natureza | Uso | Recorte / trecho | Pesos (derivados) | Consentimento | Problemas |',
    '|---|---|---|---|---|---|---|---|',
  ];
  for (const item of manifesto.itens) {
    const partes = [];
    let peso = '—';
    if (item.recortes?.length) {
      partes.push(
        item.recortes
          .map(
            (r) =>
              `${r.id} (${r.proporcao}, ${r.retangulo.largura}×${r.retangulo.altura} em ${r.retangulo.x},${r.retangulo.y})`,
          )
          .join('; '),
      );
      peso = `${pesoImagens(item.recortes.map((r) => r.id))} KB (AVIF+WebP)`;
    }
    if (item.antesDepois) {
      const ad = item.antesDepois;
      partes.push(
        `antes ${ad.antes.largura}×${ad.antes.altura} em ${ad.antes.x},${ad.antes.y} · depois em ${ad.depois.x},${ad.depois.y}`,
      );
      peso = publicavel(item) ? 'gerado' : 'não gerado (sem consentimento)';
    }
    if (item.trechos?.length) {
      const desc = [];
      let total = 0;
      for (const t of item.trechos) {
        desc.push(`${t.id} ${t.inicio}–${t.fim} s`);
        const v = indice.videos[t.id];
        if (v?.fontes) {
          const maior =
            v.fontes.mp4.at(-1) && v.fontes.mp4.reduce((a, b) => (b.largura > a.largura ? b : a));
          const webmMaior = v.fontes.webm.reduce((a, b) => (b.largura > a.largura ? b : a));
          desc[desc.length - 1] +=
            ` (mp4 ${maior.largura}px ${maior.kb} KB · webm ${webmMaior.kb} KB · pôster ${v.poster.em} s)`;
          for (const f of [...v.fontes.mp4, ...v.fontes.webm]) total += f.kb;
          for (const vv of Object.values(v.variantes ?? {}))
            for (const f of [...vv.fontes.mp4, ...vv.fontes.webm]) total += f.kb;
        }
        for (const c of indice.videos[t.id]?.capitulos ?? [])
          for (const f of [...c.fontes.mp4, ...c.fontes.webm]) total += f.kb;
      }
      partes.push(desc.join('; '));
      peso = `${total} KB (todos os vídeos)`;
    }
    if (item.stills?.length) {
      partes.push('stills: ' + item.stills.map((s) => `${s.id} ${s.em} s`).join(', '));
    }
    const nat = item.naoUsar ? `${item.natureza} · **naoUsar**` : item.natureza;
    linhas.push(
      `| ${item.indiceMapa ?? '—'} | \`${curto(item.arquivo)}\` | ${nat} | ${esc(item.uso)} | ${esc(partes.join(' · ')) || '—'} | ${peso} | ${item.consentimento} | ${esc(item.problemas.join(' '))} |`,
    );
  }
  const stills = Object.entries(indice.imagens).filter(([, v]) => v.natureza === 'quadro de vídeo');
  linhas.push(
    '',
    '**Stills (quadros de vídeo, sem upscale)**',
    '',
    '| Still | Origem | Tempo | Recorte | Exibição máx. | Pesos |',
    '|---|---|---|---|---|---|',
  );
  for (const [id, v] of stills) {
    const total = [...v.fontes.avif, ...v.fontes.webp].reduce((s, f) => s + f.kb, 0);
    linhas.push(
      `| ${id} | ${v.origem} | ${v.em} s | ${v.largura}×${v.altura} | ${v.larguraMaxExibicao} px físicos | ${total} KB |`,
    );
  }
  return linhas.join('\n');
}

function atualizarCatalogo(tabela) {
  if (!existsSync(CATALOGO)) return false;
  const texto = readFileSync(CATALOGO, 'utf8');
  const ini = '<!-- tabela:inicio -->';
  const fim = '<!-- tabela:fim -->';
  const a = texto.indexOf(ini);
  const b = texto.indexOf(fim);
  if (a < 0 || b < 0) return false;
  return escreverSeMudou(
    CATALOGO,
    `${texto.slice(0, a + ini.length)}\n\n${tabela}\n\n${texto.slice(b)}`,
  );
}

/** Remove de public/media o que o índice não referencia (ex.: item que deixou de ser publicável). */
function limparOrfaos(indice) {
  const vivos = new Set(['/media/indice.json']);
  const coletar = (v) => {
    if (typeof v === 'string' && v.startsWith('/media/')) vivos.add(v);
    else if (v && typeof v === 'object') Object.values(v).forEach(coletar);
  };
  coletar(indice);
  let n = 0;
  const andar = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const caminho = join(dir, e.name);
      if (e.isDirectory()) andar(caminho);
      else if (!vivos.has(url(caminho))) {
        rmSync(caminho);
        n++;
      }
    }
  };
  if (existsSync(PUBLICO)) andar(PUBLICO);
  return n;
}

// ---------- principal ----------

async function main() {
  const inicio = Date.now();
  const manifesto = carregarManifesto();
  const erros = validarManifesto(manifesto);
  if (erros.length) {
    console.error('Manifesto inválido:\n' + erros.join('\n'));
    process.exit(1);
  }
  if (FORCAR) rmSync(join(PASTA_CACHE, 'prepare.cache.json'), { force: true });
  const cache = new Cache(join(PASTA_CACHE, 'prepare.cache.json'));
  const indice = { versao: 1, marca: {}, imagens: {}, videos: {}, resultados: {} };

  for (const item of manifesto.itens) {
    const original = join(RAIZ, item.arquivo);

    // Antes e depois: folha de contato sempre (local); derivados só se publicável.
    if (item.natureza === 'antes-depois') {
      const folha = join(CAPTURAS, 'pares', `${item.id}.png`);
      await cache.garantir(
        `folha-par:${item.id}`,
        assinatura(await hashArquivo(original), item.antesDepois, item.consentimento),
        [folha],
        () => folhaDoPar(item, folha),
      );
    }
    if (!publicavel(item)) continue;
    const hash = await hashArquivo(original);

    if (item.tipo === 'marca') {
      const destino = join(PUBLICO, 'marca', `${item.id}.svg`);
      await cache.garantir(`marca:${item.id}`, assinatura(hash), [destino], () =>
        copyFileSync(original, destino),
      );
      indice.marca[item.id] = {
        src: url(destino),
        largura: item.dimensoes.largura,
        altura: item.dimensoes.altura,
      };
      continue;
    }

    for (const r of item.recortes ?? []) {
      const pasta = join(PUBLICO, 'img');
      const dados = await cache.garantir(
        `recorte:${r.id}`,
        assinatura(hash, r.retangulo),
        [join(pasta, `${r.id}-480.avif`)],
        () =>
          derivadosImagem({
            entrada: original,
            recorte: r.retangulo,
            pastaSaida: pasta,
            nome: r.id,
          }),
      );
      indice.imagens[r.id] = {
        origem: item.id,
        natureza: 'foto',
        proporcao: r.proporcao,
        ...urlsImagem(dados),
      };
    }

    if (item.derivados && item.tipo === 'foto') {
      const pasta = join(PUBLICO, 'img');
      const dados = await cache.garantir(
        `inteira:${item.id}`,
        assinatura(hash),
        [join(pasta, `${item.id}-480.avif`)],
        () => derivadosImagem({ entrada: original, pastaSaida: pasta, nome: item.id }),
      );
      indice.imagens[item.id] = { origem: item.id, natureza: 'foto', ...urlsImagem(dados) };
    }

    if (item.natureza === 'antes-depois') {
      const ad = item.antesDepois;
      const pasta = join(PUBLICO, 'resultados');
      const parPng = join(PASTA_CACHE, 'pares', `${item.id}.png`);
      const dados = await cache.garantir(
        `resultado:${item.id}`,
        assinatura(hash, ad),
        [parPng, join(pasta, `${item.id}-antes-480.avif`)],
        async () => {
          garantirPasta(parPng);
          await sharp(await parLadoALado(original, ad, 0, '#000')).toFile(parPng);
          return {
            antes: await derivadosImagem({
              entrada: original,
              recorte: ad.antes,
              pastaSaida: pasta,
              nome: `${item.id}-antes`,
            }),
            depois: await derivadosImagem({
              entrada: original,
              recorte: ad.depois,
              pastaSaida: pasta,
              nome: `${item.id}-depois`,
            }),
            par: await derivadosImagem({
              entrada: parPng,
              pastaSaida: pasta,
              nome: `${item.id}-par`,
            }),
          };
        },
      );
      indice.resultados[item.id] = {
        procedimento: ad.procedimento,
        tempoDecorrido: ad.tempoDecorrido,
        antes: urlsImagem(dados.antes),
        depois: urlsImagem(dados.depois),
        par: urlsImagem(dados.par),
      };
    }

    for (const t of item.trechos ?? []) {
      const base = {
        cache,
        item,
        trecho: t,
        video: original,
        hashVideo: hash,
        posterCfg: t.poster,
        janela: t.posterJanela,
      };
      if (t.capitulos?.length) {
        const capitulos = [];
        for (const c of t.capitulos) {
          const v = await trechoDeVideo({
            ...base,
            inicio: c.inicio,
            fim: c.fim,
            nome: `${t.id}-${c.id}`,
            janela: undefined,
            larguras: t.larguras,
          });
          capitulos.push({ id: c.id, titulo: c.titulo, ...v });
        }
        indice.videos[t.id] = { origem: item.id, trecho: t.id, capitulos };
        continue;
      }
      const v = await trechoDeVideo({
        ...base,
        inicio: t.inicio,
        fim: t.fim,
        nome: t.id,
        larguras: t.larguras,
        pesoMaximoKB: t.pesoMaximoKB,
      });
      for (const variante of t.variantes ?? []) {
        v.variantes ??= {};
        v.variantes[variante.id] = {
          proporcao: variante.proporcao,
          ...(await trechoDeVideo({
            ...base,
            inicio: t.inicio,
            fim: t.fim,
            nome: variante.id,
            larguras: [variante.retangulo.largura],
            recorte: variante.retangulo,
            pesoMaximoKB: t.pesoMaximoKB,
          })),
        };
      }
      indice.videos[t.id] = v;
    }
  }

  // Stills (extract-stills.mjs) → recorte + AVIF/WebP.
  const stills = await extrairStills(manifesto, cache);
  for (const { item, still, png } of stills) {
    const pasta = join(PUBLICO, 'img');
    const dados = await cache.garantir(
      `still:${still.id}`,
      assinatura(await hashArquivo(join(RAIZ, item.arquivo)), still.em, still.recorte),
      [join(pasta, `${still.id}-480.avif`)],
      () =>
        derivadosImagem({
          entrada: png,
          recorte: still.recorte,
          pastaSaida: pasta,
          nome: still.id,
        }),
    );
    indice.imagens[still.id] = {
      origem: item.id,
      natureza: 'quadro de vídeo',
      em: still.em,
      larguraMaxExibicao: still.larguraMaxExibicao,
      ...urlsImagem(dados),
    };
  }
  const folhaStills = join(CAPTURAS, 'stills', 'folha-stills.png');
  await cache.garantir(
    'folha-stills',
    assinatura(stills.map((s) => [s.still.id, s.still.em, s.still.recorte])),
    [folhaStills],
    () => folhaDeStills(stills, folhaStills).then(() => null),
  );

  cache.salvar();
  const removidos = limparOrfaos(indice);
  const mudouIndice = escreverSeMudou(
    join(PUBLICO, 'indice.json'),
    JSON.stringify(indice, null, 2) + '\n',
  );
  const mudouCatalogo = atualizarCatalogo(tabelaCatalogo(manifesto, indice));

  const s = ((Date.now() - inicio) / 1000).toFixed(1);
  console.log(
    `media:prepare ok em ${s} s · ${removidos} órfãos removidos · ${cache.feitos} gerados, ${cache.pulados} do cache · índice ${mudouIndice ? 'atualizado' : 'igual'} · catálogo ${mudouCatalogo ? 'atualizado' : 'igual'}`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

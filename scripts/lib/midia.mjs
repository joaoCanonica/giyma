// Utilitários de mídia: processos, hash, cache por assinatura e derivados de imagem.
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  createReadStream,
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

/** Mude ao alterar parâmetros de codificação: invalida o cache inteiro. */
export const VERSAO_PIPELINE = '1';

export const LARGURAS_IMAGEM = [480, 800, 1200, 1600];

export function rodar(cmd, args, { binario = false } = {}) {
  return new Promise((ok, falha) => {
    const p = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    const saida = [];
    let erro = '';
    p.stdout.on('data', (c) => saida.push(c));
    p.stderr.on('data', (c) => (erro += c));
    p.on('error', (e) =>
      falha(
        e.code === 'ENOENT'
          ? new Error(
              `${cmd} não encontrado: o media:prepare precisa de ffmpeg e ffprobe no PATH (deploy: ver docs/DEPLOY.md, build pré-compilado).`,
            )
          : e,
      ),
    );
    p.on('close', (codigo) => {
      if (codigo !== 0) return falha(new Error(`${cmd} saiu com ${codigo}\n${erro.slice(-2000)}`));
      const buf = Buffer.concat(saida);
      ok(binario ? buf : buf.toString('utf8'));
    });
  });
}

export function garantirPasta(caminhoArquivo) {
  mkdirSync(dirname(caminhoArquivo), { recursive: true });
}

const hashes = new Map();
export function hashArquivo(caminho) {
  if (hashes.has(caminho)) return Promise.resolve(hashes.get(caminho));
  return new Promise((ok, falha) => {
    const h = createHash('sha256');
    createReadStream(caminho)
      .on('data', (c) => h.update(c))
      .on('error', falha)
      .on('end', () => {
        const d = h.digest('hex');
        hashes.set(caminho, d);
        ok(d);
      });
  });
}

export function assinatura(...partes) {
  return createHash('sha256')
    .update(JSON.stringify([VERSAO_PIPELINE, ...partes]))
    .digest('hex')
    .slice(0, 20);
}

/** Cache: chave → { assinatura, arquivos, dados }. Pula o trabalho se a assinatura bate e os arquivos existem. */
export class Cache {
  constructor(caminho) {
    this.caminho = caminho;
    this.dados = existsSync(caminho) ? JSON.parse(readFileSync(caminho, 'utf8')) : {};
    this.usadas = new Set();
    this.feitos = 0;
    this.pulados = 0;
  }
  async garantir(chave, ass, arquivos, trabalho) {
    this.usadas.add(chave);
    const atual = this.dados[chave];
    if (atual && atual.assinatura === ass && arquivos.every((a) => existsSync(a))) {
      this.pulados++;
      return atual.dados;
    }
    for (const a of arquivos) garantirPasta(a);
    const dados = (await trabalho()) ?? null;
    this.dados[chave] = { assinatura: ass, dados };
    this.feitos++;
    return dados;
  }
  salvar() {
    // Descarta entradas que não foram usadas nesta rodada (registros removidos do manifesto).
    const ordenado = Object.fromEntries(
      Object.entries(this.dados)
        .filter(([chave]) => this.usadas.has(chave))
        .sort(([a], [b]) => a.localeCompare(b)),
    );
    escreverSeMudou(this.caminho, JSON.stringify(ordenado, null, 2) + '\n');
  }
}

export function escreverSeMudou(caminho, conteudo) {
  if (existsSync(caminho) && readFileSync(caminho, 'utf8') === conteudo) return false;
  garantirPasta(caminho);
  writeFileSync(caminho, conteudo);
  return true;
}

export function kb(caminho) {
  return Math.round(statSync(caminho).size / 1024);
}

/** Larguras de saída: degraus ≤ original, mais a largura nativa se ela passar do último degrau. */
export function largurasPara(larguraOriginal) {
  const ws = LARGURAS_IMAGEM.filter((w) => w <= larguraOriginal);
  const maior = ws.at(-1) ?? 0;
  if (larguraOriginal > maior && larguraOriginal < LARGURAS_IMAGEM.at(-1)) ws.push(larguraOriginal);
  if (!ws.length) ws.push(larguraOriginal);
  return ws;
}

/**
 * Gera AVIF + WebP em várias larguras e o LQIP (WebP de 24 px em data URI).
 * `entrada` é um caminho ou buffer; `recorte` é {x,y,largura,altura} opcional.
 */
export async function derivadosImagem({ entrada, recorte, pastaSaida, nome, larguras }) {
  const base = () => {
    const s = sharp(entrada, { failOn: 'error' }).rotate();
    return recorte
      ? s.extract({
          left: recorte.x,
          top: recorte.y,
          width: recorte.largura,
          height: recorte.altura,
        })
      : s;
  };
  const meta = recorte
    ? { width: recorte.largura, height: recorte.altura }
    : await sharp(entrada).metadata();
  const ws = larguras ?? largurasPara(meta.width);
  const fontes = { avif: [], webp: [] };
  for (const w of ws) {
    const h = Math.round((meta.height * w) / meta.width);
    const avif = join(pastaSaida, `${nome}-${w}.avif`);
    const webp = join(pastaSaida, `${nome}-${w}.webp`);
    garantirPasta(avif);
    await base()
      .resize({ width: w })
      .avif({ quality: 55, effort: 6, chromaSubsampling: '4:2:0' })
      .toFile(avif);
    await base().resize({ width: w }).webp({ quality: 78, effort: 6 }).toFile(webp);
    fontes.avif.push({ arquivo: avif, largura: w, altura: h, kb: kb(avif) });
    fontes.webp.push({ arquivo: webp, largura: w, altura: h, kb: kb(webp) });
  }
  const lqipBuf = await base().resize({ width: 24 }).webp({ quality: 40 }).toBuffer();
  return {
    largura: meta.width,
    altura: meta.height,
    fontes,
    lqip: `data:image/webp;base64,${lqipBuf.toString('base64')}`,
  };
}

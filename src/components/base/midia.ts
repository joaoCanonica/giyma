// Acesso ao public/media/indice.json (gerado por pnpm media:prepare) no build.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface Fonte {
  readonly src: string;
  readonly largura: number;
  readonly altura: number;
  readonly kb: number;
}
export interface ImagemIndice {
  readonly origem: string;
  readonly natureza: string;
  readonly largura: number;
  readonly altura: number;
  readonly lqip: string;
  readonly larguraMaxExibicao?: number;
  readonly fontes: { readonly avif: readonly Fonte[]; readonly webp: readonly Fonte[] };
}
export interface VideoIndice {
  readonly origem: string;
  readonly duracao: number;
  readonly loop: boolean;
  readonly mudo: boolean;
  readonly fontes: { readonly mp4: readonly Fonte[]; readonly webm: readonly Fonte[] };
  readonly poster: ImagemIndice & { readonly em: number };
}
export interface ParIndice {
  readonly procedimento: string | null;
  readonly tempoDecorrido: string | null;
  readonly antes: ImagemIndice;
  readonly depois: ImagemIndice;
}
interface Indice {
  readonly imagens: Record<string, ImagemIndice>;
  readonly videos: Record<string, VideoIndice>;
  readonly resultados?: Record<string, ParIndice>;
}

let cache: Indice | null = null;
function indice(): Indice {
  if (cache) return cache;
  const caminho = join(process.cwd(), 'public', 'media', 'indice.json');
  if (!existsSync(caminho))
    throw new Error('public/media/indice.json não existe: rode pnpm media:prepare');
  cache = JSON.parse(readFileSync(caminho, 'utf8')) as Indice;
  return cache;
}

export function imagem(id: string): ImagemIndice {
  const i = indice().imagens[id];
  if (!i) throw new Error(`imagem "${id}" não está no índice de mídia`);
  return i;
}

export function video(id: string): VideoIndice {
  const v = indice().videos[id];
  if (!v) throw new Error(`vídeo "${id}" não está no índice de mídia`);
  return v;
}

export const srcset = (fontes: readonly Fonte[]): string =>
  fontes.map((f) => `${f.src} ${f.largura}w`).join(', ');

/** Par antes/depois publicado (só existe com consentimento=autorizado: o prepare-media não gera os outros). */
export function par(id: string): ParIndice | null {
  return indice().resultados?.[id] ?? null;
}

export function temVideo(id: string): boolean {
  return Boolean(indice().videos[id]);
}

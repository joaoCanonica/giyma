import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  carregarManifesto,
  publicavel,
  RAIZ,
  validarManifesto,
} from '../scripts/lib/manifesto.mjs';

interface Retangulo {
  x: number;
  y: number;
  largura: number;
  altura: number;
}
interface Item {
  id: string;
  arquivo: string;
  natureza: string;
  consentimento: string;
  naoUsar: boolean;
  credito?: { status: string };
  antesDepois?: { antes: Retangulo; depois: Retangulo };
  recortes?: { id: string; retangulo: Retangulo }[];
  trechos?: { id: string }[];
}
interface Manifesto {
  itens: Item[];
}

const manifesto = (): Manifesto => carregarManifesto() as Manifesto;
const copia = (): Manifesto => structuredClone(manifesto());
const achar = (m: Manifesto, id: string): Item => {
  const item = m.itens.find((i) => i.id === id);
  if (!item) throw new Error(`sem item ${id}`);
  return item;
};

describe('manifesto de mídia', () => {
  it('é válido no schema e nas regras', () => {
    expect(validarManifesto(manifesto())).toEqual([]);
  });

  it('tem um registro por original (44 fotos + print + 3 logos + 7 vídeos)', () => {
    const m = manifesto();
    const originais = ['fotos', 'videos', 'marca'].flatMap((p) =>
      readdirSync(join(RAIZ, 'media-originais', p)).filter((n) => !n.startsWith('.')),
    );
    expect(m.itens).toHaveLength(originais.length);
    expect(m.itens).toHaveLength(55);
  });

  it('antes e depois só é publicável com consentimento autorizado (hoje: f00, f03, f05)', () => {
    const ads = manifesto().itens.filter((i) => i.natureza === 'antes-depois');
    expect(ads.map((i) => i.id).sort()).toEqual(
      ['f00', 'f03', 'f05', 'f06', 'f18', 'f19', 'f20', 'f21', 'f22'].map(
        (n) => `${n}-antes-depois`,
      ),
    );
    const AUTORIZADOS = ['f00-antes-depois', 'f03-antes-depois', 'f05-antes-depois'];
    for (const item of ads) {
      const aut = AUTORIZADOS.includes(item.id);
      expect(item.consentimento, item.id).toBe(aut ? 'autorizado' : 'pendente');
      expect(publicavel(item), item.id).toBe(aut);
    }
  });

  it('marca naoUsar no print do logo, no vídeo 360p e na colagem de feedback', () => {
    const nao = manifesto()
      .itens.filter((i) => i.naoUsar)
      .map((i) => i.arquivo);
    expect(nao.some((a) => a.includes('Captura de tela'))).toBe(true);
    expect(nao.some((a) => a.includes('1793717183596'))).toBe(true);
    expect(nao.some((a) => a.includes('526288937'))).toBe(true);
    expect(nao).toHaveLength(3);
  });

  it('retrato da Ester com crédito do fotógrafo pendente e recortes 4:5, 3:4 e 16:9', () => {
    const r = achar(manifesto(), 'f38-retrato-ester');
    expect(r.arquivo).toContain('627373272');
    expect(r.credito?.status).toBe('pendente');
    expect(r.recortes?.map((x) => x.id)).toEqual(['retrato-4x5', 'retrato-3x4', 'retrato-16x9']);
  });

  it('nenhum recorte do retrato toca a assinatura (x 1110–1352, y 672–733) nem os fios (x 232–244)', () => {
    for (const { retangulo: r } of achar(manifesto(), 'f38-retrato-ester').recortes ?? []) {
      const tocaAssinatura =
        r.x < 1352 && r.x + r.largura > 1110 && r.y < 733 && r.y + r.altura > 672;
      expect(tocaAssinatura).toBe(false);
      expect(r.x).toBeGreaterThan(244);
    }
  });

  describe('as travas pegam erros', () => {
    it('antes e depois com consentimento "nao-precisa"', () => {
      const m = copia();
      achar(m, 'f03-antes-depois').consentimento = 'nao-precisa';
      expect(validarManifesto(m).join()).toMatch(/exige consentimento/);
    });
    it('antes e depois com recortes de tamanhos diferentes', () => {
      const m = copia();
      const ad = achar(m, 'f05-antes-depois').antesDepois;
      if (ad) ad.depois.largura -= 10;
      expect(validarManifesto(m).join()).toMatch(/tamanhos diferentes/);
    });
    it('recorte fora da imagem', () => {
      const m = copia();
      const r = achar(m, 'f38-retrato-ester').recortes?.[0];
      if (r) r.retangulo.x = 1000;
      expect(validarManifesto(m).join()).toMatch(/fora da imagem/);
    });
    it('naoUsar com trecho', () => {
      const m = copia();
      const v = achar(m, 'v-tour');
      v.naoUsar = true;
      (v as Item & { motivoNaoUsar: string }).motivoNaoUsar = 'teste';
      expect(validarManifesto(m).join()).toMatch(/naoUsar não pode/);
    });
    it('consentimento fora da lista', () => {
      const m = copia();
      achar(m, 'f00-antes-depois').consentimento = 'talvez';
      expect(validarManifesto(m).join()).toMatch(/schema/);
    });
  });
});

const indicePath = join(RAIZ, 'public', 'media', 'indice.json');
const temDerivados = existsSync(indicePath);

describe.skipIf(!temDerivados)('derivados em public/media (depois de media:prepare)', () => {
  const indice = temDerivados
    ? (JSON.parse(readFileSync(indicePath, 'utf8')) as {
        resultados: Record<string, unknown>;
        videos: Record<
          string,
          {
            fontes: { mp4: { kb: number }[]; webm: { kb: number }[] };
            variantes?: Record<
              string,
              { fontes: { mp4: { kb: number }[]; webm: { kb: number }[] } }
            >;
          }
        >;
      })
    : null;

  it('nenhum arquivo de antes e depois pendente em public/', () => {
    const pendentes = manifesto()
      .itens.filter((i) => i.natureza === 'antes-depois' && !publicavel(i))
      .map((i) => i.id);
    expect(Object.keys(indice?.resultados ?? {}).sort()).toEqual([
      'f00-antes-depois',
      'f03-antes-depois',
      'f05-antes-depois',
    ]);
    const andar = (dir: string): string[] =>
      readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
        e.isDirectory() ? andar(join(dir, e.name)) : [e.name],
      );
    const nomes = andar(join(RAIZ, 'public', 'media'));
    for (const id of pendentes) expect(nomes.filter((n) => n.startsWith(id))).toEqual([]);
  });

  it('loop-letras ≤ 1 MB em todas as larguras e na variante 16:9', () => {
    const loop = indice?.videos['loop-letras'];
    expect(loop).toBeDefined();
    const fontes = [loop, ...Object.values(loop?.variantes ?? {})].flatMap((v) => [
      ...(v?.fontes.mp4 ?? []),
      ...(v?.fontes.webm ?? []),
    ]);
    expect(fontes.length).toBeGreaterThanOrEqual(6);
    for (const f of fontes) expect(f.kb).toBeLessThanOrEqual(1000);
  });
});

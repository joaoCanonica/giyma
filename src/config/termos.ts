// Termos vetados (CLAUDE.md, seção 8). NUNCA afrouxar sem ordem expressa do João.
// Única exceção prevista no CLAUDE.md: na FAQ, dizer que "botox" é o nome popular.
// Ela só vale dentro de um elemento marcado com data-nome-popular (ver audit-compliance).

export const TERMOS_VETADOS = [
  'o melhor',
  'a melhor',
  'número 1',
  'nº 1',
  'garantido',
  'garantia de resultado',
  'resultado imediato',
  'sem riscos',
  'sem dor',
  'avaliação gratuita',
  'grátis',
  'promoção',
  'desconto',
  'Botox',
  'Dysport',
  'Sculptra',
  'rejuvenesça',
  'transformação garantida',
] as const;

/** Termos que podem aparecer SÓ como nome popular, dentro de [data-nome-popular]. */
export const TERMOS_NOME_POPULAR = ['Botox'] as const;

function escapar(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Regex com bordas de palavra que respeitam acentos (sem pegar "sua melhor"). */
export function regexDoTermo(termo: string): RegExp {
  const corpo = escapar(termo).replace(/\s+/g, '\\s+');
  return new RegExp(`(?<![\\p{L}\\p{N}])${corpo}(?![\\p{L}\\p{N}])`, 'giu');
}

export interface Ocorrencia {
  readonly termo: string;
  readonly trecho: string;
}

export function encontrarTermosVetados(
  texto: string,
  termos: readonly string[] = TERMOS_VETADOS,
): Ocorrencia[] {
  const limpo = texto.normalize('NFC').replace(/\u00a0/g, ' ');
  const achados: Ocorrencia[] = [];
  for (const termo of termos) {
    for (const m of limpo.matchAll(regexDoTermo(termo))) {
      const i = m.index ?? 0;
      achados.push({
        termo,
        trecho: limpo.slice(Math.max(0, i - 30), i + m[0].length + 30).trim(),
      });
    }
  }
  return achados;
}

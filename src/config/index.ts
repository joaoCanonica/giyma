// Fonte única da config. Importável pelo Astro e pelos scripts Node (type stripping).
import { avaliacoes } from './avaliacoes.ts';
import { contato } from './contato.ts';
import { horario } from './horario.ts';
import { marca } from './marca.ts';
import { profissional } from './profissional.ts';
import type { Campo } from './tipos.ts';
import { valores } from './valores.ts';

export { avaliacoes, contato, horario, marca, profissional, valores };
export { modoAtual, ehPreview } from './ambiente.ts';
export { seo, robots } from './seo.ts';

export const config = { marca, profissional, contato, horario, avaliacoes, valores } as const;

export interface Pendencia {
  readonly caminho: string;
  readonly estado: 'opcional' | 'bloqueante' | 'aviso';
  readonly rotulo: string;
  readonly motivo?: string;
  /** opcional com valor já preenchido não é pendência. */
}

function ehCampo(v: unknown): v is Campo<unknown> {
  return typeof v === 'object' && v !== null && 'estado' in v && 'valor' in v;
}

/** Todos os campos não confirmados (opcionais vazios, bloqueantes e avisos). */
export function pendencias(raiz: object = config): Pendencia[] {
  const saida: Pendencia[] = [];
  const andar = (v: unknown, caminho: string) => {
    if (ehCampo(v)) {
      if (v.estado === 'bloqueante')
        saida.push({ caminho, estado: 'bloqueante', rotulo: v.rotulo });
      else if (v.estado === 'aviso')
        saida.push({ caminho, estado: 'aviso', rotulo: v.rotulo, motivo: v.motivo });
      else if (v.estado === 'opcional' && v.valor === null)
        saida.push({ caminho, estado: 'opcional', rotulo: caminho });
      return;
    }
    if (Array.isArray(v)) v.forEach((x, i) => andar(x, `${caminho}[${i}]`));
    else if (typeof v === 'object' && v !== null) {
      for (const [k, x] of Object.entries(v)) andar(x, caminho ? `${caminho}.${k}` : k);
    }
  };
  andar(raiz, '');
  return saida;
}

/**
 * Páginas que dependem de um dado bloqueante: em produção ficam fora do build
 * (o resto do site funciona). Em preview aparecem com o selo PROVISÓRIO.
 */
export const dependenciasDePagina: Readonly<Record<string, readonly Campo<unknown>[]>> = {
  'dra-ester-santos': [profissional.posEstetica],
};

export function paginaLiberada(slug: string): boolean {
  return (dependenciasDePagina[slug] ?? []).every((c) => c.estado !== 'bloqueante');
}

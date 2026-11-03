import dados from '../../docs/dados/avaliacoes-google.json' with { type: 'json' };
import { confirmado } from './tipos.ts';

const fonte = `Google Maps, coletado em ${dados.fonte.coletadoEm}`;
const nathalia = dados.avaliacoes.find((a) => a.id === 'g-001');
if (!nathalia) throw new Error('avaliação g-001 (Nathalia F.) não encontrada no JSON');

export interface Depoimento {
  readonly texto: string;
  readonly autorExibicao: string;
  readonly fonte: string;
  readonly autorizacao: string;
}

export const avaliacoes = {
  /** 1 avaliação passa fragilidade: sem nota nem selo até haver volume (meta 30+). Nunca em JSON-LD. */
  exibirNota: false,
  nota: confirmado(dados.resumo.nota, fonte),
  total: confirmado(dados.resumo.total, fonte),
  urlFicha: dados.fonte.urlFicha,
  coletadoEm: dados.fonte.coletadoEm,
  /** Citação literal ("Esther" com h, como escrito), primeiro nome + inicial e link. */
  destaque: confirmado(
    {
      texto: nathalia.texto,
      autorExibicao: nathalia.autorExibicao,
      nota: nathalia.nota,
      mesAprox: nathalia.mesAprox,
      plataforma: nathalia.plataforma,
      link: dados.fonte.urlFicha,
    },
    fonte,
  ),
  /** Depoimentos fora do Google: só com autorização escrita. Vazio até chegar. */
  depoimentosAutorizados: [] as readonly Depoimento[],
} as const;

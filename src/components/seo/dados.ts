// Dados das coleções que o SEO usa (catálogo de tratamentos).
import { getCollection } from 'astro:content';
import type { TratamentoLd } from './jsonld.ts';

/** Tratamentos que entram no catálogo e no llms.txt: só os confirmados. */
export async function tratamentosLd(): Promise<TratamentoLd[]> {
  return (await getCollection('tratamentos'))
    .map((x) => x.data)
    .filter((t) => t.status === 'confirmado')
    .map((t) => ({ slug: t.slug, nome: t.nome, resposta: t.resposta, areas: t.areas }));
}

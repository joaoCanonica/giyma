import { contato, enderecoEmLinha } from './contato.ts';
import { lerEnv, modoAtual } from './ambiente.ts';
import { marca } from './marca.ts';

export const seo = {
  /** URL pública: SITE_URL no ambiente. Sem domínio próprio (ainda não comprado), o endereço da Vercel. */
  siteUrl: (lerEnv('SITE_URL') ?? 'https://giyma-estetica-avancada.vercel.app').replace(/\/+$/, ''),
  /** Liberado na sessão 9 (conferência feita). Só vale em produção: preview nunca indexa. */
  indexar: true,
  idioma: 'pt-BR',
  local: 'pt_BR',
  /** Imagem de compartilhamento (gerada no build por scripts/gerar-og.mjs). */
  imagemOg: { caminho: '/media/og/giyma-og.jpg', largura: 1200, altura: 630 },
  imagemOgAlt:
    'Retrato de Ester Santos ao lado do logo da Giyma Saúde e Estética Avançada, em Lages/SC',
  /** Descrição do negócio (JSON-LD e llms.txt). Termos: beleza natural, cada fase, planejamento. */
  descricao:
    'Clínica de estética da Dra. Ester Santos, farmacêutica esteta (CRF-SC 3984), no Centro de Lages/SC. Harmonização facial com beleza natural em cada fase da vida: toxina botulínica, preenchimento com ácido hialurônico, bioestimulador de colágeno e rejuvenescimento de mãos, sempre com avaliação individual e planejamento.',
} as const;

/** Indexa só em produção e com indexar=true. */
export const indexavel = (): boolean => seo.indexar && modoAtual() === 'producao';

/** Conteúdo do meta robots. */
export function robots(): string {
  return indexavel() ? 'index, follow' : 'noindex, nofollow';
}

/** URL absoluta de um caminho do site ("/" vira a raiz, sem barra final nas internas). */
export function urlAbsoluta(caminho: string): string {
  const c = caminho === '/' || caminho === '' ? '/' : `/${caminho.replace(/^\/+|\/+$/g, '')}`;
  return `${seo.siteUrl}${c}`;
}

/** NAP (nome, endereço, telefone): idêntico em todas as páginas, no JSON-LD e no llms.txt. */
export function nap(): { nome: string; endereco: string; telefone: string } {
  return {
    nome: marca.nome.valor,
    endereco: enderecoEmLinha(),
    telefone: contato.telefoneExibicao.valor,
  };
}

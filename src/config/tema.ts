// Cores: a fonte única agora é src/styles/tokens.mjs (calibrada nos stills na sessão 3).
// Este módulo só repassa, para quem precisar das cores fora do CSS (ex.: ícones, JSON-LD).
export { paleta as cores, superficies } from '../styles/tokens.mjs';

export type Tema = 'claro' | 'escuro';

/** Regras de uso que o design system respeita (CLAUDE.md, seção 5). */
export const regrasDeCor = {
  ouro: 'chapado: fios, monograma e números grandes em fundo escuro; sobre pérola/névoa, rótulos e números usam ouroTinta (AA)',
  terracota: 'raríssimo: só detalhe editorial',
  perola: 'claro principal, frio, nunca areia',
} as const;

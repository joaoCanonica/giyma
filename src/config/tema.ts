// Paleta base (CLAUDE.md, seção 5). Valores aproximados: calibrar na sessão 3 com as
// fotos e o vídeo do tour e validar AA por script (audit-contraste).
export const cores = {
  cacau: '#231A16',
  petroleo: '#1E3348',
  perola: '#F3F1EE',
  nevoa: '#D9DCE0',
  ouroVelho: '#B8975F',
  terracota: '#A0522D',
} as const;

export type Tema = 'claro' | 'escuro';

/** Papéis por tema (rascunho; a sessão 3 define os tokens finais em src/styles). */
export const temas: Record<
  Tema,
  Record<'fundo' | 'superficie' | 'texto' | 'fio' | 'destaque', string>
> = {
  claro: {
    fundo: cores.perola,
    superficie: cores.nevoa,
    texto: cores.cacau,
    fio: cores.ouroVelho,
    destaque: cores.petroleo,
  },
  escuro: {
    fundo: cores.cacau,
    superficie: cores.petroleo,
    texto: cores.perola,
    fio: cores.ouroVelho,
    destaque: cores.nevoa,
  },
};

/** Regras de uso que o design system precisa respeitar. */
export const regrasDeCor = {
  ouroVelho: 'chapado: monograma, fios, números; nunca bloco, nunca degradê metálico',
  terracota: 'raríssimo: só detalhe editorial',
  perola: 'claro principal, frio, nunca areia',
} as const;

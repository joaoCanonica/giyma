// Fonte única dos tokens de cor. Gera src/styles/tokens.css (node src/styles/gerar-tokens.mjs)
// e alimenta o audit-contraste. Calibrado nos stills (sessão 3):
//   parede da recepção ≈ #242B3F (still-recepcao) · arte navy #13223C → petróleo #1F2E44
//   letras douradas: sombra #AA7F4A, tom médio #E8B87C (espelhado) → ouro velho chapado #B8925C
//   fundo do retrato #3B2927 · arte cacau #3D3230 → cacau #231A16 (principal) e cacau-2 #3A2A24

export const paleta = {
  cacau: '#231A16',
  cacau2: '#3A2A24',
  petroleo: '#1F2E44',
  petroleo2: '#2C3D57',
  perola: '#F3F1EE',
  nevoa: '#DADDE1',
  ouro: '#B8925C', // chapado: fios, monograma, números grandes em fundo escuro
  ouroClaro: '#D9B983', // ouro para fundo escuro quando precisa de mais luz (foco, números)
  ouroTinta: '#7A5A2E', // ouro escurecido para pérola/névoa (números e rótulos que precisam de AA)
  terracota: '#A0522D', // raríssimo, detalhe editorial
  tinta: '#231A16',
  tintaSuave: '#57493F',
  perolaSuave: '#CFC7BF',
  // tema escuro (pérola → noite)
  noite: '#17110E',
  noite2: '#221A16',
  cacauNoite: '#2B201B',
  petroleoNoite: '#18263A',
};

/**
 * Papéis por superfície. Cada capítulo do site declara data-superficie="perola|nevoa|cacau|petroleo".
 * fio = decorativo (ouro chapado); foco = anel de foco; numero = números grandes (≥ 24 px).
 */
const claras = (fundo) => ({
  fundo,
  texto: paleta.tinta,
  suave: paleta.tintaSuave,
  rotulo: paleta.ouroTinta,
  numero: paleta.ouroTinta,
  fio: paleta.ouro,
  foco: paleta.petroleo,
  acaoFundo: paleta.cacau,
  acaoTexto: paleta.perola,
  link: paleta.petroleo,
  esquema: 'light',
});
const escuras = (fundo, extra = {}) => ({
  fundo,
  texto: paleta.perola,
  suave: paleta.perolaSuave,
  rotulo: paleta.ouroClaro,
  numero: paleta.ouro,
  fio: paleta.ouro,
  foco: paleta.ouroClaro,
  acaoFundo: paleta.perola,
  acaoTexto: paleta.cacau,
  link: paleta.ouroClaro,
  esquema: 'dark',
  ...extra,
});

export const superficies = {
  claro: {
    perola: claras(paleta.perola),
    nevoa: claras(paleta.nevoa),
    cacau: escuras(paleta.cacau),
    petroleo: escuras(paleta.petroleo),
  },
  // Escuro global: as superfícies claras viram noite; cacau e petróleo sobem um tom
  // para a alternância de capítulos continuar visível.
  escuro: {
    perola: escuras(paleta.noite),
    nevoa: escuras(paleta.noite2),
    cacau: escuras(paleta.cacauNoite),
    petroleo: escuras(paleta.petroleoNoite),
  },
};

/** Pares usados de fato e o mínimo WCAG de cada um. */
export const pares = [
  { frente: 'texto', fundo: 'fundo', minimo: 4.5, uso: 'texto corrido' },
  { frente: 'suave', fundo: 'fundo', minimo: 4.5, uso: 'texto secundário, legendas' },
  { frente: 'rotulo', fundo: 'fundo', minimo: 4.5, uso: 'rótulos em versalete (13–14 px)' },
  { frente: 'link', fundo: 'fundo', minimo: 4.5, uso: 'links no texto' },
  { frente: 'numero', fundo: 'fundo', minimo: 3, uso: 'números grandes (≥ 24 px, texto grande)' },
  { frente: 'foco', fundo: 'fundo', minimo: 3, uso: 'anel de foco (1.4.11)' },
  { frente: 'acaoTexto', fundo: 'acaoFundo', minimo: 4.5, uso: 'texto do botão primário' },
  { frente: 'acaoFundo', fundo: 'fundo', minimo: 3, uso: 'limite do botão primário (1.4.11)' },
];

/** Ouro chapado sobre cada fundo: informativo (fio decorativo não exige contraste). */
export const informativos = [{ frente: 'fio', fundo: 'fundo', uso: 'fio dourado decorativo' }];

// ---------- contraste (WCAG 2.x) ----------

function canal(c) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}
export function luminancia(hex) {
  const n = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16));
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
}
export function contraste(a, b) {
  const [x, y] = [luminancia(a), luminancia(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

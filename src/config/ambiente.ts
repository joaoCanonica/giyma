// Modo do build: "preview" (padrão) ou "producao". Lido do ambiente no build (Node).
export type Modo = 'preview' | 'producao';

function lerEnv(chave: string): string | undefined {
  return typeof process !== 'undefined' ? process.env[chave] : undefined;
}

/**
 * GIYMA_MODO manda. Sem ele, na Vercel, o deploy de produção (VERCEL_ENV=production) é produção
 * e todo o resto (previews, máquina local) é preview: noindex, faixa "em revisão" e selos.
 */
export function modoAtual(): Modo {
  const modo = lerEnv('GIYMA_MODO');
  if (modo) return modo === 'producao' ? 'producao' : 'preview';
  return lerEnv('VERCEL_ENV') === 'production' ? 'producao' : 'preview';
}

/** URL pública: SITE_URL; senão, a URL de produção do projeto na Vercel; senão, o padrão. */
export function urlDoSite(): string {
  const vercel = lerEnv('VERCEL_PROJECT_PRODUCTION_URL');
  return (
    lerEnv('SITE_URL') ??
    (vercel ? `https://${vercel}` : 'https://giyma-estetica-avancada.vercel.app')
  ).replace(/\/+$/, '');
}

export const ehPreview = (): boolean => modoAtual() === 'preview';
export { lerEnv };

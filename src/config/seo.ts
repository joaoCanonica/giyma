import { lerEnv, modoAtual } from './ambiente.ts';

export const seo = {
  /** URL pública. Domínio pendente: vem de SITE_URL no ambiente. */
  siteUrl: lerEnv('SITE_URL') ?? 'http://localhost:4321',
  /** Fica false até a sessão 9 (conferência de normas e deploy). Preview nunca indexa. */
  indexar: false,
  idioma: 'pt-BR',
  local: 'pt_BR',
} as const;

/** Conteúdo do meta robots. */
export function robots(): string {
  return seo.indexar && modoAtual() === 'producao' ? 'index, follow' : 'noindex, nofollow';
}

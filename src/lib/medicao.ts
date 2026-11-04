// Medição sem invadir: 3 eventos, sem dado pessoal, só depois do consentimento.
// Ferramenta proposta: Plausible (sem cookie, sem perfil, dados agregados). O script só é
// pedido ao servidor externo depois de "Aceitar" (docs/FUNIL.md explica a escolha).

export type Evento = 'clique_whatsapp' | 'clique_como_chegar' | 'clique_instagram';

export interface Propriedades {
  origem: string;
  pagina: string;
  tratamento?: string;
  fase?: string;
}

/** Qual evento um link dispara (pelo destino): null = não medido. */
export function classificar(href: string): Evento | null {
  if (/^https:\/\/wa\.me\//.test(href)) return 'clique_whatsapp';
  if (/google\.com\/maps|waze\.com|maps\.apple\.com/.test(href)) return 'clique_como_chegar';
  if (/instagram\.com/.test(href)) return 'clique_instagram';
  return null;
}

/** Contexto do clique: origem (data-origem do link ou do bloco), tratamento e fase. Nada pessoal. */
export function propriedades(el: Element, pagina: string): Propriedades {
  const comDados = el.closest<HTMLElement>('[data-origem]');
  const secao = el.closest('section[id], footer, header, [data-flutuante]');
  const origem =
    comDados?.dataset['origem'] ??
    (secao?.id ||
      secao?.getAttribute('aria-labelledby') ||
      secao?.tagName.toLowerCase() ||
      'pagina');
  const props: Propriedades = { origem, pagina };
  const tratamento = el.closest<HTMLElement>('[data-tratamento]')?.dataset['tratamento'];
  const fase = el.closest<HTMLElement>('[data-fase]')?.dataset['fase'];
  if (tratamento) props.tratamento = tratamento;
  if (fase) props.fase = fase;
  return props;
}

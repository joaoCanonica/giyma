import { aviso, confirmado, opcional } from './tipos.ts';

export const marca = {
  nome: confirmado(
    'Giyma Saúde e Estética Avançada',
    'logo ("GIYMA · SAÚDE E ESTÉTICA AVANÇADA") e decisão do João (pacote de prompts, seção A)',
  ),
  /** Como aparece na ficha do Google hoje (para conferência de NAP). */
  nomeNaFichaGoogle: confirmado('Giyma | Saúde e Estética Avançada', 'Google Maps, 02/11/2026'),
  nomeCurto: confirmado('Giyma', 'logo'),
  inauguracao: confirmado('2023-09-15', 'post de inauguração (15/09/2023)'),
  /**
   * Hipótese: Gi + Ma (as filhas, Gi e Mari). NÃO publicar até a Ester confirmar.
   */
  origemDoNome: opcional<string>(null),
  logos: aviso(
    'logo reconstruído',
    'SVG reconstruído a partir das artes; validar com a clínica e pedir o arquivo do designer',
    {
      vertical: {
        original: 'media-originais/marca/giyma-logo-vertical.svg',
        publico: '/media/marca/logo-vertical.svg',
      },
      horizontal: {
        original: 'media-originais/marca/giyma-logo-horizontal.svg',
        publico: '/media/marca/logo-horizontal.svg',
      },
      monograma: {
        original: 'media-originais/marca/giyma-logo-mark.svg',
        publico: '/media/marca/logo-mark.svg',
      },
    },
  ),
  instagramProprio: opcional<string>(null),
  cnpj: opcional<string>(null),
  razaoSocial: opcional<string>(null),
  responsavelTecnico: opcional<string>(null),
  dominio: opcional<string>(null),
} as const;

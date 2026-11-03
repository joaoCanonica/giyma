import { confirmado, opcional, type Campo } from './tipos.ts';

const POST_VALORES = 'post Dew0bm9EbvR (21/10/2026)';

export interface Valor {
  readonly id: string;
  readonly nome: string;
  /** Frase da Ester para o valor (texto final na sessão 5). */
  readonly frase: Campo<string>;
  /** id do still em public/media/indice.json (null = ainda não há imagem limpa). */
  readonly still: Campo<string>;
  readonly nota?: string;
}

export const valores: readonly Valor[] = [
  {
    id: 'seguranca-e-cuidado',
    nome: 'Segurança e cuidado',
    frase: confirmado(
      'Meu atendimento é direcionado a restaurar sua autoestima com segurança e cuidado.',
      `${POST_VALORES}, arte "Valores"`,
    ),
    still: opcional<string>(null),
    nota: 'A arte usa a Ester de máscara no procedimento; no tour, o procedimento mostra paciente (direito de imagem pendente).',
  },
  {
    id: 'naturalidade-com-proposito',
    nome: 'Naturalidade com propósito',
    frase: opcional<string>(null),
    still: opcional<string>(null),
    nota: 'O quadro "face body dreams" aparece no tour (16,6–17,7 s); ainda não há still dele no manifesto.',
  },
  {
    id: 'etica-e-transparencia',
    nome: 'Ética e transparência',
    frase: opcional<string>(null),
    still: confirmado('still-xicaras', 'media.manifest.json (tour, 7,8 s)'),
  },
  {
    id: 'acolhimento-humanizado',
    nome: 'Acolhimento humanizado',
    frase: opcional<string>(null),
    still: confirmado('still-modelo', 'media.manifest.json (tour, 20,3 s)'),
  },
];

// Funil único: WhatsApp com mensagem pronta por contexto.
import { contato } from '../config/contato.ts';

export type Faixa = '20' | '30' | '40' | '50' | '60+';

/** Como a faixa entra na frase "Tenho … anos". */
export const FAIXA_EM_TEXTO: Record<Faixa, string> = {
  '20': 'entre 20 e 29',
  '30': 'entre 30 e 39',
  '40': 'entre 40 e 49',
  '50': 'entre 50 e 59',
  '60+': '60 ou mais',
};

export function linkWhatsApp(texto: string, numero: string = contato.whatsapp.valor): string {
  const digitos = numero.replace(/\D/g, '');
  if (!/^\d{12,13}$/.test(digitos)) throw new Error(`número de WhatsApp inválido: "${numero}"`);
  const t = texto.trim();
  if (!t) throw new Error('mensagem de WhatsApp vazia');
  return `https://wa.me/${digitos}?text=${encodeURIComponent(t)}`;
}

function exigir(valor: string, nome: string): string {
  const v = valor.trim();
  if (!v) throw new Error(`mensagem de WhatsApp sem ${nome}`);
  return v;
}

export const mensagens = {
  geral: (): string =>
    'Olá! Vim pelo site da Giyma e gostaria de agendar uma avaliação com a Dra. Ester.',
  tratamento: (tratamento: string): string =>
    `Olá! Vim pelo site da Giyma e gostaria de agendar uma avaliação sobre ${exigir(tratamento, 'tratamento')}.`,
  fase: (faixa: Faixa): string =>
    `Olá! Vim pelo site da Giyma. Tenho ${FAIXA_EM_TEXTO[faixa]} anos e gostaria de entender o que faz sentido para a minha pele.`,
  duvida: (tema: string): string =>
    `Olá! Vim pelo site da Giyma e tenho uma dúvida sobre ${exigir(tema, 'tema')}.`,
} as const;

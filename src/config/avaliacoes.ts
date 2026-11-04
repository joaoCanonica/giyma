import dados from '../../docs/dados/avaliacoes-google.json' with { type: 'json' };
import { confirmado } from './tipos.ts';

const fonte = `Google Maps, coletado em ${dados.fonte.coletadoEm}`;
const nathalia = dados.avaliacoes.find((a) => a.id === 'g-001');
if (!nathalia) throw new Error('avaliação g-001 (Nathalia F.) não encontrada no JSON');

export interface Depoimento {
  readonly texto: string;
  readonly autorExibicao: string;
  readonly fonte: string;
  readonly autorizacao: string;
}

export const avaliacoes = {
  /** 1 avaliação passa fragilidade: sem nota nem selo até haver volume (meta 30+). Nunca em JSON-LD. */
  exibirNota: false,
  nota: confirmado(dados.resumo.nota, fonte),
  total: confirmado(dados.resumo.total, fonte),
  urlFicha: dados.fonte.urlFicha,
  coletadoEm: dados.fonte.coletadoEm,
  /** Citação literal ("Esther" com h, como escrito), primeiro nome + inicial e link. */
  destaque: confirmado(
    {
      texto: nathalia.texto,
      autorExibicao: nathalia.autorExibicao,
      nota: nathalia.nota,
      mesAprox: nathalia.mesAprox,
      plataforma: nathalia.plataforma,
      link: dados.fonte.urlFicha,
    },
    fonte,
  ),
  /**
   * Depoimentos fora do Google: só autorizados. Mensagens de WhatsApp publicadas pela Giyma no
   * post DMvUX6LRp3r (30/07/2025), autorizadas (João, 04/11/2026). Texto literal; nunca o print.
   */
  depoimentosAutorizados: [
    {
      texto:
        'Muito obrigada por tudo, eu estou amando o resultado, queria te agradecer ainda mais pela forma que você fez, não tenho palavras',
      autorExibicao: 'Paciente da Giyma · WhatsApp',
      fonte: 'post DMvUX6LRp3r (30/07/2025), "Feedback que amamos!"',
      autorizacao: 'autorizado pelo João em 04/11/2026',
    },
    {
      texto:
        'Muitoooo obrigada!!! Você é de maaaais!!!!! Toda pessoa que eu puder eu vou indicar seu trabalho!!',
      autorExibicao: 'Paciente da Giyma · WhatsApp',
      fonte: 'post DMvUX6LRp3r (30/07/2025), "Feedback que amamos!"',
      autorizacao: 'autorizado pelo João em 04/11/2026',
    },
  ] as readonly Depoimento[],
} as const;

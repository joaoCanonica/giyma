import { aviso, confirmado } from './tipos.ts';

const POST_ANUNCIO = 'post de 25/07/2023 (anúncio da Giyma)';
const POST_50 = 'post de 05/06/2026 (aniversário de 50 anos)';
const COMECE_AQUI = 'destaque "Comece aqui" do Instagram';
const TEXTO_JOAO = 'frases reais enviadas pelo João (CLAUDE.md, seção 1)';

export const profissional = {
  nome: confirmado('Ester Santos', 'bio do Instagram'),
  tratamento: confirmado('Dra.', 'bio do Instagram'),
  profissao: confirmado('farmacêutica esteta', 'bio do Instagram'),
  registro: confirmado('CRF-SC 3984', 'bio do Instagram'),
  /** Conferir no CRF-SC a averbação da especialização em estética. */
  averbacaoEstetica: aviso<string>(
    'averbação no CRF-SC',
    'confirmar a especialização em saúde estética averbada (requisito do CFF)',
  ),
  formacao: confirmado(
    [
      {
        curso: 'Farmácia',
        instituicao: 'Universidade Federal de Santa Catarina',
        sigla: 'UFSC',
        ano: 1999,
      },
    ],
    POST_ANUNCIO,
  ),
  /** Pós-graduação lato sensu em Farmácia Estética: a habilitação no CRF-SC para injetáveis. */
  posEstetica: confirmado(
    { curso: 'Farmácia Estética', nivel: 'pós-graduação lato sensu' },
    'João, 04/11/2026 (instituição e ano não informados)',
  ),
  trajetoria: confirmado(
    ['professora universitária', 'vigilância sanitária', 'análises laboratoriais'],
    POST_ANUNCIO,
  ),
  nascimento: confirmado('1976-06-05', `${POST_50}: 50 anos em 05/06/2026`),
  marcos: [
    { ano: 1999, fato: 'Forma-se em Farmácia pela UFSC', campo: confirmado(1999, POST_ANUNCIO) },
    {
      ano: 2014,
      fato: 'Aos 38 anos, começa a cuidar de si como paciente (o "renascimento")',
      campo: aviso(
        'ano aproximado',
        'calculado de "50 anos em 2026" e "renascimento aos 38"; no site, dizer "aos 38", não o ano',
        2014,
      ),
    },
    {
      ano: 2015,
      fato: 'Farmacêuticos passam a atuar na estética (Res. CFF 616/2015)',
      campo: confirmado(2015, `${POST_ANUNCIO} e Res. CFF 616/2015`),
    },
    {
      ano: 2023,
      fato: 'Inaugura a Giyma (15/09/2023)',
      campo: confirmado('2023-09-15', 'post de inauguração'),
    },
    { ano: 2026, fato: 'Completa 50 anos', campo: confirmado('2026-06-05', POST_50) },
  ],
  citacoes: [
    {
      texto: 'Hoje eu celebro 50 anos de vida, mas o meu "renascimento" aconteceu aos 38.',
      fonte: POST_50,
    },
    { texto: 'Eu decidi que não teria medo das marcas do tempo.', fonte: POST_50 },
    {
      texto:
        'O que começou como uma jornada como paciente, tornou-se a minha missão de vida aqui na clínica.',
      fonte: POST_50,
    },
    {
      texto: 'A beleza está em abraçar a maturidade com naturalidade e segurança.',
      fonte: POST_50,
    },
    {
      texto: 'Aqui começa a nova história da Ester. Aqui começa a minha nova história com VOCÊ.',
      fonte: POST_ANUNCIO,
    },
    {
      texto:
        'Cada pessoa é única, por isso eu faço uma avaliação personalizada antes de realizar qualquer procedimento.',
      fonte: COMECE_AQUI,
    },
    { texto: 'Cada pessoa é única.', fonte: TEXTO_JOAO },
    { texto: 'Estética não é futilidade. É autocuidado, é autoestima.', fonte: TEXTO_JOAO },
    {
      texto:
        'Não é sobre mudar quem você é. É sobre alinhar o seu exterior com a força que existe no seu interior.',
      fonte: TEXTO_JOAO,
    },
    { texto: 'A SEGURANÇA é inegociável.', fonte: TEXTO_JOAO },
    {
      texto: 'Sua pele conta a sua história.',
      fonte: `${TEXTO_JOAO}; post DbBfgMjRUkX (20/07/2026)`,
    },
    {
      texto:
        'O segredo não está em uma fórmula mágica, e sim no respeito à individualidade do seu rosto.',
      fonte: TEXTO_JOAO,
    },
    {
      texto: 'Para que sua melhor versão floresça de dentro para fora.',
      fonte: 'post DJU2r4mxkNR (06/05/2025)',
    },
  ],
} as const;

/** "Dra. Ester Santos · farmacêutica esteta · CRF-SC 3984" — sempre juntos (seção 8). */
export function assinaturaProfissional(): string {
  const p = profissional;
  return `${p.tratamento.valor} ${p.nome.valor} · ${p.profissao.valor} · ${p.registro.valor}`;
}

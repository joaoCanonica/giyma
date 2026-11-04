// Páginas públicas (sitemap, llms.txt). O audit-seo confere esta lista contra o dist.
import { paginaLiberada } from '../../config/index.ts';
import { tratamentosLd } from './dados.ts';

export interface PaginaPublica {
  caminho: string;
  nome: string;
  /** Uma linha para o llms.txt. */
  resumo: string;
}

export async function paginasPublicas(): Promise<PaginaPublica[]> {
  const tratamentos = await tratamentosLd();
  return [
    { caminho: '/', nome: 'Início', resumo: 'quem é a Giyma, a Ester e como agendar' },
    { caminho: '/a-giyma', nome: 'A Giyma', resumo: 'o espaço, os valores e como é o atendimento' },
    ...(paginaLiberada('dra-ester-santos')
      ? [
          {
            caminho: '/dra-ester-santos',
            nome: 'Ester Santos',
            resumo: 'história, formação e registro profissional',
          },
        ]
      : []),
    {
      caminho: '/tratamentos',
      nome: 'Tratamentos',
      resumo: 'todos os tratamentos, com avaliação antes de qualquer procedimento',
    },
    ...tratamentos.map((t) => ({
      caminho: `/tratamentos/${t.slug}`,
      nome: t.nome,
      resumo: t.areas.length ? t.areas.join(', ') : t.nome,
    })),
    {
      caminho: '/cada-fase',
      nome: 'Cada fase',
      resumo: 'o que muda na pele dos 20 aos 60+ e o que costuma fazer sentido',
    },
    {
      caminho: '/resultados',
      nome: 'Resultados',
      resumo: 'antes e depois só com autorização da paciente',
    },
    {
      caminho: '/perguntas-frequentes',
      nome: 'Perguntas frequentes',
      resumo: 'toxina, preenchimento, bioestimulador, avaliação e quem pode aplicar',
    },
    { caminho: '/como-chegar', nome: 'Como chegar', resumo: 'endereço, rotas e mapa' },
    { caminho: '/privacidade', nome: 'Privacidade', resumo: 'como o site trata os seus dados' },
  ];
}

// Dados estruturados (schema.org, JSON-LD) gerados da config. Fonte de verdade: src/config.
// Tipo do negócio: HealthAndBeautyBusiness + MedicalBusiness (ver docs/SEO_GEO.md). NUNCA
// Physician, IndividualPhysician nem MedicalClinic (sugerem médico). SEM AggregateRating e
// sem Review: avaliações do próprio negócio são "autosservidas" para o Google.
import { contato, horario, marca, profissional, seo, urlAbsoluta } from '../../config/index.ts';
import type { Semana } from '../../lib/horario.ts';

export type No = Record<string, unknown>;

export const ID = {
  negocio: () => urlAbsoluta('/#giyma'),
  pessoa: () => urlAbsoluta('/#ester-santos'),
  site: () => urlAbsoluta('/#site'),
  catalogo: () => urlAbsoluta('/tratamentos#catalogo'),
};

export interface TratamentoLd {
  slug: string;
  nome: string;
  resposta: string | null;
  areas: readonly string[];
}

const DIAS: Record<keyof Semana, string> = {
  dom: 'Sunday',
  seg: 'Monday',
  ter: 'Tuesday',
  qua: 'Wednesday',
  qui: 'Thursday',
  sex: 'Friday',
  sab: 'Saturday',
};

/** openingHoursSpecification só quando o horário estiver confirmado. */
export function horarios(): No[] | undefined {
  const c = horario.semana as { estado: string; valor: unknown };
  if (c.estado !== 'confirmado') return undefined;
  const semana = c.valor as Semana;
  return (Object.keys(DIAS) as (keyof Semana)[]).flatMap((d) =>
    semana[d].map((f) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: `https://schema.org/${DIAS[d]}`,
      opens: f.abre,
      closes: f.fecha,
    })),
  );
}

/** Telefone em formato internacional: +55 49 99827-3904. */
export function telefoneInternacional(): string {
  const d = contato.whatsapp.valor; // 5549998273904
  return `+${d.slice(0, 2)} ${d.slice(2, 4)} ${d.slice(4, 9)}-${d.slice(9)}`;
}

export function endereco(): No {
  const e = contato.endereco.valor;
  return {
    '@type': 'PostalAddress',
    streetAddress: `${e.logradouro}, ${e.numero}`,
    addressLocality: e.cidade,
    addressRegion: e.uf,
    postalCode: e.cep,
    addressCountry: e.pais,
  };
}

/** Serviço por tratamento (página própria; prestado pela Ester na Giyma). */
export function servico(t: TratamentoLd): No {
  const url = urlAbsoluta(`/tratamentos/${t.slug}`);
  const no: No = {
    '@type': 'Service',
    '@id': `${url}#servico`,
    name: t.nome,
    serviceType: t.nome,
    url,
    provider: { '@id': ID.negocio() },
    areaServed: {
      '@type': 'City',
      name: `${contato.endereco.valor.cidade}, ${contato.endereco.valor.uf}`,
    },
  };
  if (t.resposta) no['description'] = t.resposta;
  return no;
}

/** O negócio (com o catálogo dos tratamentos confirmados). */
export function negocio(tratamentos: readonly TratamentoLd[]): No {
  const g = contato.geo.valor;
  const no: No = {
    '@type': ['HealthAndBeautyBusiness', 'MedicalBusiness'],
    '@id': ID.negocio(),
    name: marca.nome.valor,
    alternateName: marca.nomeCurto.valor,
    description: seo.descricao,
    url: urlAbsoluta('/'),
    image: urlAbsoluta(seo.imagemOg.caminho),
    logo: urlAbsoluta(marca.logos.valor?.vertical.publico ?? '/favicon.svg'),
    telephone: telefoneInternacional(),
    address: endereco(),
    geo: { '@type': 'GeoCoordinates', latitude: g.lat, longitude: g.lng },
    hasMap: contato.mapas.valor.googleFicha,
    sameAs: [contato.instagram.valor.url, contato.mapas.valor.googleFicha],
    foundingDate: marca.inauguracao.valor,
    areaServed: {
      '@type': 'City',
      name: `${contato.endereco.valor.cidade}, ${contato.endereco.valor.uf}`,
    },
    employee: { '@id': ID.pessoa() },
    knowsLanguage: seo.idioma,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      '@id': ID.catalogo(),
      name: 'Tratamentos',
      url: urlAbsoluta('/tratamentos'),
      itemListElement: tratamentos.map((t) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          '@id': `${urlAbsoluta(`/tratamentos/${t.slug}`)}#servico`,
          name: t.nome,
          url: urlAbsoluta(`/tratamentos/${t.slug}`),
        },
      })),
    },
  };
  const h = horarios();
  if (h?.length) no['openingHoursSpecification'] = h;
  return no;
}

/** A profissional. Sem "Dra." isolado: o cargo e o registro vão juntos. */
export function pessoa(tratamentos: readonly TratamentoLd[], urlPagina: string): No {
  const p = profissional;
  const f = p.formacao.valor[0];
  const [conselho, numero] = p.registro.valor.split(' ');
  return {
    '@type': 'Person',
    '@id': ID.pessoa(),
    name: p.nome.valor,
    jobTitle: 'Farmacêutica esteta',
    description: `${p.nome.valor} é farmacêutica esteta (${p.registro.valor}), formada em ${f?.curso} pela ${f?.sigla} em ${f?.ano}. Atende na ${marca.nome.valor}, no Centro de Lages/SC.`,
    url: urlPagina,
    image: urlAbsoluta('/media/img/retrato-3x4-800.webp'),
    identifier: { '@type': 'PropertyValue', propertyID: conselho, value: numero },
    hasCredential: {
      '@type': 'EducationalOccupationalCredential',
      name: `Registro profissional ${p.registro.valor}`,
      credentialCategory: 'registro profissional',
      recognizedBy: {
        '@type': 'Organization',
        name: 'Conselho Regional de Farmácia de Santa Catarina (CRF-SC)',
      },
    },
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: f?.instituicao,
      alternateName: f?.sigla,
    },
    knowsAbout: [
      'Farmácia estética',
      'Harmonização facial',
      'Beleza natural',
      'Planejamento estético por etapas',
      ...tratamentos.map((t) => t.nome),
    ],
    worksFor: { '@id': ID.negocio() },
    workLocation: { '@id': ID.negocio() },
    sameAs: [contato.instagram.valor.url],
  };
}

export function site(): No {
  return {
    '@type': 'WebSite',
    '@id': ID.site(),
    name: marca.nome.valor,
    url: urlAbsoluta('/'),
    inLanguage: seo.idioma,
    publisher: { '@id': ID.negocio() },
  };
}

export interface ItemTrilha {
  nome: string;
  caminho: string;
}
export function trilha(itens: readonly ItemTrilha[]): No {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: itens.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.nome,
      item: urlAbsoluta(it.caminho),
    })),
  };
}

export interface Pergunta {
  pergunta: string;
  resposta: string;
}
/** FAQPage: só com perguntas e respostas visíveis na página. */
export function faq(caminho: string, perguntas: readonly Pergunta[]): No {
  return {
    '@type': 'FAQPage',
    '@id': `${urlAbsoluta(caminho)}#faq`,
    url: urlAbsoluta(caminho),
    inLanguage: seo.idioma,
    mainEntity: perguntas.map((q) => ({
      '@type': 'Question',
      name: q.pergunta,
      acceptedAnswer: { '@type': 'Answer', text: q.resposta },
    })),
  };
}

/** Texto puro para o JSON-LD: tira marcação de nome popular e espaços sobrando. */
export function textoPuro(s: string): string {
  return s
    .replace(/\{\{nome-popular:([^}]+)\}\}/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function grafo(nos: readonly No[]): string {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': nos }).replace(
    /</g,
    '\\u003c',
  );
}

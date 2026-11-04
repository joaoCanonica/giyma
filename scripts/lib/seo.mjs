// Regras do audit-seo (puras: recebem HTML/JSON e devolvem problemas). Usadas por
// scripts/audit-seo.mjs e provadas em scripts/test-seo.mjs.
//
// Fontes das regras:
// - vocabulário: schema.org 30.1 (scripts/lib/schemaorg-vocab.json, extraído do repositório
//   oficial github.com/schemaorg/schemaorg): todo @type e toda propriedade precisam existir, e a
//   propriedade precisa valer para o tipo (domainIncludes, com herança);
// - Google Search Central: LocalBusiness exige name e address; FAQPage exige Question.name e
//   acceptedAnswer.text, com o texto visível na página; BreadcrumbList exige position e name;
//   avaliações do próprio negócio são autosservidas (sem AggregateRating/Review);
// - projeto (CLAUDE.md §8): nada de Physician/MedicalClinic; termos vetados e "Dra. Ester" sem
//   CRF também valem dentro do JSON-LD.
import { readFileSync } from 'node:fs';
import { parse } from 'node-html-parser';
import {
  encontrarTermosVetados,
  TERMOS_NOME_POPULAR,
  TERMOS_VETADOS,
} from '../../src/config/termos.ts';

const VOCAB = JSON.parse(readFileSync(new URL('./schemaorg-vocab.json', import.meta.url), 'utf8'));
export const VERSAO_SCHEMA = VOCAB.versao;

export const TIPOS_PROIBIDOS = [
  'Physician',
  'IndividualPhysician',
  'PhysiciansOffice',
  'MedicalClinic',
  'Hospital',
  'AggregateRating',
  'Review',
  'EmployerAggregateRating',
];
export const PROPRIEDADES_PROIBIDAS = ['aggregateRating', 'review', 'reviews'];
const NOME = /Dra\.?\s*Esth?er(\s+Santos)?/iu;

/** Tipo + todos os ancestrais (com herança múltipla). */
export function ancestrais(tipo) {
  const vistos = new Set();
  const fila = [tipo];
  while (fila.length) {
    const t = fila.shift();
    if (vistos.has(t)) continue;
    vistos.add(t);
    for (const p of VOCAB.classes[t] ?? []) fila.push(p);
  }
  return vistos;
}
const lista = (x) => (Array.isArray(x) ? x : x === undefined ? [] : [x]);

/** Valida um grafo JSON-LD contra o vocabulário e as regras. */
export function validarJsonLd(dado) {
  const problemas = [];
  const p = (regra, detalhe) => problemas.push({ regra, detalhe });
  if (dado?.['@context'] !== 'https://schema.org')
    p('jsonld-contexto', '@context precisa ser https://schema.org');
  const nos = dado?.['@graph'] ?? [dado];

  const visitar = (no, caminho) => {
    if (Array.isArray(no)) return no.forEach((x, i) => visitar(x, `${caminho}[${i}]`));
    if (typeof no !== 'object' || no === null) {
      if (typeof no === 'string') {
        for (const o of encontrarTermosVetados(
          no,
          caminho.includes('FAQPage')
            ? TERMOS_VETADOS.filter((t) => !TERMOS_NOME_POPULAR.includes(t))
            : TERMOS_VETADOS,
        ))
          p('jsonld-termo-vetado', `${caminho}: "${o.termo}"`);
        if (NOME.test(no) && !no.includes('CRF-SC 3984'))
          p('jsonld-crf', `${caminho}: cita "${no.match(NOME)[0]}" sem CRF-SC 3984`);
      }
      return;
    }
    const tipos = lista(no['@type']);
    const permitidos = new Set();
    for (const t of tipos) {
      if (!(t in VOCAB.classes))
        p(
          'jsonld-tipo-inexistente',
          `${caminho}: @type "${t}" não existe no schema.org ${VERSAO_SCHEMA}`,
        );
      if (TIPOS_PROIBIDOS.includes(t)) p('jsonld-tipo-proibido', `${caminho}: @type "${t}"`);
      for (const a of ancestrais(t)) permitidos.add(a);
    }
    const sohReferencia = !tipos.length && Object.keys(no).every((k) => k === '@id');
    if (!tipos.length && !sohReferencia) p('jsonld-sem-tipo', `${caminho}: objeto sem @type`);
    for (const [k, v] of Object.entries(no)) {
      if (k.startsWith('@')) continue;
      const def = VOCAB.propriedades[k];
      if (PROPRIEDADES_PROIBIDAS.includes(k))
        p('jsonld-avaliacao', `${caminho}.${k}: avaliação autosservida não entra no JSON-LD`);
      if (!def)
        p(
          'jsonld-propriedade-inexistente',
          `${caminho}.${k} não existe no schema.org ${VERSAO_SCHEMA}`,
        );
      else {
        if (def.s)
          p('jsonld-propriedade-obsoleta', `${caminho}.${k} foi substituída no schema.org`);
        if (tipos.length && !def.d.some((d) => permitidos.has(d)))
          p('jsonld-propriedade-fora-do-tipo', `${caminho}.${k} não vale para ${tipos.join('+')}`);
      }
      const rotulo = tipos.length ? `${caminho}<${tipos.join('+')}>.${k}` : `${caminho}.${k}`;
      visitar(v, rotulo);
    }
  };
  nos.forEach((n, i) => visitar(n, `@graph[${i}]`));

  // Requisitos do Google por tipo.
  for (const n of nos) {
    const tipos = new Set(lista(n['@type']).flatMap((t) => [...ancestrais(t)]));
    if (tipos.has('LocalBusiness')) {
      for (const k of ['name', 'address', 'telephone', 'url', 'geo'])
        if (!n[k]) p('google-negocio', `negócio sem ${k}`);
      for (const k of [
        'streetAddress',
        'addressLocality',
        'addressRegion',
        'postalCode',
        'addressCountry',
      ])
        if (!n.address?.[k]) p('google-negocio', `address sem ${k}`);
    }
    if (tipos.has('FAQPage')) {
      const qs = lista(n.mainEntity);
      if (!qs.length) p('google-faq', 'FAQPage sem mainEntity');
      for (const q of qs)
        if (
          q['@type'] !== 'Question' ||
          !q.name ||
          q.acceptedAnswer?.['@type'] !== 'Answer' ||
          !q.acceptedAnswer?.text
        )
          p('google-faq', `pergunta incompleta: ${JSON.stringify(q).slice(0, 80)}`);
    }
    if (tipos.has('BreadcrumbList')) {
      lista(n.itemListElement).forEach((it, i) => {
        if (it.position !== i + 1 || !it.name || !/^https?:\/\//.test(it.item ?? ''))
          p('google-trilha', `item ${i + 1} da trilha incompleto`);
      });
    }
    if (tipos.has('Person') && !n.name) p('jsonld-pessoa', 'Person sem name');
    if (tipos.has('Service') && !n.name) p('jsonld-servico', 'Service sem name');
  }
  return problemas;
}

const normal = (s) =>
  String(s ?? '')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Audita uma página. `ctx`: { caminho, base, robotsEsperado, nap, existe(url) }.
 * Devolve { problemas, nap (lido do rodapé), negocio (nó do JSON-LD), canonical }.
 */
export function auditarPaginaSeo(html, ctx) {
  const problemas = [];
  const p = (regra, detalhe) => problemas.push({ regra, detalhe });
  const raiz = parse(html, { blockTextElements: { script: true, style: false } });
  const meta = (sel) => raiz.querySelector(sel)?.getAttribute('content') ?? null;

  if (raiz.querySelector('html')?.getAttribute('lang') !== 'pt-BR')
    p('lang', '<html lang> precisa ser pt-BR');
  const titulo = normal(raiz.querySelector('title')?.text);
  if (titulo.length < 10 || titulo.length > 60)
    p('title', `title com ${titulo.length} caracteres: "${titulo}"`);
  const descricao = meta('meta[name="description"]') ?? '';
  if (descricao.length < 50 || descricao.length > 160)
    p('description', `description com ${descricao.length} caracteres`);
  const robots = meta('meta[name="robots"]');
  if (robots !== ctx.robotsEsperado)
    p('robots', `robots "${robots}", esperado "${ctx.robotsEsperado}"`);

  const esperado = ctx.base + (ctx.caminho === '/' ? '/' : ctx.caminho);
  const canonical = raiz.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null;
  if (canonical !== esperado) p('canonical', `canonical "${canonical}", esperado "${esperado}"`);
  const og = (k) => meta(`meta[property="og:${k}"]`);
  if (og('url') !== esperado) p('og', `og:url "${og('url')}"`);
  if (og('title') !== titulo) p('og', 'og:title diferente do title');
  if (og('description') !== descricao) p('og', 'og:description diferente da description');
  if (og('locale') !== 'pt_BR') p('og', 'og:locale precisa ser pt_BR');
  if (og('image:width') !== '1200' || og('image:height') !== '630')
    p('og', 'og:image precisa ser 1200×630');
  const img = og('image') ?? '';
  if (!img.startsWith(`${ctx.base}/`)) p('og', `og:image não é absoluta no domínio: "${img}"`);
  else if (ctx.existe && !ctx.existe(img.slice(ctx.base.length)))
    p('og', `og:image não existe no dist: ${img}`);
  if (!og('image:alt')) p('og', 'og:image sem alt');
  if (meta('meta[name="twitter:card"]') !== 'summary_large_image') p('og', 'twitter:card');

  // JSON-LD: um bloco, válido.
  const blocos = raiz.querySelectorAll('script[type="application/ld+json"]');
  let negocio = null;
  let grafo = [];
  if (blocos.length !== 1) p('jsonld', `${blocos.length} blocos JSON-LD (esperado 1)`);
  for (const b of blocos) {
    let dado;
    try {
      dado = JSON.parse(b.text);
    } catch (e) {
      p('jsonld', `JSON inválido: ${e.message}`);
      continue;
    }
    for (const x of validarJsonLd(dado)) problemas.push(x);
    grafo = dado['@graph'] ?? [dado];
    negocio =
      grafo.find((n) => lista(n['@type']).some((t) => ancestrais(t).has('LocalBusiness'))) ?? null;
  }
  if (!negocio) p('jsonld', 'sem o nó do negócio');
  const trilha = grafo.find((n) => n['@type'] === 'BreadcrumbList');
  if (ctx.caminho !== '/') {
    const ultimo = trilha?.itemListElement?.at(-1)?.item;
    if (ultimo !== esperado)
      p('trilha', `BreadcrumbList termina em "${ultimo}", esperado "${esperado}"`);
  }
  // FAQ: cada pergunta marcada está visível na página.
  const visivel = normal(
    parse(html, { blockTextElements: { script: false, style: false } }).querySelector('body')?.text,
  );
  for (const f of grafo.filter((n) => n['@type'] === 'FAQPage'))
    for (const q of lista(f.mainEntity))
      if (!visivel.includes(normal(q.name)))
        p('faq-visivel', `pergunta marcada e não visível: "${q.name}"`);

  // Parágrafo-resposta no topo: dentro da primeira seção do <main>.
  const primeira = raiz.querySelector('main section');
  if (ctx.exigirResposta !== false && !primeira?.querySelector('[data-resposta]'))
    p('resposta', 'sem parágrafo-resposta ([data-resposta]) na primeira seção');

  // NAP visível (rodapé).
  const nap = {
    nome: normal(raiz.querySelector('[data-nap="nome"]')?.text),
    endereco: normal(raiz.querySelector('[data-nap="endereco"]')?.text),
    telefone: normal(raiz.querySelector('[data-nap="telefone"]')?.text),
  };
  for (const k of ['nome', 'endereco', 'telefone'])
    if (nap[k] !== ctx.nap[k]) p('nap', `${k} no rodapé "${nap[k]}" ≠ config "${ctx.nap[k]}"`);
  if (negocio) {
    const digitos = (s) => String(s ?? '').replace(/\D/g, '');
    if (negocio.name !== ctx.nap.nome)
      p('nap', `JSON-LD name "${negocio.name}" ≠ "${ctx.nap.nome}"`);
    if (digitos(negocio.telephone) !== `55${digitos(ctx.nap.telefone)}`)
      p('nap', `JSON-LD telephone "${negocio.telephone}" ≠ "${ctx.nap.telefone}"`);
    const a = negocio.address ?? {};
    const linha = `${a.streetAddress}, ${ctx.nap.bairro}, ${a.addressLocality}/${a.addressRegion}, CEP ${a.postalCode}`;
    if (linha !== ctx.nap.endereco) p('nap', `JSON-LD address "${linha}" ≠ "${ctx.nap.endereco}"`);
  }
  return { problemas, nap, negocio, canonical };
}

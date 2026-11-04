#!/usr/bin/env node
// audit-seo: confere o dist/ para Google e IAs. Falha (exit 1) se qualquer regra quebrar.
//   · por página: lang pt-BR, title/description, robots, canonical, Open Graph 1200×630,
//     JSON-LD válido no schema.org (tipos, propriedades, domínios) e nas regras do Google,
//     sem Physician/MedicalClinic, sem AggregateRating/Review, FAQ marcada = FAQ visível,
//     parágrafo-resposta no topo e trilha (BreadcrumbList) até a própria página;
//   · NAP: nome, endereço e telefone idênticos em todas as páginas (rodapé e JSON-LD) e no
//     llms.txt, iguais à config;
//   · robots.txt, sitemap.xml e llms.txt coerentes com seo.indexar e com o dist.
// Rode depois do build, com o mesmo SITE_URL e GIYMA_MODO do build.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import sharp from 'sharp';
import { contato, indexavel, nap, seo } from '../src/config/index.ts';
import { RAIZ } from './lib/manifesto.mjs';
import { auditarPaginaSeo, VERSAO_SCHEMA } from './lib/seo.mjs';

const dist = join(RAIZ, 'dist');
if (!existsSync(join(dist, 'index.html'))) {
  console.error('✗ dist/ não existe: rode pnpm build antes.');
  process.exit(1);
}
const base = seo.siteUrl;
const robotsEsperado = indexavel() ? 'index, follow' : 'noindex, nofollow';
const napConfig = { ...nap(), bairro: contato.endereco.valor.bairro };
const existe = (url) => {
  const limpo = decodeURIComponent(url.split(/[?#]/)[0]).replace(/\/$/, '') || '/';
  return [limpo, `${limpo}.html`, limpo === '/' ? '/index.html' : null]
    .filter(Boolean)
    .some((c) => existsSync(join(dist, c)) && statSync(join(dist, c)).isFile());
};

const htmls = [];
const andar = (d) => {
  for (const n of readdirSync(d)) {
    const c = join(d, n);
    if (statSync(c).isDirectory()) andar(c);
    else if (n.endsWith('.html')) htmls.push(c);
  }
};
andar(dist);
const caminhoDe = (arq) => {
  const r = `/${relative(dist, arq)}`.replace(/\.html$/, '');
  return r === '/index' ? '/' : r;
};
// Internas (/_estilo, /_hero-*) e 404: nunca indexam, ficam fora do SEO. Redirecionamentos
// (ex.: /dra-ester-santos em produção enquanto a pós for bloqueante) também ficam fora.
const ehRedirecionamento = (a) => /http-equiv="refresh"/.test(readFileSync(a, 'utf8'));
const redirecionamentos = htmls.filter(ehRedirecionamento);
const publicas = htmls.filter(
  (a) => !/^\/(_|404$)/.test(caminhoDe(a)) && !redirecionamentos.includes(a),
);

// Páginas que vão para o ar (sitemap): só nelas o parágrafo-resposta é obrigatório; as que
// existem só no preview (tratamento pendente) mostram o aviso de "em preparação".
const sitemapPrevio = existsSync(join(dist, 'sitemap.xml'))
  ? readFileSync(join(dist, 'sitemap.xml'), 'utf8')
  : '';
const noAr = (caminho) =>
  sitemapPrevio.includes(`<loc>${base}${caminho === '/' ? '/' : caminho}</loc>`) ||
  caminho === '/dra-ester-santos';

const erros = [];
const erro = (onde, regra, detalhe) => erros.push(`✗ ${onde} · ${regra} · ${detalhe}`);
const titulos = new Map();
const descricoes = new Map();
const canonicos = new Set();
const naps = new Set();

for (const arq of publicas) {
  const caminho = caminhoDe(arq);
  const html = readFileSync(arq, 'utf8');
  const r = auditarPaginaSeo(html, {
    caminho,
    base,
    robotsEsperado,
    nap: napConfig,
    existe,
    exigirResposta: noAr(caminho),
  });
  for (const x of r.problemas) erro(caminho, x.regra, x.detalhe);
  naps.add(JSON.stringify(r.nap));
  if (r.canonical) canonicos.add(r.canonical);
  const t = html.match(/<title>(.*?)<\/title>/s)?.[1] ?? '';
  const d = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';
  if (titulos.has(t)) erro(caminho, 'title-repetido', `igual ao de ${titulos.get(t)}`);
  else titulos.set(t, caminho);
  if (descricoes.has(d)) erro(caminho, 'description-repetida', `igual à de ${descricoes.get(d)}`);
  else descricoes.set(d, caminho);
}
if (naps.size > 1) erro('site', 'nap', `${naps.size} versões diferentes do NAP entre as páginas`);

// Redirecionamento: noindex e fora do sitemap.
for (const arq of redirecionamentos) {
  const html = readFileSync(arq, 'utf8');
  if (!/<meta name="robots" content="noindex/.test(html))
    erro(caminhoDe(arq), 'robots', 'redirecionamento sem noindex');
}
// Interna e 404: noindex sempre.
for (const arq of htmls.filter((a) => !publicas.includes(a) && !redirecionamentos.includes(a))) {
  const r = readFileSync(arq, 'utf8').match(/<meta name="robots" content="([^"]*)"/)?.[1];
  if (r !== 'noindex, nofollow') erro(caminhoDe(arq), 'robots', `página interna com robots "${r}"`);
}

// Imagem OG: 1200×630 de verdade.
const og = join(dist, seo.imagemOg.caminho);
if (!existsSync(og)) erro('og', 'imagem', `${seo.imagemOg.caminho} não existe no dist`);
else {
  const m = await sharp(og).metadata();
  if (m.width !== 1200 || m.height !== 630) erro('og', 'imagem', `${m.width}×${m.height}`);
}

// robots.txt e sitemap.xml.
const robotsTxt = existsSync(join(dist, 'robots.txt'))
  ? readFileSync(join(dist, 'robots.txt'), 'utf8')
  : '';
if (!robotsTxt) erro('robots.txt', 'existe', 'não gerado');
else if (indexavel()) {
  if (!robotsTxt.includes(`Sitemap: ${base}/sitemap.xml`))
    erro('robots.txt', 'sitemap', 'sem a linha Sitemap');
  if (/Disallow:\s*\/\s*$/m.test(robotsTxt))
    erro('robots.txt', 'bloqueio', 'indexar=true mas Disallow: /');
} else if (!/Disallow:\s*\/\s*$/m.test(robotsTxt))
  erro('robots.txt', 'bloqueio', 'indexar=false precisa de Disallow: /');

const sitemap = existsSync(join(dist, 'sitemap.xml'))
  ? readFileSync(join(dist, 'sitemap.xml'), 'utf8')
  : '';
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (!locs.length) erro('sitemap.xml', 'vazio', 'sem URLs');
for (const arq of redirecionamentos)
  if (locs.includes(base + caminhoDe(arq))) erro('sitemap.xml', 'redirecionamento', caminhoDe(arq));
for (const u of locs) {
  if (!u.startsWith(base)) erro('sitemap.xml', 'dominio', u);
  else if (!existe(u.slice(base.length) || '/')) erro('sitemap.xml', 'inexistente', u);
  else if (!canonicos.has(u))
    erro('sitemap.xml', 'canonical', `${u} não é canonical de nenhuma página`);
}
// Em produção, toda página pública está no sitemap (em preview há páginas só de preview).
if (process.env.GIYMA_MODO === 'producao')
  for (const c of canonicos) if (!locs.includes(c)) erro('sitemap.xml', 'faltando', c);

// llms.txt.
const llms = existsSync(join(dist, 'llms.txt')) ? readFileSync(join(dist, 'llms.txt'), 'utf8') : '';
if (!llms.startsWith('# ')) erro('llms.txt', 'formato', 'precisa começar com "# " (H1)');
if (!/^> .+/m.test(llms)) erro('llms.txt', 'formato', 'sem o resumo em blockquote');
for (const k of ['nome', 'endereco', 'telefone'])
  if (!llms.includes(napConfig[k])) erro('llms.txt', 'nap', `não traz ${k} "${napConfig[k]}"`);
if (!llms.includes('CRF-SC 3984') || !/farmacêutica esteta/.test(llms))
  erro('llms.txt', 'registro', 'sem profissão e CRF');
for (const m of llms.matchAll(/\]\((https?:\/\/[^)]+)\)/g))
  if (m[1].startsWith(base) && !existe(m[1].slice(base.length) || '/'))
    erro('llms.txt', 'link', m[1]);

for (const e of erros) console.log(e);
console.log(
  `audit-seo · ${indexavel() ? 'indexando' : 'noindex'} · schema.org ${VERSAO_SCHEMA} · ${publicas.length} páginas públicas · ${locs.length} no sitemap · ${erros.length} problema(s)`,
);
process.exit(erros.length ? 1 : 0);

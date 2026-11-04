#!/usr/bin/env node
// Audita o HTML do dist/: termos vetados, CRF ao lado do nome, mídia naoUsar,
// antes e depois sem consentimento, originais e (em produção) marcas de preview.
// Falha em qualquer modo: são erros de código/conteúdo, não dados pendentes.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { carregarManifesto, RAIZ } from './lib/manifesto.mjs';
import { auditarHtml } from './lib/travas.mjs';

const producao = process.argv.includes('--producao') || process.env.GIYMA_MODO === 'producao';
const dist = join(RAIZ, 'dist');
if (!existsSync(dist)) {
  console.error('✗ dist/ não existe: rode pnpm build antes.');
  process.exit(1);
}
const manifesto = carregarManifesto();
const existe = (url, tipo) => {
  const limpo = decodeURIComponent(url.split(/[?#]/)[0]);
  if (tipo !== 'pagina') return existsSync(join(dist, limpo));
  const base = limpo.replace(/\/$/, '');
  return [`${base}.html`, `${base}/index.html`, limpo === '/' ? '/index.html' : null]
    .filter(Boolean)
    .some((c) => existsSync(join(dist, c)));
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

let total = 0;
for (const arquivo of htmls) {
  const problemas = auditarHtml(readFileSync(arquivo, 'utf8'), {
    manifesto,
    modo: producao ? 'producao' : 'preview',
    existe,
  });
  for (const p of problemas)
    console.log(`✗ ${relative(dist, arquivo)} · ${p.regra} · ${p.detalhe}`);
  total += problemas.length;
}
console.log(
  `audit-compliance · modo ${producao ? 'PRODUÇÃO' : 'preview'} · ${htmls.length} páginas · ${total} problema(s)`,
);
process.exit(total ? 1 : 0);

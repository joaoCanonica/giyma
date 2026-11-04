#!/usr/bin/env node
// Lighthouse mobile (padrão do Lighthouse: Moto G Power, 4G lento simulado, CPU 4×) em todas as
// rotas públicas do dist/. Metas (CLAUDE.md §4): Performance, Boas práticas ≥ 95;
// Acessibilidade = 100; SEO ≥ 95 só quando o build indexa (com noindex o SEO cai por definição).
// Também mede o peso por página (JS ≤ 35 KB gzip; CSS; fontes) e salva um resumo em
// docs/qa/lighthouse.json. Uso: pnpm build && pnpm audit-lighthouse [-- /rota ...]
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { chromium } from 'playwright';
import { indexavel } from '../src/config/index.ts';
import { DIST, rotas, servir } from './lib/servidor.mjs';

const pedidas = process.argv.slice(2).filter((a) => a.startsWith('/'));
const lista = pedidas.length ? pedidas : rotas();
const { origem, fechar } = await servir();
const tmp = join('node_modules', '.cache', 'lighthouse');
mkdirSync(tmp, { recursive: true });
const chrome = chromium.executablePath();
const META = { performance: 95, accessibility: 100, 'best-practices': 95, seo: 95 };

const gz = (arq) => gzipSync(readFileSync(join(DIST, arq)), { level: 9 }).length;
function pesos(rota) {
  const html = readFileSync(join(DIST, `${rota === '/' ? 'index' : rota}.html`), 'utf8');
  const js = new Set([...html.matchAll(/src="(\/_astro\/[^"]+\.js)"/g)].map((m) => m[1]));
  const visto = new Set();
  let bytesJs = 0;
  const somar = (f) => {
    if (visto.has(f)) return;
    visto.add(f);
    bytesJs += gz(f);
    for (const m of readFileSync(join(DIST, f), 'utf8').matchAll(
      /(?:from|import)\s*"\.\/([^"]+\.js)"/g,
    ))
      somar(`/_astro/${m[1]}`);
  };
  js.forEach(somar);
  const inline = [
    ...html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*ld\+json)[^>]*>([\s\S]*?)<\/script>/g),
  ]
    .map((m) => gzipSync(m[1], { level: 9 }).length)
    .reduce((a, b) => a + b, 0);
  const css = [...new Set([...html.matchAll(/href="(\/_astro\/[^"]+\.css)"/g)].map((m) => m[1]))]
    .map(gz)
    .reduce((a, b) => a + b, 0);
  const cssInline = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)]
    .map((m) => gzipSync(m[1], { level: 9 }).length)
    .reduce((a, b) => a + b, 0);
  return { jsGzip: bytesJs + inline, cssGzip: css + cssInline, htmlGzip: gzipSync(html).length };
}

const resultado = [];
let falhas = 0;
for (const rota of lista) {
  const saida = join(tmp, 'lh.json');
  // O Lighthouse às vezes volta sem métricas (erro de runtime): até 3 tentativas.
  let r = null;
  for (let tentativa = 0; tentativa < 3 && !r; tentativa++) {
    rmSync(saida, { force: true });
    try {
      await promisify(execFile)(
        'node_modules/.bin/lighthouse',
        [
          `${origem}${rota}`,
          '--quiet',
          `--chrome-flags=--headless=new --no-sandbox`,
          '--only-categories=performance,accessibility,best-practices,seo',
          '--output=json',
          `--output-path=${saida}`,
        ],
        { env: { ...process.env, CHROME_PATH: chrome }, timeout: 180000 },
      );
    } catch {
      /* o Lighthouse às vezes sai com código ≠ 0 mesmo gerando o relatório */
    }
    try {
      const j = JSON.parse(readFileSync(saida, 'utf8'));
      if (
        j.audits['largest-contentful-paint']?.numericValue !== undefined &&
        j.audits['cumulative-layout-shift']?.numericValue !== undefined &&
        Object.values(j.categories).every((c) => c.score !== null)
      )
        r = j;
    } catch {
      /* relatório ausente: tenta de novo */
    }
  }
  if (!r) {
    console.log(`✗ ${rota} · o Lighthouse não gerou métricas em 3 tentativas`);
    falhas++;
    continue;
  }
  const n = Object.fromEntries(
    Object.entries(r.categories).map(([k, v]) => [k, Math.round(v.score * 100)]),
  );
  const a = r.audits;
  const linha = {
    rota,
    ...n,
    lcp: Math.round(a['largest-contentful-paint'].numericValue),
    cls: Number(a['cumulative-layout-shift'].numericValue.toFixed(3)),
    tbt: Math.round(a['total-blocking-time'].numericValue),
    fcp: Math.round(a['first-contentful-paint'].numericValue),
    bytes: a['total-byte-weight'].numericValue,
    ...pesos(rota),
  };
  const ruins = Object.entries(META).filter(
    ([k, meta]) => (k !== 'seo' || indexavel()) && (n[k] ?? 0) < meta,
  );
  if (linha.jsGzip > 35 * 1024) ruins.push(['js', '35 KB']);
  if (linha.lcp >= 2000) ruins.push(['lcp', '2,0 s']);
  if (ruins.length) falhas++;
  const falhos = Object.values(r.categories)
    .flatMap((c) => c.auditRefs)
    .map((x) => a[x.id])
    .filter(
      (x) =>
        x &&
        x.score !== null &&
        x.score < 0.9 &&
        x.scoreDisplayMode !== 'informative' &&
        x.scoreDisplayMode !== 'notApplicable' &&
        x.scoreDisplayMode !== 'manual',
    )
    .map((x) => x.id);
  resultado.push({ ...linha, abaixo: ruins.map((x) => x[0]), avisos: [...new Set(falhos)] });
  console.log(
    `${ruins.length ? '✗' : '✓'} ${rota.padEnd(42)} P${n.performance} A${n.accessibility} BP${n['best-practices']} SEO${n.seo} · LCP ${(linha.lcp / 1000).toFixed(2)} s · CLS ${linha.cls} · TBT ${linha.tbt} ms · JS ${(linha.jsGzip / 1024).toFixed(1)} KB · CSS ${(linha.cssGzip / 1024).toFixed(1)} KB${ruins.length ? ` · abaixo: ${ruins.map((x) => x[0]).join(', ')}` : ''}`,
  );
}
await fechar();
mkdirSync('docs/qa', { recursive: true });
writeFileSync(
  'docs/qa/lighthouse.json',
  `${JSON.stringify({ data: new Date().toISOString(), indexavel: indexavel(), rotas: resultado }, null, 2)}\n`,
);
console.log(
  `\naudit-lighthouse · ${lista.length} rotas · ${falhas} abaixo da meta${indexavel() ? '' : ' · SEO não avaliado (build com noindex)'}`,
);
process.exit(falhas ? 1 : 0);

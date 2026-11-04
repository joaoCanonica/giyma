#!/usr/bin/env node
/* global document, window, addEventListener */
// CSP do dist/: toda página tem o <meta> de CSP, sem 'unsafe-inline' em script-src, e nenhuma
// violação acontece ao abrir, rolar e interagir (entrada, abas, assistente, aviso de privacidade,
// mapa). Uso: pnpm build && pnpm audit-csp
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';
import { DIST, rotas, servir } from './lib/servidor.mjs';

const { origem, fechar } = await servir();
const navegador = await chromium.launch();
const erros = [];
const lista = [...rotas(), '/404'];
for (const rota of lista) {
  const html = readFileSync(join(DIST, `${rota === '/' ? 'index' : rota}.html`), 'utf8');
  const meta = html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)"/)?.[1];
  if (!meta) erros.push(`✗ ${rota} · sem <meta> de CSP`);
  else if (/script-src[^;]*'unsafe-inline'/.test(meta))
    erros.push(`✗ ${rota} · script-src com 'unsafe-inline'`);
}
for (const entrada of [true, false]) {
  const ctx = await navegador.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.route(/^https?:\/\/(?!127\.0\.0\.1)/, (r) => r.abort());
  await ctx.addInitScript((pular) => {
    window.__csp = [];
    addEventListener('securitypolicyviolation', (e) =>
      window.__csp.push(
        `${e.violatedDirective} ${e.blockedURI || ''} ${(e.sample || '').slice(0, 60)}`,
      ),
    );
    if (pular)
      try {
        sessionStorage.setItem('giyma-entrada', '1');
      } catch {
        /* sem armazenamento */
      }
  }, !entrada);
  const page = await ctx.newPage();
  for (const rota of entrada ? ['/'] : lista) {
    await page.goto(`${origem}${rota}`, { waitUntil: 'networkidle' });
    if (entrada) await page.waitForTimeout(3500);
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((ok) => setTimeout(ok, 40));
      }
    });
    for (const sel of [
      '[role="tab"]:not([aria-selected="true"])',
      'details.assist summary',
      '[data-abrir-consentimento]',
      '[data-mostrar-mapa]',
      '[data-escolha="aceito"]',
    ]) {
      const el = page.locator(sel).first();
      if ((await el.count()) && (await el.isVisible())) await el.click().catch(() => {});
    }
    await page.waitForTimeout(300);
    const v = await page.evaluate(() => window.__csp);
    for (const x of v) erros.push(`✗ ${rota}${entrada ? ' (com entrada)' : ''} · violação: ${x}`);
  }
  await ctx.close();
}
await navegador.close();
await fechar();
for (const e of erros) console.log(e);
console.log(`audit-csp · ${lista.length} rotas · ${erros.length} problema(s)`);
process.exit(erros.length ? 1 : 0);

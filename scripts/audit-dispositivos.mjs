#!/usr/bin/env node
/* global document, window */
// Fumaça por dispositivo emulado no Chromium (iPhone 13/Safari iOS e Pixel 7/Android, 390–412 px):
// toda rota abre sem erro de JavaScript, sem rolagem horizontal, com o CTA de WhatsApp e com
// imagens carregadas. Atenção: é emulação de tela e user agent no motor do Chrome, não WebKit
// nem Gecko de verdade (ver docs/QA.md). Uso: pnpm build && node scripts/audit-dispositivos.mjs
import { chromium, devices } from 'playwright';
import { rotas, servir } from './lib/servidor.mjs';

const { origem, fechar } = await servir();
const navegador = await chromium.launch();
const erros = [];
for (const nome of ['iPhone 13', 'Pixel 7']) {
  const ctx = await navegador.newContext({ ...devices[nome] });
  const page = await ctx.newPage();
  const jsErros = [];
  page.on('pageerror', (e) => jsErros.push(e.message));
  for (const rota of rotas()) {
    jsErros.length = 0;
    await page.goto(`${origem}${rota}`, { waitUntil: 'networkidle' });
    // Pula a entrada como a visitante faria (toque).
    if (await page.locator('.entrada-pular').count())
      await page
        .locator('.entrada-pular')
        .tap()
        .catch(() => {});
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 700) {
        window.scrollTo(0, y);
        await new Promise((ok) => setTimeout(ok, 40));
      }
    });
    const r = await page.evaluate(() => ({
      sobra: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      wa: document.querySelectorAll('a[href^="https://wa.me/5549998273904?text="]').length,
      quebradas: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).length,
    }));
    if (r.sobra > 1) erros.push(`✗ ${nome} ${rota} · rolagem horizontal ${r.sobra} px`);
    if (!r.wa) erros.push(`✗ ${nome} ${rota} · sem link de WhatsApp`);
    if (r.quebradas) erros.push(`✗ ${nome} ${rota} · ${r.quebradas} imagem(ns) quebrada(s)`);
    for (const e of jsErros) erros.push(`✗ ${nome} ${rota} · erro de JS: ${e}`);
  }
  await ctx.close();
}
await navegador.close();
await fechar();
for (const e of erros) console.log(e);
console.log(
  `audit-dispositivos · iPhone 13 + Pixel 7 · ${rotas().length} rotas · ${erros.length} problema(s)`,
);
process.exit(erros.length ? 1 : 0);

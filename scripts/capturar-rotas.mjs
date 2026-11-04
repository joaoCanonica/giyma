// Capturas de página inteira de todas as rotas do dist/ (390 claro, 1440 claro, 390 escuro;
// movimento reduzido, sem a entrada). Uso: node scripts/capturar-rotas.mjs <pasta-de-saída>
/* global document, window */
import { chromium } from 'playwright';
import { rotas, servir } from './lib/servidor.mjs';
const out = process.argv[2];
const { origem, fechar } = await servir();
const b = await chromium.launch();
for (const [w, esq] of [
  [390, 'light'],
  [1440, 'light'],
  [390, 'dark'],
]) {
  const ctx = await b.newContext({
    viewport: { width: w, height: w > 500 ? 900 : 844 },
    colorScheme: esq,
    reducedMotion: 'reduce',
  });
  await ctx.addInitScript(() => sessionStorage.setItem('giyma-entrada', '1'));
  const p = await ctx.newPage();
  for (const r of rotas()) {
    await p.goto(origem + r, { waitUntil: 'networkidle' });
    // Rola a página toda (imagens lazy e revelações carregam), depois volta ao topo.
    await p.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 500) {
        window.scrollTo(0, y);
        await new Promise((ok) => setTimeout(ok, 60));
      }
      window.scrollTo(0, 0);
    });
    await p.waitForLoadState('networkidle');
    await p.waitForTimeout(300);
    await p.screenshot({
      path: `${out}/${r === '/' ? 'inicio' : r.slice(1).replace(/\//g, '_')}-${w}-${esq}.png`,
      fullPage: true,
    });
  }
  await ctx.close();
}
await b.close();
await fechar();

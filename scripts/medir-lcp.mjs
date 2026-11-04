#!/usr/bin/env node
// LCP da home com e sem a entrada animada, em celular simulado (412×823, 4G lento: 150 ms de
// latência, 1,6 Mbps; CPU 4×), mediana de 5 carregamentos frios. "Com entrada" é a primeira
// visita da sessão; "sem entrada" é a volta à home na mesma sessão (a abertura não se repete).
// Uso: pnpm build && node scripts/medir-lcp.mjs [/rota]
import { chromium } from 'playwright';
import { servir } from './lib/servidor.mjs';

const rota = process.argv[2] ?? '/';
const { origem, fechar } = await servir();
const navegador = await chromium.launch();
async function medir(semEntrada) {
  const ctx = await navegador.newContext({
    viewport: { width: 412, height: 823 },
    deviceScaleFactor: 1.75,
    isMobile: true,
    hasTouch: true,
  });
  if (semEntrada) await ctx.addInitScript(() => sessionStorage.setItem('giyma-entrada', '1'));
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 150,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
  });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.goto(`${origem}${rota}`, { waitUntil: 'load' });
  await page.waitForTimeout(4500);
  const r = await page.evaluate(
    () =>
      new Promise((ok) => {
        new PerformanceObserver((l) => {
          const e = l.getEntries().at(-1);
          ok({ lcp: Math.round(e.startTime), el: e.element?.tagName ?? e.url ?? '?' });
        }).observe({ type: 'largest-contentful-paint', buffered: true });
      }),
  );
  await ctx.close();
  return r;
}
const mediana = (l) => [...l].sort((a, b) => a - b)[Math.floor(l.length / 2)];
for (const [nome, sem] of [
  ['com entrada', false],
  ['sem entrada', true],
]) {
  const runs = [];
  for (let i = 0; i < 5; i++) runs.push(await medir(sem));
  console.log(
    `${rota} ${nome}: LCP mediana ${(mediana(runs.map((x) => x.lcp)) / 1000).toFixed(2)} s (${runs.map((x) => x.lcp).join(', ')} ms) · elemento: ${[...new Set(runs.map((x) => x.el))].join('/')}`,
  );
}
await navegador.close();
await fechar();

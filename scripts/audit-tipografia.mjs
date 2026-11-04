#!/usr/bin/env node
/* global document, getComputedStyle, NodeFilter */
// Tipografia visível (390 e 1440 px): título com a última linha de uma palavra só (viúva/órfã)
// e texto cortado (overflow escondido). Relatório, não trava: alguns casos são inevitáveis
// (palavra longa sozinha) e ficam anotados em docs/QA.md. Uso: pnpm build && node scripts/audit-tipografia.mjs
import { chromium } from 'playwright';
import { rotas, servir } from './lib/servidor.mjs';
const { origem, fechar } = await servir();
const b = await chromium.launch();
for (const w of [390, 1440]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' });
  await ctx.addInitScript(() => sessionStorage.setItem('giyma-entrada', '1'));
  const p = await ctx.newPage();
  for (const r of rotas()) {
    await p.goto(origem + r, { waitUntil: 'networkidle' });
    const res = await p.evaluate(() => {
      const out = [];
      const els = document.querySelectorAll(
        'h1, h2, h3, .t-display, .manifesto-frase, summary, .citacao p, .ht-apoio, .pg-abertura, .tr-resposta',
      );
      for (const el of els) {
        if (!el.offsetParent && getComputedStyle(el).position !== 'fixed') continue;
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        const palavras = [];
        let n;
        while ((n = walker.nextNode())) {
          const re = /\S+/g;
          let m;
          while ((m = re.exec(n.data))) {
            const rg = document.createRange();
            rg.setStart(n, m.index);
            rg.setEnd(n, m.index + m[0].length);
            const rc = rg.getClientRects()[0];
            if (rc) palavras.push({ w: m[0], top: Math.round(rc.top) });
          }
        }
        if (palavras.length < 3) continue;
        const linhas = [];
        for (const p of palavras) {
          const l = linhas.find((x) => Math.abs(x.top - p.top) < 4);
          if (l) l.ws.push(p.w);
          else linhas.push({ top: p.top, ws: [p.w] });
        }
        const ult = linhas[linhas.length - 1];
        if (linhas.length > 1 && ult.ws.length === 1)
          out.push(
            `${el.tagName.toLowerCase()}${el.className ? '.' + String(el.className).split(' ')[0] : ''}: "…${ult.ws[0]}" ← ${palavras
              .map((p) => p.w)
              .join(' ')
              .slice(0, 70)}`,
          );
      }
      // texto cortado
      for (const el of document.querySelectorAll('body *')) {
        const cs = getComputedStyle(el);
        if (
          (cs.overflow === 'hidden' || cs.textOverflow === 'ellipsis') &&
          el.scrollWidth > el.clientWidth + 2 &&
          el.textContent.trim() &&
          !el.closest('.so-leitor') &&
          el.clientWidth > 1 &&
          cs.clipPath === 'none' &&
          !el.matches('.so-leitor')
        )
          out.push(`CORTE ${el.tagName}.${el.className}`);
      }
      return out;
    });
    for (const x of res) console.log(w, r, x);
  }
  await ctx.close();
}
await b.close();
await fechar();

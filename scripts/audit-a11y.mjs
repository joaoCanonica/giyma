#!/usr/bin/env node
/* global document, getComputedStyle, window, matchMedia -- trechos rodam no navegador */
// Acessibilidade do dist/ (Playwright + axe-core). Falha (exit 1) em qualquer problema.
//   1. axe (WCAG 2.0/2.1/2.2 A e AA) em todas as rotas: 390 px claro e escuro, 1440 px claro;
//   2. reflow a 320 px e zoom de 200% (1280 → 640 px): sem rolagem horizontal;
//   3. teclado do início ao fim: entrada → pular a abertura → "Pular para o conteúdo" →
//      Linha do tempo (setas) → WhatsApp; comparador (setas) na página de estilo; foco visível;
//   4. movimento reduzido: nada animando sem fim, vídeos em loop parados;
//   5. vídeo em loop tem botão de pausa que funciona (WCAG 2.2.2).
// Uso: pnpm build && pnpm audit-a11y
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { chromium } from 'playwright';
import { rotas, servir } from './lib/servidor.mjs';

const AXE = readFileSync(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];
const { origem, fechar } = await servir();
const navegador = await chromium.launch();
const lista = [...rotas(), '/404'];
const erros = [];
const erro = (onde, regra, detalhe) => erros.push(`✗ ${onde} · ${regra} · ${detalhe}`);
let checagens = 0;

async function pagina(opcoes = {}, { entrada = false } = {}) {
  // bypassCSP: só para injetar o axe (o CSP real é conferido no audit-csp).
  const ctx = await navegador.newContext({ reducedMotion: 'reduce', bypassCSP: true, ...opcoes });
  if (!entrada)
    await ctx.addInitScript(() => {
      try {
        sessionStorage.setItem('giyma-entrada', '1');
      } catch {
        /* sem armazenamento */
      }
    });
  return { ctx, page: await ctx.newPage() };
}

// 1 e 2. axe + reflow + zoom.
const CENARIOS = [
  { nome: '390 claro', viewport: { width: 390, height: 844 }, colorScheme: 'light' },
  { nome: '390 escuro', viewport: { width: 390, height: 844 }, colorScheme: 'dark' },
  { nome: '1440 claro', viewport: { width: 1440, height: 900 }, colorScheme: 'light' },
];
const axePorRota = {};
for (const c of CENARIOS) {
  const { ctx, page } = await pagina({ viewport: c.viewport, colorScheme: c.colorScheme });
  for (const rota of lista) {
    await page.goto(`${origem}${rota}`, { waitUntil: 'networkidle' });
    await page.addScriptTag({ content: AXE });
    const r = await page.evaluate(
      (tags) => window.axe.run(document, { runOnly: { type: 'tag', values: tags } }),
      TAGS,
    );
    checagens++;
    axePorRota[rota] = (axePorRota[rota] ?? 0) + r.passes.length;
    for (const v of r.violations)
      erro(
        `${rota} (${c.nome})`,
        `axe ${v.id}`,
        `${v.nodes.length}× ${v.nodes[0]?.target?.join(' ')} · ${v.help}`,
      );
  }
  await ctx.close();
}
for (const [nome, largura] of [
  ['reflow 320 px', 320],
  ['zoom 200% (640 px)', 640],
]) {
  const { ctx, page } = await pagina({ viewport: { width: largura, height: 720 } });
  for (const rota of lista) {
    await page.goto(`${origem}${rota}`, { waitUntil: 'networkidle' });
    const sobra = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    checagens++;
    if (sobra > 1) erro(rota, nome, `rolagem horizontal de ${sobra} px`);
  }
  await ctx.close();
}

// 3. Teclado do início ao fim (com a entrada, sem movimento reduzido).
{
  const { ctx, page } = await pagina(
    { viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' },
    { entrada: true },
  );
  await page.goto(`${origem}/`);
  const temEntrada = await page.locator('.entrada-pular').count();
  if (!temEntrada) erro('/', 'teclado', 'a entrada não apareceu (sessão nova)');
  // Tab na entrada: o botão "Pular" recebe o foco; Enter encerra a abertura.
  await page.keyboard.press('Tab');
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => !document.documentElement.hasAttribute('data-entrada'), null, {
    timeout: 5000,
  });
  const focos = [];
  const focoVisivel = [];
  for (let i = 0; i < 70; i++) {
    await page.keyboard.press('Tab');
    const f = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const cs = getComputedStyle(el);
      const visivel = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2;
      return {
        tag: el.tagName,
        texto: (el.getAttribute('aria-label') || el.textContent || '')
          .trim()
          .replace(/\s+/g, ' ')
          .slice(0, 40),
        href: el.getAttribute('href') ?? '',
        role: el.getAttribute('role') ?? '',
        visivel,
      };
    });
    if (f) {
      focos.push(f);
      if (!f.visivel) focoVisivel.push(f.texto || f.tag);
    }
  }
  checagens++;
  // Pular a abertura pelo teclado entrega o foco ao CTA do hero (sessão 4): o Tab seguinte
  // já está no conteúdo. Em página sem entrada, o primeiro Tab é "Pular para o conteúdo".
  const inicioFoco = await page.evaluate(() => document.activeElement?.closest('main') !== null);
  if (!inicioFoco) erro('/', 'teclado', 'depois de pular a abertura, o foco não está no conteúdo');
  const aba = focos.findIndex((f) => f.role === 'tab');
  if (aba < 0) erro('/', 'teclado', 'a Linha do tempo não recebe foco');
  if (!focos.some((f) => f.href.startsWith('https://wa.me/')))
    erro('/', 'teclado', 'nenhum link de WhatsApp no percurso');
  if (focoVisivel.length)
    erro('/', 'foco-visivel', `sem contorno de foco: ${focoVisivel.slice(0, 5).join(' · ')}`);
  // Setas na Linha do tempo trocam a fase.
  const abas = page.locator('#linha-do-tempo [role="tab"]');
  if (await abas.count()) {
    await abas.first().focus();
    await page.keyboard.press('ArrowRight');
    const sel = await page.evaluate(() => document.activeElement?.getAttribute('aria-selected'));
    if (sel !== 'true') erro('/', 'teclado', 'seta → não seleciona a próxima fase');
    await page.keyboard.press('End');
    const fim = await page.evaluate(() => document.activeElement?.dataset.fase);
    if (fim !== '60') erro('/', 'teclado', `End foi para "${fim}", não para 60+`);
  }
  // "Pular para o conteúdo" leva o foco ao <main> (a entrada não volta na mesma sessão).
  await page.goto(`${origem}/`);
  await page.keyboard.press('Tab');
  const primeiro = await page.evaluate(() =>
    document.activeElement?.textContent?.replace(/\s+/g, ' ').trim(),
  );
  if (primeiro !== 'Pular para o conteúdo')
    erro('/', 'teclado', `o primeiro Tab foi "${primeiro}", não "Pular para o conteúdo"`);
  await page.keyboard.press('Enter');
  const alvo = await page.evaluate(() => document.activeElement?.id);
  if (alvo !== 'conteudo') erro('/', 'teclado', `"Pular para o conteúdo" levou a "${alvo}"`);
  console.log(
    `  teclado: ${focos.length} paradas de foco · primeira: "${focos[0]?.texto}" · Linha do tempo na parada ${aba + 1}`,
  );
  await ctx.close();
}
// Comparador (só há pares autorizados no /_estilo hoje): setas mudam o valor.
{
  const { ctx, page } = await pagina({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${origem}/_estilo`);
  const range = page.locator('input[type="range"]').first();
  if (await range.count()) {
    await range.focus();
    const antes = await range.inputValue();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    const depois = await range.inputValue();
    checagens++;
    if (antes === depois) erro('/_estilo', 'comparador', 'setas não movem o comparador');
    const texto = await range.getAttribute('aria-valuetext');
    if (!texto) erro('/_estilo', 'comparador', 'sem aria-valuetext');
  }
  await ctx.close();
}

// 4. Movimento reduzido: nada anima sem fim, loops parados.
{
  const { ctx, page } = await pagina({ viewport: { width: 390, height: 844 } });
  for (const rota of lista) {
    await page.goto(`${origem}${rota}`, { waitUntil: 'networkidle' });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await page.waitForTimeout(400);
    const r = await page.evaluate(() => ({
      reduz: matchMedia('(prefers-reduced-motion: reduce)').matches,
      infinitas: document
        .getAnimations()
        .filter((a) => a.playState === 'running' && a.effect?.getTiming().iterations === Infinity)
        .length,
      tocando: [...document.querySelectorAll('video')].filter((v) => !v.paused).length,
    }));
    checagens++;
    if (!r.reduz) erro(rota, 'movimento-reduzido', 'a emulação não pegou');
    if (r.infinitas) erro(rota, 'movimento-reduzido', `${r.infinitas} animação(ões) sem fim`);
    if (r.tocando) erro(rota, 'movimento-reduzido', `${r.tocando} vídeo(s) tocando`);
  }
  await ctx.close();
}

// 5. Pausar vídeo em loop.
{
  const { ctx, page } = await pagina({
    viewport: { width: 390, height: 844 },
    reducedMotion: 'no-preference',
  });
  for (const rota of lista) {
    await page.goto(`${origem}${rota}`, { waitUntil: 'networkidle' });
    const loops = page.locator('[data-video-loop]');
    const n = await loops.count();
    for (let i = 0; i < n; i++) {
      const fig = loops.nth(i).locator('xpath=..');
      const b = fig.locator('[data-pausa]');
      checagens++;
      if (!(await b.count())) {
        erro(rota, 'pausar-video', `vídeo em loop ${i + 1} sem botão de pausa`);
        continue;
      }
      await fig.scrollIntoViewIfNeeded();
      await page.waitForTimeout(600);
      await b.click();
      const parado = await loops.nth(i).evaluate((v) => v.paused);
      if (!parado) erro(rota, 'pausar-video', 'o botão não pausa');
      if ((await b.getAttribute('aria-pressed')) !== 'true')
        erro(rota, 'pausar-video', 'aria-pressed não muda');
    }
  }
  await ctx.close();
}

await navegador.close();
await fechar();
for (const e of erros) console.log(e);
console.log(
  `audit-a11y · ${lista.length} rotas · axe ${TAGS.join('/')} em 3 cenários · ${checagens} checagens · ${erros.length} problema(s)`,
);
process.exit(erros.length ? 1 : 0);

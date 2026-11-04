#!/usr/bin/env node
/* global window, getComputedStyle, addEventListener -- código que roda no navegador (page.evaluate). */
// E2E do funil (Playwright, 390 px). Pré-requisito: build com a medição ligada, p. ex.
//   PLAUSIBLE_DOMINIO=giyma-e2e.test pnpm build && pnpm test:e2e
// Prova: (1) o link exato do WhatsApp em 5 cenários (+ sem JS); (2) nenhum request de
// terceiro antes do consentimento; (3) Aceitar e Recusar com o mesmo peso; (4) depois de
// aceitar, medição e mapa carregam e o clique gera clique_whatsapp com origem/tratamento/fase.
import assert from 'node:assert/strict';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, resolve } from 'node:path';
import { chromium } from 'playwright';
import { linkWhatsApp, mensagens } from '../src/lib/whatsapp.ts';

const DIST = resolve('dist');
if (!existsSync(join(DIST, 'index.html'))) {
  console.error('dist/ não existe: rode "pnpm build" antes.');
  process.exit(1);
}
const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.avif': 'image/avif',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.json': 'application/json',
};
// Servidor estático mínimo (build.format "file": /x → x.html).
const servidor = createServer((req, res) => {
  const caminho = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname);
  const candidatos = [
    join(DIST, caminho),
    join(DIST, `${caminho}.html`),
    join(DIST, caminho, 'index.html'),
  ];
  const arq = candidatos.find((c) => c.startsWith(DIST) && existsSync(c) && statSync(c).isFile());
  if (!arq) {
    res.writeHead(404, { 'content-type': TIPOS['.html'] });
    return createReadStream(join(DIST, '404.html')).pipe(res);
  }
  res.writeHead(200, { 'content-type': TIPOS[extname(arq)] ?? 'application/octet-stream' });
  createReadStream(arq).pipe(res);
});
await new Promise((r) => servidor.listen(0, '127.0.0.1', r));
const ORIGEM = `http://127.0.0.1:${servidor.address().port}`;

const navegador = await chromium.launch();
const VIEWPORT = { width: 390, height: 844 };
let ok = 0;
const falhas = [];
async function caso(nome, fn) {
  try {
    await fn();
    ok++;
    console.log(`  ✓ ${nome}`);
  } catch (e) {
    falhas.push(nome);
    console.log(`  ✗ ${nome}\n    ${String(e.message).split('\n').join('\n    ')}`);
  }
}

/** Contexto que registra todo request de fora (e o bloqueia; Plausible vira um stub local). */
async function contexto(opcoes = {}) {
  const ctx = await navegador.newContext({ viewport: VIEWPORT, ...opcoes });
  const externos = [];
  await ctx.route('**/*', (route) => {
    const url = route.request().url();
    if (url.startsWith(ORIGEM) || url.startsWith('data:')) return route.continue();
    externos.push(url);
    if (/plausible\.io\/js\//.test(url))
      return route.fulfill({
        contentType: 'text/javascript',
        body: 'window.__eventos=[...(window.plausible&&window.plausible.q||[])];window.plausible=(...a)=>window.__eventos.push(a);',
      });
    return route.abort();
  });
  // Pula a entrada animada (o mesmo que scripts/capturar.mjs faz).
  await ctx.addInitScript(() => {
    try {
      sessionStorage.setItem('giyma-entrada', '1');
    } catch {
      /* sem armazenamento */
    }
  });
  return { ctx, externos };
}
const href = (page, seletor) => page.locator(seletor).first().getAttribute('href');

console.log('Link exato do WhatsApp (390 px)');
const { ctx, externos } = await contexto();
const page = await ctx.newPage();

await caso('1. início · hero → mensagem geral', async () => {
  await page.goto(`${ORIGEM}/`);
  assert.equal(await href(page, 'a[data-origem="hero"]'), linkWhatsApp(mensagens.geral()));
});
await caso('2. tratamento · toxina botulínica → mensagem do tratamento', async () => {
  await page.goto(`${ORIGEM}/tratamentos/toxina-botulinica`);
  const esperado = linkWhatsApp(mensagens.tratamento('toxina botulínica'));
  assert.equal(await href(page, 'a[data-origem="tratamento-topo"]'), esperado);
  const flutuante = page.locator('a[data-flutuante]');
  assert.equal(await flutuante.getAttribute('href'), esperado);
  assert.equal(await flutuante.getAttribute('data-tratamento'), 'toxina-botulinica');
});
await caso('3. cada fase · ?fase=50 → mensagem da fase', async () => {
  await page.goto(`${ORIGEM}/cada-fase?fase=50`);
  const botao = page.locator('a[data-origem="linha-do-tempo"][data-fase="50"]');
  await botao.waitFor({ state: 'visible' });
  assert.equal(await botao.getAttribute('href'), linkWhatsApp(mensagens.fase('50')));
  // O convite final segue a fase escolhida (sem JS: geral).
  const convite = page.locator('a[data-origem="cada-fase"]');
  assert.equal(await convite.getAttribute('href'), linkWhatsApp(mensagens.fase('50')));
  await page.locator('#fases-aba-30').click();
  assert.equal(await convite.getAttribute('href'), linkWhatsApp(mensagens.fase('30')));
  assert.equal(await convite.getAttribute('data-fase'), '30');
});
await caso('4. assistente "Não sei o que fazer" → mensagem montada pelas 3 respostas', async () => {
  await page.goto(`${ORIGEM}/`);
  const a = page.locator('#assistente-home');
  await a.locator('summary').click();
  const enviar = a.locator('[data-enviar]');
  // Sem responder tudo: não abre o WhatsApp e avisa.
  await enviar.click();
  await assert.doesNotReject(() =>
    a.locator('[data-aviso]').filter({ hasText: 'três perguntas' }).waitFor(),
  );
  await a.getByLabel('Lábios').check();
  await a.getByLabel('50 a 59').check();
  await a.getByLabel('Já fiz').check();
  assert.equal(
    await enviar.getAttribute('href'),
    linkWhatsApp(mensagens.assistente('lábios', '50', 'ja-fez')),
  );
  // Nada guardado: nenhum dado do assistente no armazenamento do navegador.
  const guardado = await page.evaluate(() =>
    JSON.stringify({ ...localStorage, ...sessionStorage }),
  );
  assert.ok(!/lábios|l%C3%A1bios|50/.test(guardado), guardado);
});
await caso('5. perguntas frequentes → mensagem de dúvida', async () => {
  await page.goto(`${ORIGEM}/perguntas-frequentes`);
  assert.equal(
    await href(page, 'a[data-origem="faq"]'),
    linkWhatsApp(mensagens.duvida('um tratamento')),
  );
});
await caso(
  'nenhum request de terceiro antes do consentimento (5 páginas + interações)',
  async () => {
    await page.goto(`${ORIGEM}/como-chegar`);
    await page.locator('[data-mostrar-mapa]').click();
    await page.locator('[data-consentimento]').waitFor({ state: 'visible' });
    await page.waitForTimeout(400);
    assert.deepEqual(externos, []);
  },
);
await caso('Aceitar e Recusar com o mesmo peso visual', async () => {
  const estilos = await page.$$eval('[data-consentimento] [data-escolha]', (bs) =>
    bs.map((b) => {
      const c = getComputedStyle(b);
      const r = b.getBoundingClientRect();
      return [
        c.color,
        c.backgroundColor,
        c.borderTop,
        c.font,
        c.letterSpacing,
        Math.round(r.width),
        Math.round(r.height),
      ].join('|');
    }),
  );
  assert.equal(estilos.length, 2);
  assert.equal(estilos[0], estilos[1]);
});
await caso('depois de Aceitar: mapa e medição carregam; clique gera clique_whatsapp', async () => {
  await page.locator('[data-escolha="aceito"]').click();
  await page.locator('.cc-mapa iframe').waitFor({ state: 'attached' });
  await page.waitForFunction(() => Array.isArray(window.__eventos));
  assert.ok(
    externos.some((u) => /plausible\.io\/js\//.test(u)),
    externos.join('\n'),
  );
  assert.ok(
    externos.some((u) => /google\.com\/maps/.test(u)),
    externos.join('\n'),
  );
  // Clique em CTA de tratamento (navegação para wa.me impedida depois da medição).
  await page.goto(`${ORIGEM}/tratamentos/toxina-botulinica`);
  await page.waitForFunction(() => Array.isArray(window.__eventos));
  await page.evaluate(() => addEventListener('click', (e) => e.preventDefault()));
  await page.locator('a[data-origem="tratamento-topo"]').click();
  const ev = await page.evaluate(() => window.__eventos.filter((x) => x[0] !== 'pageview'));
  assert.deepEqual(ev.at(-1), [
    'clique_whatsapp',
    {
      props: {
        origem: 'tratamento-topo',
        pagina: '/tratamentos/toxina-botulinica',
        tratamento: 'toxina-botulinica',
      },
    },
  ]);
});
await ctx.close();

console.log('Recusar e sem JS');
await caso('Recusar: nada de terceiro, aviso não volta, mapa não carrega', async () => {
  const { ctx: c, externos: ext } = await contexto();
  const p = await c.newPage();
  await p.goto(`${ORIGEM}/`);
  await p.locator('[data-escolha="recusado"]').click();
  await p.locator('[data-consentimento]').waitFor({ state: 'hidden' });
  await p.goto(`${ORIGEM}/como-chegar`);
  assert.equal(await p.locator('[data-consentimento]').isVisible(), false);
  await p.locator('[data-mostrar-mapa]').click();
  await p.locator('[data-escolha="recusado"]').click();
  await p
    .locator('a[data-origem="como-chegar"]')
    .evaluate((a) => a.addEventListener('click', (e) => e.preventDefault()));
  await p.locator('a[data-origem="como-chegar"]').click();
  await p.waitForTimeout(300);
  assert.equal(await p.locator('.cc-mapa iframe').count(), 0);
  assert.deepEqual(ext, []);
  // Preferência alterável no rodapé.
  await p.locator('[data-abrir-consentimento]').click();
  assert.equal(await p.locator('[data-consentimento]').isVisible(), true);
  await c.close();
});
await caso('sem JS: CTAs e assistente levam a mensagem geral; nada de terceiro', async () => {
  const { ctx: c, externos: ext } = await contexto({ javaScriptEnabled: false });
  const p = await c.newPage();
  await p.goto(`${ORIGEM}/`);
  const geral = linkWhatsApp(mensagens.geral());
  assert.equal(await href(p, 'a[data-origem="hero"]'), geral);
  assert.equal(await href(p, '#assistente-home [data-enviar]'), geral);
  assert.equal(await p.locator('[data-consentimento]').isVisible(), false);
  assert.deepEqual(ext, []);
  await c.close();
});

await navegador.close();
servidor.close();
console.log(`\n${ok} ok · ${falhas.length} falha(s)`);
process.exit(falhas.length ? 1 : 0);

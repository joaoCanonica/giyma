#!/usr/bin/env node
// Capturas do site: sobe o preview (dist/) e fotografa cada rota em
// 390 e 1440 px, tema claro e escuro (data-theme no <html>), com e sem
// prefers-reduced-motion. Saída: docs/capturas/<AAAA-MM-DD>/.
//
// Uso:
//   pnpm capturar                 # todas as rotas do dist/ (constrói se faltar)
//   pnpm capturar -- --rotas /,/a-giyma
//   pnpm capturar -- --build      # força um build antes
//   pnpm capturar -- --sem-reduzido
//
// Navegador: Chromium do Playwright. Se não estiver no lugar padrão,
// defina CHROMIUM_PATH com o executável.

import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const raiz = fileURLToPath(new URL('..', import.meta.url));
const dist = join(raiz, 'dist');
const args = process.argv.slice(2);
const porta = Number(process.env.PORTA_CAPTURA ?? 4399);
const base = `http://127.0.0.1:${porta}`;

const LARGURAS = [
  { nome: '390', width: 390, height: 844 },
  { nome: '1440', width: 1440, height: 900 },
];
const TEMAS = [
  { nome: 'claro', esquema: 'light' },
  { nome: 'escuro', esquema: 'dark' },
];
const MOVIMENTOS = args.includes('--sem-reduzido')
  ? [{ nome: '', reduzido: 'no-preference' }]
  : [
      { nome: '', reduzido: 'no-preference' },
      { nome: '-reduzido', reduzido: 'reduce' },
    ];

function valorDe(flag) {
  const i = args.indexOf(flag);
  return i >= 0 ? args[i + 1] : undefined;
}

function rotasDoDist() {
  const rotas = [];
  const andar = (dir) => {
    for (const nome of readdirSync(dir)) {
      const caminho = join(dir, nome);
      if (statSync(caminho).isDirectory()) {
        if (nome === 'media' || nome === '_astro') continue;
        andar(caminho);
      } else if (nome.endsWith('.html')) {
        const rel = relative(dist, caminho).split(sep).join('/');
        if (rel === '404.html') continue;
        let rota = '/' + rel.replace(/(^|\/)index\.html$/, '').replace(/\.html$/, '');
        rota = rota.replace(/\/$/, '') || '/';
        rotas.push(rota);
      }
    }
  };
  andar(dist);
  return rotas.sort();
}

function nomeArquivo(rota) {
  return rota === '/' ? 'inicio' : rota.replace(/^\//, '').replaceAll('/', '__');
}

async function esperarServidor(url, tentativas = 60) {
  for (let i = 0; i < tentativas; i++) {
    try {
      const r = await fetch(url);
      if (r.ok) return;
    } catch {
      // ainda subindo
    }
    await new Promise((ok) => setTimeout(ok, 250));
  }
  throw new Error(`O preview não respondeu em ${url}`);
}

function hoje() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

async function abrirNavegador() {
  const caminho = process.env.CHROMIUM_PATH;
  try {
    return await chromium.launch(caminho ? { executablePath: caminho } : {});
  } catch (erro) {
    throw new Error(
      'Chromium não encontrado. Rode "pnpm exec playwright install chromium" ou defina CHROMIUM_PATH.',
      { cause: erro },
    );
  }
}

// Rola até o fim e volta, para disparar revelações por IntersectionObserver.
async function percorrer(pagina) {
  await pagina.evaluate(async () => {
    const passo = Math.max(200, Math.floor(window.innerHeight * 0.6));
    for (let y = 0; y < document.documentElement.scrollHeight; y += passo) {
      window.scrollTo(0, y);
      await new Promise((ok) => setTimeout(ok, 60));
    }
    window.scrollTo(0, 0);
  });
}

async function main() {
  if (args.includes('--build') || !existsSync(join(dist, 'index.html'))) {
    console.log('› build');
    const r = spawnSync('pnpm', ['build'], { cwd: raiz, stdio: 'inherit' });
    if (r.status !== 0) process.exit(r.status ?? 1);
  }

  const rotas =
    valorDe('--rotas')
      ?.split(',')
      .map((r) => r.trim()) ?? rotasDoDist();
  const pasta = join(raiz, 'docs', 'capturas', hoje());
  mkdirSync(pasta, { recursive: true });

  const astroBin = join(raiz, 'node_modules', '.bin', 'astro');
  const servidor = spawn(astroBin, ['preview', '--host', '127.0.0.1', '--port', String(porta)], {
    cwd: raiz,
    stdio: ['ignore', 'pipe', 'inherit'],
  });
  // O preview do Astro 7 pode virar processo em segundo plano: encerra pelos dois caminhos.
  let encerrado = false;
  const encerrar = () => {
    if (encerrado) return;
    encerrado = true;
    servidor.kill('SIGTERM');
    spawnSync(astroBin, ['preview', 'stop'], { cwd: raiz, stdio: 'ignore' });
  };
  process.on('exit', encerrar);
  process.on('SIGINT', () => process.exit(130));

  let navegador;
  const geradas = [];
  try {
    await esperarServidor(base + '/');
    navegador = await abrirNavegador();

    for (const largura of LARGURAS) {
      for (const tema of TEMAS) {
        for (const mov of MOVIMENTOS) {
          const contexto = await navegador.newContext({
            viewport: { width: largura.width, height: largura.height },
            deviceScaleFactor: 1,
            colorScheme: tema.esquema,
            reducedMotion: mov.reduzido,
          });
          // A entrada da home roda uma vez por sessão: aqui fotografamos o estado final.
          await contexto.addInitScript(() => {
            try {
              sessionStorage.setItem('giyma-entrada', '1');
            } catch {
              // sem storage
            }
          });
          // O tema vale antes de qualquer script da página.
          await contexto.addInitScript((t) => {
            const aplicar = () => document.documentElement?.setAttribute('data-theme', t);
            aplicar();
            document.addEventListener('readystatechange', aplicar);
          }, tema.nome);
          const pagina = await contexto.newPage();

          for (const rota of rotas) {
            const resp = await pagina.goto(base + rota, { waitUntil: 'networkidle' });
            if (!resp || !resp.ok()) {
              console.warn(`! ${rota} respondeu ${resp?.status() ?? 'sem resposta'}`);
            }
            await pagina.evaluate(
              (t) => document.documentElement.setAttribute('data-theme', t),
              tema.nome,
            );
            await pagina.evaluate(() => document.fonts.ready);
            await percorrer(pagina);
            await pagina.waitForTimeout(mov.reduzido === 'reduce' ? 100 : 900);

            const arquivo = `${nomeArquivo(rota)}-${largura.nome}-${tema.nome}${mov.nome}.png`;
            await pagina.screenshot({ path: join(pasta, arquivo), fullPage: true });
            geradas.push(arquivo);
            console.log(`✓ ${arquivo}`);
          }
          await contexto.close();
        }
      }
    }
  } finally {
    await navegador?.close();
    encerrar();
  }

  console.log(`\n${geradas.length} capturas em ${relative(raiz, pasta)}/`);
}

main().catch((erro) => {
  console.error(erro);
  process.exit(1);
});

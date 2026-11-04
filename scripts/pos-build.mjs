#!/usr/bin/env node
// Pós-build (roda em "postbuild", antes de qualquer auditoria). Duas passadas em todo HTML do dist/:
//
// 1. Tipografia (acabamento): no texto visível, fora de <script>/<style>/<pre>/<textarea>:
//    · o separador " · " nunca abre linha: o espaço antes dele vira não separável;
//    · palavra de uma letra ("a", "e", "o", "é", "à") não fica sozinha no fim da linha: ela se
//      liga à palavra seguinte por um espaço não separável (regra clássica da tipografia).
//    · palavra curta com hífen (até 14 caracteres) não parte no hífen;
//    Não toca em atributos nem em URLs; o texto continua igual para leitor de tela e busca.
//
// 2. CSP por hash, por página, num <meta http-equiv="Content-Security-Policy"> logo depois do
//    charset: sha256 de cada <script> inline executável, de cada <style> e de cada atributo
//    style (com 'unsafe-hashes'). Nada de 'unsafe-inline'. frame-ancestors e HSTS vêm do
//    cabeçalho (vercel.json), porque o <meta> não aceita essas diretivas.
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { lerEnv } from '../src/config/ambiente.ts';

const DIST = join(process.cwd(), 'dist');

// ---------- 1. tipografia ----------
const CRU = /^(script|style|pre|textarea|code|title)$/i;
const CURTA = /(^|[\s(“‘—])([A-Za-zÀ-ÖØ-öø-ÿ]{1})\s+(?=[^\s<])/g;
const HIFENIZADA =
  /(?<![\p{L}\p{N}-])((?=[\p{L}\p{N}-]{3,14}(?![\p{L}\p{N}-]))[\p{L}\p{N}]+-[\p{L}\p{N}]+)(?![\p{L}\p{N}-])/gu;
export function tipografia(html) {
  const partes = html.split(/(<[^>]*>)/);
  const pilha = [];
  let corpo = false;
  for (let i = 0; i < partes.length; i++) {
    const p = partes[i];
    if (p.startsWith('<')) {
      const m = /^<\s*(\/)?\s*([a-zA-Z0-9-]+)/.exec(p);
      if (!m) continue;
      const nome = m[2].toLowerCase();
      if (nome === 'body') corpo = !m[1];
      if (CRU.test(nome)) {
        if (m[1]) pilha.pop();
        else if (!p.endsWith('/>')) pilha.push(nome);
      }
      continue;
    }
    if (!corpo || pilha.length || !p.trim()) continue;
    partes[i] = p
      .replace(/[ \t\n]+·(?=[ \t\n])/g, '\u00a0·')
      .replace(CURTA, (_t, antes, palavra) => `${antes}${palavra}\u00a0`)
      // Palavra curta com hífen ("pré-jowls", "CRF-SC") não parte no hífen.
      .replace(HIFENIZADA, '<span class="sem-quebra">$1</span>');
  }
  return partes.join('');
}

// ---------- 2. CSP ----------
const sha = (s) => `'sha256-${createHash('sha256').update(s, 'utf8').digest('base64')}'`;
function externos() {
  const dominio = lerEnv('PLAUSIBLE_DOMINIO')?.trim();
  const script = lerEnv('PLAUSIBLE_SCRIPT')?.trim() || 'https://plausible.io/js/script.js';
  return dominio ? [new URL(script).origin] : [];
}
export function csp(html) {
  const scripts = new Set();
  const estilos = new Set();
  const atributos = new Set();
  for (const m of html.matchAll(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/gi)) {
    const attrs = m[1] ?? '';
    if (/\bsrc=/.test(attrs) || /application\/ld\+json/.test(attrs)) continue;
    scripts.add(sha(m[2]));
  }
  for (const m of html.matchAll(/<style(\s[^>]*)?>([\s\S]*?)<\/style>/gi)) estilos.add(sha(m[2]));
  for (const m of html.matchAll(/\sstyle="([^"]*)"/g))
    atributos.add(
      sha(
        m[1]
          .replace(/&quot;/g, '"')
          .replace(/&amp;/g, '&')
          .replace(/&#39;/g, "'"),
      ),
    );
  const fora = externos();
  const diretivas = [
    "default-src 'self'",
    `script-src 'self' ${[...scripts].join(' ')} ${fora.join(' ')}`.trim(),
    `style-src 'self' ${[...estilos].join(' ')}${atributos.size ? ` 'unsafe-hashes' ${[...atributos].join(' ')}` : ''}`,
    "img-src 'self' data:",
    "font-src 'self'",
    "media-src 'self'",
    `connect-src 'self' ${fora.join(' ')}`.trim(),
    // Mapa interativo do Google (só carrega depois do clique e do consentimento).
    'frame-src https://www.google.com',
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    'upgrade-insecure-requests',
  ];
  const meta = `<meta http-equiv="Content-Security-Policy" content="${diretivas.join('; ')}">`;
  const limpo = html.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/, '');
  return limpo.replace(/(<meta charset="[^"]*"\s*\/?>)/i, `$1${meta}`);
}

if (process.argv[1]?.endsWith('pos-build.mjs')) {
  const arquivos = [];
  const andar = (d) => {
    for (const n of readdirSync(d)) {
      const c = join(d, n);
      if (statSync(c).isDirectory()) andar(c);
      else if (n.endsWith('.html')) arquivos.push(c);
    }
  };
  andar(DIST);
  let semCharset = 0;
  for (const a of arquivos) {
    const html = readFileSync(a, 'utf8');
    if (!/<meta charset=/i.test(html)) {
      semCharset++;
      continue; // redirecionamentos gerados pelo Astro: sem script, sem estilo
    }
    writeFileSync(a, csp(tipografia(html)));
  }
  console.log(
    `pos-build: tipografia e CSP em ${arquivos.length - semCharset} páginas (${semCharset} redirecionamento(s) sem <meta charset>)`,
  );
}

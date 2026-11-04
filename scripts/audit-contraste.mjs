#!/usr/bin/env node
// Valida AA de cada par de cor usado, em cada superfície, nos dois temas.
// Também confere se src/styles/tokens.css está em dia com src/styles/tokens.mjs.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { contraste, informativos, pares, superficies } from '../src/styles/tokens.mjs';
import { gerarCss } from '../src/styles/gerar-tokens.mjs';

const raiz = fileURLToPath(new URL('..', import.meta.url));
let falhas = 0;
const linhas = [];

for (const [tema, sups] of Object.entries(superficies)) {
  for (const [nome, papeis] of Object.entries(sups)) {
    for (const p of pares) {
      const c = contraste(papeis[p.frente], papeis[p.fundo]);
      const ok = c >= p.minimo;
      if (!ok) falhas++;
      linhas.push(
        `${ok ? '✓' : '✗'} ${tema.padEnd(6)} ${nome.padEnd(8)} ${p.frente.padEnd(9)} ${papeis[p.frente]} / ${papeis[p.fundo]}  ${c.toFixed(2).padStart(5)} ≥ ${p.minimo}  ${p.uso}`,
      );
    }
    for (const p of informativos) {
      const c = contraste(papeis[p.frente], papeis[p.fundo]);
      linhas.push(
        `· ${tema.padEnd(6)} ${nome.padEnd(8)} ${p.frente.padEnd(9)} ${papeis[p.frente]} / ${papeis[p.fundo]}  ${c.toFixed(2).padStart(5)}   ${p.uso} (informativo)`,
      );
    }
  }
}

const css = readFileSync(join(raiz, 'src/styles/tokens.css'), 'utf8');
const emDia = css === gerarCss();
console.log(linhas.join('\n'));
console.log(
  `\ntokens.css ${emDia ? 'em dia' : 'DESATUALIZADO (rode: node src/styles/gerar-tokens.mjs)'}`,
);
console.log(
  `${pares.length * Object.values(superficies).reduce((n, s) => n + Object.keys(s).length, 0)} pares · ${falhas} abaixo do mínimo`,
);
process.exit(falhas || !emDia ? 1 : 0);

// Gera src/styles/tokens.css a partir de tokens.mjs. Uso: node src/styles/gerar-tokens.mjs
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { paleta, superficies } from './tokens.mjs';

const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

function papeis(p) {
  return Object.entries(p)
    .filter(([k]) => k !== 'esquema')
    .map(([k, v]) => `  --${kebab(k)}: ${v};`)
    .concat(`  color-scheme: ${p.esquema};`)
    .join('\n');
}

function blocoTema(tema, prefixo) {
  return Object.entries(superficies[tema])
    .map(([nome, p]) => {
      const sel =
        nome === 'perola'
          ? `${prefixo},\n${prefixo} [data-superficie='perola']`
          : `${prefixo} [data-superficie='${nome}']`;
      return `${sel} {\n${papeis(p)}\n}`;
    })
    .join('\n\n');
}

export function gerarCss() {
  const base = Object.entries(paleta)
    .map(([k, v]) => `  --c-${kebab(k)}: ${v};`)
    .join('\n');
  const escuroSistema = blocoTema('escuro', ":root:not([data-theme='claro'])")
    .split('\n')
    .map((l) => (l ? `  ${l}` : l))
    .join('\n');
  return `/* GERADO por src/styles/gerar-tokens.mjs a partir de tokens.mjs. Não edite à mão. */

:root {
${base}
}

/* Tema claro (padrão). Capítulos: data-superficie="perola|nevoa|cacau|petroleo". */
${blocoTema('claro', ':root')}

/* Tema escuro escolhido. */
${blocoTema('escuro', ":root[data-theme='escuro']")}

/* Tema escuro do sistema, quando o usuário não escolheu. */
@media (prefers-color-scheme: dark) {
${escuroSistema}
}
`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeFileSync(new URL('./tokens.css', import.meta.url), gerarCss());
  console.log('tokens.css gerado');
}

// @ts-check
import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';

export default defineConfig(
  { ignores: ['dist/', '.astro/', 'node_modules/', 'public/', 'media-originais/', 'docs/'] },
  js.configs.recommended,
  ...tseslint.configs.strict,
  ...astro.configs.recommended,
  {
    files: ['**/*.{js,mjs,ts}'],
    languageOptions: { globals: { ...globals.node } },
  },
  {
    // Playwright: funções passadas a page.evaluate rodam no navegador.
    files: ['src/scripts/**/*.ts', 'scripts/capturar.mjs'],
    languageOptions: { globals: { ...globals.browser } },
  },
);

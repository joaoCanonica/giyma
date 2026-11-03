#!/usr/bin/env node
import { pendente } from './lib/pendente.mjs';

pendente(
  'audit-a11y',
  'sessão 9 · QA',
  'rodar axe em todas as rotas do dist/ (meta: zero violações).',
);
